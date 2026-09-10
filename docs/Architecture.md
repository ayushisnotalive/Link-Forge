# High-Level Architecture (HLD)

```text

┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│                                                                  │
│  ┌──────────────┐          ┌──────────────┐                     │
│  │ React SPA    │          │ Short Link   │                     │
│  │ (Dashboard)  │          │ Redirect     │                     │
│  └──────┬───────┘          └──────┬───────┘                     │
└─────────┼─────────────────────────┼──────────────────────────────┘
          │ HTTPS                   │ HTTPS
          ▼                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Nginx (Reverse Proxy)                     │
│              TLS termination, rate limiting, load balancing      │
└─────────┬─────────────────────────┬──────────────────────────────┘
          │                         │
          ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Node.js API       │   │   Redirect Service   │
│   (Express/Fastify) │   │   (Node.js/Express)  │
│                     │   │                      │
│  - Auth (JWT)       │   │  - Lookup short code │
│  - CRUD links       │   │  - Serve 302         │
│  - Dashboard API    │   │  - Fire click event  │
│  - Rate limited     │   │  - Cache-aside Redis │
└──────┬──────┬───────┘   └──────┬───────────────┘
       │      │                  │
       │      │                  │ Publish to Queue
       │      │                  ▼
       │      │         ┌─────────────────────┐
       │      │         │   RabbitMQ           │
       │      │         │   (click-events)     │
       │      │         └──────────┬───────────┘
       │      │                    │ Consume
       │      │                    ▼
       │      │         ┌─────────────────────┐
       │      │         │   Java Service       │
       │      │         │   (Spring Boot)      │
       │      │         │                      │
       │      │         │  - Consume events    │
       │      │         │  - Parse UA/IP       │
       │      │         │  - Aggregate clicks  │
       │      │         │  - Write to Postgres │
       │      │         └──────────┬───────────┘
       │      │                    │
       ▼      ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                          PostgreSQL 16                           │
│  users | short_links | click_events | click_aggregates_daily    │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│      Redis 7        │
│  Cache | Rate Limit │
│  Blacklist          │
└─────────────────────┘

```

# Low-Level-Designs --- LLD
### 1.Redirect Flow (hot-path)

```text

Client: GET /ab3xK9
    │
    ▼
Nginx (rate limit: 100 req/min per IP)
    │
    ▼
Redirect Service (Node.js)
    │
    ├── 1. Validate short code format (regex: ^[a-zA-Z0-9]{4,12}$)
    │
    ├── 2. Check Redis: GET "redirect:ab3xK9"
    │       ├── HIT → use cached data → skip to step 5
    │       └── MISS → continue
    │
    ├── 3. Query Postgres:
    │       SELECT long_url, is_active, expires_at 
    │       FROM short_links 
    │       WHERE short_code = 'ab3xK9'
    │       -- Uses B-tree index, O(log n)
    │
    ├── 4. If found and active:
    │       SET "redirect:ab3xK9" = JSON, EX 300
    │       └── Not found → return 404 page
    │
    ├── 5. Publish click event to RabbitMQ:
    │       { short_link_id, clicked_at, ip, user_agent, referrer }
    │       └── Fire-and-forget (non-blocking)
    │
    └── 6. Return 302 Found with Location: long_url

```

### 2.Auth Flow

```text

Register:
    POST /api/auth/register {email, password}
    → Validate email + password strength (min 8 chars)
    → Check email uniqueness
    → Hash password with bcrypt (cost 12)
    → Create user row
    → Generate JWT (access + refresh)
    → Set httpOnly cookies
    → Return user info

Login:
    POST /api/auth/login {email, password}
    → Find user by email
    → Compare bcrypt hash
    → Generate JWT pair
    → Set httpOnly cookies
    → Return user info

Refresh:
    POST /api/auth/refresh (refresh token in cookie)
    → Verify refresh token
    → Check blacklist in Redis
    → Issue new access token

Logout:
    POST /api/auth/logout
    → Get JWT ID (jti) from token
    → Add jti to Redis blacklist with TTL
    → Clear cookies
```

### 3.Link Creation Flow

```text

POST /api/links { long_url, custom_code? }
    │
    ├── Auth middleware: verify JWT from httpOnly cookie
    │       └── Invalid → 401
    │
    ├── Rate limit middleware: check Redis counter
    │       └── Over limit → 429 with Retry-After header
    │
    ├── Validate URL (http/https, max 2048 chars)
    │
    ├── Generate short code:
    │       ├── Custom: validate format + uniqueness
    │       └── Random: 6-char base62, retry on collision
    │
    ├── INSERT INTO short_links (user_id, short_code, long_url)
    │
    └── Return 201 with link details
```

### 4.Click Event Processing (Java)

```text

RabbitMQ Consumer (Spring Boot)
    │
    ├── Receive message from "click-events" queue
    │
    ├── Parse: { short_link_id, ip, user_agent, referrer, clicked_at }
    │
    ├── Enrichment:
    │       ├── Parse user_agent → device_type
    │       ├── GeoIP lookup → country code
    │       └── Extract domain from referrer
    │
    ├── INSERT INTO click_events (...)
    │
    ├── Upsert daily aggregate:
    │       INSERT INTO click_aggregates_daily (short_link_id, date, total_clicks)
    │       VALUES (?, CURRENT_DATE, 1)
    │       ON CONFLICT (short_link_id, date)
    │       DO UPDATE SET total_clicks = total_clicks + 1
    │
    └── Acknowledge message (dead-letter on failure)
```

### 5.DashBoard Data Flow

```text

GET /api/links?cursor={cursor}&limit=20
    │
    ├── Auth middleware
    │
    ├── Cursor pagination query:
    │       SELECT id, short_code, long_url, is_active, created_at
    │       FROM short_links
    │       WHERE user_id = ? AND created_at < ?
    │       ORDER BY created_at DESC
    │       LIMIT 21  -- extra one to determine has_more
    │
    ├── Batch click count query:
    │       SELECT short_link_id, SUM(total_clicks)
    │       FROM click_aggregates_daily
    │       WHERE short_link_id IN (...) AND date >= NOW() - INTERVAL '30 days'
    │       GROUP BY short_link_id
    │
    └── Return { links: [...], next_cursor: "..." }
```


# Expected Repo Structure

```text

linkforge/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── Makefile
├── README.md
│
├── packages/
│   ├── api/                        # Node.js + TypeScript backend
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── db/
│   │   │   │   ├── prisma/schema.prisma
│   │   │   │   ├── redis.ts
│   │   │   │   └── rabbitmq.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── analytics-service/          # Java + Spring Boot
│   │   ├── src/main/java/com/linkforge/analytics/
│   │   │   ├── AnalyticsServiceApplication.java
│   │   │   ├── config/
│   │   │   ├── consumer/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   └── model/
│   │   ├── src/main/resources/application.yml
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   └── web/                        # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── context/
│       │   ├── utils/
│       │   └── types/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── Dockerfile
│
├── infra/
│   ├── nginx/nginx.conf
│   └── postgres/init.sql
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   └── database-schema.md
│
└── scripts/
    ├── dev.sh
    └── test.sh

    

```