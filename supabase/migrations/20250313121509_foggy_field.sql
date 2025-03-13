-- Update rate limits table to make ip_address nullable
ALTER TABLE rate_limits ALTER COLUMN ip_address DROP NOT NULL;

-- Update check_rate_limit function to handle missing IP
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address text,
    p_endpoint text,
    p_max_requests int DEFAULT 100,
    p_window_minutes int DEFAULT 15
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_window_start timestamptz;
    v_current_count int;
    v_user_id uuid;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Clean up old rate limit records
    DELETE FROM rate_limits
    WHERE window_start < now() - make_interval(mins := p_window_minutes);

    -- Check if IP is blocked (if IP is provided)
    IF p_ip_address IS NOT NULL AND EXISTS (
        SELECT 1 FROM blocked_ips
        WHERE ip_address = p_ip_address
        AND (blocked_until IS NULL OR blocked_until > now())
    ) THEN
        RETURN false;
    END IF;

    -- Get or create rate limit record using user_id as identifier when IP is null
    INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (
        COALESCE(p_ip_address, v_user_id::text),
        p_endpoint,
        1,
        now()
    )
    ON CONFLICT (ip_address, endpoint) DO UPDATE
    SET request_count = rate_limits.request_count + 1
    WHERE rate_limits.window_start > now() - make_interval(mins := p_window_minutes)
    RETURNING window_start, request_count INTO v_window_start, v_current_count;

    -- Check if rate limit is exceeded
    IF v_current_count > p_max_requests THEN
        -- Log rate limit violation
        PERFORM log_security_event(
            'rate_limit_exceeded',
            v_user_id,
            p_ip_address,
            NULL,
            jsonb_build_object(
                'endpoint', p_endpoint,
                'count', v_current_count,
                'limit', p_max_requests
            )
        );
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Update get_all_users function to handle rate limiting better
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
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Check if user is admin
    IF NOT check_is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Check rate limiting using user ID
    IF NOT check_rate_limit(NULL, 'get_all_users', 100, 15) THEN
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

    -- Log successful access
    PERFORM log_security_event(
        'users_list_accessed',
        v_user_id,
        NULL,
        NULL,
        jsonb_build_object('total_users', (SELECT count(*) FROM auth.users))
    );
END;
$$;