-- 20251203140000_add_anon_write_policies.sql
-- Add INSERT/UPDATE/DELETE policies for anon users (local dev)

SET search_path TO campaign_os, public;

-- Replace anon read-only policies with full access for local dev

-- Content Drafts - full access for anon
DROP POLICY IF EXISTS "Anon users can read content_drafts" ON campaign_os.content_drafts;
DROP POLICY IF EXISTS "Anon users can do everything on content_drafts" ON campaign_os.content_drafts;
CREATE POLICY "Anon users can do everything on content_drafts"
ON campaign_os.content_drafts
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Content Slots - full access for anon
DROP POLICY IF EXISTS "Anon users can read content_slots" ON campaign_os.content_slots;
DROP POLICY IF EXISTS "Anon users can do everything on content_slots" ON campaign_os.content_slots;
CREATE POLICY "Anon users can do everything on content_slots"
ON campaign_os.content_slots
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Sprints - full access for anon
DROP POLICY IF EXISTS "Anon users can read sprints" ON campaign_os.sprints;
DROP POLICY IF EXISTS "Anon users can do everything on sprints" ON campaign_os.sprints;
CREATE POLICY "Anon users can do everything on sprints"
ON campaign_os.sprints
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
