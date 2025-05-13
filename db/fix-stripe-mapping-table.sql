-- Fix for the subscription_tiers_stripe_mapping table
-- This ensures the table has the correct structure and constraints

-- Check if the table exists, if not create it
CREATE TABLE IF NOT EXISTS subscription_tiers_stripe_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  price_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscription_tiers_stripe_mapping_unique_constraint'
  ) THEN
    ALTER TABLE subscription_tiers_stripe_mapping
    ADD CONSTRAINT subscription_tiers_stripe_mapping_unique_constraint
    UNIQUE (subscription_tier_id, stripe_price_id, billing_period);
  END IF;
END
$$;

-- Add price_amount column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_tiers_stripe_mapping' AND column_name = 'price_amount'
  ) THEN
    ALTER TABLE subscription_tiers_stripe_mapping
    ADD COLUMN price_amount DECIMAL(10, 2);
  END IF;
END
$$;

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_tiers_stripe_mapping_updated_at ON subscription_tiers_stripe_mapping;

CREATE TRIGGER update_subscription_tiers_stripe_mapping_updated_at
BEFORE UPDATE ON subscription_tiers_stripe_mapping
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_stripe_mapping_tier_id
ON subscription_tiers_stripe_mapping(subscription_tier_id);

CREATE INDEX IF NOT EXISTS idx_subscription_tiers_stripe_mapping_price_id
ON subscription_tiers_stripe_mapping(stripe_price_id);

-- Add RLS policies
ALTER TABLE subscription_tiers_stripe_mapping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_all_subscription_tiers_stripe_mapping ON subscription_tiers_stripe_mapping;

-- Create policy for admins to have full access
CREATE POLICY admin_all_subscription_tiers_stripe_mapping ON subscription_tiers_stripe_mapping
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
