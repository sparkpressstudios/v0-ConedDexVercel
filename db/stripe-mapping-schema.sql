-- Update the subscription_tiers_stripe_mapping table to include billing period
ALTER TABLE subscription_tiers_stripe_mapping
ADD COLUMN IF NOT EXISTS billing_period TEXT;

-- Create a unique constraint to ensure we don't have duplicate mappings
ALTER TABLE subscription_tiers_stripe_mapping
DROP CONSTRAINT IF EXISTS unique_tier_price_mapping;

ALTER TABLE subscription_tiers_stripe_mapping
ADD CONSTRAINT unique_tier_price_billing_period_mapping 
UNIQUE (subscription_tier_id, stripe_price_id, billing_period);
