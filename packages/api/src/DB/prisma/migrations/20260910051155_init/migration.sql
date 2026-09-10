-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_links" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "short_code" VARCHAR(12) NOT NULL,
    "long_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" BIGSERIAL NOT NULL,
    "short_link_id" UUID,
    "clicked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "referrer" TEXT,
    "country" VARCHAR(2),
    "device_type" VARCHAR(20),

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_aggregates_daily" (
    "short_link_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "click_aggregates_daily_pkey" PRIMARY KEY ("short_link_id","date")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "short_links_short_code_key" ON "short_links"("short_code");

-- CreateIndex
CREATE INDEX "idx_short_links_short_code" ON "short_links"("short_code");

-- CreateIndex
CREATE INDEX "idx_short_links_user_created" ON "short_links"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_click_events_link_time" ON "click_events"("short_link_id", "clicked_at" DESC);

-- AddForeignKey
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_short_link_id_fkey" FOREIGN KEY ("short_link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_aggregates_daily" ADD CONSTRAINT "click_aggregates_daily_short_link_id_fkey" FOREIGN KEY ("short_link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
