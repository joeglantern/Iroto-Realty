-- Add hero_image_path column to property_categories table
ALTER TABLE property_categories 
ADD COLUMN hero_image_path TEXT;

-- Add comment to document the column
COMMENT ON COLUMN property_categories.hero_image_path IS 'Path to category hero image stored in property-images bucket';

-- Update existing categories to have default sort order if null
UPDATE property_categories 
SET sort_order = 0 
WHERE sort_order IS NULL;

-- Create index for better performance when filtering by active categories with images
CREATE INDEX idx_property_categories_active_with_images 
ON property_categories(is_active, hero_image_path) 
WHERE is_active = true;