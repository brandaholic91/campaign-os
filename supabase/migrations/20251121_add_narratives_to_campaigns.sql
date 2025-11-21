-- Add narratives column to campaigns table
ALTER TABLE campaigns ADD COLUMN narratives JSONB DEFAULT '[]'::jsonb;
