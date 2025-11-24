# Epic 5: Execution Planner - Sprint & Content Calendar AI

**Status:** draft

**Status note:** Story drafted 2025-11-27 - Execution Planner epic story breakdown based on party mode discussion

**Epic Slug:** campaign-os-epic5-execution-planner

---

## Epic Goal

Build an AI-powered execution planner that generates sprint plans and content calendars from validated campaign structures. The planner creates 2-4 sprints based on campaign length and complexity, then generates content slots distributed evenly across sprints, respecting channel constraints and strategic priorities.

---

## Epic Scope

**In Scope:**
- Database schema: `sprints`, `sprint_segments`, `sprint_topics`, `sprint_channels`, `content_slots` tables
- AI endpoint: `POST /api/ai/campaign-execution` with streaming progress
- Execution plan preview UI (sprint list + content calendar view)
- Save execution plan API with transaction support
- Edit & management UI for sprints and content slots
- Zod schema validation for all execution plan data
- Constraint enforcement (max posts per day/channel, max total per week)

**Out of Scope (Epic 6+):**
- Content copy generation for slots (future epic)
- Advanced sprint optimization algorithms
- Multi-campaign execution coordination
- Execution analytics and reporting

---

## Epic Dependencies

**External:**
- Epic 4.0 complete (strategic metadata enhancement, validation checklist)
- Epic 3.0 complete (message strategies, segment-topic matrix)
- Epic 2 complete (LLM infrastructure, CopilotKit)

**Internal:**
- Epic 4.0 complete (all stories done, especially validation)
- Database schema from Epic 1-4
- Existing campaign structure generation (Story 2.2)

---

## Story Map - Epic 5

```
Database Foundation Layer
├── Story 5.1: Database Schema for Execution Planning
│   └── sprints, junction tables, content_slots, Zod schemas
│
AI Generation Layer
├── Story 5.2: Execution Planner AI Endpoint
│   └── POST /api/ai/campaign-execution, streaming, prompt engineering
│
User Experience Layer
├── Story 5.3: Execution Plan Preview UI
│   └── Sprint list, content calendar, progress feedback
│
Persistence Layer
├── Story 5.4: Save Execution Plan API & Workflow
│   └── POST /api/campaigns/execution, transaction, rollback
│
Management Layer
└── Story 5.5: Execution Plan Edit & Management UI
    └── Edit sprints/slots, delete, re-generate
```

---

## Stories - Epic 5

### Story 5.1: Database Schema for Execution Planning

**Status:** pending

**User Story:**

As a **developer**,
I want **database tables for sprints and content slots with proper relationships**,
So that **execution plans can be stored and managed in the database**.

---

**Acceptance Criteria:**

**AC 5.1.1: Sprints tábla létrehozása**
- **Given** Epic 4.0 complete (strategic metadata)
- **When** I run the migration
- **Then** `sprints` table exists with columns:
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

**AC 5.1.2: Sprint junction táblák létrehozása**
- **Given** Migration runs
- **When** I check the database
- **Then** `sprint_segments` junction table exists:
  - `sprint_id` (UUID, FK to sprints, ON DELETE CASCADE)
  - `segment_id` (UUID, FK to segments, ON DELETE CASCADE)
  - PRIMARY KEY (sprint_id, segment_id)
- **And** `sprint_topics` junction table exists:
  - `sprint_id` (UUID, FK to sprints, ON DELETE CASCADE)
  - `topic_id` (UUID, FK to topics, ON DELETE CASCADE)
  - PRIMARY KEY (sprint_id, topic_id)
- **And** `sprint_channels` junction table exists:
  - `sprint_id` (UUID, FK to sprints, ON DELETE CASCADE)
  - `channel_key` (TEXT, NOT NULL) - e.g., "facebook_organic"
  - PRIMARY KEY (sprint_id, channel_key)
- **And** All foreign keys have CASCADE delete

**AC 5.1.3: Content slots tábla létrehozása**
- **Given** Migration runs
- **When** I check the database
- **Then** `content_slots` table exists with columns:
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

**AC 5.1.4: Zod schemas definiálva**
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

**AC 5.1.5: TypeScript types generálva**
- **Given** Database migration is complete
- **When** I generate TypeScript types from Supabase schema
- **Then** `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts` is run
- **And** Generated types include: `sprints`, `sprint_segments`, `sprint_topics`, `sprint_channels`, `content_slots`
- **And** Types are exported and available for use in components and API routes

