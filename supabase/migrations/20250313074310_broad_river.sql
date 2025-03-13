/*
  # Fix user management functions

  1. Changes
    - Update get_all_users function to match expected return type
    - Add proper type casting for better type safety
    - Improve error handling
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_all_users();

-- Create improved get_all_users function
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
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id::uuid,
    u.email::text,
    COALESCE(p.display_name, 'Unnamed User')::text,
    COALESCE(p.role, 'user')::text,
    COALESCE(p.status, 'active')::text,
    p.last_login::timestamptz,
    COALESCE(p.created_at, u.created_at)::timestamptz,
    (EXISTS (SELECT 1 FROM admin_users a WHERE a.id = u.id))::boolean
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.id
  ORDER BY COALESCE(p.created_at, u.created_at) DESC;
END;
$$;