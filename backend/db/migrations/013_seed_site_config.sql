-- Seed Site Config and Achievements
INSERT INTO site_config (config_key, config_value, description)
VALUES
    -- Hero Stats
    ('stat_members_count', '200+', 'Number of members shown in hero stats'),
    ('stat_years_in_business', '5+', 'Years in business shown in hero stats'),
    ('stat_trainers_count', '5+', 'Number of trainers shown in hero stats'),
    ('stat_transformations', '100+', 'Transformations achieved shown in hero stats'),

    -- Gym Info
    ('gym_name', 'Fitness Garage', 'Gym display name'),
    ('gym_address', '123 Iron Works Way, Fitness District', 'Full gym physical address'),
    ('gym_phone', '+91 98765 43210', 'Contact phone number'),
    ('gym_email', 'contact@fitnessgarage.com', 'Contact email address'),
    ('gym_maps_embed_url', 'https://maps.google.com', 'Google Maps embed URL'),
    ('gym_google_form_url', 'https://forms.google.com', 'Google Form URL for inquiries'),
    ('gym_google_place_id', '', 'Google Place ID for reviews sync'),

    -- Reviews Sync
    ('reviews_last_synced_at', '2000-01-01T00:00:00Z', 'Timestamp of last Google Reviews sync'),

    -- Hero Slideshow
    ('hero_slideshow_interval_ms', '5000', 'Milliseconds between hero slideshow slides'),

    -- About Section
    ('about_tagline', 'Push Beyond Your Limits — Forge Your Legacy.', 'Gym tagline/mission statement'),
    ('about_story', 'Fitness Garage was founded with a single mission: to provide an uncompromising, world-class training environment for those committed to transforming their bodies and minds. From heavy iron to personalized functional guidance, we build strength that lasts.', 'Gym story description')
ON CONFLICT (config_key) DO UPDATE
    SET config_value = EXCLUDED.config_value,
        description = EXCLUDED.description;

-- Seed Initial Achievements
INSERT INTO achievements (label, value, display_order, is_active)
VALUES
    ('Best Gym Award 2024', '#1', 1, true),
    ('Top Rated Gym', '4.9★', 2, true),
    ('500+ Transformations', '500+', 3, true)
ON CONFLICT DO NOTHING;
