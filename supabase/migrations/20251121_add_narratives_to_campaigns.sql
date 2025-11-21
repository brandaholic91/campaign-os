-- Add narratives column to campaigns table
-- Using IF NOT EXISTS to prevent errors if column already exists
ALTER TABLE campaign_os.campaigns ADD COLUMN IF NOT EXISTS narratives JSONB DEFAULT '[]'::jsonb;
