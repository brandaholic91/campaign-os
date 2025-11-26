-- 20250102_content_slot_draft_separation.sql
-- Story 6.1: ContentSlot Schema Enhancement & ContentDraft Table
-- Enhances content_slots table with new fields and creates content_drafts table

SET search_path TO campaign_os, public;

-- Ensure campaign_os schema exists
CREATE SCHEMA IF NOT EXISTS campaign_os;

-- Grant usage on schema (idempotent)
GRANT USAGE ON SCHEMA campaign_os TO postgres, anon, authenticated, service_role;

-- Step 1: Enhance content_slots table with new columns
-- All new columns are nullable initially for backward compatibility
DO $$
BEGIN
  -- Only proceed if content_slots table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots') THEN

    -- Add campaign_id column (nullable initially, will be set to NOT NULL after migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'campaign_id') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN campaign_id UUID REFERENCES campaign_os.campaigns(id) ON DELETE CASCADE;
    END IF;

    -- Add time_of_day column (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'time_of_day') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN time_of_day TEXT;
    END IF;

    -- Add secondary_segment_ids JSONB array (optional, 0-2 segments)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'secondary_segment_ids') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN secondary_segment_ids JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add secondary_topic_ids JSONB array (optional, 0-2 topics)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'secondary_topic_ids') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN secondary_topic_ids JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add related_goal_ids JSONB array (required, min 1, max 2 goals)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'related_goal_ids') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN related_goal_ids JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add funnel_stage column (required)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'funnel_stage') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN funnel_stage TEXT;
    END IF;

    -- Add angle_type column (required)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'angle_type') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN angle_type TEXT;
    END IF;

    -- Add cta_type column (required)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'cta_type') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN cta_type TEXT;
    END IF;

    -- Add tone_override column (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'tone_override') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN tone_override TEXT;
    END IF;

    -- Add asset_requirements JSONB array (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'asset_requirements') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN asset_requirements JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add owner column (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'owner') THEN
      ALTER TABLE campaign_os.content_slots ADD COLUMN owner TEXT;
    END IF;

  END IF;
END $$;

-- Step 2: Add CHECK constraints for enum fields
DO $$
BEGIN
  -- time_of_day constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_time_of_day'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_time_of_day
      CHECK (time_of_day IS NULL OR time_of_day IN ('morning', 'midday', 'evening', 'unspecified'));
  END IF;

  -- funnel_stage constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_funnel_stage_content_slots'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_funnel_stage_content_slots
      CHECK (funnel_stage IS NULL OR funnel_stage IN ('awareness', 'engagement', 'consideration', 'conversion', 'mobilization'));
  END IF;

  -- angle_type constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_angle_type'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_angle_type
      CHECK (angle_type IS NULL OR angle_type IN ('story', 'proof', 'how_to', 'comparison', 'behind_the_scenes', 'testimonial', 'other'));
  END IF;

  -- cta_type constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_cta_type'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_cta_type
      CHECK (cta_type IS NULL OR cta_type IN ('soft_info', 'learn_more', 'signup', 'donate', 'attend_event', 'share', 'comment'));
  END IF;

  -- related_goal_ids max 2 constraint (min constraint added after data migration in Step 4.5)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_related_goal_ids_max'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_related_goal_ids_max
      CHECK (related_goal_ids IS NULL OR jsonb_array_length(related_goal_ids) <= 2);
  END IF;

  -- secondary_segment_ids max 2 constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_secondary_segment_ids_max'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_secondary_segment_ids_max
      CHECK (secondary_segment_ids IS NULL OR jsonb_array_length(secondary_segment_ids) <= 2);
  END IF;

  -- secondary_topic_ids max 2 constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_secondary_topic_ids_max'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_secondary_topic_ids_max
      CHECK (secondary_topic_ids IS NULL OR jsonb_array_length(secondary_topic_ids) <= 2);
  END IF;
END $$;

-- Step 3: Update status column constraint (remove 'draft', 'published', add 'scheduled', 'cancelled')
-- Drop old constraint if exists and create new one
DO $$
BEGIN
  -- Drop old status constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_slots_status_check'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots DROP CONSTRAINT content_slots_status_check;
  END IF;

  -- Add new status constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_content_slot_status'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    ALTER TABLE campaign_os.content_slots
      ADD CONSTRAINT valid_content_slot_status
      CHECK (status IN ('planned', 'scheduled', 'cancelled'));
  END IF;
