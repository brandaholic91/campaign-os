# Story 6.1: ContentSlot Schema Enhancement & ContentDraft Table

Status: done

## Story

As a **developer**,
I want **enhanced ContentSlot schema and new ContentDraft table**,
so that **content planning is separated into tactical slots and concrete drafts**.

## Acceptance Criteria

1. **Given** I have the current content_slots table from Story 5.1
   **When** I run the migration
   **Then** content_slots table is enhanced with all new fields:
   - `campaign_id` UUID (NOT NULL, FK → campaigns)
   - `time_of_day` TEXT (optional: 'morning' | 'midday' | 'evening' | 'unspecified')
   - `secondary_segment_ids` JSONB array (optional, 0-2 segments)
   - `secondary_topic_ids` JSONB array (optional, 0-2 topics)
   - `related_goal_ids` JSONB array (required, min 1, max 2 goals)
   - `funnel_stage` TEXT (required: 'awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization')
   - `angle_type` TEXT (required: 'story' | 'proof' | 'how_to' | 'comparison' | 'behind_the_scenes' | 'testimonial' | 'other')
   - `cta_type` TEXT (required: 'soft_info' | 'learn_more' | 'signup' | 'donate' | 'attend_event' | 'share' | 'comment')
   - `tone_override` TEXT (optional)
   - `asset_requirements` JSONB array (optional)
   - `owner` TEXT (optional)

2. **And** Status enum updated: 'planned' | 'scheduled' | 'cancelled' (removed 'draft', 'published')

3. **And** content_drafts table is created with all required fields:
   - `id` UUID (primary key)
   - `slot_id` UUID (NOT NULL, FK → content_slots, CASCADE delete)
   - `variant_name` TEXT (optional)
   - `status` TEXT (required: 'draft' | 'approved' | 'rejected' | 'published')
   - `hook` TEXT (required, min 10 chars)
   - `body` TEXT (required, min 50 chars)
   - `cta_copy` TEXT (required, min 5 chars)
   - `visual_idea` TEXT (required, min 20 chars)
   - `alt_text_suggestion` TEXT (optional)
   - `length_hint` TEXT (optional)
   - `tone_notes` TEXT (optional)
   - `used_segment_id` UUID (optional, FK → segments)
   - `used_topic_id` UUID (optional, FK → topics)
   - `used_goal_ids` JSONB array (optional)
   - `created_by` TEXT (required: 'ai' | 'human')
   - `created_at`, `updated_at` timestamps

4. **And** Indexes created: `idx_content_drafts_slot_id`, `idx_content_drafts_status`

5. **And** Updated_at trigger created for content_drafts

6. **And** Migration handles existing slots:
   - `campaign_id`: filled from sprint → campaign relationship
   - `funnel_stage`: from sprint `focus_stage` or default 'awareness'
   - `related_goal_ids`: from sprint `focus_goals` or empty array
   - `angle_type`: inferred from `angle_hint` or 'other'
   - `cta_type`: default 'learn_more'
   - Status migration: 'draft' → 'scheduled', 'published' → 'scheduled'

7. **And** Zod schemas updated: ContentSlotSchema, ContentDraftSchema with all new fields

8. **And** TypeScript types regenerated from database schema

## Tasks / Subtasks

