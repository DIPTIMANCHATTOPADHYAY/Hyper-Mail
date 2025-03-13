/*
  # Add user management tables and functions

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `role` (text)
      - `status` (text)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles`
    - Add policies for admin access
    - Add function to manage users
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  role text DEFAULT 'user',
  status text DEFAULT 'active',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update user profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Function to get all users with their profiles
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  role text,
  status text,
  last_login timestamptz,
  created_at timestamptz,
  is_admin boolean
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.display_name,
    p.role,
    p.status,
    p.last_login,
    p.created_at,
    (EXISTS (SELECT 1 FROM admin_users a WHERE a.id = u.id)) as is_admin
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;