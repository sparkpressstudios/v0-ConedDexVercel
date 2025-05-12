-- Enhanced Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  previous_state JSONB,
  new_state JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_id_idx ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_action_type_idx ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_type_idx ON admin_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx ON admin_audit_logs(created_at);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id UUID,
  action_type VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  previous_state JSONB DEFAULT NULL,
  new_state JSONB DEFAULT NULL,
  ip_address VARCHAR DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id, action_type, entity_type, entity_id, 
    previous_state, new_state, ip_address, user_agent, details
  ) VALUES (
    admin_id, action_type, entity_type, entity_id,
    previous_state, new_state, ip_address, user_agent, details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- View for audit log reporting
CREATE OR REPLACE VIEW admin_audit_log_view AS
SELECT 
  al.id,
  al.action_type,
  al.entity_type,
  al.entity_id,
  al.created_at,
  p.full_name as admin_name,
  p.email as admin_email,
  al.ip_address,
  al.details
FROM 
  admin_audit_logs al
JOIN 
  profiles p ON al.admin_id = p.id
ORDER BY 
  al.created_at DESC;

-- Function to get audit logs with pagination
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_admin_id UUID DEFAULT NULL,
  p_action_type VARCHAR DEFAULT NULL,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) 
RETURNS TABLE (
  id UUID,
  admin_id UUID,
  admin_name TEXT,
  admin_email TEXT,
  action_type VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  previous_state JSONB,
  new_state JSONB,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.admin_id,
    p.full_name as admin_name,
    p.email as admin_email,
    al.action_type,
    al.entity_type,
    al.entity_id,
    al.previous_state,
    al.new_state,
    al.ip_address,
    al.user_agent,
    al.created_at,
    al.details
  FROM 
    admin_audit_logs al
  JOIN 
    profiles p ON al.admin_id = p.id
  WHERE
    (p_admin_id IS NULL OR al.admin_id = p_admin_id) AND
    (p_action_type IS NULL OR al.action_type = p_action_type) AND
    (p_entity_type IS NULL OR al.entity_type = p_entity_type) AND
    (p_entity_id IS NULL OR al.entity_id = p_entity_id) AND
    (p_start_date IS NULL OR al.created_at >= p_start_date) AND
    (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY 
    al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
