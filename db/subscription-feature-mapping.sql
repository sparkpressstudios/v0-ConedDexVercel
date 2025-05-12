-- Features table
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription tiers table (if not already exists)
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  stripe_price_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature limits table (for features with quantity limits)
CREATE TABLE IF NOT EXISTS feature_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  subscription_tier_id UUID REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  max_count INTEGER,
  UNIQUE(feature_id, subscription_tier_id)
);

-- Subscription tier features mapping
CREATE TABLE IF NOT EXISTS subscription_tier_features (
  subscription_tier_id UUID REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  limit_id UUID REFERENCES feature_limits(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (subscription_tier_id, feature_id)
);

-- Function to check if a user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_key VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.subscription_tier_id = st.id
    JOIN subscription_tier_features stf ON st.id = stf.subscription_tier_id
    JOIN features f ON stf.feature_id = f.id
    WHERE us.user_id = p_user_id
    AND f.key = p_feature_key
    AND stf.is_enabled = true
    AND us.is_active = true
    AND st.is_active = true
    AND f.is_active = true
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Function to get feature limit for a user
CREATE OR REPLACE FUNCTION get_feature_limit(
  p_user_id UUID,
  p_feature_key VARCHAR
) RETURNS INTEGER AS $$
DECLARE
  feature_limit INTEGER;
BEGIN
  SELECT fl.max_count
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.subscription_tier_id = st.id
  JOIN subscription_tier_features stf ON st.id = stf.subscription_tier_id
  JOIN features f ON stf.feature_id = f.id
  LEFT JOIN feature_limits fl ON stf.limit_id = fl.id
  WHERE us.user_id = p_user_id
  AND f.key = p_feature_key
  AND stf.is_enabled = true
  AND us.is_active = true
  AND st.is_active = true
  AND f.is_active = true
  AND (us.expires_at IS NULL OR us.expires_at > NOW())
  LIMIT 1
  INTO feature_limit;
  
  RETURN feature_limit;
END;
$$ LANGUAGE plpgsql;

-- Seed some common features
INSERT INTO features (name, key, description, category)
VALUES
  ('Unlimited Flavors', 'unlimited_flavors', 'Add unlimited ice cream flavors to your shop', 'Shop Management'),
  ('Shop Analytics', 'shop_analytics', 'Access detailed analytics for your shop', 'Analytics'),
  ('Custom Shop Branding', 'custom_branding', 'Add custom branding to your shop profile', 'Customization'),
  ('Email Marketing', 'email_marketing', 'Send marketing emails to your customers', 'Marketing'),
  ('Multiple Shop Locations', 'multiple_locations', 'Add multiple locations for your shop', 'Shop Management'),
  ('Advanced Reporting', 'advanced_reporting', 'Access advanced reporting features', 'Analytics'),
  ('Customer Management', 'customer_management', 'Manage your customer database', 'CRM'),
  ('Loyalty Program', 'loyalty_program', 'Create and manage a loyalty program', 'Marketing'),
  ('API Access', 'api_access', 'Access the ConeDex API', 'Integration'),
  ('Priority Support', 'priority_support', 'Get priority customer support', 'Support')
ON CONFLICT (key) DO NOTHING;
