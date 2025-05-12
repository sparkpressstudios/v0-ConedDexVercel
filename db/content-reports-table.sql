-- Create content reports table
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  flavor_id uuid REFERENCES flavors(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  reason text NOT NULL,
  comments text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes text
);

-- Add indexes
CREATE INDEX IF NOT EXISTS content_reports_reporter_id_idx ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS content_reports_flavor_id_idx ON content_reports(flavor_id);
CREATE INDEX IF NOT EXISTS content_reports_shop_id_idx ON content_reports(shop_id);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status);
CREATE INDEX IF NOT EXISTS content_reports_created_at_idx ON content_reports(created_at);

-- Add RLS policies
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Policy for selecting reports (admins only)
CREATE POLICY select_content_reports ON content_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'Admin'
    )
  );

-- Policy for inserting reports (any authenticated user)
CREATE POLICY insert_content_reports ON content_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for updating reports (admins only)
CREATE POLICY update_content_reports ON content_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'Admin'
    )
  );

-- Add sample data if table is empty
INSERT INTO content_reports (
  reporter_id,
  flavor_id,
  report_type,
  reason,
  comments,
  status,
  created_at
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM flavors LIMIT 1),
  unnest(ARRAY['inappropriate', 'duplicate', 'spam']),
  unnest(ARRAY['Contains inappropriate content', 'This is a duplicate of another flavor', 'This appears to be spam']),
  unnest(ARRAY['Please review this content as it contains inappropriate language', 'This flavor already exists in the database', 'This flavor appears to be spam or advertising']),
  'pending',
  now() - (interval '1 day' * generate_series(1, 3))
WHERE NOT EXISTS (SELECT 1 FROM content_reports LIMIT 1);
