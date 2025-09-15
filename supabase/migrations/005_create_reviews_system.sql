-- Migration: 005_create_reviews_system.sql
-- Description: Create reviews and ratings system for properties
-- Date: 2025-09-14

-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Property Association
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Reviewer Information
    reviewer_name TEXT NOT NULL,
    reviewer_email TEXT,
    reviewer_location TEXT, -- e.g., "London, UK"
    reviewer_avatar_path TEXT, -- path to avatar image in storage (optional)
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    
    -- Additional Details
    stay_date DATE, -- when they stayed (if provided)
    verified_stay BOOLEAN DEFAULT false, -- if this was a verified booking
    
    -- Review Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Admin Notes (internal)
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id), -- admin who created/imported the review
    updated_by UUID REFERENCES profiles(id)
);

-- Create review responses table (for property owner responses)
CREATE TABLE review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    
    -- Response Content
    response_text TEXT NOT NULL,
    responder_name TEXT DEFAULT 'Iroto Realty Team',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Create review helpful votes table (for users to vote helpful/not helpful)
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    
    -- Vote Details
    is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
    voter_ip TEXT, -- to prevent duplicate voting
    voter_session TEXT, -- alternative to IP for session-based voting
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for reviews
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_is_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_is_active ON reviews(is_active);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_stay_date ON reviews(stay_date);
CREATE INDEX idx_reviews_verified_stay ON reviews(verified_stay);

-- Create indexes for review responses
CREATE INDEX idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX idx_review_responses_is_active ON review_responses(is_active);

-- Create indexes for review votes
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_voter_ip ON review_votes(voter_ip);
CREATE UNIQUE INDEX idx_review_votes_unique_ip_vote ON review_votes(review_id, voter_ip);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews

-- Policy: Anyone can view approved reviews for published properties
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (
        status = 'approved' 
        AND is_active = true
        AND EXISTS (
            SELECT 1 FROM properties 
            WHERE id = reviews.property_id 
            AND status = 'published' 
            AND is_active = true
        )
    );

-- Policy: Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policy: Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for review responses

-- Policy: Anyone can view active responses for approved reviews
CREATE POLICY "Anyone can view active review responses" ON review_responses
    FOR SELECT USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM reviews 
            WHERE id = review_responses.review_id 
            AND status = 'approved' 
            AND is_active = true
        )
    );

-- Policy: Admins can manage review responses
CREATE POLICY "Admins can manage review responses" ON review_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for review votes

-- Policy: Anyone can view vote counts (aggregated)
CREATE POLICY "Anyone can view review votes" ON review_votes
    FOR SELECT USING (true);

-- Policy: Anyone can insert votes (but with uniqueness constraints)
CREATE POLICY "Anyone can vote on reviews" ON review_votes
    FOR INSERT WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_reviews
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_review_responses
    BEFORE UPDATE ON review_responses
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Add updated_by triggers
CREATE TRIGGER set_updated_by_reviews
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_by();

CREATE TRIGGER set_updated_by_review_responses
    BEFORE UPDATE ON review_responses
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_by();

-- Function to set approved_at when status changes to approved
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to 'approved' and approved_at is null
    IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.approved_at IS NULL THEN
        NEW.approved_at = timezone('utc'::text, now());
        NEW.approved_by = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_approved_at_reviews
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_approved_at();

-- Create view for property review statistics
CREATE VIEW property_review_stats AS
SELECT 
    p.id as property_id,
    p.title as property_title,
    COUNT(r.id) as total_reviews,
    COUNT(r.id) FILTER (WHERE r.is_featured = true) as featured_reviews,
    ROUND(AVG(r.rating), 2) as average_rating,
    COUNT(r.id) FILTER (WHERE r.rating = 5) as five_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 4) as four_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 3) as three_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 2) as two_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 1) as one_star_count,
    MAX(r.created_at) as latest_review_date
FROM properties p
LEFT JOIN reviews r ON p.id = r.property_id 
    AND r.status = 'approved' 
    AND r.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.title;

-- Create view for featured reviews (for homepage testimonials)
CREATE VIEW featured_reviews AS
SELECT 
    r.id,
    r.property_id,
    p.title as property_name,
    r.reviewer_name,
    r.reviewer_location,
    r.reviewer_avatar_path,
    r.rating,
    r.title as review_title,
    r.comment,
    r.created_at
FROM reviews r
JOIN properties p ON r.property_id = p.id
WHERE r.status = 'approved' 
    AND r.is_featured = true 
    AND r.is_active = true
    AND p.is_active = true
ORDER BY r.created_at DESC;

-- Insert some sample reviews for testing
INSERT INTO reviews (
    property_id, 
    reviewer_name, 
    reviewer_location, 
    rating, 
    title,
    comment, 
    status,
    is_featured,
    stay_date,
    verified_stay
) 
SELECT 
    p.id,
    'Sarah Mitchell',
    'London, UK',
    5,
    'Absolutely magical stay',
    'Our stay at this villa was absolutely magical. The property exceeded our expectations in every way, and the team at Iroto Realty made everything seamless.',
    'approved',
    true,
    CURRENT_DATE - INTERVAL '30 days',
    true
FROM properties p 
WHERE p.slug LIKE '%lamu%' 
LIMIT 1;

INSERT INTO reviews (
    property_id, 
    reviewer_name, 
    reviewer_location, 
    rating, 
    title,
    comment, 
    status,
    is_featured,
    stay_date,
    verified_stay
) 
SELECT 
    p.id,
    'James Wilson',
    'New York, USA',
    5,
    'Best investment decision',
    'Investing in coastal Kenya through Iroto Realty was the best decision we made. The ROI has been excellent and the property management is top-notch.',
    'approved',
    true,
    CURRENT_DATE - INTERVAL '60 days',
    true
FROM properties p 
WHERE p.slug LIKE '%watamu%' 
LIMIT 1;

COMMENT ON TABLE reviews IS 'Customer reviews and ratings for properties';
COMMENT ON TABLE review_responses IS 'Property owner/management responses to reviews';
COMMENT ON TABLE review_votes IS 'User votes on review helpfulness';
COMMENT ON COLUMN reviews.reviewer_avatar_path IS 'Path to reviewer avatar in Supabase storage';
COMMENT ON COLUMN reviews.verified_stay IS 'Whether this review is from a verified booking';
COMMENT ON COLUMN reviews.is_featured IS 'Whether to display prominently on homepage/property page';
COMMENT ON VIEW property_review_stats IS 'Aggregated review statistics per property';
COMMENT ON VIEW featured_reviews IS 'Featured reviews for homepage testimonials';