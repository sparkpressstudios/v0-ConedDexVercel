-- Create a comprehensive audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  user_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add indexes for common query patterns
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON admin_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at);

-- Create a function to automatically add IP and user agent
CREATE OR REPLACE FUNCTION set_audit_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Get IP and user agent from request context if available
  NEW.ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for';
  NEW.user_agent = current_setting('request.headers', true)::json->>'user-agent';
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If we can't get the headers, just continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set metadata
DROP TRIGGER IF EXISTS set_audit_metadata_trigger ON admin_audit_logs;
CREATE TRIGGER set_audit_metadata_trigger
BEFORE INSERT ON admin_audit_logs
FOR EACH ROW
EXECUTE FUNCTION set_audit_metadata();

-- Create a view for easier querying of common audit patterns
CREATE OR REPLACE VIEW admin_audit_summary AS
SELECT 
  date_trunc('day', created_at) AS day,
  action,
  resource_type,
  COUNT(*) AS action_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM admin_audit_logs
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;

-- Add RLS policies to protect audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY admin_audit_logs_admin_select ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- System can insert audit logs
CREATE POLICY admin_audit_logs_system_insert ON admin_audit_logs
  FOR INSERT WITH CHECK (true);

-- No one can update or delete audit logs
CREATE POLICY admin_audit_logs_no_update ON admin_audit_logs
  FOR UPDATE USING (false);

CREATE POLICY admin_audit_logs_no_delete ON admin_audit_logs
  FOR DELETE USING (false);
