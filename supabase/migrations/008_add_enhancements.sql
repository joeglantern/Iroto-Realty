-- Migration: 008_add_enhancements.sql
-- Description: Add essential enhancements and optional features for better CMS functionality
-- Date: 2025-09-14

-- ===========================
-- ESSENTIAL ENHANCEMENTS
-- ===========================

-- 1. Add property specifications (common real estate fields)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_size_sqm INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lot_size_sqm INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT false;

-- 2. Enhanced contact inquiries for better lead management
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS preferred_dates DATERANGE;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS guest_count INTEGER;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS special_requests TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- 3. Create dedicated blog authors table for better author management
CREATE TABLE IF NOT EXISTS blog_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    avatar_path TEXT, -- path to avatar in Supabase storage
    email TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb, -- {"twitter": "handle", "linkedin": "url"}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- Add author_id to blog_posts (optional - can still use author_name for flexibility)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES blog_authors(id);

-- ===========================
-- OPTIONAL ENHANCEMENTS
-- ===========================

-- 4. Property availability system (for rental bookings - OPTIONAL)
CREATE TABLE IF NOT EXISTS property_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked', 'maintenance')),
    booking_reference TEXT, -- external booking reference
    guest_name TEXT, -- if booked
    notes TEXT,
    rate_override DECIMAL(10,2), -- custom rate for this period
    minimum_stay INTEGER DEFAULT 1, -- minimum nights
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- 5. FAQ system (commonly needed for property websites - OPTIONAL)
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'general', 'booking', 'property', 'travel'
    is_featured BOOLEAN DEFAULT false, -- show on homepage
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- 6. Property features/highlights (alternative to amenities for marketing copy - OPTIONAL)
CREATE TABLE IF NOT EXISTS property_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    feature_title TEXT NOT NULL, -- e.g., "Ocean Views", "Private Beach Access"
    feature_description TEXT, -- detailed description
    icon_name TEXT, -- for displaying icons
    sort_order INTEGER DEFAULT 0,
    is_highlight BOOLEAN DEFAULT false, -- main selling points
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===========================
-- INDEXES FOR NEW TABLES
-- ===========================

-- Blog authors indexes
CREATE INDEX IF NOT EXISTS idx_blog_authors_is_active ON blog_authors(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_authors_name ON blog_authors(name);

-- Property availability indexes
CREATE INDEX IF NOT EXISTS idx_property_availability_property_id ON property_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_dates ON property_availability(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_property_availability_status ON property_availability(status);

-- FAQs indexes
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_featured ON faqs(is_featured);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);

-- Property features indexes
CREATE INDEX IF NOT EXISTS idx_property_features_property_id ON property_features(property_id);
CREATE INDEX IF NOT EXISTS idx_property_features_sort_order ON property_features(sort_order);
CREATE INDEX IF NOT EXISTS idx_property_features_is_highlight ON property_features(is_highlight);

-- ===========================
-- ROW LEVEL SECURITY
-- ===========================

-- Enable RLS on new tables
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_authors
CREATE POLICY "Anyone can view active blog authors" ON blog_authors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage blog authors" ON blog_authors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for property_availability (Admin only - sensitive booking data)
CREATE POLICY "Admins can manage property availability" ON property_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for FAQs
CREATE POLICY "Anyone can view active FAQs" ON faqs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for property_features
CREATE POLICY "Anyone can view property features for published properties" ON property_features
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE id = property_features.property_id 
            AND status = 'published' 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can manage property features" ON property_features
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- ===========================
-- TRIGGERS FOR UPDATED_AT
-- ===========================

CREATE TRIGGER set_updated_at_blog_authors
    BEFORE UPDATE ON blog_authors
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_property_availability
    BEFORE UPDATE ON property_availability
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_faqs
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ===========================
-- SAMPLE DATA FOR ENHANCEMENTS
-- ===========================

-- Insert default blog authors (optional - can still use author_name field)
INSERT INTO blog_authors (name, bio, email, is_active) VALUES
('Sarah Johnson', 'Travel writer and Kenya coast enthusiast with over 10 years of experience exploring East Africa.', 'sarah@irotorealty.com', true),
('Michael Chen', 'Marine biologist and diving instructor specializing in Kenyan coastal waters.', 'michael@irotorealty.com', true),
('David Mbugua', 'Real estate investment advisor with deep knowledge of Kenya''s property market.', 'david@irotorealty.com', true),
('Amina Hassan', 'Local cultural expert and food writer from Lamu Island.', 'amina@irotorealty.com', true)
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, is_featured, sort_order) VALUES
('What is included in the rental price?', 'All our rental properties include housekeeping, Wi-Fi, and basic amenities. Specific inclusions vary by property and are detailed in each listing.', 'booking', true, 1),
('How far in advance should I book?', 'We recommend booking 2-3 months in advance, especially for peak season (December-March and July-August).', 'booking', true, 2),
('Do you provide airport transfers?', 'Yes, we can arrange airport transfers for all guests. Please contact us after booking to arrange this service.', 'travel', true, 3),
('What is your cancellation policy?', 'Cancellation policies vary by property. Standard policy is 50% refund for cancellations 30+ days before arrival.', 'booking', false, 4),
('Are pets allowed?', 'Pet policies vary by property. Please check individual property listings or contact us to confirm pet-friendly options.', 'property', false, 5)
ON CONFLICT DO NOTHING;

-- ===========================
-- USEFUL VIEWS FOR OPTIONAL FEATURES
-- ===========================

-- Property availability summary view
CREATE OR REPLACE VIEW property_availability_summary AS
SELECT 
    p.id as property_id,
    p.title as property_title,
    COUNT(pa.id) as total_bookings,
    COUNT(pa.id) FILTER (WHERE pa.status = 'booked') as confirmed_bookings,
    COUNT(pa.id) FILTER (WHERE pa.status = 'blocked') as blocked_periods,
    MIN(pa.start_date) FILTER (WHERE pa.status = 'available' AND pa.start_date > CURRENT_DATE) as next_available_date,
    AVG(pa.rate_override) FILTER (WHERE pa.rate_override IS NOT NULL) as average_custom_rate
FROM properties p
LEFT JOIN property_availability pa ON p.id = pa.property_id
WHERE p.listing_type IN ('rental', 'both') AND p.is_active = true
GROUP BY p.id, p.title;

-- Featured FAQs view for homepage
CREATE OR REPLACE VIEW featured_faqs AS
SELECT 
    id,
    question,
    answer,
    category,
    sort_order
FROM faqs
WHERE is_featured = true AND is_active = true
ORDER BY sort_order ASC, created_at ASC;

COMMENT ON TABLE blog_authors IS 'Dedicated author management for blog posts';
COMMENT ON TABLE property_availability IS 'OPTIONAL: Property availability and booking calendar system';
COMMENT ON TABLE faqs IS 'OPTIONAL: Frequently asked questions for website';
COMMENT ON TABLE property_features IS 'OPTIONAL: Structured property features/highlights for marketing';
COMMENT ON VIEW property_availability_summary IS 'Summary of property booking status and availability';
COMMENT ON VIEW featured_faqs IS 'Featured FAQs for homepage display';