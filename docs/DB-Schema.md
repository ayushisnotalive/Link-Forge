# Postgres

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

```

# Redis Table

# Cache-aside for hot redirects
```
Key:   "redirect:{shortCode}"
Value: JSON { long_url, expires_at, is_active }
TTL:   300 seconds (5 minutes)
```

# Rate limiting
```
Key:   "rate:{userId}" or "rate:{ipAddress}"
Value: Counter with TTL window
```

# Token blacklist
```
Key:   "blacklist:{jti}"
Value: "1"
TTL:   Remaining token lifetime
```