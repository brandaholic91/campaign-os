-- 20251129_enhanced_sprint_schema.sql
-- Story 5.6: Enhanced Sprint Schema & Database Migration
-- Enhances sprints table with strategic metadata fields for Epic 5 Phase 2

SET search_path TO campaign_os, public;

-- Ensure campaign_os schema exists
CREATE SCHEMA IF NOT EXISTS campaign_os;

-- Grant usage on schema (idempotent)
GRANT USAGE ON SCHEMA campaign_os TO postgres, anon, authenticated, service_role;

-- Step 1: Add enhanced sprint schema fields to existing sprints table
-- All fields are nullable initially for backward compatibility
DO $$
BEGIN
  -- Only proceed if sprints table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'campaign_os' AND table_name = 'sprints') THEN

    -- Add focus_stage column with CHECK constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'focus_stage') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN focus_stage TEXT;
    END IF;

    -- Add focus_goals JSONB column with default empty array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'focus_goals') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN focus_goals JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add suggested_weekly_post_volume JSONB column (nullable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'suggested_weekly_post_volume') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN suggested_weekly_post_volume JSONB;
    END IF;

    -- Add narrative_emphasis JSONB column with default empty array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'narrative_emphasis') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN narrative_emphasis JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add key_messages_summary TEXT column (nullable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'key_messages_summary') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN key_messages_summary TEXT;
    END IF;

    -- Add success_criteria JSONB column with default empty array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'success_criteria') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN success_criteria JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add risks_and_watchouts JSONB column with default empty array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'risks_and_watchouts') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN risks_and_watchouts JSONB DEFAULT '[]'::jsonb;
    END IF;

  END IF;
END $$;

-- Step 2: Add CHECK constraint for focus_stage enum values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_focus_stage'
    AND conrelid = 'campaign_os.sprints'::regclass
  ) THEN
    ALTER TABLE campaign_os.sprints
      ADD CONSTRAINT valid_focus_stage
      CHECK (focus_stage IS NULL OR focus_stage IN ('awareness', 'engagement', 'consideration', 'conversion', 'mobilization'));
  END IF;
END $$;

-- Step 3: Add indexes for better query performance on new JSONB columns
CREATE INDEX IF NOT EXISTS idx_sprints_focus_goals ON campaign_os.sprints USING GIN(focus_goals);
CREATE INDEX IF NOT EXISTS idx_sprints_narrative_emphasis ON campaign_os.sprints USING GIN(narrative_emphasis);
CREATE INDEX IF NOT EXISTS idx_sprints_success_criteria ON campaign_os.sprints USING GIN(success_criteria);
CREATE INDEX IF NOT EXISTS idx_sprints_risks_and_watchouts ON campaign_os.sprints USING GIN(risks_and_watchouts);

-- Step 4: Grant permissions (inherited from authenticated role)
-- No additional grants needed as authenticated role already has access to sprints table

-- Step 5: Add column comments for documentation
COMMENT ON COLUMN campaign_os.sprints.focus_stage IS 'Sprint focus stage: awareness, engagement, consideration, conversion, or mobilization (nullable for backward compatibility)';
COMMENT ON COLUMN campaign_os.sprints.focus_goals IS 'JSONB array of goal_id UUIDs (1-3 goals per sprint), default: empty array';
COMMENT ON COLUMN campaign_os.sprints.suggested_weekly_post_volume IS 'JSONB object: {total_posts_per_week: number, video_posts_per_week: number, stories_per_week?: number} (nullable)';
COMMENT ON COLUMN campaign_os.sprints.narrative_emphasis IS 'JSONB array of narrative_id UUIDs (1-2 narratives per sprint), default: empty array';
COMMENT ON COLUMN campaign_os.sprints.key_messages_summary IS '4-6 bullet points: what we emphasize in this sprint (nullable)';
COMMENT ON COLUMN campaign_os.sprints.success_criteria IS 'JSONB array of qualitative indicators: "ha ezt látjuk, jó irányban vagyunk", default: empty array';
COMMENT ON COLUMN campaign_os.sprints.risks_and_watchouts IS 'JSONB array of 2-4 points: what to watch for, default: empty array';

-- Step 6: Update table comment to reflect enhanced schema
COMMENT ON TABLE campaign_os.sprints IS 'Sprint plans for campaign execution. Enhanced with Phase 1 fields (order, focus_description, success_indicators) and Phase 2 strategic metadata (focus_stage, focus_goals, suggested_weekly_post_volume, narrative_emphasis, key_messages_summary, success_criteria, risks_and_watchouts).';