-- 20251127_ensure_topic_metadata_fields.sql
-- Ensures related_goal_stages and recommended_content_types fields exist in topics table
-- with proper defaults and constraints

SET search_path TO campaign_os, public;

-- Add columns if they don't exist (they should already exist from 20251123_strategic_metadata_enhancement.sql)
-- but this ensures they're there even if that migration wasn't run
ALTER TABLE campaign_os.topics 
  ADD COLUMN IF NOT EXISTS related_goal_stages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_content_types JSONB DEFAULT '[]'::jsonb;

-- Update existing NULL values to empty arrays
UPDATE campaign_os.topics 
SET 
  related_goal_stages = '[]'::jsonb 
WHERE related_goal_stages IS NULL;

UPDATE campaign_os.topics 
SET 
  recommended_content_types = '[]'::jsonb 
WHERE recommended_content_types IS NULL;

-- Set default for future inserts (if column already exists, this won't change existing default)
-- We need to drop and recreate to set default if column already exists
DO $$
BEGIN
  -- Set default for related_goal_stages
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'campaign_os' 
    AND table_name = 'topics' 
    AND column_name = 'related_goal_stages'
  ) THEN
    ALTER TABLE campaign_os.topics 
      ALTER COLUMN related_goal_stages SET DEFAULT '[]'::jsonb;
  END IF;

  -- Set default for recommended_content_types
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'campaign_os' 
    AND table_name = 'topics' 
    AND column_name = 'recommended_content_types'
  ) THEN
    ALTER TABLE campaign_os.topics 
      ALTER COLUMN recommended_content_types SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add comments if they don't exist
COMMENT ON COLUMN campaign_os.topics.related_goal_stages IS 'Array of funnel stages relevant to this topic (awareness, engagement, consideration, conversion, mobilization). REQUIRED for execution readiness.';
COMMENT ON COLUMN campaign_os.topics.recommended_content_types IS 'Array of recommended content types (e.g., "short_video", "story", "static_image", "carousel", "long_form_video", "email"). REQUIRED for execution readiness.';

