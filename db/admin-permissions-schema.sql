-- Admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  key VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES admin_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- User roles mapping
CREATE TABLE IF NOT EXISTS admin_user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION check_admin_permission(
  p_user_id UUID,
  p_permission_key VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM admin_user_roles aur
    JOIN admin_role_permissions arp ON aur.role_id = arp.role_id
    JOIN admin_permissions ap ON arp.permission_id = ap.id
    WHERE aur.user_id = p_user_id
    AND ap.key = p_permission_key
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID
) RETURNS TABLE (
  permission_id UUID,
  permission_name VARCHAR,
  permission_key VARCHAR,
  permission_category VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    ap.id,
    ap.name,
    ap.key,
    ap.category
  FROM admin_user_roles aur
  JOIN admin_role_permissions arp ON aur.role_id = arp.role_id
  JOIN admin_permissions ap ON arp.permission_id = ap.id
  WHERE aur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default roles
INSERT INTO admin_roles (name, description, is_system)
VALUES 
  ('Super Admin', 'Full access to all administrative functions', true),
  ('Content Manager', 'Can manage content but not system settings', true),
  ('Analyst', 'Can view analytics and reports', true),
  ('Moderator', 'Can moderate user content', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO admin_permissions (name, key, description, category)
VALUES
  -- User management
  ('View Users', 'users.view', 'Can view user profiles and information', 'User Management'),
  ('Create Users', 'users.create', 'Can create new user accounts', 'User Management'),
  ('Edit Users', 'users.edit', 'Can edit user profiles and information', 'User Management'),
  ('Delete Users', 'users.delete', 'Can delete user accounts', 'User Management'),
  ('Manage User Roles', 'users.manage_roles', 'Can assign roles to users', 'User Management'),
  
  -- Shop management
  ('View Shops', 'shops.view', 'Can view shop profiles and information', 'Shop Management'),
  ('Create Shops', 'shops.create', 'Can create new shops', 'Shop Management'),
  ('Edit Shops', 'shops.edit', 'Can edit shop profiles and information', 'Shop Management'),
  ('Delete Shops', 'shops.delete', 'Can delete shops', 'Shop Management'),
  ('Verify Shops', 'shops.verify', 'Can verify shop authenticity', 'Shop Management'),
  ('Import Shops', 'shops.import', 'Can import shops from external sources', 'Shop Management'),
  
  -- Content management
  ('Moderate Content', 'content.moderate', 'Can approve or reject user-submitted content', 'Content Management'),
  ('Delete Content', 'content.delete', 'Can delete any content', 'Content Management'),
  ('Feature Content', 'content.feature', 'Can mark content as featured', 'Content Management'),
  
  -- System management
  ('View Settings', 'system.view_settings', 'Can view system settings', 'System Management'),
  ('Edit Settings', 'system.edit_settings', 'Can edit system settings', 'System Management'),
  ('Manage Backups', 'system.manage_backups', 'Can create and restore backups', 'System Management'),
  ('View Logs', 'system.view_logs', 'Can view system logs', 'System Management'),
  
  -- Subscription management
  ('View Subscriptions', 'subscriptions.view', 'Can view subscription plans and subscribers', 'Subscription Management'),
  ('Manage Subscription Plans', 'subscriptions.manage_plans', 'Can create and edit subscription plans', 'Subscription Management'),
  ('Manage Features', 'subscriptions.manage_features', 'Can create and edit subscription features', 'Subscription Management'),
  ('View Payments', 'subscriptions.view_payments', 'Can view payment information', 'Subscription Management'),
  
  -- Analytics
  ('View Analytics', 'analytics.view', 'Can view analytics dashboards', 'Analytics'),
  ('Export Reports', 'analytics.export', 'Can export analytics reports', 'Analytics'),
  ('Create Custom Reports', 'analytics.custom_reports', 'Can create custom analytics reports', 'Analytics')
ON CONFLICT (key) DO NOTHING;

-- Assign all permissions to Super Admin role
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Super Admin'),
  id
FROM admin_permissions
ON CONFLICT DO NOTHING;

-- Assign content permissions to Content Manager role
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Content Manager'),
  id
FROM admin_permissions
WHERE key LIKE 'content.%' OR key IN ('shops.view', 'users.view')
ON CONFLICT DO NOTHING;

-- Assign analytics permissions to Analyst role
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Analyst'),
  id
FROM admin_permissions
WHERE key LIKE 'analytics.%'
ON CONFLICT DO NOTHING;

-- Assign moderation permissions to Moderator role
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Moderator'),
  id
FROM admin_permissions
WHERE key IN ('content.moderate', 'content.delete', 'shops.view', 'users.view')
ON CONFLICT DO NOTHING;
