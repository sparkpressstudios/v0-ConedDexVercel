-- Add additional image fields to the shops table if they don't exist

DO $$
BEGIN
    -- Check if thumbnailImage column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shops' AND column_name = 'thumbnail_image') THEN
        ALTER TABLE shops ADD COLUMN thumbnail_image TEXT;
    END IF;

    -- Check if additionalImages column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shops' AND column_name = 'additional_images') THEN
        ALTER TABLE shops ADD COLUMN additional_images TEXT[];
    END IF;

    -- Check if businessType column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shops' AND column_name = 'business_type') THEN
        ALTER TABLE shops ADD COLUMN business_type TEXT;
    END IF;
END
$$;

-- Create a function to update existing shops with thumbnail images
CREATE OR REPLACE FUNCTION generate_thumbnail_from_main_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If mainImage exists but thumbnailImage doesn't, create a thumbnail URL
    IF NEW.main_image IS NOT NULL AND NEW.thumbnail_image IS NULL THEN
        -- Extract the photo reference from the main_image URL if it's a Google Places photo
        IF NEW.main_image LIKE '%/api/maps/photo?reference=%' THEN
            NEW.thumbnail_image = REPLACE(NEW.main_image, 'maxwidth=800', 'maxwidth=200');
        ELSE
            -- For other image types, just use the same URL for now
            NEW.thumbnail_image = NEW.main_image;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate thumbnails
DROP TRIGGER IF EXISTS generate_thumbnail_trigger ON shops;
CREATE TRIGGER generate_thumbnail_trigger
BEFORE INSERT OR UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION generate_thumbnail_from_main_image();

-- Add an index on googlePlaceId for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_shops_google_place_id ON shops(google_place_id);
