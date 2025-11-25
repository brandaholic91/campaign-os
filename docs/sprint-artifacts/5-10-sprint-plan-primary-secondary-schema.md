# Story 5.10: Sprint Plan Primary/Secondary Schema Implementation

Status: in-progress

**Epic:** Epic 5 - Execution Planning  
**Story ID:** 5.10  
**Dátum:** 2025-11-25  
**Becsült effort:** 5-6 pont (3-4 nap)

---

## User Story

As a **campaign manager**,  
I want **sprint plans with primary and secondary focus areas for segments, topics, and channels**,  
So that **I can clearly prioritize which audiences, topics, and channels are most important for each sprint phase**.

---

## Acceptance Criteria

### AC1: Schema Update

**Given** I have the current SprintPlanSchema with legacy `focus_segments`, `focus_topics`, `focus_channels` fields  
**When** I update the schema  
**Then** The schema includes:
- `focus_stage`: **required** (not optional)
- `focus_segments_primary`: array of 1-2 segment IDs (required)
- `focus_segments_secondary`: array of 0-2 segment IDs (optional)
- `focus_topics_primary`: array of 2-3 topic IDs (required)
- `focus_topics_secondary`: array of 2-4 topic IDs (optional)
- `focus_channels_primary`: array of 2-3 channel keys (required)
- `focus_channels_secondary`: array of 0-N channel keys (optional)

**And** Legacy fields (`focus_segments`, `focus_topics`, `focus_channels`) are removed from schema  
**And** All validation rules enforce the min/max constraints

### AC2: Database Migration

**Given** I have existing sprint_segments, sprint_topics, sprint_channels junction tables  
**When** I run the migration  
**Then** Each junction table has a `priority` column:
- `sprint_segments.priority`: TEXT CHECK (priority IN ('primary', 'secondary'))
- `sprint_topics.priority`: TEXT CHECK (priority IN ('primary', 'secondary'))
- `sprint_channels.priority`: TEXT CHECK (priority IN ('primary', 'secondary'))

**And** Existing junction table records are migrated to `priority = 'primary'` (default)  
**And** Migration is idempotent (safe to run multiple times)

### AC3: API GET Endpoint

**Given** I have sprints with primary/secondary relationships in junction tables  
**When** I GET `/api/sprints?campaignId=xxx` or `/api/sprints/[sprintId]`  
**Then** Response includes:
```json
{
  "id": "sprint_1",
  "focus_segments_primary": ["segment-uuid-1", "segment-uuid-2"],
  "focus_segments_secondary": ["segment-uuid-3"],
  "focus_topics_primary": ["topic-uuid-1", "topic-uuid-2", "topic-uuid-3"],
  "focus_topics_secondary": ["topic-uuid-4", "topic-uuid-5"],
  "focus_channels_primary": ["instagram_reels", "tiktok"],
  "focus_channels_secondary": ["facebook"]
}
```

**And** If a sprint has no secondary relationships, the secondary arrays are empty arrays (not null)  
**And** Backward compatibility: If a sprint has no priority in junction tables, all relationships are treated as primary

### AC4: API POST Endpoint

**Given** I have a sprint plan with primary/secondary fields  
**When** I POST to `/api/sprints` with:
```json
{
  "campaign_id": "xxx",
  "name": "Sprint 1",
  "focus_segments_primary": ["segment-1", "segment-2"],
  "focus_segments_secondary": ["segment-3"],
  "focus_topics_primary": ["topic-1", "topic-2"],
  "focus_topics_secondary": ["topic-3", "topic-4"],
  "focus_channels_primary": ["instagram_reels", "tiktok"],
  "focus_channels_secondary": ["facebook"]
}
```

**Then** Sprint is created in `sprints` table  
**And** Junction table records are created with correct priority:
- `sprint_segments`: segment-1, segment-2 with `priority = 'primary'`
- `sprint_segments`: segment-3 with `priority = 'secondary'`
- `sprint_topics`: topic-1, topic-2 with `priority = 'primary'`
- `sprint_topics`: topic-3, topic-4 with `priority = 'secondary'`
- `sprint_channels`: instagram_reels, tiktok with `priority = 'primary'`
- `sprint_channels`: facebook with `priority = 'secondary'`

