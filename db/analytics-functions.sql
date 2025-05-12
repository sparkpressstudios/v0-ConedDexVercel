-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users INTEGER,
  active_users INTEGER,
  new_users_last_week INTEGER,
  verified_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles)::INTEGER AS total_users,
    (SELECT COUNT(*) FROM profiles WHERE last_sign_in_at > NOW() - INTERVAL '30 days')::INTEGER AS active_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days')::INTEGER AS new_users_last_week,
    (SELECT COUNT(*) FROM profiles WHERE email_verified = true)::INTEGER AS verified_users;
END;
$$ LANGUAGE plpgsql;

-- Function to get flavor statistics
CREATE OR REPLACE FUNCTION get_flavor_stats()
RETURNS TABLE (
  total_flavors INTEGER,
  approved_flavors INTEGER,
  pending_flavors INTEGER,
  new_flavors_last_week INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM flavors)::INTEGER AS total_flavors,
    (SELECT COUNT(*) FROM flavors WHERE status = 'approved')::INTEGER AS approved_flavors,
    (SELECT COUNT(*) FROM flavors WHERE status = 'pending')::INTEGER AS pending_flavors,
    (SELECT COUNT(*) FROM flavors WHERE created_at > NOW() - INTERVAL '7 days')::INTEGER AS new_flavors_last_week;
END;
$$ LANGUAGE plpgsql;

-- Function to get shop statistics
CREATE OR REPLACE FUNCTION get_shop_stats()
RETURNS TABLE (
  total_shops INTEGER,
  claimed_shops INTEGER,
  premium_shops INTEGER,
  new_shops_last_week INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM shops)::INTEGER AS total_shops,
    (SELECT COUNT(*) FROM shops WHERE owner_id IS NOT NULL)::INTEGER AS claimed_shops,
    (SELECT COUNT(*) FROM shops 
     JOIN business_subscriptions ON shops.id = business_subscriptions.business_id
     WHERE business_subscriptions.status = 'active')::INTEGER AS premium_shops,
    (SELECT COUNT(*) FROM shops WHERE created_at > NOW() - INTERVAL '7 days')::INTEGER AS new_shops_last_week;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform usage data
CREATE OR REPLACE FUNCTION get_platform_usage()
RETURNS TABLE (
  category TEXT,
  name TEXT,
  value INTEGER
) AS $$
BEGIN
  -- Sample data - in a real implementation, this would query analytics_events or similar
  RETURN QUERY
  SELECT 'device' AS category, 'Mobile' AS name, 65 AS value
  UNION ALL SELECT 'device', 'Desktop', 35, 35
  UNION ALL SELECT 'browser', 'Chrome', 45, 45
  UNION ALL SELECT 'browser', 'Safari', 30, 30
  UNION ALL SELECT 'browser', 'Firefox', 15, 15
  UNION ALL SELECT 'browser', 'Edge', 10, 10
  UNION ALL SELECT 'os', 'iOS', 40, 40
  UNION ALL SELECT 'os', 'Android', 25, 25
  UNION ALL SELECT 'os', 'Windows', 20, 20
  UNION ALL SELECT 'os', 'macOS', 15, 15;
END;
$$ LANGUAGE plpgsql;

-- Function to get feature usage data
CREATE OR REPLACE FUNCTION get_feature_usage()
RETURNS TABLE (
  feature TEXT,
  count INTEGER
) AS $$
BEGIN
  -- Sample data - in a real implementation, this would query analytics_events or similar
  RETURN QUERY
  SELECT 'Flavor Logging' AS feature, 120 AS count
  UNION ALL SELECT 'Shop Browsing', 95
  UNION ALL SELECT 'Map View', 80
  UNION ALL SELECT 'Profile Updates', 65
  UNION ALL SELECT 'Shop Following', 50
  UNION ALL SELECT 'Reviews', 45
  UNION ALL SELECT 'Leaderboard', 40
  UNION ALL SELECT 'Badges', 35;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity data
CREATE OR REPLACE FUNCTION get_user_activity()
RETURNS TABLE (
  day INTEGER,
  hour INTEGER,
  value INTEGER
) AS $$
BEGIN
  -- Sample data - in a real implementation, this would query analytics_events or similar
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(0, 6) AS day
  ),
  hours AS (
    SELECT generate_series(0, 23) AS hour
  ),
  cross_join AS (
    SELECT day, hour FROM days CROSS JOIN hours
  )
  SELECT 
    day, 
    hour, 
    (CASE 
      WHEN hour BETWEEN 9 AND 17 THEN floor(random() * 50 + 20)::INTEGER
      WHEN hour BETWEEN 18 AND 22 THEN floor(random() * 70 + 30)::INTEGER
      ELSE floor(random() * 20 + 5)::INTEGER
    END) AS value
  FROM cross_join
  ORDER BY day, hour;
END;
$$ LANGUAGE plpgsql;

-- Function to get user retention data
CREATE OR REPLACE FUNCTION get_user_retention()
RETURNS TABLE (
  cohort TEXT,
  week0 INTEGER,
  week1 INTEGER,
  week2 INTEGER,
  week3 INTEGER,
  week4 INTEGER
) AS $$
BEGIN
  -- Sample data - in a real implementation, this would calculate actual retention
  RETURN QUERY
  SELECT 'Week 1' AS cohort, 100 AS week0, 75 AS week1, 60 AS week2, 55 AS week3, 50 AS week4
  UNION ALL SELECT 'Week 2', 100, 70, 58, 52, 48
  UNION ALL SELECT 'Week 3', 100, 72, 61, 54, 0
  UNION ALL SELECT 'Week 4', 100, 68, 57, 0, 0
  UNION ALL SELECT 'Week 5', 100, 71, 0, 0, 0
  UNION ALL SELECT 'Week 6', 100, 0, 0, 0, 0;
END;
$$ LANGUAGE plpgsql;
