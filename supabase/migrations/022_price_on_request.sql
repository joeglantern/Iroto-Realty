-- Migration: 022_price_on_request.sql
-- Description: Properties can be listed as "Contact for price" instead of showing a price
-- Date: 2026-07-19

ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_on_request BOOLEAN DEFAULT false;

-- Seed: all current properties are listed without a public price
UPDATE properties SET price_on_request = true;

COMMENT ON COLUMN properties.price_on_request IS 'When true the website shows "Contact for Price" instead of the rental/sale price';