**And** Validation enforces:
- `focus_segments_primary`: min 1, max 2
- `focus_topics_primary`: min 2, max 3
- `focus_channels_primary`: min 2, max 3

### AC5: API PUT Endpoint

**Given** I have an existing sprint  
**When** I PUT to `/api/sprints/[sprintId]` with updated primary/secondary fields  
**Then** Junction table records are updated:
- Old relationships are deleted
- New relationships are inserted with correct priority

**And** Validation rules are enforced (same as POST)

### AC6: AI Generation Endpoint

**Given** I have a validated campaign structure  
**When** I POST to `/api/ai/campaign-sprints`  
**Then** Generated sprints include primary/secondary fields  
**And** AI prompt already includes these fields (no prompt changes needed)  
**And** Validation passes with new schema

### AC7: Execution Plan Save

**Given** I have an execution plan with sprints containing primary/secondary fields  
**When** I POST to `/api/campaigns/execution`  
**Then** Sprints are saved with primary/secondary relationships  
**And** Junction table records include priority field

### AC8: Frontend Form

**Given** I am editing a sprint  
**When** I view the sprint form  
**Then** I see separate sections for:
- Primary segments (1-2 selection)
- Secondary segments (0-2 selection, optional)
- Primary topics (2-3 selection)
- Secondary topics (2-4 selection, optional)
- Primary channels (2-3 selection)
- Secondary channels (optional)

**And** Form validation enforces min/max constraints  
**And** Form shows clear labels: "Fő szegmensek", "Kiegészítő szegmensek", stb.

### AC9: Frontend Display

**Given** I am viewing a sprint  
**When** I see sprint details  
**Then** Primary and secondary items are visually distinguished:
- Primary items: bold, primary color
- Secondary items: normal weight, secondary color
- Clear labels: "Fő szegmensek", "Kiegészítő szegmensek"

### AC10: Backward Compatibility

**Given** I have existing sprints without primary/secondary distinction  
**When** I load these sprints  
**Then** All existing relationships are treated as primary  
**And** No errors occur  
**And** UI displays all relationships as primary (with option to edit)

---

## Technical Implementation

### Files to Modify

1. **Schema (`lib/ai/schemas.ts`)**
   - Update `SprintPlanSchema` (lines 349-382)
   - Remove legacy fields
   - Add primary/secondary fields with validation

2. **Database Migration (`supabase/migrations/`)**
   - Create new migration file
   - Add `priority` column to junction tables
   - Migrate existing data

3. **API Endpoints**
   - `app/api/sprints/route.ts` - GET/POST/PUT
   - `app/api/ai/campaign-sprints/route.ts` - validation
   - `app/api/campaigns/execution/route.ts` - save logic

4. **Frontend Components**
   - `components/sprints/SprintForm.tsx`
   - `components/campaigns/SprintEditForm.tsx`
   - `components/sprints/SprintBoard.tsx`
   - `components/campaigns/SprintDetailPage.tsx`

5. **Types**
   - `lib/supabase/types.ts` - regenerate if DB changed

### Database Migration Script

```sql
-- Add priority column to junction tables
ALTER TABLE campaign_os.sprint_segments 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary';

ALTER TABLE campaign_os.sprint_topics 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary';

ALTER TABLE campaign_os.sprint_channels 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary';

-- Set default for existing records
UPDATE campaign_os.sprint_segments SET priority = 'primary' WHERE priority IS NULL;
UPDATE campaign_os.sprint_topics SET priority = 'primary' WHERE priority IS NULL;
UPDATE campaign_os.sprint_channels SET priority = 'primary' WHERE priority IS NULL;

-- Add check constraints
ALTER TABLE campaign_os.sprint_segments 
  ADD CONSTRAINT sprint_segments_priority_check 
  CHECK (priority IN ('primary', 'secondary'));

ALTER TABLE campaign_os.sprint_topics 
  ADD CONSTRAINT sprint_topics_priority_check 
  CHECK (priority IN ('primary', 'secondary'));

ALTER TABLE campaign_os.sprint_channels 
  ADD CONSTRAINT sprint_channels_priority_check 
  CHECK (priority IN ('primary', 'secondary'));
```

