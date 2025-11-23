-- Set search path to include campaign_os and public
SET search_path TO campaign_os, public;

-- Create message_strategies table in campaign_os schema
CREATE TABLE IF NOT EXISTS campaign_os.message_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaign_os.campaigns(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES campaign_os.segments(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES campaign_os.topics(id) ON DELETE CASCADE,
  strategy_core JSONB NOT NULL,
  style_tone JSONB NOT NULL,
  cta_funnel JSONB NOT NULL,
  extra_fields JSONB,
  preview_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one strategy per segment x topic combination within a campaign
  CONSTRAINT message_strategies_campaign_segment_topic_key UNIQUE (campaign_id, segment_id, topic_id)
);

-- Create index on campaign_id for query performance
CREATE INDEX IF NOT EXISTS idx_message_strategies_campaign ON campaign_os.message_strategies(campaign_id);

-- Create trigger for automatic updated_at timestamp updates
-- Note: update_updated_at_column function is assumed to exist from previous migrations
DROP TRIGGER IF EXISTS update_message_strategies_updated_at ON campaign_os.message_strategies;
CREATE TRIGGER update_message_strategies_updated_at
  BEFORE UPDATE ON campaign_os.message_strategies
  FOR EACH ROW
  EXECUTE FUNCTION campaign_os.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE campaign_os.message_strategies IS 'Stores communication strategies for specific segment-topic combinations';
COMMENT ON COLUMN campaign_os.message_strategies.strategy_core IS 'JSONB containing positioning_statement, core_message, supporting_messages[], proof_points[], objections_reframes[]';
COMMENT ON COLUMN campaign_os.message_strategies.style_tone IS 'JSONB containing tone_profile, language_style, communication_guidelines, emotional_temperature';
COMMENT ON COLUMN campaign_os.message_strategies.cta_funnel IS 'JSONB containing funnel_stage, cta_objectives[], cta_patterns[], friction_reducers[]';
COMMENT ON COLUMN campaign_os.message_strategies.extra_fields IS 'JSONB containing optional framing_type, key_phrases[], risk_notes';

-- Enable Row Level Security
ALTER TABLE campaign_os.message_strategies ENABLE ROW LEVEL SECURITY;

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