- [x] Task 1: Create database migration file (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create migration file: `supabase/migrations/20251201_content_slot_draft_separation.sql`
  - [x] Add ALTER TABLE statements for content_slots new columns
  - [x] Add CHECK constraints for enum fields (time_of_day, funnel_stage, angle_type, cta_type)
  - [x] Update status column constraint (remove 'draft', 'published', add 'scheduled', 'cancelled')
  - [x] Create content_drafts table with all fields
  - [x] Add foreign key constraints (slot_id → content_slots, used_segment_id → segments, used_topic_id → topics)
  - [x] Add CHECK constraints for content_drafts (status, created_by)
  - [x] Create indexes: idx_content_drafts_slot_id, idx_content_drafts_status
  - [x] Create updated_at trigger for content_drafts
  - [x] Add migration logic for existing slots (campaign_id, funnel_stage, related_goal_ids, angle_type, cta_type, status)
  - [x] Add constraint: related_goal_ids min 1 (CHECK jsonb_array_length >= 1)
  - [x] Set NOT NULL constraints after migration (campaign_id, primary_segment_id, primary_topic_id, funnel_stage)

- [x] Task 2: Update Zod schemas (AC: 7)
  - [x] Add FunnelStageSchema enum to `lib/ai/schemas.ts`
  - [x] Add ContentObjectiveSchema enum (if not exists)
  - [x] Add ContentTypeSchema enum (if not exists)
  - [x] Add AngleTypeSchema enum
  - [x] Add CTATypeSchema enum
  - [x] Add ContentSlotStatusSchema enum (updated values)
  - [x] Add TimeOfDaySchema enum (optional)
  - [x] Update ContentSlotSchema with all new fields
  - [x] Add ContentDraftStatusSchema enum
  - [x] Create ContentDraftSchema with all fields
  - [x] Add validation: related_goal_ids min 1, max 2
  - [x] Add validation: hook min 10 chars, body min 50 chars, cta_copy min 5 chars, visual_idea min 20 chars

- [x] Task 3: Regenerate TypeScript types (AC: 8)
  - [x] Run Supabase type generation: `npx supabase gen types typescript --local > lib/supabase/types.ts`
  - [x] Verify new types: ContentSlot, ContentDraft
  - [x] Update any existing type imports if needed

- [x] Task 4: Test migration (AC: 1-6)
  - [x] Test migration on local database (migration successfully executed)
  - [x] Verify existing slots are migrated correctly (campaign_id, funnel_stage, related_goal_ids populated from sprint)
  - [x] Verify new fields are nullable initially, then set to NOT NULL (migration handles this correctly)
  - [x] Verify content_drafts table created with all constraints (table exists with all required fields and CHECK constraints)
  - [x] Verify indexes created (idx_content_drafts_slot_id, idx_content_drafts_status)
  - [x] Verify triggers work (updated_at trigger created for content_drafts)
  - [x] Test foreign key constraints (CASCADE delete configured for slot_id → content_slots)

## Dev Notes

### Relevant Architecture Patterns

- **Migration Strategy:** Follow existing migration pattern from Story 5.1 (`20251128_execution_planning_schema.sql`)
- **Schema Organization:** Use `campaign_os` schema for all tables
- **Type Safety:** Use Zod schemas for validation, Supabase generated types for TypeScript
- **Backward Compatibility:** Existing slots must remain functional, new fields nullable initially

### Source Tree Components to Touch

**Database:**
- `supabase/migrations/` - New migration file
- Existing migration: `20251128_execution_planning_schema.sql` (reference for pattern)

**Schema Validation:**
- `lib/ai/schemas.ts` - Add new Zod schemas and update ContentSlotSchema

**TypeScript Types:**
- `lib/supabase/types.ts` - Regenerate from database schema

### Migration Details

**ContentSlot Enhancement:**
- Add new columns with `IF NOT EXISTS` checks
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pattern
- Set default values for nullable fields
- Migrate existing data before setting NOT NULL constraints
- Update status enum: remove 'draft' and 'published', add 'scheduled' and 'cancelled'

**ContentDraft Table:**
- Create table with all fields
- Foreign key to content_slots with CASCADE delete
- Optional foreign keys to segments and topics (SET NULL on delete)
- CHECK constraints for enums
- Indexes for performance (slot_id, status)

**Data Migration:**
- For existing slots: derive campaign_id from sprint → campaign relationship
- For existing slots: derive funnel_stage from sprint focus_stage or default 'awareness'
- For existing slots: derive related_goal_ids from sprint focus_goals or empty array
- For existing slots: infer angle_type from angle_hint or set 'other'
- For existing slots: set cta_type to 'learn_more' as default
- For existing slots: migrate status 'draft' → 'scheduled', 'published' → 'scheduled'

### Testing Standards

- Test migration on clean database
- Test migration on database with existing slots
- Verify all constraints work (CHECK, FOREIGN KEY, NOT NULL)
- Verify indexes are created
- Verify triggers fire correctly
- Test backward compatibility: existing slots still queryable

### Project Structure Notes

- Follow existing migration file naming: `YYYYMMDD_description.sql`
- Use `campaign_os` schema consistently
- Follow existing Zod schema patterns from `lib/ai/schemas.ts`
- Regenerate types after migration using Supabase CLI

### References

- [Source: docs/sprint-artifacts/content-slot-draft-separation-plan.md#3-adatbázis-séma] - Detailed database schema specification
- [Source: docs/sprint-artifacts/content-slot-draft-separation-plan.md#4-zod-sémák] - Zod schema specifications
- [Source: supabase/migrations/20251128_execution_planning_schema.sql] - Reference migration pattern
- [Source: lib/ai/schemas.ts] - Existing Zod schema patterns
- [Source: docs/epics.md#epic-6] - Epic 6 story breakdown

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/6-1-content-slot-schema-enhancement-draft-table.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- ✅ **Migration fájl létrehozva** (`supabase/migrations/20251201_content_slot_draft_separation.sql`): 
  - Content_slots tábla bővítve új mezőkkel (campaign_id, time_of_day, secondary_segment_ids, secondary_topic_ids, related_goal_ids, funnel_stage, angle_type, cta_type, tone_override, asset_requirements, owner)
  - Status enum frissítve: 'planned', 'scheduled', 'cancelled' (eltávolítva 'draft', 'published')
  - Content_drafts tábla létrehozva minden mezővel, constraint-tel és indexekkel
  - Adatmigráció: meglévő slot-ok campaign_id, funnel_stage, related_goal_ids, angle_type, cta_type mezői kitöltve
  - CHECK constraint-ek hozzáadva minden enum mezőhöz
  - Foreign key constraint-ek: slot_id → content_slots (CASCADE), used_segment_id → segments (SET NULL), used_topic_id → topics (SET NULL)
  - Indexek: idx_content_drafts_slot_id, idx_content_drafts_status
  - Updated_at trigger létrehozva content_drafts táblához

- ✅ **Zod schemák frissítve** (`lib/ai/schemas.ts`):
  - Új enum schemák: FunnelStageSchema, TimeOfDaySchema, AngleTypeSchema, CTATypeSchema, ContentSlotStatusSchema, ContentDraftStatusSchema
  - ContentSlotSchema bővítve minden új mezővel és validációval
  - ContentDraftSchema létrehozva minden mezővel és validációval (hook min 10, body min 50, cta_copy min 5, visual_idea min 20 chars)
  - related_goal_ids validáció: min 1, max 2

- ✅ **TypeScript típusok regenerálva** (`lib/supabase/types.ts`):
  - Content_slots típusok frissítve új mezőkkel
  - Content_drafts típusok generálva

- ✅ **Migration tesztek**:
  - Migration sikeresen lefutott az adatbázison
  - Minden constraint és index létrejött
  - Adatmigráció helyesen működött

### File List

- `supabase/migrations/20251201_content_slot_draft_separation.sql` - Migration fájl
- `lib/ai/schemas.ts` - Zod schemák frissítve (ContentSlotSchema, ContentDraftSchema, új enum schemák)
- `lib/supabase/types.ts` - TypeScript típusok regenerálva

