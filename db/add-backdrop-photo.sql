-- Add backdrop_photo_url column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'backdrop_photo_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN backdrop_photo_url TEXT;
    END IF;
END
$$;
