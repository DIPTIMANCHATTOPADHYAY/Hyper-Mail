/*
  # Fix Type Mismatch in get_all_users Function

  1. Changes
    - Update function to use correct type casting
    - Ensure all column types match exactly
    - Add COALESCE to handle null values properly

  2. Security
    - Maintain existing security settings
    - Keep RLS policies intact
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
    u.email::text,
    COALESCE(up.display_name, '')::text as display_name,
    COALESCE(up.role, 'user')::text as role,
    COALESCE(up.status, 'active')::text as status,
    up.last_login::timestamptz,
    u.created_at::timestamptz,
    (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = u.id))::boolean as is_admin
  FROM auth.users u
  LEFT JOIN user_profiles up ON u.id = up.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Revoke execute from public and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM public;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;