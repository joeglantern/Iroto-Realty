-- Migration: 006_create_system_settings.sql
-- Description: Create system settings and configuration tables
-- Date: 2025-09-14

-- Create system settings table for global site configuration
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'url', 'email')),
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- whether this setting can be read by non-admins
    category TEXT DEFAULT 'general', -- group related settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES profiles(id)
);

-- Create homepage content table for dynamic homepage sections
CREATE TABLE homepage_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    image_path TEXT, -- path to image in storage
    button_text TEXT,
    button_link TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES profiles(id)
);

-- Create contact inquiries table (for contact form submissions)
CREATE TABLE contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Details
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Property Interest (optional)
    interested_property_id UUID REFERENCES properties(id),
    inquiry_type TEXT DEFAULT 'general' CHECK (inquiry_type IN ('general', 'property', 'investment', 'booking')),
    
    -- Status
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'replied', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Admin Response
    admin_notes TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES profiles(id),
    
    -- Tracking
    source TEXT DEFAULT 'contact_form', -- where the inquiry came from
    user_ip TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    subscription_source TEXT DEFAULT 'website', -- where they subscribed from
    interests JSONB DEFAULT '[]'::jsonb, -- array of interests like ['lamu', 'investment']
    is_active BOOLEAN DEFAULT true,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create audit log table for tracking important changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES profiles(id),
    user_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);

CREATE INDEX idx_homepage_content_section_key ON homepage_content(section_key);
CREATE INDEX idx_homepage_content_is_active ON homepage_content(is_active);
CREATE INDEX idx_homepage_content_sort_order ON homepage_content(sort_order);

CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_inquiry_type ON contact_inquiries(inquiry_type);
CREATE INDEX idx_contact_inquiries_priority ON contact_inquiries(priority);
CREATE INDEX idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX idx_contact_inquiries_property_id ON contact_inquiries(interested_property_id);

CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_is_active ON newsletter_subscriptions(is_active);
CREATE INDEX idx_newsletter_source ON newsletter_subscriptions(subscription_source);
CREATE INDEX idx_newsletter_created_at ON newsletter_subscriptions(created_at DESC);

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- System Settings Policies
CREATE POLICY "Anyone can view public settings" ON system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Homepage Content Policies
CREATE POLICY "Anyone can view active homepage content" ON homepage_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage homepage content" ON homepage_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Contact Inquiries Policies
CREATE POLICY "Anyone can insert contact inquiries" ON contact_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact inquiries" ON contact_inquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Newsletter Subscriptions Policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Audit Log Policies (admin only)
CREATE POLICY "Admins can view audit log" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_system_settings
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_homepage_content
    BEFORE UPDATE ON homepage_content
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_contact_inquiries
    BEFORE UPDATE ON contact_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_newsletter_subscriptions
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, category) VALUES
('site_name', 'Iroto Realty', 'text', 'Website name', true, 'general'),
('site_description', 'Premium coastal properties in Kenya', 'text', 'Website description for SEO', true, 'seo'),
('contact_email', 'info@irotorealty.com', 'email', 'Main contact email', true, 'contact'),
('contact_phone', '+254 XXX XXX XXX', 'text', 'Main contact phone', true, 'contact'),
('office_address', 'Lamu Island, Kenya', 'text', 'Office address', true, 'contact'),
('social_facebook', '', 'url', 'Facebook page URL', true, 'social'),
('social_instagram', '', 'url', 'Instagram profile URL', true, 'social'),
('social_twitter', '', 'url', 'Twitter profile URL', true, 'social'),
('google_analytics_id', '', 'text', 'Google Analytics tracking ID', false, 'analytics'),
('max_file_upload_size', '10485760', 'number', 'Max file upload size in bytes (10MB)', false, 'uploads'),
('allowed_image_types', '["jpg", "jpeg", "png", "webp"]', 'json', 'Allowed image file types', false, 'uploads'),
('featured_properties_limit', '6', 'number', 'Number of featured properties to show on homepage', false, 'display'),
('blog_posts_per_page', '10', 'number', 'Number of blog posts per page', false, 'blog'),
('reviews_require_approval', 'true', 'boolean', 'Whether reviews need admin approval', false, 'reviews'),
('currency_symbol', 'KES', 'text', 'Currency symbol for prices', true, 'pricing'),
('default_meta_title', 'Iroto Realty - Premium Coastal Properties in Kenya', 'text', 'Default meta title', true, 'seo'),
('default_meta_description', 'Discover luxury vacation rentals and investment opportunities in Kenya''s premier coastal destinations including Lamu and Watamu.', 'text', 'Default meta description', true, 'seo');

-- Insert default homepage content
INSERT INTO homepage_content (section_key, title, subtitle, content, is_active, sort_order) VALUES
('hero', 'IROTO REALTY', 'Discover Kenya''s Premier Coastal Properties', 'Experience luxury living in Kenya''s most sought-after coastal destinations', true, 1),
('about_preview', 'About Iroto Realty', 'Your trusted partner in premium Kenyan real estate', 'Founded with a vision to showcase Kenya''s most exceptional coastal properties, Iroto Realty has become synonymous with luxury, authenticity, and unparalleled service.', true, 2),
('why_choose', 'Why Choose Our Properties', 'Excellence in every detail', 'From luxury amenities to prime locations, we maintain the highest standards in every property we represent.', true, 3);

COMMENT ON TABLE system_settings IS 'Global system settings and configuration';
COMMENT ON TABLE homepage_content IS 'Dynamic content sections for homepage';
COMMENT ON TABLE contact_inquiries IS 'Contact form submissions and inquiries';
COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions';
COMMENT ON TABLE audit_log IS 'Audit trail for important system changes';
COMMENT ON COLUMN system_settings.is_public IS 'Whether non-admin users can read this setting';
COMMENT ON COLUMN homepage_content.image_path IS 'Path to section image in Supabase storage';
COMMENT ON COLUMN contact_inquiries.source IS 'Where the inquiry originated from';
COMMENT ON COLUMN newsletter_subscriptions.interests IS 'JSON array of subscriber interests';