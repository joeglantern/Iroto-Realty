-- Iroto Realty Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations (Watamu, Lamu, etc.)
CREATE TABLE locations (why
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  hero_image VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Categories
CREATE TABLE property_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  location_id UUID REFERENCES locations(id),
  category_id UUID REFERENCES property_categories(id),
  property_type VARCHAR(20) CHECK (property_type IN ('rental', 'sale')) NOT NULL,
  price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm INTEGER,
  featured_image VARCHAR(500),
  video_url VARCHAR(500),
  amenities JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(100) NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts (Travel Insights)
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  location_id UUID REFERENCES locations(id),
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Content (Dynamic content management)
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(100) NOT NULL, -- 'about', 'contact', 'hero', etc.
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('admin', 'editor')) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_location ON properties(location_id);
CREATE INDEX idx_properties_category ON properties(category_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_reviews_property ON reviews(property_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_blog_posts_location ON blog_posts(location_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);

-- Insert default locations
INSERT INTO locations (name, slug, description, is_active) VALUES
('Lamu', 'lamu', 'Historic island town on Kenya''s coast known for its Swahili architecture and culture.', true),
('Watamu', 'watamu', 'Beautiful coastal town famous for its pristine beaches and marine national park.', true);

-- Insert default property categories
INSERT INTO property_categories (name, slug, description, is_active) VALUES
('Beach House', 'beach-house', 'Luxury beachfront properties with ocean views.', true),
('Villa', 'villa', 'Spacious villas with private amenities.', true),
('Apartment', 'apartment', 'Modern apartments with contemporary facilities.', true),
('Traditional House', 'traditional-house', 'Authentic Swahili architecture properties.', true);

-- Insert sample site content
INSERT INTO site_content (section, content, is_active) VALUES
('hero', '{
  "title": "Premium Real Estate in Kenya",
  "subtitle": "Discover luxury properties in Lamu and Watamu",
  "cta_primary": "View Properties",
  "cta_secondary": "Contact Us"
}', true),
('about', '{
  "title": "About Iroto Realty",
  "content": "We specialize in premium real estate along Kenya''s beautiful coast, offering unique properties in Lamu and Watamu that combine luxury with authentic coastal living."
}', true),
('contact', '{
  "email": "info@irotorealty.com",
  "phone": "+254712345678",
  "address": "Lamu Island, Kenya"
}', true);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to active locations" ON locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active categories" ON property_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active properties" ON properties
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to property images" ON property_images
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Allow public read access to published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Allow public read access to active site content" ON site_content
  FOR SELECT USING (is_active = true);

-- Policies for admin access (you'll need to configure authentication)
-- These policies assume you have proper authentication setup

CREATE POLICY "Allow admin full access to all tables" ON locations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to categories" ON property_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to properties" ON properties
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to property images" ON property_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to reviews" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to site content" ON site_content
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access to admin users" ON admin_users
  FOR ALL USING (auth.role() = 'authenticated');