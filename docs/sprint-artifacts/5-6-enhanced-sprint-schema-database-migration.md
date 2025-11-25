# Story 5.6: Enhanced Sprint Schema & Database Migration

Status: done

## Story

As a **developer**,
I want **an enhanced sprint schema with strategic metadata fields and database migration**,
so that **sprints contain enough information to guide future content slot generation without micromanagement**.

## Acceptance Criteria

1. **AC 5.6.1: Enhanced sprints table columns**
   - **Given** I have Epic 5 Phase 1 database schema (Story 5.1 complete)
   - **When** I run the migration
   - **Then** `campaign_os.sprints` table is enhanced with new columns:
     - `focus_stage` (TEXT, nullable initially) - CHECK constraint: IN ('awareness', 'engagement', 'consideration', 'conversion', 'mobilization')
     - `focus_goals` (JSONB, default '[]'::jsonb) - Array of goal_id UUIDs (1-3 goals per sprint)
     - `suggested_weekly_post_volume` (JSONB, nullable) - Object: `{total_posts_per_week: number, video_posts_per_week: number, stories_per_week?: number}`
     - `narrative_emphasis` (JSONB, default '[]'::jsonb) - Array of narrative_id UUIDs (1-2 narratives per sprint)
     - `key_messages_summary` (TEXT, nullable) - 4-6 bullet points: what we emphasize in this sprint
     - `success_criteria` (JSONB, default '[]'::jsonb) - Array of qualitative indicators: "ha ezt látjuk, jó irányban vagyunk"
     - `risks_and_watchouts` (JSONB, default '[]'::jsonb) - Array of 2-4 points: what to watch for
   - **And** All new columns are nullable initially for backward compatibility with existing sprints
   - **And** JSONB columns have default empty arrays where applicable

2. **AC 5.6.2: Enhanced SprintPlanSchema with new fields**
   - **Given** Migration is complete
   - **When** I check `lib/ai/schemas.ts`
   - **Then** `SprintPlanSchema` includes all new fields:
     - `focus_stage` (SprintFocusStageSchema enum: 'awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization')
     - `focus_goals` (array of UUID strings, min 1, max 3)
     - `suggested_weekly_post_volume` (SuggestedWeeklyPostVolumeSchema object)
     - `narrative_emphasis` (array of UUID strings, min 1, max 2)
     - `key_messages_summary` (string, min 20 characters)
     - `success_criteria` (array of strings, min 1)
     - `risks_and_watchouts` (array of strings, min 2, max 4)
   - **And** All new fields are optional (nullable) in schema for backward compatibility
   - **And** TypeScript types are exported: `SprintFocusStage`, `SuggestedWeeklyPostVolume`, `EnhancedSprintPlan`

