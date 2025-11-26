-- 20251123_strategic_metadata_enhancement.sql

-- Create enums if they don't exist (in public schema)
DO $$ BEGIN
    CREATE TYPE public.funnel_stage_enum AS ENUM ('awareness', 'engagement', 'consideration', 'conversion', 'mobilization');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.narrative_phase_enum AS ENUM ('early', 'mid', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhance goals table
ALTER TABLE campaign_os.goals ADD COLUMN IF NOT EXISTS funnel_stage public.funnel_stage_enum;
ALTER TABLE campaign_os.goals ADD COLUMN IF NOT EXISTS kpi_hint TEXT;

-- Enhance topics table
ALTER TABLE campaign_os.topics ADD COLUMN IF NOT EXISTS related_goal_stages JSONB; -- Array of funnel_stage_enum strings
ALTER TABLE campaign_os.topics ADD COLUMN IF NOT EXISTS recommended_content_types JSONB; -- Array of strings

-- Create narratives table
CREATE TABLE IF NOT EXISTS campaign_os.narratives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaign_os.campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    suggested_phase public.narrative_phase_enum,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction tables
CREATE TABLE IF NOT EXISTS campaign_os.narrative_goals (
    narrative_id UUID NOT NULL REFERENCES campaign_os.narratives(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES campaign_os.goals(id) ON DELETE CASCADE,
    PRIMARY KEY (narrative_id, goal_id)
);

CREATE TABLE IF NOT EXISTS campaign_os.narrative_topics (
    narrative_id UUID NOT NULL REFERENCES campaign_os.narratives(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES campaign_os.topics(id) ON DELETE CASCADE,
    PRIMARY KEY (narrative_id, topic_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_narratives_campaign ON campaign_os.narratives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_narrative_goals_narrative ON campaign_os.narrative_goals(narrative_id);
CREATE INDEX IF NOT EXISTS idx_narrative_goals_goal ON campaign_os.narrative_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_narrative_topics_narrative ON campaign_os.narrative_topics(narrative_id);
CREATE INDEX IF NOT EXISTS idx_narrative_topics_topic ON campaign_os.narrative_topics(topic_id);

-- Add comments
COMMENT ON COLUMN campaign_os.goals.funnel_stage IS 'Strategic funnel stage: awareness, engagement, consideration, conversion, mobilization';
COMMENT ON COLUMN campaign_os.goals.kpi_hint IS 'Optional hint for KPI tracking (e.g., "FB/IG reach")';
COMMENT ON COLUMN campaign_os.topics.related_goal_stages IS 'Array of funnel stages relevant to this topic';
COMMENT ON COLUMN campaign_os.topics.recommended_content_types IS 'Array of recommended content types (e.g., "short_video", "story")';
COMMENT ON TABLE campaign_os.narratives IS 'Strategic narratives for the campaign';
COMMENT ON COLUMN campaign_os.campaigns.narratives IS 'Legacy JSONB array of narratives. Synced with narratives table for backward compatibility.';

-- Data Migration: Move JSONB narratives to table
DO $$
DECLARE
    campaign_record RECORD;
    narrative_json JSONB;
    new_narrative_id UUID;
    goal_id_text TEXT;
    topic_id_text TEXT;
BEGIN
    -- Iterate through all campaigns that have narratives
    FOR campaign_record IN SELECT id, narratives FROM campaign_os.campaigns WHERE narratives IS NOT NULL AND jsonb_array_length(narratives) > 0 LOOP
        
        -- Iterate through each narrative in the JSONB array
        FOR narrative_json IN SELECT * FROM jsonb_array_elements(campaign_record.narratives) LOOP
            
            -- Insert into narratives table
            INSERT INTO campaign_os.narratives (campaign_id, title, description, priority, suggested_phase)
            VALUES (
                campaign_record.id,
                narrative_json->>'title',
                narrative_json->>'description',
                (narrative_json->>'priority')::INTEGER,
                (narrative_json->>'suggested_phase')::public.narrative_phase_enum
            )
            RETURNING id INTO new_narrative_id;

            -- Handle primary_goal_ids (if exists and is array)
            IF narrative_json->'primary_goal_ids' IS NOT NULL AND jsonb_typeof(narrative_json->'primary_goal_ids') = 'array' THEN
                FOR goal_id_text IN SELECT * FROM jsonb_array_elements_text(narrative_json->'primary_goal_ids') LOOP
                    BEGIN
                        INSERT INTO campaign_os.narrative_goals (narrative_id, goal_id)
                        VALUES (new_narrative_id, goal_id_text::UUID)
                        ON CONFLICT DO NOTHING;
                    EXCEPTION WHEN OTHERS THEN
                        -- Ignore invalid UUIDs or missing goals
                    END;
                END LOOP;
            END IF;

            -- Handle primary_topic_ids (if exists and is array)
            IF narrative_json->'primary_topic_ids' IS NOT NULL AND jsonb_typeof(narrative_json->'primary_topic_ids') = 'array' THEN
                FOR topic_id_text IN SELECT * FROM jsonb_array_elements_text(narrative_json->'primary_topic_ids') LOOP
                    BEGIN
                        INSERT INTO campaign_os.narrative_topics (narrative_id, topic_id)
                        VALUES (new_narrative_id, topic_id_text::UUID)
                        ON CONFLICT DO NOTHING;
                    EXCEPTION WHEN OTHERS THEN
                        -- Ignore invalid UUIDs or missing topics
                    END;
                END LOOP;
            END IF;

        END LOOP;
    END LOOP;
END $$;
