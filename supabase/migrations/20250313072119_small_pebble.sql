/*
  # Add delete_user function

  1. New Functions
    - `delete_user`: Deletes a user and their associated data
      - Parameters:
        - user_id (uuid): The ID of the user to delete

  2. Security
    - Function is set to SECURITY DEFINER to run with elevated privileges
    - Search path is explicitly set to public for security
*/

-- Drop the function if it exists
DROP FUNCTION IF EXISTS delete_user(uuid);

-- Create the delete_user function
CREATE OR REPLACE FUNCTION delete_user(user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  -- Get the auth user
  SELECT * INTO auth_user FROM auth.users WHERE id = user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete from admin_users if exists
  DELETE FROM admin_users WHERE id = user_id;

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;