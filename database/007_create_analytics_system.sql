-- Migration: 007_create_analytics_system.sql
-- Description: Create analytics and tracking system for admin insights
-- Date: 2025-09-14

-- Create page views tracking table
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Page Details
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer_url TEXT,
    
    -- Property/Content Association
    property_id UUID REFERENCES properties(id),
    blog_post_id UUID REFERENCES blog_posts(id),
    
    -- User/Session Info
    session_id TEXT,
    user_ip TEXT,
    user_agent TEXT,
    device_type TEXT, -- mobile, tablet, desktop
    browser TEXT,
    country TEXT,
    city TEXT,
    
    -- Engagement Metrics
    time_on_page INTEGER, -- seconds spent on page
    scroll_depth INTEGER, -- percentage scrolled (0-100)
    
    -- Timestamps
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create property inquiries tracking (when someone shows interest)
CREATE TABLE property_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    
    -- Inquiry Details
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('view_details', 'contact_form', 'phone_call', 'email_inquiry', 'booking_request')),
    source_page TEXT, -- where they came from
    
    -- Contact Info (if provided)
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    message TEXT,
    
    -- Tracking
    session_id TEXT,
    user_ip TEXT,
    user_agent TEXT,
    referrer_url TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT true,
    followed_up_at TIMESTAMP WITH TIME ZONE,
    followed_up_by UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create search queries tracking
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Search Details
    query_text TEXT NOT NULL,
    filters_applied JSONB DEFAULT '{}'::jsonb, -- location, price range, etc.
    results_count INTEGER DEFAULT 0,
    
    -- User clicked on result
    result_clicked BOOLEAN DEFAULT false,
    clicked_property_id UUID REFERENCES properties(id),
    click_position INTEGER, -- which result position was clicked
    
    -- Tracking
    session_id TEXT,
    user_ip TEXT,
    page_path TEXT,
    
    -- Timestamps
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create email campaigns tracking (for newsletter/marketing)
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campaign Details
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT,
    campaign_type TEXT DEFAULT 'newsletter' CHECK (campaign_type IN ('newsletter', 'property_alert', 'promotional', 'follow_up')),
    
    -- Sending Details
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- Create email interactions tracking
CREATE TABLE email_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id),
    
    -- Recipient Info
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    
    -- Interaction Details
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('sent', 'delivered', 'opened', 'clicked', 'unsubscribed', 'bounced')),
    clicked_url TEXT, -- if clicked, what URL
    
    -- Tracking
    user_agent TEXT,
    ip_address TEXT,
    
    -- Timestamps
    interacted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create performance metrics summary table (daily aggregates)
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    
    -- Website Metrics
    total_page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    property_views INTEGER DEFAULT 0,
    blog_views INTEGER DEFAULT 0,
    
    -- Engagement Metrics
    total_inquiries INTEGER DEFAULT 0,
    contact_form_submissions INTEGER DEFAULT 0,
    newsletter_signups INTEGER DEFAULT 0,
    
    -- Property Metrics
    properties_viewed INTEGER DEFAULT 0,
    most_viewed_property_id UUID REFERENCES properties(id),
    most_viewed_property_views INTEGER DEFAULT 0,
    
    -- Search Metrics
    total_searches INTEGER DEFAULT 0,
    top_search_term TEXT,
    top_search_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(metric_date)
);

-- Create indexes for analytics tables
CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_page_views_property_id ON page_views(property_id);
CREATE INDEX idx_page_views_blog_post_id ON page_views(blog_post_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
CREATE INDEX idx_page_views_device_type ON page_views(device_type);

CREATE INDEX idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_inquiry_type ON property_inquiries(inquiry_type);
CREATE INDEX idx_property_inquiries_status ON property_inquiries(status);
CREATE INDEX idx_property_inquiries_created_at ON property_inquiries(created_at DESC);
CREATE INDEX idx_property_inquiries_follow_up ON property_inquiries(follow_up_required, followed_up_at);

CREATE INDEX idx_search_queries_query_text ON search_queries(query_text);
CREATE INDEX idx_search_queries_searched_at ON search_queries(searched_at DESC);
CREATE INDEX idx_search_queries_result_clicked ON search_queries(result_clicked);
CREATE INDEX idx_search_queries_session_id ON search_queries(session_id);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_campaign_type ON email_campaigns(campaign_type);
CREATE INDEX idx_email_campaigns_created_at ON email_campaigns(created_at DESC);

CREATE INDEX idx_email_interactions_campaign_id ON email_interactions(campaign_id);
CREATE INDEX idx_email_interactions_recipient_email ON email_interactions(recipient_email);
CREATE INDEX idx_email_interactions_interaction_type ON email_interactions(interaction_type);
CREATE INDEX idx_email_interactions_interacted_at ON email_interactions(interacted_at DESC);

CREATE INDEX idx_daily_metrics_metric_date ON daily_metrics(metric_date DESC);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Analytics are admin-only for viewing, but anyone can insert tracking data)

