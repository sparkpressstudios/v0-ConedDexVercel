-- Create table for storing Stripe customers
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_customers_business_id ON stripe_customers(business_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);

-- Add payment-related columns to business_subscriptions table
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_metadata JSONB;

-- Create table for subscription payments
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  payment_provider TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_payments_business_id ON subscription_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment_reference ON subscription_payments(payment_reference);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE TRIGGER update_stripe_customers_timestamp
BEFORE UPDATE ON stripe_customers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subscription_payments_timestamp
BEFORE UPDATE ON subscription_payments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Update the update_business_subscription stored procedure to handle payment info
CREATE OR REPLACE FUNCTION update_business_subscription(
  p_business_id UUID,
  p_tier_id UUID,
  p_user_id UUID,
  p_previous_tier_id UUID DEFAULT NULL,
  p_payment_provider TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_subscription_id UUID;
  v_tier_name TEXT;
BEGIN
  -- Check if a subscription already exists for this business
  SELECT id INTO v_subscription_id
  FROM business_subscriptions
  WHERE business_id = p_business_id;
  
  -- Get the tier name
  SELECT name INTO v_tier_name
  FROM subscription_tiers
  WHERE id = p_tier_id;
  
  IF v_subscription_id IS NULL THEN
    -- Create a new subscription
    INSERT INTO business_subscriptions (
      business_id,
      subscription_tier_id,
      status,
      start_date,
      is_auto_renew,
      payment_provider,
      payment_reference,
      payment_status
    )
    VALUES (
      p_business_id,
      p_tier_id,
      'active',
      NOW(),
      TRUE,
      p_payment_provider,
      p_payment_reference,
      CASE WHEN p_payment_provider IS NOT NULL THEN 'pending' ELSE NULL END
    )
    RETURNING id INTO v_subscription_id;
    
    -- Create an activity log entry
    INSERT INTO activity_log (
      user_id,
      business_id,
      activity_type,
      description,
      metadata
    )
    VALUES (
      p_user_id,
      p_business_id,
      'subscription_created',
      'Subscription created for ' || v_tier_name,
      jsonb_build_object(
        'tier_id', p_tier_id,
        'tier_name', v_tier_name,
        'payment_provider', p_payment_provider,
        'payment_reference', p_payment_reference
      )
    );
  ELSE
    -- Update the existing subscription
    UPDATE business_subscriptions
    SET 
      subscription_tier_id = p_tier_id,
      status = 'active',
      updated_at = NOW(),
      payment_provider = COALESCE(p_payment_provider, payment_provider),
      payment_reference = COALESCE(p_payment_reference, payment_reference),
      payment_status = CASE 
        WHEN p_payment_provider IS NOT NULL AND p_payment_reference IS NOT NULL 
        THEN 'pending' 
        ELSE payment_status 
      END
    WHERE id = v_subscription_id;
    
    -- Create an activity log entry
    INSERT INTO activity_log (
      user_id,
      business_id,
      activity_type,
      description,
      metadata
    )
    VALUES (
      p_user_id,
      p_business_id,
      'subscription_updated',
      'Subscription updated to ' || v_tier_name,
      jsonb_build_object(
        'tier_id', p_tier_id,
        'tier_name', v_tier_name,
        'previous_tier_id', p_previous_tier_id,
        'payment_provider', p_payment_provider,
        'payment_reference', p_payment_reference
      )
    );
  END IF;
  
  v_result := jsonb_build_object(
    'subscription_id', v_subscription_id,
    'business_id', p_business_id,
    'tier_id', p_tier_id,
    'status', 'active'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
