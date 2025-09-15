-- Migration: 009_fix_rls_policies.sql
-- Description: Fix RLS policies to avoid infinite recursion and ensure admin access
-- Date: 2025-09-14

-- Drop the problematic policies that cause infinite recursion
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

-- Ensure admin user has correct profile
-- This will create or update the admin profile for the existing auth user
INSERT INTO profiles (id, email, role, is_active)
SELECT 
    u.id, 
    u.email, 
    'admin', 
    true
FROM auth.users u 
WHERE u.email = 'admin@irotorealty.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    is_active = true,
    email = EXCLUDED.email;

COMMENT ON TABLE profiles IS 'User profiles with simplified RLS policies to avoid recursion';