-- 20251202_add_rls_to_content_slots_and_drafts.sql
-- Story: Fix permission denied errors by enabling RLS and adding policies

SET search_path TO campaign_os, public;

-- Enable RLS on content_slots
ALTER TABLE campaign_os.content_slots ENABLE ROW LEVEL SECURITY;

-- Enable RLS on content_drafts
ALTER TABLE campaign_os.content_drafts ENABLE ROW LEVEL SECURITY;

-- Policy for content_slots: Allow everything for authenticated users
DROP POLICY IF EXISTS "Authenticated users can do everything on content_slots" ON campaign_os.content_slots;
CREATE POLICY "Authenticated users can do everything on content_slots"
ON campaign_os.content_slots
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for content_drafts: Allow everything for authenticated users
DROP POLICY IF EXISTS "Authenticated users can do everything on content_drafts" ON campaign_os.content_drafts;
CREATE POLICY "Authenticated users can do everything on content_drafts"
ON campaign_os.content_drafts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions again just to be sure (idempotent)
GRANT ALL ON campaign_os.content_slots TO authenticated;
GRANT ALL ON campaign_os.content_drafts TO authenticated;
