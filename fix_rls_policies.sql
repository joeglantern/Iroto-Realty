-- Fix RLS policies to avoid infinite recursion
-- Run this in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;  
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert new profiles" ON profiles;

-- Create simpler, non-recursive policies
-- Policy: Users can update their own profile (simplified - no role check to avoid recursion)
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow reading profiles for authenticated users (admins need this access)
CREATE POLICY "Authenticated users can read profiles" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Only allow INSERT via trigger function (not direct user access)
CREATE POLICY "Profiles insert via trigger only" ON profiles
    FOR INSERT WITH CHECK (false);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;