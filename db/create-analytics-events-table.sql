-- Create analytics_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(255) NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  user_id UUID,
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  screen_size VARCHAR(20),
  referrer TEXT,
  page_url TEXT,
  app_version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add indexes for common queries
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
