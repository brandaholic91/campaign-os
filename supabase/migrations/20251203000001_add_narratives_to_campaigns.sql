-- Add narratives column to campaigns table
-- Using IF NOT EXISTS to prevent errors if column already exists
-- Check if campaign_os schema exists, otherwise use public schema
DO $$
BEGIN
  -- Try campaign_os schema first (after schema_separation migration)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'campaign_os' AND table_name = 'campaigns') THEN
    ALTER TABLE campaign_os.campaigns ADD COLUMN IF NOT EXISTS narratives JSONB DEFAULT '[]'::jsonb;
  -- Fallback to public schema (before schema_separation migration)
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN
    ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS narratives JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
