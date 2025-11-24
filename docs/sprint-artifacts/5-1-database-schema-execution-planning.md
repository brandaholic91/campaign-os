# Story 5.1: Database Schema for Execution Planning

Status: drafted

## Story

As a **developer**,
I want **database tables for sprints and content slots with proper relationships**,
so that **execution plans can be stored and managed in the database**.

## Acceptance Criteria

1. **AC 5.1.1: Sprints tábla létrehozása**
   - **Given** Epic 4.0 complete (strategic metadata)
   - **When** I run the migration
   - **Then** `campaign_os.sprints` table exists with columns:
     - `id` (UUID, primary key, default uuid_generate_v4())
     - `campaign_id` (UUID, NOT NULL, FK to campaigns, ON DELETE CASCADE)
     - `name` (TEXT, NOT NULL) - e.g., "Kickoff – Ismertségnövelés"
     - `order` (INTEGER, NOT NULL) - 1, 2, 3...
     - `start_date` (DATE, NOT NULL)
     - `end_date` (DATE, NOT NULL)
     - `focus_goal` (TEXT, NOT NULL) - enum: 'awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization'
     - `focus_description` (TEXT, NOT NULL) - 2-3 mondatos leírás
     - `success_indicators` (JSONB, nullable) - kvalitatív KPI-dialógus
     - `created_at` (TIMESTAMPTZ, default NOW())
     - `updated_at` (TIMESTAMPTZ, default NOW())
   - **And** CHECK constraint: `end_date > start_date`
   - **And** Index on `campaign_id` for performance

2. **AC 5.1.2: Sprint junction táblák létrehozása**
   - **Given** Migration runs
   - **When** I check the database
   - **Then** `campaign_os.sprint_segments` junction table exists:
     - `sprint_id` (UUID, FK to sprints, ON DELETE CASCADE)
     - `segment_id` (UUID, FK to segments, ON DELETE CASCADE)
     - PRIMARY KEY (sprint_id, segment_id)
   - **And** `campaign_os.sprint_topics` junction table exists:
     - `sprint_id` (UUID, FK to sprints, ON DELETE CASCADE)
     - `topic_id` (UUID, FK to topics, ON DELETE CASCADE)
     - PRIMARY KEY (sprint_id, topic_id)
   - **And** `campaign_os.sprint_channels` junction table exists:
     - `sprint_id` (UUID, FK to sprints, ON DELETE CASCADE)
     - `channel_key` (TEXT, NOT NULL) - e.g., "facebook_organic"
     - PRIMARY KEY (sprint_id, channel_key)
   - **And** All foreign keys have CASCADE delete

3. **AC 5.1.3: Content slots tábla létrehozása**
   - **Given** Migration runs
   - **When** I check the database
   - **Then** `campaign_os.content_slots` table exists with columns:
     - `id` (UUID, primary key, default uuid_generate_v4())
     - `sprint_id` (UUID, NOT NULL, FK to sprints, ON DELETE CASCADE)
     - `date` (DATE, NOT NULL)
     - `channel` (TEXT, NOT NULL) - e.g., "facebook_organic", "instagram_reels"
     - `slot_index` (INTEGER, NOT NULL) - napi sorszám ugyanazon csatornán (1, 2, 3...)
     - `primary_segment_id` (UUID, nullable, FK to segments, ON DELETE SET NULL)
     - `primary_topic_id` (UUID, nullable, FK to topics, ON DELETE SET NULL)
     - `objective` (TEXT, NOT NULL) - enum: 'reach' | 'engagement' | 'traffic' | 'lead' | 'conversion' | 'mobilization'
     - `content_type` (TEXT, NOT NULL) - enum: 'short_video' | 'story' | 'static_image' | 'carousel' | 'live' | 'long_post' | 'email'
     - `angle_hint` (TEXT, nullable) - 1-2 mondatos kreatív irány
     - `notes` (TEXT, nullable) - produkciós kommentek
     - `status` (TEXT, NOT NULL, default 'planned') - enum: 'planned' | 'draft' | 'published'
     - `created_at` (TIMESTAMPTZ, default NOW())
     - `updated_at` (TIMESTAMPTZ, default NOW())
   - **And** UNIQUE constraint on `(date, channel, slot_index)`
   - **And** Index on `sprint_id` for performance
   - **And** Index on `date` for calendar queries
   - **And** DB trigger validates `date` is within `sprints.start_date` and `sprints.end_date` (optional but recommended)

