-- Add AI analysis columns to the flavors table
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS rarity TEXT;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS base_type TEXT;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending';
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS similar_to TEXT;

-- Create index for faster searching by tags
CREATE INDEX IF NOT EXISTS idx_flavors_tags ON flavors USING GIN (tags);

-- Create index for moderation status queries
CREATE INDEX IF NOT EXISTS idx_flavors_moderation_status ON flavors (moderation_status);
