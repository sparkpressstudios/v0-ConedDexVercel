-- Add additional fields to the shops table to store all Google Places data

DO $$
BEGIN
    -- Check and add columns if they don't exist
    
    -- Basic shop information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'google_url') THEN
        ALTER TABLE shops ADD COLUMN google_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'business_hours') THEN
        ALTER TABLE shops ADD COLUMN business_hours JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'price_range') THEN
        ALTER TABLE shops ADD COLUMN price_range INTEGER;
    END IF;
    
    -- Enhanced details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'wheelchair_accessible') THEN
        ALTER TABLE shops ADD COLUMN wheelchair_accessible BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'serves_beer') THEN
        ALTER TABLE shops ADD COLUMN serves_beer BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'serves_wine') THEN
        ALTER TABLE shops ADD COLUMN serves_wine BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'serves_vegetarian') THEN
        ALTER TABLE shops ADD COLUMN serves_vegetarian BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'takeout_available') THEN
        ALTER TABLE shops ADD COLUMN takeout_available BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'delivery_available') THEN
        ALTER TABLE shops ADD COLUMN delivery_available BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'outdoor_seating') THEN
        ALTER TABLE shops ADD COLUMN outdoor_seating BOOLEAN;
    END IF;
    
    -- Import metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'import_source') THEN
        ALTER TABLE shops ADD COLUMN import_source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'imported_by') THEN
        ALTER TABLE shops ADD COLUMN imported_by UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'last_synced') THEN
        ALTER TABLE shops ADD COLUMN last_synced TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Shop status and verification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'verification_status') THEN
        ALTER TABLE shops ADD COLUMN verification_status TEXT DEFAULT 'unverified';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'is_permanently_closed') THEN
        ALTER TABLE shops ADD COLUMN is_permanently_closed BOOLEAN DEFAULT false;
    END IF;
    
    -- Reviews and ratings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'google_reviews') THEN
        ALTER TABLE shops ADD COLUMN google_reviews JSONB;
    END IF;
    
    -- Create a separate table for imported reviews if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imported_reviews') THEN
        CREATE TABLE imported_reviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
            author_name TEXT,
            rating INTEGER,
            text TEXT,
            time TIMESTAMP WITH TIME ZONE,
            source TEXT DEFAULT 'google_places',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
END
$$;

-- Create index on googlePlaceId for faster lookups
CREATE INDEX IF NOT EXISTS idx_shops_google_place_id ON shops(googlePlaceId);

-- Create index on business_type for filtering
CREATE INDEX IF NOT EXISTS idx_shops_business_type ON shops(business_type);

-- Create index on verification_status for filtering
CREATE INDEX IF NOT EXISTS idx_shops_verification_status ON shops(verification_status);

-- Add a function to update last_synced timestamp on shop updates
CREATE OR REPLACE FUNCTION update_shop_last_synced()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_synced = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_synced
DROP TRIGGER IF EXISTS update_shop_last_synced_trigger ON shops;
CREATE TRIGGER update_shop_last_synced_trigger
BEFORE UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION update_shop_last_synced();
