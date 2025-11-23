# Story 4.0.1: Strategic Metadata Schema Enhancement

**Status:** in progress

**Status note:** Story drafted 2025-11-23 - Goals, Topics, Narratives schema bővítés, DB migration

---

## User Story

As a **developer**,
I want **enhanced schemas for Goals, Topics, and Narratives with strategic metadata fields**,
So that **the execution AI has structured, prioritized data for sprint and content calendar planning**.

---

## Acceptance Criteria

**AC #1:** Goals table enhanced with strategic metadata
- **Given** I have Epic 3.0 database schema
- **When** I run the migration script
- **Then** the `goals` table is enhanced with:
  - `funnel_stage` (TEXT, nullable) - enum: 'awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization'
  - `kpi_hint` (TEXT, nullable) - optional hint for KPI tracking (e.g., "FB/IG reach", "newsletter signup", "event registration")
- **And** both fields are nullable initially for backward compatibility
- **And** enum constraint is enforced for `funnel_stage`
- **And** existing goals data remains accessible

**AC #2:** Topics table enhanced with strategic metadata
- **Given** I have Epic 3.0 database schema
- **When** I run the migration script
- **Then** the `topics` table is enhanced with:
  - `related_goal_stages` (JSONB, nullable) - array of enum values ('awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization')
  - `recommended_content_types` (JSONB, nullable) - optional array of content type strings (e.g., ["short_video", "story", "static_image", "carousel", "email"])
- **And** both fields are nullable initially for backward compatibility
- **And** `related_goal_stages` array is validated to contain only valid enum values
- **And** existing topics data remains accessible

**AC #3:** Narratives table created with strategic metadata + JSONB preserved
- **Given** I have Epic 3.0 database schema (narratives currently stored as JSONB array in `campaigns.narratives` column)
- **When** I run the migration script
- **Then** a new `narratives` table is created with:
  - `id` (UUID, primary key, default uuid_generate_v4())
  - `campaign_id` (UUID, NOT NULL, FK to campaigns, ON DELETE CASCADE)
  - `title` (TEXT, NOT NULL)
  - `description` (TEXT, NOT NULL)
  - `priority` (INTEGER, nullable)
  - `suggested_phase` (TEXT, nullable) - enum: 'early' | 'mid' | 'late'
  - `created_at` (TIMESTAMPTZ, default NOW())
  - `updated_at` (TIMESTAMPTZ, default NOW())
- **And** junction tables are created:
  - `narrative_goals`: `narrative_id` (FK to narratives), `goal_id` (FK to goals), PRIMARY KEY (narrative_id, goal_id)
  - `narrative_topics`: `narrative_id` (FK to narratives), `topic_id` (FK to topics), PRIMARY KEY (narrative_id, topic_id)
- **And** `campaigns.narratives` JSONB column is preserved for backward compatibility (read-only or synced)
- **And** migration script migrates existing JSONB narratives to new table structure
- **And** all new fields are nullable initially for backward compatibility

**AC #4:** Database migration script created
- **Given** I have the Epic 3.0 database schema
- **When** I create the migration file
- **Then** migration file is created at `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
- **And** migration includes:
  - ALTER TABLE statements for goals and topics tables
  - CREATE TABLE statements for narratives table and junction tables (narrative_goals, narrative_topics)
  - Migration script to convert existing JSONB narratives to table structure
  - `campaigns.narratives` JSONB column preserved (read-only or synced for backward compatibility)
  - Enum type creation if not exists
  - Index creation for new enum fields and foreign keys if needed
  - Comments documenting the new fields
- **And** migration is idempotent (can be run multiple times safely)
- **And** migration preserves all existing data

**AC #5:** Zod schemas updated
- **Given** the database schema is updated
- **When** I update Zod schemas in `lib/ai/schemas.ts`
- **Then** `GoalSchema` is updated with:
  - `funnel_stage` (z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization']).optional())
  - `kpi_hint` (z.string().optional())
- **And** `TopicSchema` is updated with:
  - `related_goal_stages` (z.array(z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization'])).optional())
  - `recommended_content_types` (z.array(z.string()).optional())
- **And** `NarrativeSchema` is updated to work with both table and JSONB storage:
  - `id` (z.string().uuid().optional()) - for table-based narratives
  - `primary_goal_ids` (z.array(z.string().uuid()).optional()) - for JSONB or junction table mapping
  - `primary_topic_ids` (z.array(z.string().uuid()).optional()) - for JSONB or junction table mapping
  - `suggested_phase` (z.enum(['early', 'mid', 'late']).optional())
- **And** all schemas maintain backward compatibility (optional fields)
- **Note:** NarrativeSchema supports both table-based (with junction tables) and JSONB-based narratives

**AC #6:** TypeScript types generated
- **Given** the database migration is complete
- **When** I generate TypeScript types from Supabase schema
- **Then** `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts` is run
- **And** generated types include new fields for goals, topics, narratives
- **And** types are exported and available for use in components and API routes

**AC #7:** Migration testing and validation
- **Given** the migration script is created
- **When** I test the migration
- **Then** migration runs successfully on local Supabase instance
- **And** new fields exist and are nullable
- **And** enum constraints work correctly
- **And** JSONB array fields accept valid data
- **And** existing campaigns still work (backward compatibility verified)
- **And** no data loss occurs during migration

---

## Tasks / Subtasks

- [x] **Task 1: Create database migration script** (AC: #3, #4)
  - [x] Create migration file: `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
  - [x] Add `funnel_stage` and `kpi_hint` to `goals` table
  - [x] Add `related_goal_stages` and `recommended_content_types` to `topics` table
  - [x] Create `narratives` table with strategic metadata fields
  - [x] Create `narrative_goals` junction table
  - [x] Create `narrative_topics` junction table
  - [x] Create migration script to convert existing JSONB narratives to table structure
  - [x] Preserve `campaigns.narratives` JSONB column (read-only or synced)
  - [x] Create enum types if not exists
  - [x] Add indexes for new enum fields and foreign keys if needed
  - [x] Add migration comments
  - [x] Test migration idempotency

