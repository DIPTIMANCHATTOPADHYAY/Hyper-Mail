/*
  # Create admin users table and authentication

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policies for authenticated users to read and update their own data
    - Create trigger function to handle admin user creation
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