-- 20251128_execution_planning_schema.sql
-- Story 5.1: Database Schema for Execution Planning
-- Creates enhanced sprints table, junction tables, and content_slots table

SET search_path TO campaign_os, public;

-- Ensure campaign_os schema exists
CREATE SCHEMA IF NOT EXISTS campaign_os;

-- Grant usage on schema (idempotent)
GRANT USAGE ON SCHEMA campaign_os TO postgres, anon, authenticated, service_role;

-- Step 1: Enhance existing sprints table (safely check if table exists first)
DO $$
BEGIN
  -- Only proceed if sprints table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'campaign_os' AND table_name = 'sprints') THEN
    
    -- Add new columns with safe defaults
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'order') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN "order" INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'focus_description') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN focus_description TEXT DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'success_indicators') THEN
      ALTER TABLE campaign_os.sprints ADD COLUMN success_indicators JSONB;
    END IF;

    -- Update existing rows safely
    UPDATE campaign_os.sprints 
    SET 
      focus_goal = COALESCE(focus_goal, 'awareness'),
      focus_description = COALESCE(focus_description, ''),
      "order" = COALESCE("order", 1)
    WHERE focus_goal IS NULL OR focus_description IS NULL OR "order" IS NULL;

    -- Set NOT NULL constraints only after all rows have values
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'focus_goal' AND is_nullable = 'YES') THEN
      ALTER TABLE campaign_os.sprints ALTER COLUMN focus_goal SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'focus_description' AND is_nullable = 'YES') THEN
      ALTER TABLE campaign_os.sprints ALTER COLUMN focus_description SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'campaign_os' AND table_name = 'sprints' AND column_name = 'order' AND is_nullable = 'YES') THEN
      ALTER TABLE campaign_os.sprints ALTER COLUMN "order" SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Add CHECK constraint for end_date > start_date (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_sprint_dates' 
    AND conrelid = 'campaign_os.sprints'::regclass
  ) THEN
    ALTER TABLE campaign_os.sprints 
      ADD CONSTRAINT valid_sprint_dates CHECK (end_date > start_date);
  END IF;
END $$;

-- Add index on campaign_id if not exists
CREATE INDEX IF NOT EXISTS idx_sprints_campaign_id ON campaign_os.sprints(campaign_id);

-- Step 2: Create junction tables for sprints
-- sprint_segments junction table
CREATE TABLE IF NOT EXISTS campaign_os.sprint_segments (
  sprint_id UUID NOT NULL REFERENCES campaign_os.sprints(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES campaign_os.segments(id) ON DELETE CASCADE,
  PRIMARY KEY (sprint_id, segment_id)
);

-- sprint_topics junction table
CREATE TABLE IF NOT EXISTS campaign_os.sprint_topics (
  sprint_id UUID NOT NULL REFERENCES campaign_os.sprints(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES campaign_os.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (sprint_id, topic_id)
);

-- sprint_channels junction table
CREATE TABLE IF NOT EXISTS campaign_os.sprint_channels (
  sprint_id UUID NOT NULL REFERENCES campaign_os.sprints(id) ON DELETE CASCADE,
  channel_key TEXT NOT NULL,
  PRIMARY KEY (sprint_id, channel_key)
);

-- Step 3: Create content_slots table
CREATE TABLE IF NOT EXISTS campaign_os.content_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES campaign_os.sprints(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  channel TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  primary_segment_id UUID REFERENCES campaign_os.segments(id) ON DELETE SET NULL,
  primary_topic_id UUID REFERENCES campaign_os.topics(id) ON DELETE SET NULL,
  objective TEXT NOT NULL,
  content_type TEXT NOT NULL,
  angle_hint TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_content_slot UNIQUE (date, channel, slot_index)
);

-- Add indexes for content_slots
CREATE INDEX IF NOT EXISTS idx_content_slots_sprint_id ON campaign_os.content_slots(sprint_id);
CREATE INDEX IF NOT EXISTS idx_content_slots_date ON campaign_os.content_slots(date);
CREATE INDEX IF NOT EXISTS idx_content_slots_channel ON campaign_os.content_slots(channel);

-- Step 4: Optional DB trigger to validate content_slots.date within sprint date range
-- This ensures data integrity at the database level
CREATE OR REPLACE FUNCTION campaign_os.validate_content_slot_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM campaign_os.sprints
    WHERE id = NEW.sprint_id
    AND NEW.date >= start_date
    AND NEW.date <= end_date
  ) THEN
    RAISE EXCEPTION 'Content slot date % is outside sprint date range for sprint_id %', NEW.date, NEW.sprint_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS validate_content_slot_date_trigger ON campaign_os.content_slots;
CREATE TRIGGER validate_content_slot_date_trigger
  BEFORE INSERT OR UPDATE ON campaign_os.content_slots
  FOR EACH ROW
  EXECUTE FUNCTION campaign_os.validate_content_slot_date();

-- Step 5: Add updated_at trigger for content_slots
DROP TRIGGER IF EXISTS update_content_slots_updated_at ON campaign_os.content_slots;
CREATE TRIGGER update_content_slots_updated_at
  BEFORE UPDATE ON campaign_os.content_slots
  FOR EACH ROW
  EXECUTE FUNCTION campaign_os.update_updated_at_column();

-- Step 6: Grant permissions
-- Grant permissions on sprints table (if not already granted)
GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprints TO authenticated;

-- Grant permissions on junction tables
GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprint_segments TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprint_topics TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprint_channels TO authenticated;

-- Grant permissions on content_slots table
GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.content_slots TO authenticated;

-- Grant sequence permissions (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA campaign_os TO authenticated;

-- Step 7: Add comments for documentation
COMMENT ON TABLE campaign_os.sprints IS 'Sprint plans for campaign execution. Enhanced with order, focus_description, and success_indicators for execution planning.';
COMMENT ON COLUMN campaign_os.sprints."order" IS 'Sprint order number (1, 2, 3...) for sequencing sprints within a campaign';
COMMENT ON COLUMN campaign_os.sprints.focus_goal IS 'Primary focus goal for this sprint: awareness, engagement, consideration, conversion, or mobilization';
COMMENT ON COLUMN campaign_os.sprints.focus_description IS '2-3 sentence description of sprint focus';
COMMENT ON COLUMN campaign_os.sprints.success_indicators IS 'JSONB containing qualitative KPI dialogue/indicators';

COMMENT ON TABLE campaign_os.sprint_segments IS 'Junction table linking sprints to target segments';
COMMENT ON TABLE campaign_os.sprint_topics IS 'Junction table linking sprints to topics';
COMMENT ON TABLE campaign_os.sprint_channels IS 'Junction table linking sprints to channels (by channel_key)';

COMMENT ON TABLE campaign_os.content_slots IS 'Content calendar slots with specific dates, channels, and content planning details';
COMMENT ON COLUMN campaign_os.content_slots.slot_index IS 'Daily sequence number for same channel (1, 2, 3...)';
COMMENT ON COLUMN campaign_os.content_slots.objective IS 'Content objective: reach, engagement, traffic, lead, conversion, or mobilization';
COMMENT ON COLUMN campaign_os.content_slots.content_type IS 'Content type: short_video, story, static_image, carousel, live, long_post, or email';
COMMENT ON COLUMN campaign_os.content_slots.status IS 'Content status: planned, draft, or published';
COMMENT ON COLUMN campaign_os.content_slots.angle_hint IS '1-2 sentence creative direction hint';
COMMENT ON COLUMN campaign_os.content_slots.notes IS 'Production comments and notes';