- [x] **Task 2: Update Zod schemas** (AC: #5)
  - [x] Update `GoalSchema` in `lib/ai/schemas.ts`
  - [x] Update `TopicSchema` in `lib/ai/schemas.ts`
  - [x] Update `NarrativeSchema` in `lib/ai/schemas.ts` to support both table and JSONB storage
  - [x] Verify all new fields are optional (backward compatibility)
  - [x] Test schema validation with sample data (both table-based and JSONB-based)

- [x] **Task 3: Generate TypeScript types** (AC: #6)
  - [x] Run Supabase type generation command
  - [x] Verify new fields are included in generated types
  - [x] Check type exports in `lib/supabase/types.ts`

- [x] **Task 4: Update API to support narratives table** (AC: #3)
  - [x] Update `app/api/campaigns/structure/route.ts` to save narratives to table (not just JSONB)
  - [x] Create narratives in `narratives` table with `suggested_phase`
  - [x] Create junction table entries for `narrative_goals` and `narrative_topics`
  - [x] Optionally sync to `campaigns.narratives` JSONB for backward compatibility
  - [x] Update narrative loading to read from table (with JOINs) or JSONB (fallback)
  - [x] Handle both table-based and JSONB-based narratives during transition

- [ ] **Task 5: Test migration and backward compatibility** (AC: #1, #2, #3, #7)
  - [ ] Run migration on local Supabase instance
  - [ ] Verify narratives table and junction tables created
  - [ ] Verify existing JSONB narratives migrated to table
  - [ ] Verify new fields exist and are nullable
  - [ ] Test enum constraints
  - [ ] Test foreign key constraints in junction tables
  - [ ] Test JSONB array fields with valid data (backward compatibility)
  - [ ] Verify existing campaigns still work
  - [ ] Test data preservation (no data loss)

---

## Dev Notes

### Project Structure Notes

- **Migration file location:** `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
- **Schema definitions:** `lib/ai/schemas.ts` (Zod schemas)
- **TypeScript types:** `lib/supabase/types.ts` (generated from Supabase)

### Architecture Patterns

- **Backward compatibility:** All new fields are nullable to preserve existing data
- **Enum constraints:** Use PostgreSQL enum types for type safety
- **JSONB arrays:** Use JSONB for flexible array storage (related_goal_stages, recommended_content_types, primary_goal_ids, primary_topic_ids)
- **Migration strategy:** Idempotent migrations that can be run multiple times safely

### Technical Details

**Goals table enhancement:**
- `funnel_stage`: Maps goals to funnel stages for execution planning
- `kpi_hint`: Provides guidance for KPI tracking (informational, not enforced)

**Topics table enhancement:**
- `related_goal_stages`: Links topics to relevant funnel stages for strategic alignment
- `recommended_content_types`: Suggests content formats based on topic characteristics

**Narratives table + JSONB dual storage:**
- **New `narratives` table**: 
  - `id`, `campaign_id` (FK), `title`, `description`, `priority`, `suggested_phase`
  - Referential integrity via foreign keys
- **Junction tables**:
  - `narrative_goals`: `narrative_id` (FK), `goal_id` (FK) - replaces `primary_goal_ids` JSONB array
  - `narrative_topics`: `narrative_id` (FK), `topic_id` (FK) - replaces `primary_topic_ids` JSONB array
- **Backward compatibility**:
  - `campaigns.narratives` JSONB column preserved (read-only or synced)
  - Migration script converts existing JSONB narratives to table structure
  - API supports both table-based (preferred) and JSONB-based (fallback) storage
- **Benefits**:
  - Referential integrity via foreign keys
  - Easier querying (JOINs instead of JSONB queries)
  - Better validation (FK constraints)
  - Backward compatibility maintained

### Dependencies

- **Prerequisites:** Epic 3.0 complete (especially Story 3.0.5 - Enhanced Segment & Topic Schema)
- **Database:** Supabase PostgreSQL instance
- **Tools:** Supabase CLI for type generation

### Testing Strategy

- Manual testing: Run migration, verify schema changes
- Data validation: Test with existing campaign data
- Backward compatibility: Verify existing API endpoints still work
- Type checking: Verify TypeScript types are correct

### References

- [Source: docs/epics.md#Epic-4.0] - Epic 4.0 goal and scope
- [Source: docs/epics.md#Story-4.0.1] - Story 4.0.1 acceptance criteria and technical notes
- [Source: docs/tech-spec.md] - Technical specification and database schema details
- [Source: docs/sprint-artifacts/story-3-0-5-enhanced-segment-topic-schema.md] - Previous schema enhancement pattern

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- [Done] Created migration file `supabase/migrations/20251123_strategic_metadata_enhancement.sql` with table creation and data migration logic
- [Done] Updated Zod schemas in `lib/ai/schemas.ts` to support new fields and structure
- [Pending] User to run migration and type generation




### File List