### Schema Changes

```typescript
export const SprintPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  order: z.number().int().positive(),
  start_date: dateStringSchema(),
  end_date: dateStringSchema(),
  
  // Required fields
  focus_stage: SprintFocusStageSchema, // NOW REQUIRED
  focus_goals: z.array(z.string().uuid()).min(1).max(3),
  
  // Primary/secondary fields
  focus_segments_primary: z.array(z.string().uuid()).min(1).max(2),
  focus_segments_secondary: z.array(z.string().uuid()).max(2).optional(),
  focus_topics_primary: z.array(z.string().uuid()).min(2).max(3),
  focus_topics_secondary: z.array(z.string().uuid()).min(2).max(4).optional(),
  focus_channels_primary: z.array(z.string().min(1)).min(2).max(3),
  focus_channels_secondary: z.array(z.string().min(1)).optional(),
  
  // Other enhanced fields
  suggested_weekly_post_volume: SuggestedWeeklyPostVolumeSchema.optional(),
  narrative_emphasis: z.array(z.string().uuid()).min(1).max(2).optional(),
  key_messages_summary: z.string().min(20).optional(),
  success_criteria: z.array(z.string()).min(1).optional(),
  risks_and_watchouts: z.array(z.string()).min(1).max(4).optional(),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start
}, {
  message: 'end_date must be after start_date',
  path: ['end_date']
})
```

---

## Testing Checklist

- [ ] Schema validation: new fields accepted
- [ ] Schema validation: required fields enforced
- [ ] Schema validation: min/max constraints enforced
- [ ] Database migration: priority columns added
- [ ] Database migration: existing data migrated
- [ ] API GET: primary/secondary fields returned correctly
- [ ] API POST: primary/secondary fields saved with priority
- [ ] API PUT: primary/secondary fields updated correctly
- [ ] AI generation: new fields generated correctly
- [ ] Execution plan save: primary/secondary relationships saved
- [ ] Frontend form: primary/secondary fields editable
- [ ] Frontend display: primary/secondary items distinguished
- [ ] Backward compatibility: existing sprints load correctly

---

## Dependencies

**Prerequisites:**
- Story 5.6 (Enhanced Sprint Schema) - partial overlap, this story extends it
- Story 5.7 (Sprint-Only AI Generation) - should work with new schema

**Blocks:**
- None (can be done in parallel with other stories)

---

## Risks & Mitigation

1. **Breaking change risk:** Removing legacy fields might break existing code
   - **Mitigation:** Gradual migration, keep legacy fields optional initially, or add compatibility layer

2. **Database migration risk:** Adding priority column might fail on existing data
   - **Mitigation:** Safe migration with defaults, test on staging first

3. **AI prompt risk:** AI might not generate primary/secondary correctly
   - **Mitigation:** Prompt already includes these fields, add validation, test thoroughly

4. **Frontend complexity:** Form might become too complex with primary/secondary
   - **Mitigation:** Clear UI/UX design, separate sections, good labeling

---

## Tasks / Subtasks

- [x] Task 1: Update SprintPlanSchema (AC: 1)
  - [x] Modify `lib/ai/schemas.ts` - Update `SprintPlanSchema` (lines 349-382)
  - [x] Remove legacy fields: `focus_segments`, `focus_topics`, `focus_channels`
  - [x] Add `focus_stage` as required field (not optional)
  - [x] Add `focus_segments_primary`: array of 1-2 segment IDs (required)
  - [x] Add `focus_segments_secondary`: array of 0-2 segment IDs (optional)
  - [x] Add `focus_topics_primary`: array of 2-3 topic IDs (required)
  - [x] Add `focus_topics_secondary`: array of 2-4 topic IDs (optional)
  - [x] Add `focus_channels_primary`: array of 2-3 channel keys (required)
  - [x] Add `focus_channels_secondary`: array of 0-N channel keys (optional)
  - [x] Enforce min/max validation constraints
  - [ ] Test schema validation with valid/invalid data

