-- Migration: 003_create_properties_table.sql
-- Description: Create core properties table with all property details and content
-- Date: 2025-09-14

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Property Info Sections (for the dual INFO boxes on property page)
    property_info_1 TEXT,
    property_info_2 TEXT,
    
    -- Categorization
    category_id UUID REFERENCES property_categories(id),
    property_type_text TEXT, -- Free text field for property type (as seen in admin)
    specific_location TEXT, -- e.g., "Beach front", "near town center"
    
    -- Listing Type & Pricing
    listing_type TEXT DEFAULT 'rental' CHECK (listing_type IN ('rental', 'sale', 'both')),
    rental_price DECIMAL(12,2), -- per night price
    sale_price DECIMAL(15,2), -- total sale price
    currency TEXT DEFAULT 'KES',
    
    -- Property Specifications
    bedrooms INTEGER,
    bathrooms INTEGER,
    max_guests INTEGER,
    
    -- Media
    hero_image_path TEXT, -- path to hero image in storage
    video_url TEXT, -- YouTube/Vimeo URL
    
    -- Amenities (stored as JSON array)
    amenities JSONB DEFAULT '[]'::jsonb,
    
    -- SEO Fields
    meta_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    
    -- Publishing & Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Create property images table for gallery
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL, -- path to image in storage
    alt_text TEXT,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- Create indexes for properties
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_category_id ON properties(category_id);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
CREATE INDEX idx_properties_is_active ON properties(is_active);
CREATE INDEX idx_properties_published_at ON properties(published_at);
CREATE INDEX idx_properties_rental_price ON properties(rental_price);
CREATE INDEX idx_properties_sale_price ON properties(sale_price);

-- GIN index for amenities JSON search
CREATE INDEX idx_properties_amenities_gin ON properties USING GIN (amenities);

-- Full text search index
CREATE INDEX idx_properties_search ON properties USING GIN (
    to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' ||
        COALESCE(property_info_1, '') || ' ' ||
        COALESCE(property_info_2, '') || ' ' ||
        COALESCE(specific_location, '')
    )
);

-- Create indexes for property images
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_sort_order ON property_images(sort_order);
CREATE INDEX idx_property_images_is_active ON property_images(is_active);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties

-- Policy: Anyone can view published properties
CREATE POLICY "Anyone can view published properties" ON properties
    FOR SELECT USING (status = 'published' AND is_active = true);

-- Policy: Admins can view all properties
CREATE POLICY "Admins can view all properties" ON properties
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can insert properties
CREATE POLICY "Admins can insert properties" ON properties
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can update properties
CREATE POLICY "Admins can update properties" ON properties
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can delete properties
CREATE POLICY "Admins can delete properties" ON properties
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for property_images

-- Policy: Anyone can view images for published properties
CREATE POLICY "Anyone can view published property images" ON property_images
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_images.property_id 
            AND status = 'published' 
            AND is_active = true
        )
    );

-- Policy: Admins can view all property images
CREATE POLICY "Admins can view all property images" ON property_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can manage property images
CREATE POLICY "Admins can manage property images" ON property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_properties
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Function to automatically set updated_by
CREATE OR REPLACE FUNCTION set_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_by_properties
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_by();

-- Function to set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to 'published' and published_at is null
    IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at = timezone('utc'::text, now());
    END IF;
    
    -- If status is changing from 'published' to something else, keep published_at
    -- (don't reset it, in case they want to unpublish and republish)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_published_at_properties
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

-- Function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '[^\w\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique slugs
CREATE OR REPLACE FUNCTION ensure_unique_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug from title
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check if slug exists and increment if needed
    WHILE EXISTS (
        SELECT 1 FROM properties 
        WHERE slug = final_slug 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_unique_slug_properties
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION ensure_unique_slug();

COMMENT ON TABLE properties IS 'Core properties table with all property details and content';
COMMENT ON TABLE property_images IS 'Property gallery images';
COMMENT ON COLUMN properties.property_info_1 IS 'Content for first INFO section on property page';
COMMENT ON COLUMN properties.property_info_2 IS 'Content for second INFO section on property page';
COMMENT ON COLUMN properties.property_type_text IS 'Free text property type (Villa, House, etc.)';
COMMENT ON COLUMN properties.amenities IS 'JSON array of amenities';
COMMENT ON COLUMN properties.hero_image_path IS 'Path to hero image in Supabase storage';
COMMENT ON COLUMN property_images.sort_order IS 'Display order in gallery (lower numbers first)';