4. **AC 5.1.4: Schema és jogosultságok beállítása**
   - **Given** Migration runs
   - **When** I check the database
   - **Then** All tables are created in `campaign_os` schema
   - **And** `campaign_os` schema exists (created if not exists)
   - **And** Appropriate permissions are granted for write operations:
     - `GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprints TO authenticated`
     - `GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprint_segments TO authenticated`
     - `GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprint_topics TO authenticated`
     - `GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.sprint_channels TO authenticated`
     - `GRANT INSERT, UPDATE, DELETE, SELECT ON campaign_os.content_slots TO authenticated`
   - **And** Sequence permissions are granted (if using sequences):
     - `GRANT USAGE ON ALL SEQUENCES IN SCHEMA campaign_os TO authenticated`
   - **And** Foreign key references use fully qualified names (schema.table) where needed

5. **AC 5.1.5: Zod schemas definiálva**
   - **Given** Story 5.1 complete
   - **When** I import from `lib/ai/schemas.ts`
   - **Then** `SprintFocusGoalTypeSchema` is exported (enum: awareness, engagement, consideration, conversion, mobilization)
   - **And** `SprintPlanSchema` is exported with all required fields:
     - `id` (string), `name` (string, min 1), `order` (number, int, positive)
     - `start_date` (string, regex date), `end_date` (string, regex date)
     - `focus_goal` (SprintFocusGoalTypeSchema), `focus_description` (string, min 10)
     - `focus_segments` (array of strings, min 1), `focus_topics` (array of strings, min 1)
     - `focus_channels` (array of strings, min 1), `success_indicators` (optional array)
   - **And** `ContentObjectiveSchema` is exported (enum: reach, engagement, traffic, lead, conversion, mobilization)
   - **And** `ContentTypeSchema` is exported (enum: short_video, story, static_image, carousel, live, long_post, email)
   - **And** `ContentSlotSchema` is exported with all required fields:
     - `id` (string), `sprint_id` (string), `date` (string, regex date)
     - `channel` (string, min 1), `slot_index` (number, int, positive)
     - `primary_segment_id` (optional UUID), `primary_topic_id` (optional UUID)
     - `objective` (ContentObjectiveSchema), `content_type` (ContentTypeSchema)
     - `angle_hint` (optional string), `notes` (optional string), `status` (enum, default 'planned')
   - **And** `ExecutionPlanSchema` is exported:
     - `sprints` (array of SprintPlanSchema, min 1, max 6)
     - `content_calendar` (array of ContentSlotSchema, min 1)
   - **And** All schemas validate required fields correctly
   - **And** TypeScript types are exported: `SprintPlan`, `ContentSlot`, `ExecutionPlan`, etc.

6. **AC 5.1.6: TypeScript types generálva**
   - **Given** Database migration is complete
   - **When** I generate TypeScript types from Supabase schema
   - **Then** `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts` is run
   - **And** Generated types include: `sprints`, `sprint_segments`, `sprint_topics`, `sprint_channels`, `content_slots`
   - **And** Types are exported and available for use in components and API routes

## Tasks / Subtasks

- [ ] Task 1: Create database migration file (AC: 1, 2, 3, 4)
  - [ ] Create `supabase/migrations/YYYYMMDD_execution_planning_schema.sql`
  - [ ] Create `campaign_os` schema if not exists: `CREATE SCHEMA IF NOT EXISTS campaign_os;`
  - [ ] Set search path or use fully qualified names: `SET search_path TO campaign_os, public;`
  - [ ] Define `campaign_os.sprints` table with all columns and constraints
  - [ ] Define `campaign_os.sprint_segments` junction table
  - [ ] Define `campaign_os.sprint_topics` junction table
  - [ ] Define `campaign_os.sprint_channels` junction table
  - [ ] Define `campaign_os.content_slots` table with all columns and constraints
  - [ ] Add CHECK constraint for `end_date > start_date` on sprints
  - [ ] Add UNIQUE constraint on `(date, channel, slot_index)` for content_slots
  - [ ] Create indexes: `sprints.campaign_id`, `content_slots.sprint_id`, `content_slots.date`
  - [ ] Create optional DB trigger to validate content_slots.date within sprint date range
  - [ ] Grant permissions: `GRANT INSERT, UPDATE, DELETE, SELECT ON ALL TABLES IN SCHEMA campaign_os TO authenticated;`
  - [ ] Grant sequence permissions: `GRANT USAGE ON ALL SEQUENCES IN SCHEMA campaign_os TO authenticated;`
  - [ ] Test migration on local Supabase instance
  - [ ] Verify all foreign keys and CASCADE deletes work correctly
  - [ ] Verify permissions allow authenticated users to write to tables