- [x] Task 2: Database Migration (AC: 2)
  - [x] Create new migration file in `supabase/migrations/`
  - [x] Add `priority` column to `sprint_segments` table (TEXT, DEFAULT 'primary')
  - [x] Add `priority` column to `sprint_topics` table (TEXT, DEFAULT 'primary')
  - [x] Add `priority` column to `sprint_channels` table (TEXT, DEFAULT 'primary')
  - [x] Add CHECK constraints: priority IN ('primary', 'secondary')
  - [x] Migrate existing records: SET priority = 'primary' WHERE priority IS NULL
  - [x] Ensure migration is idempotent (safe to run multiple times)
  - [ ] Test migration on staging database

- [x] Task 3: Update API GET Endpoint (AC: 3)
  - [x] Modify `app/api/sprints/route.ts` - GET handler
  - [x] Query junction tables with priority field
  - [x] Group relationships by priority (primary vs secondary)
  - [x] Return `focus_segments_primary` and `focus_segments_secondary` arrays
  - [x] Return `focus_topics_primary` and `focus_topics_secondary` arrays
  - [x] Return `focus_channels_primary` and `focus_channels_secondary` arrays
  - [x] Handle backward compatibility: if priority is NULL, treat as 'primary'
  - [x] Return empty arrays (not null) if no secondary relationships exist
  - [ ] Test GET endpoint with existing sprints (backward compatibility)
  - [ ] Test GET endpoint with new sprints (primary/secondary)

- [x] Task 4: Update API POST Endpoint (AC: 4)
  - [x] Modify `app/api/sprints/route.ts` - POST handler
  - [x] Accept `focus_segments_primary` and `focus_segments_secondary` in request body
  - [x] Accept `focus_topics_primary` and `focus_topics_secondary` in request body
  - [x] Accept `focus_channels_primary` and `focus_channels_secondary` in request body
  - [x] Validate min/max constraints:
    - `focus_segments_primary`: min 1, max 2
    - `focus_topics_primary`: min 2, max 3
    - `focus_channels_primary`: min 2, max 3
  - [x] Create sprint in `sprints` table
  - [x] Insert junction table records with correct priority:
    - `sprint_segments`: primary items with `priority = 'primary'`
    - `sprint_segments`: secondary items with `priority = 'secondary'`
    - `sprint_topics`: primary items with `priority = 'primary'`
    - `sprint_topics`: secondary items with `priority = 'secondary'`
    - `sprint_channels`: primary items with `priority = 'primary'`
    - `sprint_channels`: secondary items with `priority = 'secondary'`
  - [ ] Test POST endpoint with valid data
  - [ ] Test POST endpoint validation (min/max constraints)

- [x] Task 5: Update API PUT Endpoint (AC: 5)
  - [x] Modify `app/api/sprints/route.ts` - PUT handler
  - [x] Accept updated primary/secondary fields in request body
  - [x] Delete old junction table records for this sprint
  - [x] Insert new junction table records with correct priority
  - [x] Enforce same validation rules as POST
  - [ ] Test PUT endpoint with existing sprint
  - [ ] Test PUT endpoint validation

- [x] Task 6: Verify AI Generation Endpoint (AC: 6)
  - [x] Check `app/api/ai/campaign-sprints/route.ts`
  - [x] Verify AI prompt already includes primary/secondary fields (no changes needed)
  - [x] Verify generated sprints include primary/secondary fields
  - [x] Verify validation passes with new SprintPlanSchema
  - [ ] Test AI generation endpoint with validated campaign structure

- [x] Task 7: Update Execution Plan Save (AC: 7)
  - [x] Modify `app/api/campaigns/execution/route.ts`
  - [x] Update save logic to handle primary/secondary fields
  - [x] Create junction table records with priority field
  - [ ] Test execution plan save with sprints containing primary/secondary fields

