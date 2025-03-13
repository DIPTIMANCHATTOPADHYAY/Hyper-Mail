/*
  # Add Admin RLS Policies for User Profiles

  1. Changes
    - Add RLS policy for admin users to update user profiles
    - Maintain existing policies
    - Ensure proper security checks

  2. Security
    - Only allow authenticated admin users to update profiles
    - Use check_is_admin() function for verification
*/

-- Add policy to allow admins to update any user profile
DROP POLICY IF EXISTS "Admins can update user profiles" ON user_profiles;
CREATE POLICY "Admins can update user profiles"
ON user_profiles
FOR UPDATE
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- Add policy to allow admins to insert user profiles
DROP POLICY IF EXISTS "Admins can insert user profiles" ON user_profiles;
CREATE POLICY "Admins can insert user profiles"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (check_is_admin());

-- Add policy to allow admins to delete user profiles
DROP POLICY IF EXISTS "Admins can delete user profiles" ON user_profiles;
CREATE POLICY "Admins can delete user profiles"
ON user_profiles
FOR DELETE
TO authenticated
USING (check_is_admin());

-- Ensure RLS is enabled
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;