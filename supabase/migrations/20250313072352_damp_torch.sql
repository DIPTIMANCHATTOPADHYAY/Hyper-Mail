/*
  # Fix admin authentication and user deletion

  1. Changes
    - Drop trigger before function to resolve dependency
    - Recreate admin_users table with proper constraints
    - Update RLS policies for better security
    - Add function to check admin status
    - Fix delete_user function to handle errors properly

  2. Security
    - All functions are SECURITY DEFINER
    - Explicit search path set for security
    - Proper error handling added
*/

-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS delete_user(uuid);
DROP FUNCTION IF EXISTS handle_admin_auth();

-- Drop the table last since it has no dependencies
DROP TABLE IF EXISTS admin_users;

-- Create admin_users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin users can update own data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE email = user_email
  );
END;
$$;

-- Function to handle admin auth
CREATE OR REPLACE FUNCTION handle_admin_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create admin user record if user_metadata indicates admin status
  IF (NEW.raw_user_meta_data->>'is_admin')::boolean = true THEN
    INSERT INTO admin_users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (email) 
    DO UPDATE SET
      updated_at = now()
    WHERE admin_users.id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger after the function exists
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_auth();

-- Function to delete user
CREATE OR REPLACE FUNCTION delete_user(user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete from auth.users (cascade will handle admin_users)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Insert initial admin user if not exists
INSERT INTO admin_users (id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'nooblofi0@gmail.com'
ON CONFLICT (email) DO NOTHING;