-- [x] Task 8: Update Frontend Forms (AC: 8)
  - [x] Modify `components/sprints/SprintForm.tsx`
  - [x] Modify `components/campaigns/SprintEditForm.tsx`
  - [x] Add separate sections for:
    - Primary segments (1-2 selection, required)
    - Secondary segments (0-2 selection, optional)
    - Primary topics (2-3 selection, required)
    - Secondary topics (2-4 selection, optional)
    - Primary channels (2-3 selection, required)
    - Secondary channels (optional)
  - [x] Add form validation for min/max constraints
  - [x] Add clear labels: "Fő szegmensek", "Kiegészítő szegmensek", "Fő témák", "Kiegészítő témák", "Fő csatornák", "Kiegészítő csatornák"
  - [ ] Test form validation
  - [ ] Test form submission

-- [x] Task 9: Update Frontend Display (AC: 9)
  - [x] Modify `components/sprints/SprintBoard.tsx`
  - [x] Modify `components/campaigns/SprintDetailPage.tsx`
  - [x] Display primary items: bold, primary color
  - [x] Display secondary items: normal weight, secondary color
  - [x] Add clear labels: "Fő szegmensek", "Kiegészítő szegmensek", stb.
  - [ ] Test visual distinction between primary and secondary items

- [ ] Task 10: Backward Compatibility (AC: 10)
  - [ ] Test loading existing sprints without priority in junction tables
  - [ ] Verify all existing relationships are treated as primary
  - [ ] Verify no errors occur when loading old sprints
  - [ ] Verify UI displays all relationships as primary (with option to edit)
  - [ ] Test migration path: old sprints can be edited to add secondary items

- [x] Task 11: Regenerate TypeScript Types
  - [x] Run `supabase gen types typescript` after migration
  - [x] Verify types include `priority` field in junction table types
  - [x] Update `lib/supabase/types.ts` if needed

- [ ] Task 12: Testing
  - [ ] Test schema validation: new fields accepted
  - [ ] Test schema validation: required fields enforced
  - [ ] Test schema validation: min/max constraints enforced
  - [ ] Test database migration: priority columns added
  - [ ] Test database migration: existing data migrated
  - [ ] Test API GET: primary/secondary fields returned correctly
  - [ ] Test API POST: primary/secondary fields saved with priority
  - [ ] Test API PUT: primary/secondary fields updated correctly
  - [ ] Test AI generation: new fields generated correctly
  - [ ] Test execution plan save: primary/secondary relationships saved
  - [ ] Test frontend form: primary/secondary fields editable
  - [ ] Test frontend display: primary/secondary items distinguished
  - [ ] Test backward compatibility: existing sprints load correctly

## Dev Notes

### Learnings from Previous Story

**From Story 5.9 (Status: done) - UI Refactor - Two-Phase Model**
- Sprint detail page pattern established: `/campaigns/[id]/sprints/[sprintId]`
- SprintList component displays enhanced sprint metadata including primary/secondary segments, topics, channels
- UI patterns for displaying priority indicators established
- Sprint cards show primary/secondary items with visual distinction

[Source: docs/sprint-artifacts/5-9-ui-refactor-two-phase-model.md]
[Source: components/campaigns/SprintList.tsx]
[Source: components/campaigns/SprintDetailPage.tsx]

**From Story 5.6 (Status: done) - Enhanced Sprint Schema & Database Migration**
- Enhanced sprint schema pattern established with nullable fields for backward compatibility
- Database migration pattern: add nullable columns, set defaults, add constraints
- SprintPlanSchema update pattern: add optional fields first, then make required in later story
- Junction table pattern: use separate tables for many-to-many relationships

[Source: docs/sprint-artifacts/5-6-enhanced-sprint-schema-database-migration.md]
[Source: lib/ai/schemas.ts]

**From Story 5.7 (Status: done) - Sprint-Only AI Generation Endpoint**
- AI prompt already includes primary/secondary fields (lines 47-52 in sprint-planner.ts)
- No prompt changes needed for this story
- AI generation endpoint validates against SprintPlanSchema

