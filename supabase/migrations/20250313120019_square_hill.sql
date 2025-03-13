/*
  # Enhanced Security Measures

  1. Security Updates
    - Add rate limiting for authentication
    - Add IP blocking for suspicious activity
    - Add audit logging
    - Enhance RLS policies
    - Add security functions

  2. New Tables
    - `security_audit_logs` - Track security-related events
    - `blocked_ips` - Store blocked IP addresses
    - `rate_limits` - Track API rate limits

  3. Functions
    - `log_security_event` - Log security events
    - `check_rate_limit` - Check rate limiting
    - `block_ip` - Block suspicious IPs
*/

-- Create security audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    ip_address text,
    user_agent text,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create blocked IPs table
CREATE TABLE IF NOT EXISTS blocked_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address text NOT NULL UNIQUE,
    reason text,
    blocked_until timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Create rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address text NOT NULL,
    endpoint text NOT NULL,
    request_count int DEFAULT 1,
    window_start timestamptz DEFAULT now(),
    UNIQUE (ip_address, endpoint)
);

-- Enable RLS on new tables
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create security event logging function
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type text,
    p_user_id uuid DEFAULT NULL,
    p_ip_address text DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO security_audit_logs (
        user_id,
        event_type,
        ip_address,
        user_agent,
        details
    ) VALUES (
        p_user_id,
        p_event_type,
        p_ip_address,
        p_user_agent,
        p_details
    );
END;
$$;

-- Create rate limiting function
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
BEGIN
    -- Clean up old rate limit records
    DELETE FROM rate_limits
    WHERE window_start < now() - make_interval(mins := p_window_minutes);

    -- Check if IP is blocked
    IF EXISTS (
        SELECT 1 FROM blocked_ips
        WHERE ip_address = p_ip_address
        AND (blocked_until IS NULL OR blocked_until > now())
    ) THEN
        RETURN false;
    END IF;

    -- Get or create rate limit record
    INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, now())
    ON CONFLICT (ip_address, endpoint) DO UPDATE
    SET request_count = rate_limits.request_count + 1
    WHERE rate_limits.window_start > now() - make_interval(mins := p_window_minutes)
    RETURNING window_start, request_count INTO v_window_start, v_current_count;

    -- Check if rate limit is exceeded
    IF v_current_count > p_max_requests THEN
        -- Log rate limit violation
        PERFORM log_security_event(
            'rate_limit_exceeded',
            NULL,
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

-- Create IP blocking function
CREATE OR REPLACE FUNCTION block_ip(
    p_ip_address text,
    p_reason text DEFAULT NULL,
    p_duration_hours int DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO blocked_ips (
        ip_address,
        reason,
        blocked_until
    ) VALUES (
        p_ip_address,
        p_reason,
        CASE
            WHEN p_duration_hours IS NOT NULL THEN now() + make_interval(hours := p_duration_hours)
            ELSE NULL
        END
    )
    ON CONFLICT (ip_address) DO UPDATE
    SET
        reason = EXCLUDED.reason,
        blocked_until = EXCLUDED.blocked_until;

    -- Log IP blocking event
    PERFORM log_security_event(
        'ip_blocked',
        NULL,
        p_ip_address,
        NULL,
        jsonb_build_object(
            'reason', p_reason,
            'duration_hours', p_duration_hours
        )
    );
END;
$$;

-- Enhance user_profiles RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR
        check_is_admin()
        OR
        EXISTS (
            SELECT 1
            FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'moderator'
        )
    );

-- Add policies for security audit logs
CREATE POLICY "Admins can view audit logs"
    ON security_audit_logs
    FOR SELECT
    TO authenticated
    USING (check_is_admin());

-- Add policies for blocked IPs
CREATE POLICY "Admins can manage blocked IPs"
    ON blocked_ips
    FOR ALL
    TO authenticated
    USING (check_is_admin())
    WITH CHECK (check_is_admin());

-- Add policies for rate limits
CREATE POLICY "Admins can view rate limits"
    ON rate_limits
    FOR SELECT
    TO authenticated
    USING (check_is_admin());

-- Create function to check if user is moderator
CREATE OR REPLACE FUNCTION check_is_moderator() RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'moderator'
    );
END;
$$;

-- Create function to validate email domain
CREATE OR REPLACE FUNCTION is_valid_email_domain(email text) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Add your allowed domain logic here
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Create trigger to log user profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        PERFORM log_security_event(
            'profile_updated',
            NEW.id,
            NULL,
            NULL,
            jsonb_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_security_event(
            'profile_deleted',
            OLD.id,
            NULL,
            NULL,
            jsonb_build_object(
                'role', OLD.role,
                'status', OLD.status
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER log_profile_changes
    AFTER UPDATE OR DELETE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_changes();

-- Update get_all_users function with security checks
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
    -- Check if user is admin
    IF NOT check_is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Check rate limiting
    IF NOT check_rate_limit(current_setting('request.headers')::json->>'x-real-ip', 'get_all_users', 100, 15) THEN
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
        auth.uid(),
        current_setting('request.headers')::json->>'x-real-ip',
        current_setting('request.headers')::json->>'user-agent'
    );
END;
$$;