3. **AC 5.6.3: TypeScript types regenerated**
   - **Given** Migration is complete
   - **When** I run `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
   - **Then** Generated types include new columns in `sprints` table type
   - **And** Types reflect nullable nature of new columns (optional properties)
   - **And** JSONB columns are typed as appropriate TypeScript arrays/objects

4. **AC 5.6.4: Backward compatibility verified**
   - **Given** Existing sprints exist in database (with Phase 1 schema)
   - **When** Migration runs
   - **Then** All existing sprints remain accessible
   - **And** Existing sprints have NULL or default values for new columns
   - **And** No data loss occurs
   - **And** Existing API endpoints continue to work with Phase 1 fields

**Prerequisites:** Story 5.1 (Phase 1 database schema)

**Estimated Effort:** 2-3 points (1-2 days)

## Tasks / Subtasks

- [x] Task 1: Create database migration (AC: 1)
  - [x] Create migration file: `supabase/migrations/20251129_enhanced_sprint_schema.sql`
  - [x] Add `focus_stage` column with CHECK constraint for enum values
  - [x] Add `focus_goals` JSONB column with default empty array
  - [x] Add `suggested_weekly_post_volume` JSONB column (nullable)
  - [x] Add `narrative_emphasis` JSONB column with default empty array
  - [x] Add `key_messages_summary` TEXT column (nullable)
  - [x] Add `success_criteria` JSONB column with default empty array
  - [x] Add `risks_and_watchouts` JSONB column with default empty array
  - [x] Test migration on local Supabase instance
  - [x] Verify existing sprints remain compatible (NULL/default values)
  - [x] Verify CHECK constraint works correctly
  - [x] Rollback migration if issues found

- [x] Task 2: Enhance SprintPlanSchema (AC: 2)
  - [x] Add `SprintFocusStageSchema` enum to `lib/ai/schemas.ts`
  - [x] Add `SuggestedWeeklyPostVolumeSchema` object schema
  - [x] Enhance `SprintPlanSchema` with new optional fields:
    - `focus_stage` (SprintFocusStageSchema, optional)
    - `focus_goals` (array of UUID strings, min 1, max 3, optional)
    - `suggested_weekly_post_volume` (SuggestedWeeklyPostVolumeSchema, optional)
    - `narrative_emphasis` (array of UUID strings, min 1, max 2, optional)
    - `key_messages_summary` (string, min 20, optional)
    - `success_criteria` (array of strings, min 1, optional)
    - `risks_and_watchouts` (array of strings, min 2, max 4, optional)
  - [x] Export TypeScript types: `SprintFocusStage`, `SuggestedWeeklyPostVolume`, `EnhancedSprintPlan`
  - [x] Test schema validation with sample data (with and without new fields)
  - [x] Verify backward compatibility (Phase 1 sprint data validates successfully)

- [x] Task 3: Regenerate TypeScript types (AC: 3)
  - [x] Run `npx supabase gen types typescript --local > lib/supabase/types.ts`
  - [x] Verify generated types include new columns
  - [x] Verify JSONB columns are typed correctly (arrays/objects)
  - [x] Verify nullable columns are optional in TypeScript types
  - [x] Update any type imports that might be affected

- [x] Task 4: Verify backward compatibility (AC: 4)
  - [x] Query existing sprints from database
  - [x] Verify all existing sprints are accessible
  - [x] Verify new columns have NULL or default values for existing sprints
  - [x] Test existing API endpoints with Phase 1 sprint data
  - [x] Verify no breaking changes in API responses
  - [x] Document backward compatibility in migration comments

- [x] Task 5: Testing and validation
  - [x] Create test sprint with all new fields populated
  - [x] Create test sprint with only Phase 1 fields (backward compatibility test)
  - [x] Verify schema validation works for both cases
  - [x] Test database queries with new columns
  - [x] Test JSONB column queries (array/object access)

## Dev Notes

### Learnings from Previous Story

**From Story 5.1 (Status: in-progress) - Database Schema for Execution Planning**
- Database migration pattern established in `supabase/migrations/YYYYMMDD_execution_planning_schema.sql`
- Sprints table structure defined in Phase 1: `id`, `campaign_id`, `name`, `order`, `start_date`, `end_date`, `focus_goal`, `focus_description`, `success_indicators`
- Junction tables created: `sprint_segments`, `sprint_topics`, `sprint_channels`
- Zod schemas defined in `lib/ai/schemas.ts` - follow same pattern for enhanced schema
- TypeScript types generated via `supabase gen types` command

[Source: docs/sprint-artifacts/5-1-database-schema-execution-planning.md]

### Architecture Patterns and Constraints

- **Migration Pattern:** Follow existing migration naming convention: `YYYYMMDD_description.sql`
- **Schema Location:** All database schema changes in `supabase/migrations/`
- **Zod Schema Location:** Execution plan schemas in `lib/ai/schemas.ts`
- **Type Generation:** Use Supabase CLI: `supabase gen types typescript`
- **Backward Compatibility:** New fields must be nullable/optional initially to not break existing sprints
- **JSONB Columns:** Use default empty arrays `'[]'::jsonb` where appropriate
- **CHECK Constraints:** Use CHECK constraints for enum-like values (e.g., focus_stage)

### Project Structure Notes

**New/Modified Files:**
- `supabase/migrations/YYYYMMDD_enhanced_sprint_schema.sql` - NEW migration file
- `lib/ai/schemas.ts` - MODIFY to enhance SprintPlanSchema
- `lib/supabase/types.ts` - MODIFY (regenerated after migration)

**Database Schema:**
- Table: `campaign_os.sprints` - MODIFY (add columns)
- No changes to junction tables (sprint_segments, sprint_topics, sprint_channels)

### References

- [Source: docs/epics.md#Story-5.6]
- [Source: docs/tech-spec.md#Phase-2-Enhanced-Schema]
- [Source: docs/sprint-artifacts/5-1-database-schema-execution-planning.md]
- [Source: lib/ai/schemas.ts]
- [Source: supabase/migrations/]

### Testing Standards

- Test migration on local Supabase instance before production
- Verify backward compatibility with existing Phase 1 sprints
- Test schema validation with both enhanced and Phase 1 sprint data
- Test JSONB column queries and array/object access patterns
- Verify CHECK constraints reject invalid enum values

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

Implementation approach:
1. Created migration with safe defaults for backward compatibility
2. Enhanced Zod schemas with optional new fields
3. Fixed TypeScript compilation issues in existing components
4. Updated test cases to comply with enhanced schema requirements

### Completion Notes List

✅ Database migration `20251129_enhanced_sprint_schema.sql` successfully adds 7 new strategic metadata columns to sprints table
✅ SprintPlanSchema enhanced with Phase 2 fields while maintaining backward compatibility
✅ TypeScript types regenerated and include all new nullable/optional fields
✅ Backward compatibility verified - existing sprints work with default/NULL values
✅ All tests passing including enhanced schema validation

### File List

- `supabase/migrations/20251129_enhanced_sprint_schema.sql` - NEW migration file
- `lib/ai/schemas.ts` - MODIFIED with enhanced SprintPlanSchema and new types
- `lib/supabase/types.ts` - MODIFIED (regenerated with new columns)
- `app/api/campaigns/execution/route.ts` - MODIFIED for backward compatibility
- `components/campaigns/SprintList.tsx` - MODIFIED for backward compatibility
- `__tests__/ai/campaign-brief.test.ts` - MODIFIED test data to meet schema requirements
- `__tests__/validation/campaign-structure.test.ts` - MODIFIED test data to meet schema requirements

