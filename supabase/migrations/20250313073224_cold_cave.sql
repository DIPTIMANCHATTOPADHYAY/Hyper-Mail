/*
  # Add user cookies storage

  1. New Tables
    - `user_cookies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `cookies` (jsonb, stores cookie data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on user_cookies table
    - Add policies for authenticated users to manage their own cookies
*/

-- Create user_cookies table
CREATE TABLE user_cookies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cookies jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_cookies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own cookies"
  ON user_cookies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cookies"
  ON user_cookies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX user_cookies_user_id_idx ON user_cookies(user_id);