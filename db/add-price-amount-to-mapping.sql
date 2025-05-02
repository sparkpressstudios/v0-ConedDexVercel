-- Add price_amount column to subscription_tiers_stripe_mapping table
ALTER TABLE subscription_tiers_stripe_mapping 
ADD COLUMN IF NOT EXISTS price_amount DECIMAL(10, 2) DEFAULT 0;

-- Create function to detect price changes
CREATE OR REPLACE FUNCTION check_subscription_price_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- When a subscription tier price is updated
  IF TG_OP = 'UPDATE' AND OLD.price != NEW.price THEN
    -- Insert a notification for admins
    INSERT INTO admin_notifications (
      type,
      title,
      message,
      metadata,
      is_read
    ) VALUES (
      'price_change',
      'Subscription Price Change',
      'The price for subscription tier "' || NEW.name || '" has changed from $' || OLD.price || ' to $' || NEW.price || '. You may need to update the Stripe price mapping.',
      jsonb_build_object(
        'tier_id', NEW.id,
        'old_price', OLD.price,
        'new_price', NEW.price
      ),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price changes
DROP TRIGGER IF EXISTS subscription_price_change_trigger ON subscription_tiers;
CREATE TRIGGER subscription_price_change_trigger
AFTER UPDATE ON subscription_tiers
FOR EACH ROW
EXECUTE FUNCTION check_subscription_price_changes();

-- Create admin_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on admin_notifications
CREATE INDEX IF NOT EXISTS admin_notifications_type_idx ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS admin_notifications_is_read_idx ON admin_notifications(is_read);
