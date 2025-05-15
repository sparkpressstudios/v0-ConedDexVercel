-- Create shop check-ins table if it doesn't exist
CREATE TABLE IF NOT EXISTS shop_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  is_public BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, shop_id, created_at)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS shop_checkins_shop_id_idx ON shop_checkins(shop_id);
CREATE INDEX IF NOT EXISTS shop_checkins_user_id_idx ON shop_checkins(user_id);
CREATE INDEX IF NOT EXISTS shop_checkins_created_at_idx ON shop_checkins(created_at);

-- Create view for shop check-in counts
CREATE OR REPLACE VIEW shop_checkin_stats AS
SELECT 
  shop_id,
  COUNT(*) as total_checkins,
  COUNT(DISTINCT user_id) as unique_visitors,
  AVG(rating) as average_rating,
  MAX(created_at) as last_checkin
FROM shop_checkins
GROUP BY shop_id;

-- Add RLS policies
ALTER TABLE shop_checkins ENABLE ROW LEVEL SECURITY;

-- Policy for inserting check-ins (users can check in to any shop)
CREATE POLICY insert_checkins ON shop_checkins
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for viewing check-ins (users can see public check-ins and their own)
CREATE POLICY select_checkins ON shop_checkins
  FOR SELECT TO authenticated
  USING (is_public OR auth.uid() = user_id);

-- Policy for updating check-ins (users can only update their own)
CREATE POLICY update_checkins ON shop_checkins
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Policy for deleting check-ins (users can only delete their own)
CREATE POLICY delete_checkins ON shop_checkins
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
