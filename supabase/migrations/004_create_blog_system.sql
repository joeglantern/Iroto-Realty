-- Migration: 004_create_blog_system.sql
-- Description: Create blog system with posts, categories, and tags
-- Date: 2025-09-14

-- Create blog categories table
CREATE TABLE blog_categories (
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

-- Create blog tags table
CREATE TABLE blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- Create blog posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    
    -- Categorization
    category_id UUID REFERENCES blog_categories(id),
    
    -- Media (stored in storage bucket)
    featured_image_path TEXT, -- path to featured image in storage
    
    -- Author Info
    author_name TEXT NOT NULL,
    author_bio TEXT,
    author_avatar_path TEXT, -- path to author avatar in storage
    
    -- Publishing Info
    read_time TEXT, -- e.g., "5 min read"
    
    -- SEO Fields
    meta_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    
    -- Publishing & Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Create junction table for blog post tags (many-to-many)
CREATE TABLE blog_post_tags (
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    blog_tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (blog_post_id, blog_tag_id)
);

-- Create indexes for blog categories
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_categories_is_active ON blog_categories(is_active);
CREATE INDEX idx_blog_categories_sort_order ON blog_categories(sort_order);

-- Create indexes for blog tags
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX idx_blog_tags_is_active ON blog_tags(is_active);
CREATE INDEX idx_blog_tags_name ON blog_tags(name);

-- Create indexes for blog posts
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author_name ON blog_posts(author_name);

-- Full text search index for blog posts
CREATE INDEX idx_blog_posts_search ON blog_posts USING GIN (
    to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(excerpt, '') || ' ' ||
        COALESCE(content, '') || ' ' ||
        COALESCE(author_name, '')
    )
);

-- Create indexes for blog post tags junction
CREATE INDEX idx_blog_post_tags_blog_post_id ON blog_post_tags(blog_post_id);
CREATE INDEX idx_blog_post_tags_blog_tag_id ON blog_post_tags(blog_tag_id);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories

-- Policy: Anyone can view active categories
CREATE POLICY "Anyone can view active blog categories" ON blog_categories
    FOR SELECT USING (is_active = true);

-- Policy: Admins can manage all categories
CREATE POLICY "Admins can manage blog categories" ON blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for blog_tags

-- Policy: Anyone can view active tags
CREATE POLICY "Anyone can view active blog tags" ON blog_tags
    FOR SELECT USING (is_active = true);

-- Policy: Admins can manage all tags
CREATE POLICY "Admins can manage blog tags" ON blog_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for blog_posts

-- Policy: Anyone can view published posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Policy: Admins can manage all posts
CREATE POLICY "Admins can manage blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- RLS Policies for blog_post_tags

-- Policy: Anyone can view tags for published posts
CREATE POLICY "Anyone can view published post tags" ON blog_post_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM blog_posts 
            WHERE id = blog_post_tags.blog_post_id 
            AND status = 'published'
        )
    );

-- Policy: Admins can manage post tags
CREATE POLICY "Admins can manage blog post tags" ON blog_post_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_blog_categories
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_blog_posts
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Add updated_by trigger for blog posts
CREATE TRIGGER set_updated_by_blog_posts
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_by();

-- Add published_at trigger for blog posts
CREATE TRIGGER set_published_at_blog_posts
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

-- Add slug generation for blog posts
CREATE TRIGGER ensure_unique_slug_blog_posts
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION ensure_unique_slug();

-- Function to generate unique blog category slugs
CREATE OR REPLACE FUNCTION ensure_unique_blog_category_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := generate_slug(NEW.name);
    final_slug := base_slug;
    
    WHILE EXISTS (
        SELECT 1 FROM blog_categories 
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

CREATE TRIGGER ensure_unique_slug_blog_categories
    BEFORE INSERT OR UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION ensure_unique_blog_category_slug();

-- Function to generate unique blog tag slugs
CREATE OR REPLACE FUNCTION ensure_unique_blog_tag_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := generate_slug(NEW.name);
    final_slug := base_slug;
    
    WHILE EXISTS (
        SELECT 1 FROM blog_tags 
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

CREATE TRIGGER ensure_unique_slug_blog_tags
    BEFORE INSERT OR UPDATE ON blog_tags
    FOR EACH ROW
    EXECUTE FUNCTION ensure_unique_blog_tag_slug();

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, sort_order) VALUES
('Travel Guide', 'travel-guide', 'Guides and tips for traveling to Kenya coast', 1),
('Activities', 'activities', 'Things to do and experiences at coastal destinations', 2),
('Investment', 'investment', 'Real estate investment insights and opportunities', 3),
('Culture', 'culture', 'Local culture, food, and heritage stories', 4),
('Sustainability', 'sustainability', 'Environmental conservation and responsible tourism', 5),
('Property Tips', 'property-tips', 'Tips for property buyers and renters', 6),
('Local Life', 'local-life', 'Stories from local communities and lifestyle', 7);

-- Insert some default tags
INSERT INTO blog_tags (name, slug) VALUES
('lamu', 'lamu'),
('watamu', 'watamu'),
('beach', 'beach'),
('vacation', 'vacation'),
('kenya', 'kenya'),
('luxury', 'luxury'),
('villa', 'villa'),
('culture', 'culture'),
('marine-life', 'marine-life'),
('investment', 'investment'),
('travel-tips', 'travel-tips'),
('food', 'food'),
('heritage', 'heritage');

COMMENT ON TABLE blog_categories IS 'Blog post categories like Travel Guide, Activities, etc.';
COMMENT ON TABLE blog_tags IS 'Blog post tags for flexible tagging';
COMMENT ON TABLE blog_posts IS 'Blog posts with full content and metadata';
COMMENT ON TABLE blog_post_tags IS 'Many-to-many relationship between posts and tags';
COMMENT ON COLUMN blog_posts.featured_image_path IS 'Path to featured image in Supabase storage';
COMMENT ON COLUMN blog_posts.author_avatar_path IS 'Path to author avatar in Supabase storage';
COMMENT ON COLUMN blog_posts.read_time IS 'Estimated reading time like "5 min read"';