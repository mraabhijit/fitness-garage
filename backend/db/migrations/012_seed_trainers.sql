-- Seed 5 Initial Trainers
INSERT INTO trainers (name, slug, specialization, experience_years, certifications, bio, photo_filename, display_order, is_active)
VALUES
    ('Trainer One', 'trainer-one', 'Personal Training & Bodybuilding', 5, ARRAY['ACE Certified', 'CPR/AED'], 'Specialist in hyper-growth strength and personalized progression cycles.', 'trainer-one.jpg', 1, true),
    ('Trainer Two', 'trainer-two', 'Strength & Conditioning', 4, ARRAY['CSCS', 'CrossFit Level 2'], 'Focused on functional movement, athletic agility, and compound lifting mechanics.', 'trainer-two.jpg', 2, true),
    ('Trainer Three', 'trainer-three', 'Weight Loss & Calisthenics', 3, ARRAY['ISSA Certified', 'Nutrition Specialist'], 'Passionate about sustainable fat loss, metabolic conditioning, and mobility.', 'trainer-three.jpg', 3, true),
    ('Trainer Four', 'trainer-four', 'Zumba & Dance Fitness', 6, ARRAY['Licensed Zumba Instructor', 'Aerobics Pro'], 'Leading dynamic high-tempo sessions that keep fitness fun and intense.', 'trainer-four.jpg', 4, true),
    ('Trainer Five', 'trainer-five', 'Nutrition Coaching & Rehab', 2, ARRAY['Precision Nutrition L1'], 'Dedicated to meal planning, biomechanics optimization, and joint recovery.', 'trainer-five.jpg', 5, true)
ON CONFLICT (slug) DO NOTHING;
