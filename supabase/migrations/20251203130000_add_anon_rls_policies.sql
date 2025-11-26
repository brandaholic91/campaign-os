-- 20251203130000_add_anon_rls_policies.sql
-- Add RLS policies for anonymous (anon) users to allow local development without auth

SET search_path TO campaign_os, public;

-- Add anon policy for content_slots
DROP POLICY IF EXISTS "Anon users can read content_slots" ON campaign_os.content_slots;
CREATE POLICY "Anon users can read content_slots"
ON campaign_os.content_slots
FOR SELECT
TO anon
USING (true);

-- Add anon policy for content_drafts  
DROP POLICY IF EXISTS "Anon users can read content_drafts" ON campaign_os.content_drafts;
CREATE POLICY "Anon users can read content_drafts"
ON campaign_os.content_drafts
FOR SELECT
TO anon
USING (true);

-- Also add anon policies for sprints and related tables
DROP POLICY IF EXISTS "Anon users can read sprints" ON campaign_os.sprints;
CREATE POLICY "Anon users can read sprints"
ON campaign_os.sprints
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Anon users can read sprint_segments" ON campaign_os.sprint_segments;
CREATE POLICY "Anon users can read sprint_segments"
ON campaign_os.sprint_segments
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Anon users can read sprint_topics" ON campaign_os.sprint_topics;
CREATE POLICY "Anon users can read sprint_topics"
ON campaign_os.sprint_topics
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Anon users can read sprint_channels" ON campaign_os.sprint_channels;
CREATE POLICY "Anon users can read sprint_channels"
ON campaign_os.sprint_channels
FOR SELECT
TO anon
USING (true);
