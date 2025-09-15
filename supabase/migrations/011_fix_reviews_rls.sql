-- Migration: 011_fix_reviews_rls.sql
-- Description: Fix RLS policies for reviews to prevent hanging/recursion issues
-- Date: 2025-09-15

-- Drop the problematic policy that might be causing recursion
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

-- Create separate policies for different operations to avoid conflicts
CREATE POLICY "Admins can insert reviews" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

CREATE POLICY "Admins can update reviews" ON reviews
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

CREATE POLICY "Admins can delete reviews" ON reviews
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

COMMENT ON TABLE reviews IS 'Reviews table with fixed RLS policies to prevent recursion';