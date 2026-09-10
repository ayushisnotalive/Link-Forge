# LinkForge — Pre-Planning Document (Complete)

## 1. Project Overview

**LinkForge** is a URL shortener with analytics platform. Users create short, shareable links and track click performance (clicks, referrers, devices, countries) from a centralized dashboard.

**Why it matters:** Demonstrates JWT auth, Redis caching, rate limiting, Postgres indexing, cursor pagination, RabbitMQ messaging, polyglot architecture (Node + Java), and React frontend — all in one coherent, real-world project.

---

## 2. What is a URL Shortener?

A URL shortener converts long URLs into short, manageable links.

- **Long URL:** `https://docs.google.com/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890/edit?usp=sharing`
- **Short URL:** `https://linkforge.dev/ab3xK9`

**Why use it:**
- **Shareability** — Fits in tweets, texts, QR codes
- **Tracking** — Click analytics (who, when, where, device)
- **Branding** — Custom domains for professional links
- **Management** — Update, pause, or delete links from one dashboard

**How it works:**
1. User submits a long URL
2. System generates a unique short code (`ab3xK9`)
3. System stores mapping: `ab3xK9 → long URL`
4. When someone visits `linkforge.dev/ab3xK9`, system looks up code and redirects

---

## 3. Demand It Solves

| Problem | Solution |
|---------|----------|
| Long URLs break in messages/emails | Clean, short links that never break |
| No visibility into link performance | Real-time click analytics |
| Sharing links across platforms manually | One link, track everywhere |
| Managing many links across campaigns | Central dashboard with pagination |
| Rate-limited abuse of public shorteners | Private, authenticated, rate-limited API |

---

## 4. Target Users

- **Indie hackers / Micro-SaaS owners** — track marketing links
- **Content creators** — share links on social media, track engagement
- **Small dev teams** — internal tool for sharing staging links, docs
- **Anyone who shares links regularly** and wants data on them

---

## 5. Requirements

### Functional Requirements (MVP)

- [ ] Create short link from long URL (authenticated)
- [ ] Redirect short link to original URL (public, fast)
- [ ] JWT auth with httpOnly cookies (register, login, logout, refresh)
- [ ] Rate limiting on link creation API (per user, per IP)
- [ ] Dashboard: list user's links (cursor paginated)
- [ ] Delete / disable a link
- [ ] Basic analytics: total clicks per link

### Extended (V1.5)

- [ ] Click analytics: referrer, user agent, country, device type
- [ ] Custom short codes (`linkforge.dev/my-sale`)
- [ ] Click graphs (24h, 7d, 30d)
- [ ] Link expiration dates
- [ ] QR code generation per link

### Non-Functional Requirements

- **Latency:** Redirect lookup < 50ms (p95)
- **Throughput:** Handle 1000+ redirects/sec
- **Availability:** 99.9% uptime for redirect service
- **Durability:** Click events never lost (queue-based)
- **Scalability:** Horizontal scaling for read-heavy redirect path
- **Security:** JWT refresh tokens, rate limiting, input sanitization

---

## 6. Tech Stack (Production-Grade)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend (Main API)** | Node.js + TypeScript + Express/Fastify | Reuse existing Redis rate-limiting + JWT code |
| **Backend (Analytics)** | Java 17 + Spring Boot | Polyglot point, demonstrates Java service design |
| **Database** | PostgreSQL 16 | Relational data, B-tree indexed lookups |
| **Cache** | Redis 7 | Cache-aside for hot redirects, rate limiting |
| **Message Queue** | RabbitMQ 3 | Decoupled click-event processing |
| **Frontend** | React 18 + Vite + Tailwind CSS | Dashboard UI |
| **ORM** | Prisma (Node) / Hibernate (Java) | Type-safe DB access |
| **Auth** | JWT (access + refresh) in httpOnly cookies | Stateless, secure |
| **Containerization** | Docker + Docker Compose | Local dev + deployment |
| **CI/CD** | GitHub Actions | Automated testing + deployment |
| **Monitoring** | Prometheus + Grafana (optional) | Metrics dashboards |
| **Reverse Proxy** | Nginx | TLS termination, load balancing |

---

## 7. Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Short links table
CREATE TABLE short_links (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    short_code    VARCHAR(12) UNIQUE NOT NULL,
    long_url      TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_short_links_short_code ON short_links (short_code);
CREATE INDEX idx_short_links_user_created ON short_links (user_id, created_at DESC);

-- Click events table (raw events)
CREATE TABLE click_events (
    id            BIGSERIAL PRIMARY KEY,
    short_link_id UUID REFERENCES short_links(id) ON DELETE CASCADE,
    clicked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    referrer      TEXT,
    country       VARCHAR(2),
    device_type   VARCHAR(20)
);

CREATE INDEX idx_click_events_link_time ON click_events (short_link_id, clicked_at DESC);

-- Daily aggregated clicks (pre-computed)
CREATE TABLE click_aggregates_daily (
    short_link_id UUID REFERENCES short_links(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    total_clicks  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (short_link_id, date)
);