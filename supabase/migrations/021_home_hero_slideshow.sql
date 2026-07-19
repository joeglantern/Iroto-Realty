-- Migration: 021_home_hero_slideshow.sql
-- Description: Homepage hero supports multiple slideshow images (JSON array of storage paths)
-- Date: 2026-07-19

-- Empty value means the website falls back to the legacy single home_hero_image
-- setting, and then to its built-in default image.
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, category) VALUES
('home_hero_images', '', 'json', 'Homepage hero slideshow images (JSON array of storage paths in property-images bucket)', true, 'site_images')
ON CONFLICT (setting_key) DO NOTHING;
