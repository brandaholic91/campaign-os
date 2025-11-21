-- Campaign OS - Initial Database Schema
-- Supabase Migration for Sprint 1
-- Date: 2025-11-20

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE campaign_type AS ENUM (
  'political_election',
  'political_issue',
  'brand_awareness',
  'product_launch',
  'promo',
  'ngo_issue'
);

CREATE TYPE goal_type AS ENUM (
  'awareness',
  'engagement',
  'list_building',
  'conversion',
  'mobilization'
);

CREATE TYPE campaign_status AS ENUM (
  'planning',
  'running',
  'closed'
);

CREATE TYPE message_type AS ENUM (
  'core',
  'supporting',
  'contrast'
);

CREATE TYPE message_status AS ENUM (
  'draft',
  'approved'
);

CREATE TYPE sprint_status AS ENUM (
  'planned',
  'active',
  'closed'
);

CREATE TYPE task_category AS ENUM (
  'creative',
  'copy',
  'social_setup',
  'ads_setup',
  'analytics',
  'coordination'
);

CREATE TYPE task_status AS ENUM (
  'todo',
  'in_progress',
  'done'
);

CREATE TYPE channel_type AS ENUM (
  'social',
  'paid',
  'owned'
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  campaign_type campaign_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  primary_goal_type goal_type NOT NULL,
  secondary_goals JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  budget_estimate NUMERIC,
  status campaign_status DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_metric JSONB,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segments (audience) table
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  demographics JSONB,
  psychographics JSONB,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table (generalized from issues)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  message_type message_type DEFAULT 'core',
  headline TEXT NOT NULL,
  body TEXT,
  proof_point TEXT,
  cta TEXT,
  status message_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type channel_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign-Channels junction table
CREATE TABLE campaign_channels (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  weight INTEGER CHECK (weight >= 1 AND weight <= 5),
  PRIMARY KEY (campaign_id, channel_id)
);

-- Sprints table
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  focus_goal TEXT,
  focus_channels JSONB DEFAULT '[]'::jsonb,
  status sprint_status DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_sprint_dates CHECK (end_date > start_date)
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category task_category,
  status task_status DEFAULT 'todo',
  assignee TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_goals_campaign ON goals(campaign_id);
CREATE INDEX idx_segments_campaign ON segments(campaign_id);
CREATE INDEX idx_topics_campaign ON topics(campaign_id);
CREATE INDEX idx_messages_campaign ON messages(campaign_id);
CREATE INDEX idx_messages_segment_topic ON messages(segment_id, topic_id);
CREATE INDEX idx_sprints_campaign ON sprints(campaign_id);
CREATE INDEX idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_campaign_channels_campaign ON campaign_channels(campaign_id);
CREATE INDEX idx_campaign_channels_channel ON campaign_channels(channel_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial channels
INSERT INTO channels (name, type) VALUES
  ('Facebook organic', 'social'),
  ('Instagram reels', 'social'),
  ('Instagram stories', 'social'),
  ('TikTok', 'social'),
  ('YouTube shorts', 'social'),
  ('LinkedIn', 'social'),
  ('Facebook Ads', 'paid'),
  ('Instagram Ads', 'paid'),
  ('Google Ads', 'paid'),
  ('Email', 'owned'),
  ('Landing page', 'owned'),
  ('Blog', 'owned')
ON CONFLICT (name) DO NOTHING;
