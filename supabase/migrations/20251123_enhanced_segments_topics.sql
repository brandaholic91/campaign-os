-- Enhanced Segment & Topic Schema Migration
-- Date: 2025-11-23

-- Set search path to include campaign_os and public
SET search_path TO campaign_os, public;

-- 1. Enhance Segments Table
ALTER TABLE segments
ADD COLUMN short_label TEXT,
ADD COLUMN demographic_profile JSONB DEFAULT '{}'::jsonb,
ADD COLUMN psychographic_profile JSONB DEFAULT '{}'::jsonb,
ADD COLUMN media_habits JSONB DEFAULT '{}'::jsonb,
ADD COLUMN funnel_stage_focus TEXT CHECK (funnel_stage_focus IN ('awareness', 'engagement', 'consideration', 'conversion', 'mobilization')),
ADD COLUMN example_persona JSONB DEFAULT '{}'::jsonb;

-- Migrate existing demographics/psychographics to new columns (simple copy for now, structure migration happens in app logic if needed or assumed compatible)
UPDATE segments
SET 
  demographic_profile = COALESCE(demographics, '{}'::jsonb),
  psychographic_profile = COALESCE(psychographics, '{}'::jsonb);

-- Handle Priority Migration for Segments
ALTER TABLE segments ADD COLUMN priority_new TEXT CHECK (priority_new IN ('primary', 'secondary'));

UPDATE segments
SET priority_new = CASE
  WHEN priority <= 2 THEN 'primary'
  ELSE 'secondary'
END;

-- Default to secondary if null
UPDATE segments SET priority_new = 'secondary' WHERE priority_new IS NULL;

ALTER TABLE segments DROP COLUMN priority;
ALTER TABLE segments RENAME COLUMN priority_new TO priority;

-- 2. Enhance Topics Table
ALTER TABLE topics
ADD COLUMN short_label TEXT,
ADD COLUMN topic_type TEXT CHECK (topic_type IN ('benefit', 'problem', 'value', 'proof', 'story')),
ADD COLUMN related_goal_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN core_narrative TEXT,
ADD COLUMN content_angles JSONB DEFAULT '[]'::jsonb,
ADD COLUMN recommended_channels JSONB DEFAULT '[]'::jsonb,
ADD COLUMN risk_notes JSONB DEFAULT '[]'::jsonb;

-- Handle Priority Migration for Topics
-- Topics didn't have priority column in initial schema, so just add it
ALTER TABLE topics ADD COLUMN priority TEXT CHECK (priority IN ('primary', 'secondary')) DEFAULT 'secondary';

-- 3. Create Segment-Topic Matrix Table
CREATE TABLE segment_topic_matrix (
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  importance TEXT NOT NULL CHECK (importance IN ('high', 'medium', 'low')),
  role TEXT NOT NULL CHECK (role IN ('core_message', 'support', 'experimental')),
  summary TEXT, -- AI-generated brief summary (max 500 chars)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (segment_id, topic_id)
);

-- Create indexes
CREATE INDEX idx_segment_topic_matrix_segment ON segment_topic_matrix(segment_id);
CREATE INDEX idx_segment_topic_matrix_topic ON segment_topic_matrix(topic_id);

-- Add trigger for updated_at
CREATE TRIGGER update_segment_topic_matrix_updated_at BEFORE UPDATE ON segment_topic_matrix
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
