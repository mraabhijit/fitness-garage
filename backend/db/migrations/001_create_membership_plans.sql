-- Membership Plans Table
CREATE TABLE IF NOT EXISTS membership_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier            TEXT NOT NULL CHECK (tier IN ('basic', 'pt')),
    duration        TEXT NOT NULL CHECK (duration IN ('monthly', 'quarterly', 'half_yearly', 'annual')),
    price           NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tier, duration)
);

DROP TRIGGER IF EXISTS trg_membership_plans_updated_at ON membership_plans;
CREATE TRIGGER trg_membership_plans_updated_at
    BEFORE UPDATE ON membership_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
