# Story 4.0.1: Strategic Metadata Schema Enhancement

**Status:** drafted

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

**AC #3:** Narratives table enhanced with strategic metadata
- **Given** I have Epic 3.0 database schema (narratives table exists from Epic 2)
- **When** I run the migration script
- **Then** the `narratives` table is enhanced with:
  - `primary_goal_ids` (JSONB, nullable) - optional array of UUIDs referencing goals
  - `primary_topic_ids` (JSONB, nullable) - optional array of UUIDs referencing topics
  - `suggested_phase` (TEXT, nullable) - optional enum: 'early' | 'mid' | 'late'
- **And** all fields are nullable initially for backward compatibility
- **And** enum constraint is enforced for `suggested_phase`
- **And** UUID arrays are validated to contain valid UUID format
- **And** existing narratives data remains accessible

**AC #4:** Database migration script created
- **Given** I have the Epic 3.0 database schema
- **When** I create the migration file
- **Then** migration file is created at `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
- **And** migration includes:
  - ALTER TABLE statements for goals, topics, narratives
  - Enum type creation if not exists
  - Index creation for new enum fields if needed
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
- **And** `NarrativeSchema` is updated with:
  - `primary_goal_ids` (z.array(z.string().uuid()).optional())
  - `primary_topic_ids` (z.array(z.string().uuid()).optional())
  - `suggested_phase` (z.enum(['early', 'mid', 'late']).optional())
- **And** all schemas maintain backward compatibility (optional fields)

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

- [ ] **Task 1: Create database migration script** (AC: #4)
  - [ ] Create migration file: `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
  - [ ] Add `funnel_stage` and `kpi_hint` to `goals` table
  - [ ] Add `related_goal_stages` and `recommended_content_types` to `topics` table
  - [ ] Add `primary_goal_ids`, `primary_topic_ids`, `suggested_phase` to `narratives` table
  - [ ] Create enum types if not exists
  - [ ] Add indexes for new enum fields if needed
  - [ ] Add migration comments
  - [ ] Test migration idempotency

- [ ] **Task 2: Update Zod schemas** (AC: #5)
  - [ ] Update `GoalSchema` in `lib/ai/schemas.ts`
  - [ ] Update `TopicSchema` in `lib/ai/schemas.ts`
  - [ ] Update `NarrativeSchema` in `lib/ai/schemas.ts`
  - [ ] Verify all new fields are optional (backward compatibility)
  - [ ] Test schema validation with sample data

- [ ] **Task 3: Generate TypeScript types** (AC: #6)
  - [ ] Run Supabase type generation command
  - [ ] Verify new fields are included in generated types
  - [ ] Check type exports in `lib/supabase/types.ts`

- [ ] **Task 4: Test migration and backward compatibility** (AC: #1, #2, #3, #7)
  - [ ] Run migration on local Supabase instance
  - [ ] Verify new fields exist and are nullable
  - [ ] Test enum constraints
  - [ ] Test JSONB array fields with valid data
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

**Narratives table enhancement:**
- `primary_goal_ids`: Links narratives to specific goals for prioritization
- `primary_topic_ids`: Links narratives to specific topics for content planning
- `suggested_phase`: Indicates when narrative should be used (early/mid/late campaign)

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

### File List

