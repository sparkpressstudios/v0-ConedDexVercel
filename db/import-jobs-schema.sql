-- Create import_jobs table to track batch import operations
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL, -- 'shops', 'users', 'flavors', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_name VARCHAR(255),
  file_size INTEGER,
  total INTEGER DEFAULT 0,
  processed INTEGER DEFAULT 0,
  successful INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Add indexes for common queries
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Add indexes for performance
CREATE INDEX import_jobs_user_id_idx ON import_jobs(user_id);
CREATE INDEX import_jobs_type_idx ON import_jobs(type);
CREATE INDEX import_jobs_status_idx ON import_jobs(status);
CREATE INDEX import_jobs_created_at_idx ON import_jobs(created_at);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_import_job_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_import_job_timestamp
BEFORE UPDATE ON import_jobs
FOR EACH ROW
EXECUTE FUNCTION update_import_job_timestamp();