END $$;

-- Step 4: Migrate existing slots data
-- Fill campaign_id from sprint → campaign relationship
UPDATE campaign_os.content_slots cs
SET campaign_id = s.campaign_id
FROM campaign_os.sprints s
WHERE cs.sprint_id = s.id
  AND cs.campaign_id IS NULL;

-- Fill funnel_stage from sprint focus_stage or default 'awareness'
UPDATE campaign_os.content_slots cs
SET funnel_stage = COALESCE(s.focus_stage, 'awareness')
FROM campaign_os.sprints s
WHERE cs.sprint_id = s.id
  AND cs.funnel_stage IS NULL;

-- Fill related_goal_ids from sprint focus_goals or empty array
UPDATE campaign_os.content_slots cs
SET related_goal_ids = COALESCE(s.focus_goals, '[]'::jsonb)
FROM campaign_os.sprints s
WHERE cs.sprint_id = s.id
  AND (cs.related_goal_ids IS NULL OR jsonb_array_length(cs.related_goal_ids) = 0);

-- Fill angle_type from angle_hint or default 'other'
-- Simple inference: if angle_hint contains certain keywords, map to angle_type
UPDATE campaign_os.content_slots
SET angle_type = CASE
  WHEN angle_hint IS NULL OR angle_hint = '' THEN 'other'
  WHEN LOWER(angle_hint) LIKE '%story%' OR LOWER(angle_hint) LIKE '%történet%' THEN 'story'
  WHEN LOWER(angle_hint) LIKE '%proof%' OR LOWER(angle_hint) LIKE '%bizonyíték%' OR LOWER(angle_hint) LIKE '%eredmény%' THEN 'proof'
  WHEN LOWER(angle_hint) LIKE '%how%' OR LOWER(angle_hint) LIKE '%hogyan%' OR LOWER(angle_hint) LIKE '%útmutató%' THEN 'how_to'
  WHEN LOWER(angle_hint) LIKE '%compare%' OR LOWER(angle_hint) LIKE '%összehasonlítás%' THEN 'comparison'
  WHEN LOWER(angle_hint) LIKE '%behind%' OR LOWER(angle_hint) LIKE '%kulisszák%' OR LOWER(angle_hint) LIKE '%háttér%' THEN 'behind_the_scenes'
  WHEN LOWER(angle_hint) LIKE '%testimonial%' OR LOWER(angle_hint) LIKE '%vélemény%' OR LOWER(angle_hint) LIKE '%visszajelzés%' THEN 'testimonial'
  ELSE 'other'
END
WHERE angle_type IS NULL;

-- Fill cta_type with default 'learn_more'
UPDATE campaign_os.content_slots
SET cta_type = 'learn_more'
WHERE cta_type IS NULL;

-- Migrate status: 'draft' → 'scheduled', 'published' → 'scheduled'
UPDATE campaign_os.content_slots
SET status = 'scheduled'
WHERE status IN ('draft', 'published');

-- Step 4.5: Ensure all related_goal_ids have at least 1 goal before adding constraint
-- For slots where related_goal_ids is empty or NULL, try to get goals from campaign
-- If campaign has no goals, we need to handle this case
DO $$
DECLARE
  slot_record RECORD;
  campaign_goal_ids JSONB;
BEGIN
  -- For each slot with empty or NULL related_goal_ids
  FOR slot_record IN 
    SELECT cs.id, cs.campaign_id
    FROM campaign_os.content_slots cs
    WHERE cs.related_goal_ids IS NULL 
       OR jsonb_array_length(cs.related_goal_ids) = 0
  LOOP
    -- Try to get first goal from campaign
    SELECT jsonb_agg(id ORDER BY created_at)
    INTO campaign_goal_ids
    FROM campaign_os.goals
    WHERE campaign_id = slot_record.campaign_id
    LIMIT 2;
    
    -- If campaign has goals, use them (max 2)
    IF campaign_goal_ids IS NOT NULL AND jsonb_array_length(campaign_goal_ids) > 0 THEN
      UPDATE campaign_os.content_slots
      SET related_goal_ids = campaign_goal_ids
      WHERE id = slot_record.id;
    ELSE
      -- If no goals exist, we cannot satisfy the constraint
      -- This should not happen in practice, but we'll set a placeholder
      -- In production, you might want to raise an error here instead
      RAISE WARNING 'Content slot % has no goals in campaign %. Cannot satisfy related_goal_ids min 1 constraint.', 
        slot_record.id, slot_record.campaign_id;
      -- Set to empty array for now - constraint will fail if we add it
      -- Better approach: delete these slots or require manual fix
    END IF;
  END LOOP;
