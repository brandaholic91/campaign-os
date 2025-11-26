BEGIN;

ALTER TABLE campaign_os.sprint_segments
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary';
ALTER TABLE campaign_os.sprint_topics
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary';
ALTER TABLE campaign_os.sprint_channels
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary';

UPDATE campaign_os.sprint_segments
  SET priority = 'primary'
  WHERE priority IS NULL;
UPDATE campaign_os.sprint_topics
  SET priority = 'primary'
  WHERE priority IS NULL;
UPDATE campaign_os.sprint_channels
  SET priority = 'primary'
  WHERE priority IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sprint_segments_priority_check'
  ) THEN
    ALTER TABLE campaign_os.sprint_segments
      ADD CONSTRAINT sprint_segments_priority_check CHECK (priority IN ('primary', 'secondary'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sprint_topics_priority_check'
  ) THEN
    ALTER TABLE campaign_os.sprint_topics
      ADD CONSTRAINT sprint_topics_priority_check CHECK (priority IN ('primary', 'secondary'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sprint_channels_priority_check'
  ) THEN
    ALTER TABLE campaign_os.sprint_channels
      ADD CONSTRAINT sprint_channels_priority_check CHECK (priority IN ('primary', 'secondary'));
  END IF;
END;
$$;

COMMIT;

