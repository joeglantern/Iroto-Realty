-- Migration: 012_simplify_reviews_rls.sql
-- Description: Simplify RLS policies for reviews to avoid any recursion or hanging issues
-- Date: 2025-09-15

-- Drop all existing review policies to start fresh
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;

-- Create very simple policies that avoid any recursion

-- Policy: Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved' AND is_active = true);

-- Policy: Authenticated users can view all reviews
CREATE POLICY "Authenticated users can view all reviews" ON reviews
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can insert reviews (simplified)
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can update reviews
CREATE POLICY "Authenticated users can update reviews" ON reviews
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can delete reviews
CREATE POLICY "Authenticated users can delete reviews" ON reviews
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON reviews TO authenticated;

COMMENT ON TABLE reviews IS 'Reviews table with simplified RLS policies to avoid hanging issues';