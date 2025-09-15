-- Migration: 002_create_property_categories.sql
-- Description: Create property categories and locations for organizing properties
-- Date: 2025-09-14

-- Create property categories table (for locations like Lamu, Watamu)
CREATE TABLE property_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- Create property types table (for Villa, House, Apartment, etc.)
CREATE TABLE property_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- Create indexes
CREATE INDEX idx_property_categories_slug ON property_categories(slug);
CREATE INDEX idx_property_categories_is_active ON property_categories(is_active);
CREATE INDEX idx_property_categories_sort_order ON property_categories(sort_order);

CREATE INDEX idx_property_types_slug ON property_types(slug);
CREATE INDEX idx_property_types_is_active ON property_types(is_active);
CREATE INDEX idx_property_types_sort_order ON property_types(sort_order);

-- Enable Row Level Security
ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_categories

-- Policy: Everyone can view active categories
CREATE POLICY "Anyone can view active property categories" ON property_categories
    FOR SELECT USING (is_active = true);

-- Policy: Admins can view all categories
CREATE POLICY "Admins can view all property categories" ON property_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can insert categories
CREATE POLICY "Admins can insert property categories" ON property_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can update categories
CREATE POLICY "Admins can update property categories" ON property_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can delete categories
CREATE POLICY "Admins can delete property categories" ON property_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for property_types (same as categories)

-- Policy: Everyone can view active types
CREATE POLICY "Anyone can view active property types" ON property_types
    FOR SELECT USING (is_active = true);

-- Policy: Admins can view all types
CREATE POLICY "Admins can view all property types" ON property_types
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can insert types
CREATE POLICY "Admins can insert property types" ON property_types
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can update types
CREATE POLICY "Admins can update property types" ON property_types
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can delete types
CREATE POLICY "Admins can delete property types" ON property_types
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_property_categories
    BEFORE UPDATE ON property_categories
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_property_types
    BEFORE UPDATE ON property_types
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Insert default categories (locations)
INSERT INTO property_categories (name, slug, description, sort_order) VALUES
('Lamu', 'lamu', 'Historic island destination with UNESCO World Heritage charm', 1),
('Watamu', 'watamu', 'Tropical beach paradise with marine national park', 2),
('Kilifi', 'kilifi', 'Coastal town with creek views and cultural heritage', 3),
('Malindi', 'malindi', 'Historic coastal town with Italian influences', 4);

-- Insert default property types
INSERT INTO property_types (name, slug, description, sort_order) VALUES
('Villa', 'villa', 'Luxury standalone properties with private amenities', 1),
('House', 'house', 'Residential properties suitable for families', 2),
('Apartment', 'apartment', 'Multi-unit residential properties', 3),
('Resort', 'resort', 'Commercial hospitality properties', 4),
('Cottage', 'cottage', 'Charming small-scale properties', 5),
('Penthouse', 'penthouse', 'Premium top-floor properties with exceptional views', 6);

COMMENT ON TABLE property_categories IS 'Property categories/locations like Lamu, Watamu';
COMMENT ON TABLE property_types IS 'Property types like Villa, House, Apartment';
COMMENT ON COLUMN property_categories.slug IS 'URL-friendly version of category name';
COMMENT ON COLUMN property_types.slug IS 'URL-friendly version of type name';
COMMENT ON COLUMN property_categories.sort_order IS 'Display order (lower numbers first)';
COMMENT ON COLUMN property_types.sort_order IS 'Display order (lower numbers first)';