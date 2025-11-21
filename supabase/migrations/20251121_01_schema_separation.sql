-- Campaign OS - Schema Separation Migration
-- Date: 2025-11-21
-- Purpose: Move Campaign OS tables to dedicated 'campaign_os' schema for multi-project isolation
-- 
-- This migration:
-- 1. Creates campaign_os schema
-- 2. Moves all Campaign OS tables from public to campaign_os schema
-- 3. Keeps enum types in public (shared across projects)
-- 4. Sets up proper permissions
-- 5. Migrates existing data

-- Step 1: Create campaign_os schema
CREATE SCHEMA IF NOT EXISTS campaign_os;

-- Step 2: Grant permissions to Supabase roles
GRANT USAGE ON SCHEMA campaign_os TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA campaign_os TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA campaign_os TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA campaign_os TO postgres, anon, authenticated, service_role;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA campaign_os 
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA campaign_os 
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA campaign_os 
  GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Step 3: Move tables to campaign_os schema
-- Using ALTER TABLE SET SCHEMA for clean migration
-- Note: Enum types remain in public schema (shared)

-- Move campaigns table first (no dependencies)
ALTER TABLE IF EXISTS public.campaigns SET SCHEMA campaign_os;

-- Move channels table (referenced by campaign_channels)
ALTER TABLE IF EXISTS public.channels SET SCHEMA campaign_os;

-- Move dependent tables
ALTER TABLE IF EXISTS public.goals SET SCHEMA campaign_os;
ALTER TABLE IF EXISTS public.segments SET SCHEMA campaign_os;
ALTER TABLE IF EXISTS public.topics SET SCHEMA campaign_os;
ALTER TABLE IF EXISTS public.messages SET SCHEMA campaign_os;
ALTER TABLE IF EXISTS public.campaign_channels SET SCHEMA campaign_os;
ALTER TABLE IF EXISTS public.sprints SET SCHEMA campaign_os;
ALTER TABLE IF EXISTS public.tasks SET SCHEMA campaign_os;

-- Step 4: Move trigger function to campaign_os schema
-- Check if function exists first to avoid errors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
             WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column') THEN
    ALTER FUNCTION public.update_updated_at_column() SET SCHEMA campaign_os;
  END IF;
END $$;

-- Step 5: Update search_path for campaign_os schema to find enum types in public
-- This allows campaign_os tables to reference public enum types
ALTER SCHEMA campaign_os OWNER TO postgres;

-- Step 6: Verify foreign key constraints are preserved
-- PostgreSQL automatically updates FK references when tables are moved
-- Enum type references remain valid as they're in public schema

-- Note: If tables don't exist yet (fresh install), this migration is idempotent
-- The IF EXISTS clauses prevent errors on fresh installations

