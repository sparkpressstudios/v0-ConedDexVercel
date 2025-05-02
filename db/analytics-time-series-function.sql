-- Create a function to get time series analytics data
CREATE OR REPLACE FUNCTION get_analytics_time_series(
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  interval_minutes INTEGER
)
RETURNS TABLE (
  time_bucket TIMESTAMP WITH TIME ZONE,
  active_users BIGINT,
  page_views BIGINT,
  actions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH time_series AS (
    SELECT 
      time_bucket AS bucket
    FROM 
      generate_series(
        date_trunc('minute', start_time), 
        date_trunc('minute', end_time), 
        (interval_minutes || ' minutes')::INTERVAL
      ) AS time_bucket
  ),
  user_counts AS (
    SELECT
      date_trunc('minute', created_at) AS minute,
      COUNT(DISTINCT user_id) AS users
    FROM
      analytics_events
    WHERE
      created_at BETWEEN start_time AND end_time
    GROUP BY
      minute
  ),
  page_view_counts AS (
    SELECT
      date_trunc('minute', created_at) AS minute,
      COUNT(*) AS views
    FROM
      analytics_events
    WHERE
      created_at BETWEEN start_time AND end_time
      AND event_type = 'page_view'
    GROUP BY
      minute
  ),
  action_counts AS (
    SELECT
      date_trunc('minute', created_at) AS minute,
      COUNT(*) AS acts
    FROM
      analytics_events
    WHERE
      created_at BETWEEN start_time AND end_time
      AND event_type != 'page_view'
    GROUP BY
      minute
  )
  SELECT
    ts.bucket AS time_bucket,
    COALESCE(uc.users, 0) AS active_users,
    COALESCE(pvc.views, 0) AS page_views,
    COALESCE(ac.acts, 0) AS actions
  FROM
    time_series ts
  LEFT JOIN
    user_counts uc ON ts.bucket = uc.minute
  LEFT JOIN
    page_view_counts pvc ON ts.bucket = pvc.minute
  LEFT JOIN
    action_counts ac ON ts.bucket = ac.minute
  ORDER BY
    ts.bucket;
END;
$$ LANGUAGE plpgsql;
