-- Set search path to include campaign_os and public
SET search_path TO campaign_os, public;

-- Grant explicit permissions on segment_topic_matrix table
GRANT ALL ON TABLE campaign_os.segment_topic_matrix TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security on segment_topic_matrix table
ALTER TABLE campaign_os.segment_topic_matrix ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on segment_topic_matrix for authenticated users" ON campaign_os.segment_topic_matrix;
DROP POLICY IF EXISTS "Allow all operations on segment_topic_matrix for anon" ON campaign_os.segment_topic_matrix;

-- Create policies for segment_topic_matrix
-- Allow all operations for authenticated users (since we're using server-side API routes)
CREATE POLICY "Allow all operations on segment_topic_matrix for authenticated users"
  ON campaign_os.segment_topic_matrix
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also allow operations for anon key (for API routes)
CREATE POLICY "Allow all operations on segment_topic_matrix for anon"
  ON campaign_os.segment_topic_matrix
  FOR ALL
  USING (true)
  WITH CHECK (true);

