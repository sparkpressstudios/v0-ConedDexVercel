-- First, enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "New users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;

-- Create policies for the profiles table
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow service role to manage all profiles
CREATE POLICY "Service role can manage all profiles" 
ON profiles 
USING (auth.role() = 'service_role');

-- Allow authenticated users to insert their own profile
CREATE POLICY "New users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view other profiles
CREATE POLICY "Authenticated users can view profiles" 
ON profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow admin users to manage all profiles
CREATE POLICY "Admin can manage all profiles"
ON profiles
USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions to the authenticated role
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;

-- Grant permissions to the anon role for the API route
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;
GRANT USAGE ON SEQUENCE profiles_id_seq TO anon;
