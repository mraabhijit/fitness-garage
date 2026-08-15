-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    membership_plan_id  UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
    amount              NUMERIC(10, 2) NOT NULL,
    payment_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method      TEXT NOT NULL DEFAULT 'cash'
                            CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'other')),
    invoice_path        TEXT,
    notes               TEXT,
    recorded_by         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Trigger
DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'member_own_payments'
    ) THEN
        CREATE POLICY member_own_payments ON payments
            FOR SELECT USING (
                member_id IN (
                    SELECT id FROM members WHERE supabase_user_id = auth.uid()
                )
            );
    END IF;
END $$;
