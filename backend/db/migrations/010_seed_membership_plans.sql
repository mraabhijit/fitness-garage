-- Seed 8 Membership Plan Combinations
INSERT INTO membership_plans (tier, duration, price, description, is_active)
VALUES
    ('basic', 'monthly',     0.00, 'Basic access - Monthly membership', true),
    ('basic', 'quarterly',   0.00, 'Basic access - Quarterly membership (3 months)', true),
    ('basic', 'half_yearly', 0.00, 'Basic access - Half-yearly membership (6 months)', true),
    ('basic', 'annual',      0.00, 'Basic access - Annual membership (12 months)', true),
    ('pt',    'monthly',     0.00, 'Personal Training - Monthly membership with dedicated trainer', true),
    ('pt',    'quarterly',   0.00, 'Personal Training - Quarterly membership with dedicated trainer', true),
    ('pt',    'half_yearly', 0.00, 'Personal Training - Half-yearly membership with dedicated trainer', true),
    ('pt',    'annual',      0.00, 'Personal Training - Annual membership with dedicated trainer', true)
ON CONFLICT (tier, duration) DO NOTHING;
