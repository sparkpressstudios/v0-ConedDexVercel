-- Create the subscription_tiers_stripe_mapping table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_tiers_stripe_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint to ensure we don't have duplicate mappings
ALTER TABLE subscription_tiers_stripe_mapping
DROP CONSTRAINT IF EXISTS unique_tier_price_billing_period_mapping;

ALTER TABLE subscription_tiers_stripe_mapping
ADD CONSTRAINT unique_tier_price_billing_period_mapping 
UNIQUE (subscription_tier_id, stripe_price_id, billing_period);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_stripe_mapping_tier_id
ON subscription_tiers_stripe_mapping(subscription_tier_id);

CREATE INDEX IF NOT EXISTS idx_subscription_tiers_stripe_mapping_price_id
ON subscription_tiers_stripe_mapping(stripe_price_id);
