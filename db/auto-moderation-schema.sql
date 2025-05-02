-- Add columns to support auto-moderation workflow
ALTER TABLE flavors 
ADD COLUMN IF NOT EXISTS auto_moderated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_rarity TEXT,
ADD COLUMN IF NOT EXISTS ai_duplicate_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_moderation_flags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_similar_flavors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_content_severity TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS ai_image_severity TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS needs_ai_analysis BOOLEAN DEFAULT TRUE;

-- Create an index to quickly find flavors that need moderation
CREATE INDEX IF NOT EXISTS idx_flavors_needs_moderation 
ON flavors (status, auto_moderated)
WHERE status = 'pending';

-- Create an index for finding auto-approved flavors
CREATE INDEX IF NOT EXISTS idx_flavors_auto_approved
ON flavors (status, auto_moderated)
WHERE status = 'approved' AND auto_moderated = TRUE;

-- Create an index for finding flavors that need AI analysis
CREATE INDEX IF NOT EXISTS idx_flavors_needs_ai_analysis
ON flavors (needs_ai_analysis)
WHERE needs_ai_analysis = TRUE;

-- Create a view for moderation statistics
CREATE OR REPLACE VIEW flavor_moderation_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'approved' AND auto_moderated = TRUE) AS auto_approved_count,
  COUNT(*) FILTER (WHERE status = 'approved' AND auto_moderated = FALSE) AS manually_approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
  COUNT(*) FILTER (WHERE status = 'info_requested') AS info_requested_count,
  COUNT(*) FILTER (WHERE ai_analyzed_at IS NOT NULL) AS ai_analyzed_count,
  COUNT(*) FILTER (WHERE needs_ai_analysis = TRUE) AS needs_ai_analysis_count,
  COUNT(*) AS total_count
FROM flavors;

-- Create a function to automatically process new flavor submissions
CREATE OR REPLACE FUNCTION process_new_flavor()
RETURNS TRIGGER AS $$
BEGIN
  -- Set initial status to pending
  NEW.status := 'pending';
  
  -- Mark that this record needs AI analysis
  NEW.needs_ai_analysis := TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically process new flavor submissions
DROP TRIGGER IF EXISTS trigger_new_flavor ON flavors;
CREATE TRIGGER trigger_new_flavor
BEFORE INSERT ON flavors
FOR EACH ROW
EXECUTE FUNCTION process_new_flavor();
