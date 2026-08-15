-- Seed 8 Initial Services
INSERT INTO services (name, slug, description, icon_filename, display_order, is_active)
VALUES
    ('Personal Training', 'personal-training', 'One-on-one customized fitness training with expert coaches.', 'personal-training.svg', 1, true),
    ('Group Classes', 'group-classes', 'High-energy group workouts designed to push limits together.', 'group-classes.svg', 2, true),
    ('Weight Loss Programs', 'weight-loss-programs', 'Structured fat loss and lifestyle transformation regimens.', 'weight-loss-programs.svg', 3, true),
    ('Strength & Conditioning', 'strength-conditioning', 'Powerlifting, bodybuilding, and athletic conditioning.', 'strength-conditioning.svg', 4, true),
    ('Nutrition Coaching', 'nutrition-coaching', 'Personalized diet plans and nutritional guidance.', 'nutrition-coaching.svg', 5, true),
    ('Cardio Programs', 'cardio-programs', 'High-intensity interval and endurance cardio workouts.', 'cardio-programs.svg', 6, true),
    ('Kids Dance', 'kids-dance', 'Fun and energetic dance fitness sessions for kids.', 'kids-dance.svg', 7, true),
    ('Zumba', 'zumba', 'Dynamic dance fitness routines set to energetic rhythms.', 'zumba.svg', 8, true)
ON CONFLICT (slug) DO NOTHING;