[Source: docs/sprint-artifacts/5-7-sprint-only-ai-generation-endpoint.md]
[Source: lib/ai/prompts/sprint-planner.ts]

### Architecture Patterns and Constraints

- **Schema Updates:** Update Zod schemas in `lib/ai/schemas.ts` - remove legacy fields, add primary/secondary fields with validation
- **Database Migrations:** Create idempotent migrations in `supabase/migrations/` - add priority column with defaults and constraints
- **API Pattern:** GET endpoints query junction tables and group by priority, POST/PUT endpoints create/update junction records with priority
- **Backward Compatibility:** Existing sprints without priority are treated as primary - no breaking changes
- **Frontend Forms:** Separate sections for primary/secondary items with clear Hungarian labels
- **Frontend Display:** Visual distinction between primary (bold, primary color) and secondary (normal, secondary color) items

### Project Structure Notes

**Modified Files:**
- `lib/ai/schemas.ts` - MODIFY SprintPlanSchema (remove legacy fields, add primary/secondary fields)
- `supabase/migrations/` - NEW migration file for priority columns
- `app/api/sprints/route.ts` - MODIFY GET/POST/PUT handlers
- `app/api/ai/campaign-sprints/route.ts` - VERIFY validation (no changes needed)
- `app/api/campaigns/execution/route.ts` - MODIFY save logic
- `components/sprints/SprintForm.tsx` - MODIFY form fields
- `components/campaigns/SprintEditForm.tsx` - MODIFY form fields
- `components/sprints/SprintBoard.tsx` - MODIFY display
- `components/campaigns/SprintDetailPage.tsx` - MODIFY display
- `lib/supabase/types.ts` - REGENERATE after migration

**Note:** This story extends Story 5.6 - the enhanced sprint schema already exists, we're adding primary/secondary distinction.

### References

- [Source: docs/epics.md#Story-5.10]
- [Source: docs/tech-spec.md#Epic-5-Execution-Planner]
- [Source: docs/sprint-artifacts/5-6-enhanced-sprint-schema-database-migration.md]
- [Source: docs/sprint-artifacts/5-9-ui-refactor-two-phase-model.md]
- [Source: lib/ai/schemas.ts]
- [Source: lib/ai/prompts/sprint-planner.ts]
- [Source: app/api/sprints/route.ts]
- [Source: components/campaigns/SprintEditForm.tsx]

### Testing Standards

- Test schema validation with valid/invalid data (min/max constraints)
- Test database migration on staging first (idempotent, backward compatible)
- Test API endpoints (GET/POST/PUT) with primary/secondary fields
- Test backward compatibility: existing sprints load correctly
- Test AI generation: new fields generated correctly
- Test frontend forms: validation and submission
- Test frontend display: visual distinction between primary/secondary
- Integration test: full workflow from AI generation to display

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/5-10-sprint-plan-primary-secondary-schema.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- 2025-11-25: Backend schema/migration/API changes plus frontend SprintForm/SprintBoard/SprintDetailPage now display és editálja a primary/secondary mezőket magyar címkékkel.

### File List

- `lib/ai/schemas.ts`
- `supabase/migrations/20251130_add_sprint_priority_columns.sql`
- `app/api/sprints/route.ts`
- `app/api/ai/campaign-sprints/route.ts`
- `app/api/campaigns/execution/route.ts`
- `app/api/ai/campaign-execution/route.ts`
- `lib/supabase/types.ts`
- `docs/sprint-status.yaml`
- `components/sprints/SprintForm.tsx`
- `components/sprints/SprintBoard.tsx`
- `components/campaigns/SprintDetailPage.tsx`
- `components/campaigns/SprintList.tsx`

## Change Log

- 2025-11-25: Story status moved to in-progress; backend schema/migration/API scopes implemented per AC1–AC7 and documented.
- 2025-11-25: Frontend SprintForm/SprintBoard/SprintDetailPage/SprintList frissítve primary/secondary UI-val és validációval; story dokumentáció frissítve.