-- Page Views Policies
CREATE POLICY "Anyone can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all page views" ON page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Property Inquiries Policies
CREATE POLICY "Anyone can insert property inquiries" ON property_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage property inquiries" ON property_inquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Search Queries Policies
CREATE POLICY "Anyone can insert search queries" ON search_queries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view search queries" ON search_queries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Email Campaigns Policies (Admin only)
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Email Interactions Policies
CREATE POLICY "Anyone can insert email interactions" ON email_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view email interactions" ON email_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Daily Metrics Policies (Admin only)
CREATE POLICY "Admins can manage daily metrics" ON daily_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_property_inquiries
    BEFORE UPDATE ON property_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_email_campaigns
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_daily_metrics
    BEFORE UPDATE ON daily_metrics
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create analytics views for admin dashboard

-- Popular Properties View
CREATE VIEW popular_properties AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.category_id,
    pc.name as category_name,
    COUNT(pv.id) as total_views,
    COUNT(pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '30 days') as views_last_30_days,
    COUNT(pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '7 days') as views_last_7_days,
    COUNT(pi.id) as total_inquiries,
    COUNT(pi.id) FILTER (WHERE pi.created_at > NOW() - INTERVAL '30 days') as inquiries_last_30_days
FROM properties p
LEFT JOIN property_categories pc ON p.category_id = pc.id
LEFT JOIN page_views pv ON p.id = pv.property_id
LEFT JOIN property_inquiries pi ON p.id = pi.property_id
WHERE p.is_active = true AND p.status = 'published'
GROUP BY p.id, p.title, p.slug, p.category_id, pc.name
ORDER BY views_last_30_days DESC;

-- Popular Blog Posts View
CREATE VIEW popular_blog_posts AS
SELECT 
    bp.id,
    bp.title,
    bp.slug,
    bp.category_id,
    bc.name as category_name,
    bp.author_name,
    COUNT(pv.id) as total_views,
    COUNT(pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '30 days') as views_last_30_days,
    COUNT(pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '7 days') as views_last_7_days
FROM blog_posts bp
LEFT JOIN blog_categories bc ON bp.category_id = bc.id
LEFT JOIN page_views pv ON bp.id = pv.blog_post_id
WHERE bp.status = 'published'
GROUP BY bp.id, bp.title, bp.slug, bp.category_id, bc.name, bp.author_name
ORDER BY views_last_30_days DESC;

-- Traffic Summary View
CREATE VIEW traffic_summary AS
SELECT 
    DATE(pv.viewed_at) as view_date,
    COUNT(*) as total_page_views,
    COUNT(DISTINCT pv.session_id) as unique_sessions,
    COUNT(DISTINCT pv.user_ip) as unique_visitors,
    COUNT(*) FILTER (WHERE pv.property_id IS NOT NULL) as property_views,
    COUNT(*) FILTER (WHERE pv.blog_post_id IS NOT NULL) as blog_views,
    COUNT(DISTINCT pv.device_type) as device_types,
    AVG(pv.time_on_page) as avg_time_on_page,
    AVG(pv.scroll_depth) as avg_scroll_depth
FROM page_views pv
WHERE pv.viewed_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(pv.viewed_at)
ORDER BY view_date DESC;

-- Search Analytics View
CREATE VIEW search_analytics AS
SELECT 
    sq.query_text,
    COUNT(*) as search_count,
    COUNT(*) FILTER (WHERE sq.result_clicked = true) as clicked_searches,
    ROUND((COUNT(*) FILTER (WHERE sq.result_clicked = true)::decimal / COUNT(*) * 100), 2) as click_through_rate,
    AVG(sq.results_count) as avg_results_count,
    COUNT(*) FILTER (WHERE sq.searched_at > NOW() - INTERVAL '30 days') as searches_last_30_days
FROM search_queries sq
WHERE sq.searched_at > NOW() - INTERVAL '90 days'
GROUP BY sq.query_text
HAVING COUNT(*) >= 2
ORDER BY search_count DESC;

COMMENT ON TABLE page_views IS 'Track all page views for analytics';
COMMENT ON TABLE property_inquiries IS 'Track property interest and lead generation';
COMMENT ON TABLE search_queries IS 'Track search behavior and optimize search results';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns management';
COMMENT ON TABLE email_interactions IS 'Track email open/click rates';
COMMENT ON TABLE daily_metrics IS 'Daily aggregated metrics for performance tracking';
COMMENT ON VIEW popular_properties IS 'Most viewed and inquired properties';
COMMENT ON VIEW popular_blog_posts IS 'Most popular blog posts by views';
COMMENT ON VIEW traffic_summary IS 'Daily traffic summary for dashboard charts';
COMMENT ON VIEW search_analytics IS 'Search query performance and optimization insights';