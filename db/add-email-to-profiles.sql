-- Check if email column exists in profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'email'
    ) THEN
        -- Add email column to profiles table
        ALTER TABLE profiles ADD COLUMN email TEXT;
        
        -- Update existing profiles with email from auth.users if possible
        UPDATE profiles
        SET email = users.email
        FROM auth.users
        WHERE profiles.id = users.id;
        
        -- Add comment explaining the column
        COMMENT ON COLUMN profiles.email IS 'User email address from auth.users, duplicated for convenience';
    END IF;
END
$$;

-- Create an index on the email column for faster lookups
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'profiles'
        AND indexname = 'profiles_email_idx'
    ) THEN
        CREATE INDEX profiles_email_idx ON profiles(email);
    END IF;
END
$$;
