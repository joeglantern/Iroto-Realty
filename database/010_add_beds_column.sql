-- Migration: 010_add_beds_column.sql
-- Description: Add beds column to properties table (separate from bedrooms)
-- Date: 2025-10-05

-- Add beds column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds INTEGER;

-- Create index for beds column for filtering
CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);

COMMENT ON COLUMN properties.beds IS 'Number of beds in the property (can differ from bedrooms)';
