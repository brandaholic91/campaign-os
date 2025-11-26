-- 20251203_consolidated_rls_fix.sql
-- Consolidated migration to fix RLS permissions for content_slots and content_drafts

SET search_path TO campaign_os, public;

-- 0. Ensure content_drafts table exists (recreate if missing)
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

-- 1. Enable RLS (safe if already enabled)
ALTER TABLE campaign_os.content_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_os.content_drafts ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies (drop first to ensure clean state)

-- Content Slots Policy
DROP POLICY IF EXISTS "Authenticated users can do everything on content_slots" ON campaign_os.content_slots;
CREATE POLICY "Authenticated users can do everything on content_slots"
ON campaign_os.content_slots
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Content Drafts Policy
DROP POLICY IF EXISTS "Authenticated users can do everything on content_drafts" ON campaign_os.content_drafts;
CREATE POLICY "Authenticated users can do everything on content_drafts"
ON campaign_os.content_drafts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Create missing indexes (from failed 20251201 migration)
CREATE INDEX IF NOT EXISTS idx_content_drafts_slot_id ON campaign_os.content_drafts(slot_id);
CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON campaign_os.content_drafts(status);

-- 4. Ensure triggers exist
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

-- 5. Grant Permissions (idempotent)
GRANT ALL ON campaign_os.content_slots TO authenticated;
GRANT ALL ON campaign_os.content_drafts TO authenticated;
GRANT ALL ON campaign_os.sprints TO authenticated;
GRANT ALL ON campaign_os.sprint_segments TO authenticated;
GRANT ALL ON campaign_os.sprint_topics TO authenticated;
GRANT ALL ON campaign_os.sprint_channels TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA campaign_os TO authenticated;
