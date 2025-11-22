-- Set search path to include campaign_os and public
SET search_path TO campaign_os, public;

-- Grant explicit permissions on message_strategies table
GRANT ALL ON TABLE campaign_os.message_strategies TO postgres, anon, authenticated, service_role;

-- Grant permissions on sequence if it exists (UUID uses gen_random_uuid(), so sequence might not exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'campaign_os' AND sequencename = 'message_strategies_id_seq') THEN
    GRANT ALL ON SEQUENCE campaign_os.message_strategies_id_seq TO postgres, anon, authenticated, service_role;
  END IF;
END $$;

-- Enable Row Level Security on message_strategies table
ALTER TABLE campaign_os.message_strategies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on message_strategies for authenticated users" ON campaign_os.message_strategies;
DROP POLICY IF EXISTS "Allow all operations on message_strategies for anon" ON campaign_os.message_strategies;

-- Create policies for message_strategies
-- Allow all operations for authenticated users (since we're using server-side API routes)
CREATE POLICY "Allow all operations on message_strategies for authenticated users"
  ON campaign_os.message_strategies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also allow operations for anon key (for API routes)
CREATE POLICY "Allow all operations on message_strategies for anon"
  ON campaign_os.message_strategies
  FOR ALL
  USING (true)
  WITH CHECK (true);

