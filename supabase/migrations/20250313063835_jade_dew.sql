/*
  # Set up admin authentication

  1. Changes
    - Create admin_users table if not exists
    - Create admin authentication trigger
    - Insert initial admin user

  2. Security
    - Enable RLS on admin_users table
    - Add policies for admin users
*/

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin users can read own data" ON admin_users;
  DROP POLICY IF EXISTS "Admin users can update own data" ON admin_users;
END $$;

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

-- Function to handle admin user creation
CREATE OR REPLACE FUNCTION handle_admin_auth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_auth();

-- Insert initial admin user if not exists
INSERT INTO admin_users (email)
VALUES ('nooblofi0@gmail.com')
ON CONFLICT (email) DO NOTHING;