- [ ] Task 2: Create Zod schemas (AC: 5)
  - [ ] Add `SprintFocusGoalTypeSchema` enum to `lib/ai/schemas.ts`
  - [ ] Add `SprintPlanSchema` with all required fields and validations
  - [ ] Add `ContentObjectiveSchema` enum
  - [ ] Add `ContentTypeSchema` enum
  - [ ] Add `ContentSlotSchema` with all required fields and validations
  - [ ] Add `ExecutionPlanSchema` combining sprints and content_calendar
  - [ ] Export TypeScript types: `SprintPlan`, `ContentSlot`, `ExecutionPlan`, etc.
  - [ ] Test schema validation with sample data
  - [ ] Verify all enum values match database constraints

- [ ] Task 3: Generate TypeScript types (AC: 6)
  - [ ] Run `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
  - [ ] Verify generated types include: `sprints`, `sprint_segments`, `sprint_topics`, `sprint_channels`, `content_slots`
  - [ ] Check that types are properly exported
  - [ ] Test type usage in a sample component/API route

- [ ] Task 4: Testing (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Write unit tests for Zod schemas
  - [ ] Write integration tests for database migration
  - [ ] Test foreign key constraints and CASCADE deletes
  - [ ] Test UNIQUE constraint on content_slots
  - [ ] Test CHECK constraint on sprints (end_date > start_date)
  - [ ] Test optional DB trigger for date validation (if implemented)

## Dev Notes

### Architecture Patterns and Constraints

- **Database Schema:** Follow existing Supabase migration patterns from Epic 1-4
- **Schema Organization:** All tables are created in `campaign_os` schema for better organization and namespace separation
- **Schema Creation:** Migration creates `campaign_os` schema if it doesn't exist: `CREATE SCHEMA IF NOT EXISTS campaign_os;`
- **Permissions:** Grant appropriate permissions to `authenticated` role for all tables:
  - `GRANT INSERT, UPDATE, DELETE, SELECT ON ALL TABLES IN SCHEMA campaign_os TO authenticated;`
  - `GRANT USAGE ON ALL SEQUENCES IN SCHEMA campaign_os TO authenticated;`
- **Junction Tables:** Use many-to-many relationships for sprint-segment, sprint-topic, sprint-channel connections (similar to segment-topic matrix pattern from Epic 3.0.5)
- **Foreign Keys:** All foreign keys use CASCADE delete to maintain referential integrity. Use fully qualified names (schema.table) where needed for cross-schema references
- **Nullable Fields:** `primary_segment_id` and `primary_topic_id` in content_slots are nullable for flexibility (can extend later)
- **Enum Constraints:** Use TEXT columns with application-level enum validation (Zod schemas) rather than PostgreSQL ENUM types for flexibility
- **Indexes:** Create indexes on foreign keys and frequently queried columns (campaign_id, sprint_id, date)
- **Triggers:** Optional DB trigger for date validation provides additional data integrity layer

### Project Structure Notes

- **Migration File:** `supabase/migrations/YYYYMMDD_execution_planning_schema.sql` (follow existing naming convention)
- **Schema Definitions:** `lib/ai/schemas.ts` (add to existing file, follow existing schema patterns)
- **TypeScript Types:** `lib/supabase/types.ts` (generated file, do not edit manually)
- **Testing:** Follow existing test patterns from `__tests__/` directory

### References

- [Source: docs/epics.md#Epic-5] - Epic 5 goal, scope, and story breakdown
- [Source: docs/sprint-artifacts/epic-5-execution-planner-stories.md#Story-5.1] - Detailed acceptance criteria and technical notes
- [Source: docs/tech-spec.md#Epic-5-Technical-Approach] - Database schema SQL examples and technical approach
- [Source: supabase/migrations/] - Existing migration patterns for reference (check for schema usage and permission grants)
- [Source: lib/ai/schemas.ts] - Existing Zod schema patterns (GoalSchema, TopicSchema, etc.)

### Learnings from Previous Story

**From Story 4-0-4-ui-validation-status-checklist (Status: done)**

- **Schema Patterns:** Follow established patterns from Epic 4.0 for enum handling and JSONB fields
- **Migration Best Practices:** Use descriptive migration file names with date prefix
- **Type Generation:** Always regenerate TypeScript types after schema changes
- **Testing:** Include both unit tests (Zod schemas) and integration tests (database constraints)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-27: Story drafted by Bob (Scrum Master) based on epic-5-execution-planner-stories.md
- 2025-11-27: Updated to specify `campaign_os` schema usage and permission grants for authenticated users