**Prerequisites:** Epic 4.0 complete (strategic metadata)

**Estimated Effort:** 5 points (2-3 days)

---

### Story 5.2: Execution Planner AI Endpoint

**Status:** pending

**User Story:**

As a **campaign manager**,
I want **an AI endpoint that generates sprint plans and content calendars from validated campaign structures**,
So that **I can quickly create execution plans without manual planning**.

---

**Acceptance Criteria:**

**AC 5.2.1: AI endpoint válaszol**
- **Given** A validated campaign structure exists
- **When** I POST to `/api/ai/campaign-execution` with `{ campaignId }`
- **Then** Endpoint returns 200 status
- **And** Response is a streaming response (Content-Type: text/event-stream)
- **And** Response uses Server-Sent Events (SSE) format

**AC 5.2.2: Input validáció működik (soft gate)**
- **Given** Campaign structure exists (may or may not be fully validated)
- **When** I POST to `/api/ai/campaign-execution`
- **Then** Endpoint checks validation status (soft gate - doesn't block)
- **And** If not ready for execution, warning is returned but execution proceeds
- **And** Warning includes validation issues list
- **And** If ready for execution, execution proceeds normally

**AC 5.2.3: Sprint generálás működik**
- **Given** Campaign length is 25 days, 4 segments, 6 topics, 3 channels
- **When** AI generates execution plan
- **Then** 2-4 sprints are generated (based on campaign complexity)
- **And** Sprint count follows guidelines:
  - ≤ 10 days → 1 sprint
  - 11-30 days → 2-3 sprints
  - 31-60 days → 3-4 sprints
  - 61+ days → 4-6 sprints
- **And** Each sprint has all required fields:
  - `name` (e.g., "Kickoff – Ismertségnövelés")
  - `order` (1, 2, 3...)
  - `start_date`, `end_date` (within campaign dates)
  - `focus_goal` (awareness, engagement, consideration, conversion, mobilization)
  - `focus_description` (2-3 mondatos leírás)
  - `focus_segments` (array of segment IDs)
  - `focus_topics` (array of topic IDs)
  - `focus_channels` (array of channel keys)
  - `success_indicators` (optional array)
- **And** Sprint dates don't overlap
- **And** Sprint dates cover entire campaign period (no gaps)
- **And** Sprint focus goals follow guidelines:
  - 1 sprint → awareness OR conversion (based on goal_type)
  - 2 sprints → awareness + conversion/engagement
  - 3+ sprints → awareness + engagement/consideration + conversion

**AC 5.2.4: Content slot generálás működik**
- **Given** Sprints are generated
- **When** AI generates content calendar
- **Then** Content slots are generated for each sprint
- **And** Slot count follows guidelines:
  - Per channel, per day: max 1-2 posts (except Stories: 5)
  - Weekly total: 5-10 (low budget), 10-20 (medium), 20-30 (high)
- **And** Each slot has all required fields:
  - `date` (within sprint date range)
  - `channel` (from campaign channels)
  - `slot_index` (1, 2, 3... per day per channel)
  - `primary_segment_id` (optional, from focus_segments)
  - `primary_topic_id` (optional, from focus_topics)
  - `objective` (reach, engagement, traffic, lead, conversion, mobilization)
  - `content_type` (short_video, story, static_image, carousel, live, long_post, email)
  - `angle_hint` (1-2 mondatos kreatív irány)
  - `notes` (optional produkciós kommentek)
- **And** Slots are distributed evenly across sprints
- **And** Slot dates are within sprint date ranges
- **And** Max posts per day per channel constraint is respected (max 2, except Stories: 5)
- **And** Max total posts per week constraint is respected
- **And** Priority-based slot generation:
  - High-importance + core_message segment×topic pairs → always get slots
  - Medium-importance + support pairs → slots if budget allows
  - Experimental pairs → optional slots

**AC 5.2.5: Streaming progress működik**
- **Given** AI endpoint is called
- **When** Response streams
- **Then** Progress events are received in SSE format:
  - `{ type: 'progress', step: 'sprint_planning', message: 'Sprint tervezés...' }`
  - `{ type: 'progress', step: 'sprint_planning', message: '3 sprint generálva', sprints: [...] }`
  - `{ type: 'progress', step: 'content_calendar', message: 'Tartalomnaptár generálása...' }`
  - `{ type: 'progress', step: 'content_calendar', message: '25 slot generálva', slots: 25 }`
  - `{ type: 'complete', executionPlan: { sprints, content_calendar } }`
- **And** Progress messages are user-friendly (Hungarian)
- **And** Final `complete` event contains full execution plan

**AC 5.2.6: Zod validáció működik**
- **Given** AI generates execution plan
- **When** Response is validated
- **Then** `ExecutionPlanSchema.parse()` succeeds
- **And** Invalid plans are rejected with clear error messages
- **And** Validation errors include field-level details

**AC 5.2.7: Constraint enforcement működik (post-processing)**
- **Given** AI generates execution plan
- **When** Plan violates constraints (e.g., too many slots per day)
- **Then** Post-processing function enforces constraints:
  - Removes slots by priority (experimental → medium → high)
  - Attempts to move slots to other days if possible
  - Returns warnings about removed/moved slots
- **And** Final plan respects all constraints

**Prerequisites:** Story 5.1 (DB schema), Epic 2 complete (LLM infrastructure)

**Estimated Effort:** 8 points (4-5 days, complex prompt engineering)

---

### Story 5.3: Execution Plan Preview UI

**Status:** pending

**User Story:**

As a **campaign manager**,
I want **to preview the generated execution plan before saving**,
So that **I can review sprints and content calendar before committing**.

---

**Acceptance Criteria:**

**AC 5.3.1: Preview UI megjelenik**
- **Given** Campaign detail page exists
- **When** I view campaign detail page
- **Then** "Sprintek & Naptár" tab exists
- **And** "Sprintek és tartalomnaptár generálása AI-val" button exists
- **And** Button is disabled if campaign structure is not ready for execution (with tooltip)

**AC 5.3.2: Generate button működik**
- **Given** Campaign structure is ready (or user proceeds with warning)
- **When** I click "Sprintek és tartalomnaptár generálása AI-val"
- **Then** Loading state shows (button disabled, spinner)
- **And** Progress bar/messages appear:
  - "Sprint tervezés..."
  - "3 sprint generálva"
  - "Tartalomnaptár generálása..."
  - "25 slot generálva"
- **And** Progress updates in real-time (streaming)
- **And** Final result is displayed when complete

**AC 5.3.3: Sprint lista megjelenik**
- **Given** Execution plan is generated
- **When** I view preview
- **Then** Sprint list shows all sprints with:
  - Name (e.g., "Kickoff – Ismertségnövelés")
  - Dates (start_date - end_date)
  - Focus goal badge (awareness, engagement, consideration, conversion, mobilization)
  - Focus description (2-3 mondatos leírás)
  - Focus segments count (e.g., "3 szegmens")
  - Focus topics count (e.g., "5 téma")
  - Focus channels badges (e.g., "Facebook", "Instagram")
- **And** Sprints are ordered by `order` field (1, 2, 3...)
- **And** Sprint timeline view is readable (horizontal timeline or vertical list)
- **And** Each sprint is expandable to show details

**AC 5.3.4: Content calendar megjelenik**
- **Given** Execution plan is generated
- **When** I view preview
- **Then** Content calendar shows slots in view options:
  - Weekly view (default)
  - Monthly view
  - Sprint view (grouped by sprint)
- **And** Each slot shows:
  - Date (formatted, e.g., "2025-03-03")
  - Channel badge (e.g., "Facebook", "Instagram")
  - Segment name (if primary_segment_id exists)
  - Topic name (if primary_topic_id exists)
  - Objective badge (reach, engagement, traffic, lead, conversion, mobilization)
  - Content type icon/badge (short_video, story, static_image, carousel, live, long_post, email)
  - Angle hint (truncated, full on hover)
- **And** Calendar is scrollable and responsive (mobile, tablet, desktop)
- **And** Slots are color-coded by sprint or objective

**AC 5.3.5: Preview actions működik**
- **Given** Execution plan is generated and previewed
- **When** I view preview
- **Then** "Mentés" button exists (primary)
- **And** "Újragenerálás" button exists (secondary)
- **And** "Mégse" button exists (tertiary)
- **And** Clicking "Mentés" saves plan to database (Story 5.4)
- **And** Clicking "Újragenerálás" shows confirmation dialog, then regenerates
- **And** Clicking "Mégse" closes preview without saving

**AC 5.3.6: Error handling működik**
- **Given** AI generation fails (network error, API error, validation error)
- **When** Error occurs
- **Then** Error message is displayed to user (user-friendly, Hungarian)
- **And** "Újrapróbálás" button is available
- **And** User can retry generation

**Prerequisites:** Story 5.2 (AI endpoint)

**Estimated Effort:** 5 points (3-4 days)

---

### Story 5.4: Save Execution Plan API & Workflow

**Status:** pending

**User Story:**

As a **campaign manager**,
I want **to save the generated execution plan to the database**,
So that **I can use it for campaign execution and editing**.

---

**Acceptance Criteria:**

**AC 5.4.1: Save API működik**
- **Given** Execution plan is generated and previewed
- **When** I POST to `/api/campaigns/execution` with `{ campaignId, executionPlan }`
- **Then** Endpoint validates execution plan against `ExecutionPlanSchema`
- **And** All sprints are saved to `sprints` table
- **And** All sprint-segment relationships are saved to `sprint_segments` junction table
- **And** All sprint-topic relationships are saved to `sprint_topics` junction table
- **And** All sprint-channel relationships are saved to `sprint_channels` junction table
- **And** All content slots are saved to `content_slots` table
- **And** Response returns success with saved IDs

**AC 5.4.2: Tranzakció atomicitás**
- **Given** Execution plan has 3 sprints + 20 slots
- **When** Save fails mid-way (e.g., slot validation error, constraint violation)
- **Then** No partial data is saved (rollback)
- **And** Error message is shown to user
- **And** Original campaign state is preserved
- **And** Transaction uses PostgreSQL function or batch insert with rollback logic

**AC 5.4.3: Validáció működik**
- **Given** Execution plan has invalid data (e.g., slot date outside sprint range, duplicate slot_index)
- **When** I try to save
- **Then** Validation error is returned (400 status)
- **And** Error message is clear and actionable (e.g., "Slot date 2025-03-15 is outside sprint date range 2025-03-01 to 2025-03-14")
- **And** No data is saved

**AC 5.4.4: Duplicate save handling**
- **Given** Execution plan is already saved
- **When** I try to save again
- **Then** System handles gracefully:
  - Option A: Update existing plan (delete old, insert new in transaction)
  - Option B: Return error "Execution plan already exists, use update endpoint"
- **And** User is informed of the action taken

**AC 5.4.5: Date validation trigger működik (optional)**
- **Given** DB trigger is created (from Story 5.1)
- **When** I try to save content slot with date outside sprint range
- **Then** DB trigger prevents insertion
- **And** Error is returned to application layer

**Prerequisites:** Story 5.1 (DB schema), Story 5.2 (AI endpoint)

**Estimated Effort:** 5 points (3-4 days)

---

### Story 5.5: Execution Plan Edit & Management UI

**Status:** pending

**User Story:**

As a **campaign manager**,
I want **to edit sprints and content slots after saving**,
So that **I can fine-tune the execution plan to match reality**.

---

**Acceptance Criteria:**

**AC 5.5.1: Sprint szerkesztés működik**
- **Given** Execution plan is saved
- **When** I click "Szerkesztés" on a sprint
- **Then** Sprint edit form opens with fields:
  - Name (text input)
  - Start date, end date (date pickers)
  - Focus goal (select dropdown)
  - Focus description (textarea)
  - Focus segments (multi-select)
  - Focus topics (multi-select)
  - Focus channels (multi-select)
  - Success indicators (array input)
- **And** I can save changes
- **And** Changes are saved to database via PUT `/api/sprints/[id]`
- **And** Related content slots are validated (dates within new sprint range)
- **And** If slot dates are outside new range, warning is shown and slots are moved/deleted

**AC 5.5.2: Content slot szerkesztés működik**
- **Given** Execution plan is saved
- **When** I click "Szerkesztés" on a content slot
- **Then** Slot edit form opens with fields:
  - Date (date picker)
  - Channel (select dropdown)
  - Slot index (number input)
  - Primary segment (select dropdown, optional)
  - Primary topic (select dropdown, optional)
  - Objective (select dropdown)
  - Content type (select dropdown)
  - Angle hint (textarea, optional)
  - Notes (textarea, optional)
  - Status (select dropdown: planned, draft, published)
- **And** I can save changes
- **And** Changes are saved to database via PUT `/api/content-slots/[id]`
- **And** Validation prevents invalid changes (e.g., date outside sprint range, duplicate slot_index)

**AC 5.5.3: Törlés működik**
- **Given** Execution plan is saved
- **When** I click "Törlés" on a sprint or content slot
- **Then** Confirmation dialog appears: "Biztosan törölni szeretnéd ezt a [sprint/slot]-ot?"
- **And** If confirmed, item is removed from database
- **And** Related relationships are cleaned up (CASCADE delete)
  - Sprint deletion → related slots deleted
  - Slot deletion → no cascade needed (no children)
- **And** If cancelled, nothing happens

**AC 5.5.4: Re-generate működik**
- **Given** Execution plan is saved
- **When** I click "Újragenerálás" button
- **Then** Confirmation dialog appears: "Biztosan újragenerálod? A jelenlegi terv törlődik."
- **And** If confirmed:
  - Old plan is deleted (sprints + slots)
  - New plan is generated (Story 5.2)
  - Preview is shown (Story 5.3)
- **And** If cancelled, nothing happens

**AC 5.5.5: Bulk operations működik (optional)**
- **Given** Execution plan is saved
- **When** I select multiple slots
- **Then** Bulk actions are available:
  - Bulk delete (with confirmation)
  - Bulk status change (planned → draft → published)
  - Bulk channel change
- **And** Bulk operations are applied to all selected slots

**AC 5.5.6: Validation feedback működik**
- **Given** I edit sprint or slot
- **When** I make invalid change (e.g., date outside range)
- **Then** Inline validation error is shown
- **And** Save button is disabled until valid
- **And** Error message is clear and actionable

**Prerequisites:** Story 5.3 (Preview UI), Story 5.4 (Save API)

**Estimated Effort:** 8 points (4-5 days)

---

## Implementation Timeline - Epic 5

**Total Story Points:** 31 points

**Estimated Timeline:** 18-22 days (approximately 4-5 weeks with buffer)

**Story Sequence:**
1. Story 5.1: Database Schema (must complete first - foundation, critical path)
2. Story 5.2: AI Endpoint (depends on 5.1, critical path)
3. Story 5.3: Preview UI (depends on 5.2, can start in parallel with 5.4)
4. Story 5.4: Save API (depends on 5.1 and 5.2, can start in parallel with 5.3)
5. Story 5.5: Edit UI (depends on 5.3 and 5.4)

**Notes:**
- Story 5.1 is critical path - database foundation required for all other stories
- Story 5.2 is critical path - AI endpoint required for preview and save
- Stories 5.3 and 5.4 can work in parallel after 5.2 (UI and API)
- Story 5.5 requires both 5.3 and 5.4 (edit functionality needs both UI and API)
- AI prompt engineering requires careful iteration (Story 5.2)
- Constraint enforcement is critical for realistic execution plans
- Transaction support ensures data integrity (Story 5.4)

---

## Technical Decisions Summary

Based on party mode discussion:

1. **Database Schema:**
   - Junction tables for sprint-segment/topic/channel relationships (better query performance, referential integrity)
   - Nullable primary_segment_id and primary_topic_id in content_slots (simple start, can extend later)
   - DB trigger for date validation (optional but recommended)

2. **AI Endpoint:**
   - Streaming response (SSE) with progress updates
   - Soft gate validation (warns but doesn't block)
   - Priority-based slot generation (high → medium → experimental)
   - Post-processing constraint enforcement

3. **Sprint Planning:**
   - Flexible logic with guidelines (not rigid rules)
   - Sprint count based on campaign length + complexity
   - Sprint focus goals based on campaign goal_type + length

4. **Content Slot Planning:**
   - Dynamic calculation with constraints
   - Per channel, per day limits (max 2, except Stories: 5)
   - Weekly total limits (budget-based)
   - Priority-based generation (high-importance pairs always get slots)

5. **Save Workflow:**
   - Single transaction (PostgreSQL function or batch insert with rollback)
   - Atomicity ensures no partial saves
   - Validation before save

---

**Story file created:** 2025-11-27
**Created by:** Bob (Scrum Master) based on party mode discussion

