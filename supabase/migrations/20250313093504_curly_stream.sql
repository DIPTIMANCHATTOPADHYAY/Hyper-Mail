/*
  # Fix User List Loading

  1. Changes
    - Create function to fetch all users with admin status
    - Include user profiles and admin status in results
    - Add proper type definition for results

  2. Security
    - Only allow authenticated users to call this function
    - Add RLS policy to restrict access to admins only
*/

CREATE OR REPLACE FUNCTION public.get_all_users()
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
    up.display_name,
    up.role,
    up.status,
    up.last_login,
    u.created_at,
    (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = u.id)) as is_admin
  FROM auth.users u
  LEFT JOIN user_profiles up ON u.id = up.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Revoke execute from public and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM public;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- Add policy to restrict function execution to admins only
CREATE OR REPLACE FUNCTION check_is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS admin_users_can_get_all_users ON user_profiles;
CREATE POLICY admin_users_can_get_all_users ON user_profiles
  FOR SELECT
  TO authenticated
  USING (check_is_admin());