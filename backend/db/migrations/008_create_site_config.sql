-- Site Config Table
CREATE TABLE IF NOT EXISTS site_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key      TEXT NOT NULL UNIQUE,
    config_value    TEXT NOT NULL,
    description     TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(config_key);

-- Trigger
DROP TRIGGER IF EXISTS trg_site_config_updated_at ON site_config;
CREATE TRIGGER trg_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
