-- Create shop claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS shop_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    owner_name TEXT NOT NULL,
    owner_position TEXT,
    owner_email TEXT,
    owner_phone TEXT,
    verification_notes TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_shop_claims_shop_id ON shop_claims(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_claims_user_id ON shop_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_claims_status ON shop_claims(status);

-- Add columns to shops table for claim management if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'has_claim_request') THEN
        ALTER TABLE shops ADD COLUMN has_claim_request BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'is_claimed') THEN
        ALTER TABLE shops ADD COLUMN is_claimed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'owner_id') THEN
        ALTER TABLE shops ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END
$$;

-- Create RLS policies for shop claims
ALTER TABLE shop_claims ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own claims
CREATE POLICY "Users can view their own claims"
ON shop_claims
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own claims
CREATE POLICY "Users can insert their own claims"
ON shop_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all claims
CREATE POLICY "Admins can view all claims"
ON shop_claims
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy for admins to update claims
CREATE POLICY "Admins can update claims"
ON shop_claims
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_shop_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_shop_claims_updated_at_trigger ON shop_claims;
CREATE TRIGGER update_shop_claims_updated_at_trigger
BEFORE UPDATE ON shop_claims
FOR EACH ROW
EXECUTE FUNCTION update_shop_claims_updated_at();
