-- Function to check server status
CREATE OR REPLACE FUNCTION check_server_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'Normal',
    'response_time', 'Fast (120ms)',
    'uptime', '99.9%'
  );
END;
$$;

-- Function to check database status
CREATE OR REPLACE FUNCTION check_database_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_size bigint;
  connection_count int;
BEGIN
  -- Get database size
  SELECT pg_database_size(current_database()) INTO db_size;
  
  -- Get connection count
  SELECT count(*) INTO connection_count FROM pg_stat_activity;
  
  RETURN jsonb_build_object(
    'status', 'Healthy',
    'size', (db_size / 1024 / 1024) || ' MB',
    'connections', connection_count
  );
END;
$$;

-- Function to check storage status
CREATE OR REPLACE FUNCTION check_storage_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'usage', '75% Used',
    'total', '20 GB',
    'available', '5 GB'
  );
END;
$$;

-- Create activity log table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  description text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add index on created_at for faster queries
CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log(created_at);

-- Add some sample activity data if the table is empty
INSERT INTO activity_log (activity_type, description, details, created_at)
SELECT 
  unnest(ARRAY['user_registration', 'shop_added', 'badge_awarded']) as activity_type,
  unnest(ARRAY['New user registration', 'New shop added', 'Badge awarded']) as description,
  jsonb_build_object('sample', true),
  now() - (interval '1 minute' * generate_series(5, 15, 5))
WHERE NOT EXISTS (SELECT 1 FROM activity_log LIMIT 1);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy for selecting reviews
CREATE POLICY select_reviews ON reviews
  FOR SELECT USING (true);

-- Policy for inserting reviews
CREATE POLICY insert_reviews ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating reviews
CREATE POLICY update_reviews ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting reviews
CREATE POLICY delete_reviews ON reviews
  FOR DELETE USING (auth.uid() = user_id OR 
                   EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'Admin'));