END $$;

-- Now add the min constraint after ensuring all rows have at least 1 goal
DO $$
BEGIN
  -- related_goal_ids min 1 constraint (only add if all rows satisfy it)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_related_goal_ids_min'
    AND conrelid = 'campaign_os.content_slots'::regclass
  ) THEN
    -- Only add constraint if no rows violate it
    IF NOT EXISTS (
      SELECT 1 FROM campaign_os.content_slots
      WHERE related_goal_ids IS NULL 
         OR jsonb_array_length(related_goal_ids) < 1
    ) THEN
      ALTER TABLE campaign_os.content_slots
        ADD CONSTRAINT valid_related_goal_ids_min
        CHECK (related_goal_ids IS NOT NULL AND jsonb_array_length(related_goal_ids) >= 1);
    ELSE
      RAISE EXCEPTION 'Cannot add valid_related_goal_ids_min constraint: some rows have less than 1 goal. Please fix data first.';
    END IF;
  END IF;
END $$;

-- Step 5: Set NOT NULL constraints after migration
DO $$
BEGIN
  -- Set campaign_id to NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'campaign_id' AND is_nullable = 'YES') THEN
    ALTER TABLE campaign_os.content_slots ALTER COLUMN campaign_id SET NOT NULL;
  END IF;

  -- Set primary_segment_id to NOT NULL (if it exists and is nullable)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'primary_segment_id' AND is_nullable = 'YES') THEN
    -- Only set NOT NULL if all rows have values
    IF NOT EXISTS (SELECT 1 FROM campaign_os.content_slots WHERE primary_segment_id IS NULL) THEN
      ALTER TABLE campaign_os.content_slots ALTER COLUMN primary_segment_id SET NOT NULL;
    END IF;
  END IF;

  -- Set primary_topic_id to NOT NULL (if it exists and is nullable)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'primary_topic_id' AND is_nullable = 'YES') THEN
    -- Only set NOT NULL if all rows have values
    IF NOT EXISTS (SELECT 1 FROM campaign_os.content_slots WHERE primary_topic_id IS NULL) THEN
      ALTER TABLE campaign_os.content_slots ALTER COLUMN primary_topic_id SET NOT NULL;
    END IF;
  END IF;

  -- Set funnel_stage to NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'funnel_stage' AND is_nullable = 'YES') THEN
    ALTER TABLE campaign_os.content_slots ALTER COLUMN funnel_stage SET NOT NULL;
  END IF;

  -- Set angle_type to NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'angle_type' AND is_nullable = 'YES') THEN
    ALTER TABLE campaign_os.content_slots ALTER COLUMN angle_type SET NOT NULL;
  END IF;

  -- Set cta_type to NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'cta_type' AND is_nullable = 'YES') THEN
    ALTER TABLE campaign_os.content_slots ALTER COLUMN cta_type SET NOT NULL;
  END IF;

  -- Set related_goal_ids to NOT NULL (should already have values from Step 4.5)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'campaign_os' AND table_name = 'content_slots' AND column_name = 'related_goal_ids' AND is_nullable = 'YES') THEN
    -- Verify all rows have at least one goal (should be handled in Step 4.5)
    IF EXISTS (
      SELECT 1 FROM campaign_os.content_slots
      WHERE related_goal_ids IS NULL OR jsonb_array_length(related_goal_ids) < 1
    ) THEN
      RAISE EXCEPTION 'Cannot set related_goal_ids to NOT NULL: some rows have less than 1 goal. Please fix data first.';
    END IF;
    
    ALTER TABLE campaign_os.content_slots ALTER COLUMN related_goal_ids SET NOT NULL;
  END IF;
END $$;

