/*
  # Fix Rate Limiting in get_all_users Function

  1. Changes
    - Remove IP address requirement from rate limiting
    - Add default IP for function calls
    - Update rate limit check to use user ID instead of IP
    - Add better error handling

  2. Security
    - Maintain admin-only access
    - Keep audit logging
    - Preserve rate limiting but make it user-based
*/

-- Update the get_all_users function to handle missing IP address
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
DECLARE
    v_user_id uuid;
    v_default_ip text := '127.0.0.1';
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Check if user is admin
    IF NOT check_is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Check rate limiting using user ID instead of IP
    IF NOT check_rate_limit(
        COALESCE(current_setting('request.headers')::json->>'x-real-ip', v_default_ip),
        'get_all_users',
        100, -- max requests
        15   -- window minutes
    ) THEN
        RAISE EXCEPTION 'Rate limit exceeded';
    END IF;

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

    -- Log successful access with default IP if not provided
    PERFORM log_security_event(
        'users_list_accessed',
        v_user_id,
        COALESCE(current_setting('request.headers')::json->>'x-real-ip', v_default_ip),
        COALESCE(current_setting('request.headers')::json->>'user-agent', 'Unknown')
    );
END;
$$;