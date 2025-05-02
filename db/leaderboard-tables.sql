-- Create leaderboard_metrics table
CREATE TABLE IF NOT EXISTS leaderboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard_seasons table
CREATE TABLE IF NOT EXISTS leaderboard_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_scores table
CREATE TABLE IF NOT EXISTS user_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES leaderboard_metrics(id) ON DELETE CASCADE,
  score BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_id)
);

-- Create team_scores table
CREATE TABLE IF NOT EXISTS team_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES leaderboard_metrics(id) ON DELETE CASCADE,
  score BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, metric_id)
);

-- Create seasonal_user_scores table
CREATE TABLE IF NOT EXISTS seasonal_user_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES leaderboard_seasons(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES leaderboard_metrics(id) ON DELETE CASCADE,
  score BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, season_id, metric_id)
);

-- Create seasonal_team_scores table
CREATE TABLE IF NOT EXISTS seasonal_team_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES leaderboard_seasons(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES leaderboard_metrics(id) ON DELETE CASCADE,
  score BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, season_id, metric_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_metric_id ON user_scores(metric_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_score ON user_scores(score DESC);

CREATE INDEX IF NOT EXISTS idx_team_scores_team_id ON team_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_team_scores_metric_id ON team_scores(metric_id);
CREATE INDEX IF NOT EXISTS idx_team_scores_score ON team_scores(score DESC);

CREATE INDEX IF NOT EXISTS idx_seasonal_user_scores_user_id ON seasonal_user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_user_scores_season_id ON seasonal_user_scores(season_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_user_scores_metric_id ON seasonal_user_scores(metric_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_user_scores_score ON seasonal_user_scores(score DESC);

CREATE INDEX IF NOT EXISTS idx_seasonal_team_scores_team_id ON seasonal_team_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_team_scores_season_id ON seasonal_team_scores(season_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_team_scores_metric_id ON seasonal_team_scores(metric_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_team_scores_score ON seasonal_team_scores(score DESC);