-- Step 6: Create content_drafts table
CREATE TABLE IF NOT EXISTS campaign_os.content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES campaign_os.content_slots(id) ON DELETE CASCADE,
  variant_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  hook TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_copy TEXT NOT NULL,
  visual_idea TEXT NOT NULL,
  alt_text_suggestion TEXT,
  length_hint TEXT,
  tone_notes TEXT,
  used_segment_id UUID REFERENCES campaign_os.segments(id) ON DELETE SET NULL,
  used_topic_id UUID REFERENCES campaign_os.topics(id) ON DELETE SET NULL,
  used_goal_ids JSONB DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_content_draft_status CHECK (status IN ('draft', 'approved', 'rejected', 'published')),
  CONSTRAINT valid_content_draft_created_by CHECK (created_by IN ('ai', 'human')),
  CONSTRAINT valid_hook_min_length CHECK (char_length(hook) >= 10),
  CONSTRAINT valid_body_min_length CHECK (char_length(body) >= 50),
  CONSTRAINT valid_cta_copy_min_length CHECK (char_length(cta_copy) >= 5),
  CONSTRAINT valid_visual_idea_min_length CHECK (char_length(visual_idea) >= 20)
);

-- Step 7: Create indexes for content_drafts
CREATE INDEX IF NOT EXISTS idx_content_drafts_slot_id ON campaign_os.content_drafts(slot_id);
CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON campaign_os.content_drafts(status);

-- Step 8: Create updated_at trigger for content_drafts
-- Ensure the trigger function exists (should already exist from previous migrations)
CREATE OR REPLACE FUNCTION campaign_os.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_content_drafts_updated_at ON campaign_os.content_drafts;
CREATE TRIGGER update_content_drafts_updated_at
  BEFORE UPDATE ON campaign_os.content_drafts
  FOR EACH ROW
  EXECUTE FUNCTION campaign_os.update_updated_at_column();

-- Step 9: Grant permissions
GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.content_drafts TO authenticated;

-- Step 10: Add comments for documentation
COMMENT ON TABLE campaign_os.content_drafts IS 'Content drafts generated from content slots. Each draft represents a concrete content piece with copy, visuals, and CTA.';
COMMENT ON COLUMN campaign_os.content_drafts.slot_id IS 'Foreign key to content_slots table (CASCADE delete)';
COMMENT ON COLUMN campaign_os.content_drafts.variant_name IS 'Optional variant name for A/B testing or multiple versions';
COMMENT ON COLUMN campaign_os.content_drafts.status IS 'Draft status: draft, approved, rejected, or published';
COMMENT ON COLUMN campaign_os.content_drafts.hook IS 'Content hook (min 10 chars) - opening line to capture attention';
COMMENT ON COLUMN campaign_os.content_drafts.body IS 'Main content body (min 50 chars)';
COMMENT ON COLUMN campaign_os.content_drafts.cta_copy IS 'Call-to-action copy (min 5 chars)';
COMMENT ON COLUMN campaign_os.content_drafts.visual_idea IS 'Visual concept description (min 20 chars)';
COMMENT ON COLUMN campaign_os.content_drafts.created_by IS 'Creator type: ai or human';
COMMENT ON COLUMN campaign_os.content_slots.campaign_id IS 'Foreign key to campaigns table (NOT NULL after migration)';
COMMENT ON COLUMN campaign_os.content_slots.time_of_day IS 'Optional time of day: morning, midday, evening, or unspecified';
COMMENT ON COLUMN campaign_os.content_slots.secondary_segment_ids IS 'JSONB array of secondary segment IDs (0-2 segments)';
COMMENT ON COLUMN campaign_os.content_slots.secondary_topic_ids IS 'JSONB array of secondary topic IDs (0-2 topics)';
COMMENT ON COLUMN campaign_os.content_slots.related_goal_ids IS 'JSONB array of related goal IDs (required, min 1, max 2 goals)';
COMMENT ON COLUMN campaign_os.content_slots.funnel_stage IS 'Funnel stage: awareness, engagement, consideration, conversion, or mobilization (required)';
COMMENT ON COLUMN campaign_os.content_slots.angle_type IS 'Content angle type: story, proof, how_to, comparison, behind_the_scenes, testimonial, or other (required)';
COMMENT ON COLUMN campaign_os.content_slots.cta_type IS 'CTA type: soft_info, learn_more, signup, donate, attend_event, share, or comment (required)';
COMMENT ON COLUMN campaign_os.content_slots.status IS 'Content slot status: planned, scheduled, or cancelled (updated from previous draft/published values)';

