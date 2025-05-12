-- Create a view that combines profiles and auth.users
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  p.id,
  p.full_name,
  COALESCE(p.email, u.email) as email,
  p.avatar_url,
  p.role,
  p.created_at,
  u.last_sign_in_at,
  CASE WHEN u.banned_until IS NULL THEN true ELSE false END as is_active
FROM 
  profiles p
LEFT JOIN 
  auth.users u ON p.id = u.id;

-- Grant access to the view
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO service_role;
