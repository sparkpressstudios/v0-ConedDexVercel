-- Check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            full_name TEXT,
            email TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            last_sign_in_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT TRUE,
            email_verified BOOLEAN DEFAULT FALSE
        );
    ELSE
        -- If the table exists but user_id column is referenced instead of id
        -- We'll add a view to make existing code work without breaking changes
        CREATE OR REPLACE VIEW profiles_with_user_id AS
        SELECT 
            id,
            id as user_id,
            full_name,
            email,
            avatar_url,
            role,
            created_at,
            last_sign_in_at,
            is_active,
            email_verified
        FROM profiles;
    END IF;
END
$$;

-- Add RLS policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" 
        ON profiles FOR SELECT 
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" 
        ON profiles FOR UPDATE 
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" 
        ON profiles FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can manage all profiles') THEN
        CREATE POLICY "Service role can manage all profiles" 
        ON profiles 
        USING (auth.role() = 'service_role');
    END IF;
END
$$;
