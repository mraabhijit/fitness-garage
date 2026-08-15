-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id    UUID UNIQUE,
    full_name           TEXT NOT NULL,
    phone_number        TEXT,
    email_address       TEXT,
    membership_plan_id  UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
    status              TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'expired', 'pending', 'suspended')),
    start_date          DATE NOT NULL,
    expiry_date         DATE NOT NULL,
    imported            BOOLEAN NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_expiry_date ON members(expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_supabase_user_id ON members(supabase_user_id);

-- Trigger
DROP TRIGGER IF EXISTS trg_members_updated_at ON members;
CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'member_own_data'
    ) THEN
        CREATE POLICY member_own_data ON members
            FOR SELECT USING (auth.uid() = supabase_user_id);
    END IF;
END $$;
