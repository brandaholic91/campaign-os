-- Set search path to include campaign_os and public
SET search_path TO campaign_os, public;

-- Grant explicit permissions on narratives tables
GRANT ALL ON TABLE campaign_os.narratives TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE campaign_os.narrative_goals TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE campaign_os.narrative_topics TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security on narratives tables
ALTER TABLE campaign_os.narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_os.narrative_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_os.narrative_topics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on narratives for authenticated users" ON campaign_os.narratives;
DROP POLICY IF EXISTS "Allow all operations on narratives for anon" ON campaign_os.narratives;
DROP POLICY IF EXISTS "Allow all operations on narrative_goals for authenticated users" ON campaign_os.narrative_goals;
DROP POLICY IF EXISTS "Allow all operations on narrative_goals for anon" ON campaign_os.narrative_goals;
DROP POLICY IF EXISTS "Allow all operations on narrative_topics for authenticated users" ON campaign_os.narrative_topics;
DROP POLICY IF EXISTS "Allow all operations on narrative_topics for anon" ON campaign_os.narrative_topics;

-- Create policies for narratives table
-- Allow all operations for authenticated users (since we're using server-side API routes)
CREATE POLICY "Allow all operations on narratives for authenticated users"
  ON campaign_os.narratives
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also allow operations for anon key (for API routes)
CREATE POLICY "Allow all operations on narratives for anon"
  ON campaign_os.narratives
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for narrative_goals table
CREATE POLICY "Allow all operations on narrative_goals for authenticated users"
  ON campaign_os.narrative_goals
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on narrative_goals for anon"
  ON campaign_os.narrative_goals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for narrative_topics table
CREATE POLICY "Allow all operations on narrative_topics for authenticated users"
  ON campaign_os.narrative_topics
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on narrative_topics for anon"
  ON campaign_os.narrative_topics
  FOR ALL
  USING (true)
  WITH CHECK (true);

