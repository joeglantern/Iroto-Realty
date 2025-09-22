-- Migration: Rename bathrooms column to beds
-- This migration renames the 'bathrooms' column to 'beds' in the properties table

BEGIN;

-- Rename the bathrooms column to beds
ALTER TABLE properties
RENAME COLUMN bathrooms TO beds;

-- Update the comment to reflect the change
COMMENT ON COLUMN properties.beds IS 'Number of beds in the property';

COMMIT;