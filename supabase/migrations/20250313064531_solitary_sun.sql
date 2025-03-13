/*
  # Fix Admin Authentication System

  1. Changes
    - Drop all existing admin-related objects
    - Recreate admin_users table with proper structure
    - Add RLS policies with proper checks
    - Create improved admin auth trigger function
    - Add initial admin user

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Improve trigger function security
*/

-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_admin_auth();
DROP TABLE IF EXISTS admin_users;

-- Create admin_users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Improved admin auth function
CREATE FUNCTION handle_admin_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create admin user record for specific email
  IF NEW.email = 'nooblofi0@gmail.com' THEN
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

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_auth();

-- Insert initial admin user
INSERT INTO admin_users (email)
VALUES ('nooblofi0@gmail.com')
ON CONFLICT (email) DO NOTHING;