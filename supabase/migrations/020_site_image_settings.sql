-- Migration: 020_site_image_settings.sql
-- Description: Add editable site image settings for homepage and about page
-- Date: 2026-07-19

-- Image paths point into the property-images storage bucket (site/ prefix).
-- Empty value means the website falls back to its built-in default image.
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, category) VALUES
('home_hero_image', '', 'text', 'Homepage hero background image (storage path in property-images bucket)', true, 'site_images'),
('about_hero_image', '', 'text', 'About page hero background image (storage path in property-images bucket)', true, 'site_images'),
('about_story_image', '', 'text', 'About page "Our Story" section photo (storage path in property-images bucket)', true, 'site_images')
ON CONFLICT (setting_key) DO NOTHING;
