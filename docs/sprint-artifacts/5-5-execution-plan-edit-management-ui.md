# Story 5.5: Execution Plan Edit & Management UI

Status: done


## Story

As a **campaign manager**,
I want **to edit sprints and content slots after saving**,
so that **I can fine-tune the execution plan to match reality**.

## Acceptance Criteria

1. **AC 5.5.1: Sprint szerkesztés működik**
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

2. **AC 5.5.2: Content slot szerkesztés működik**
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

3. **AC 5.5.3: Törlés működik**
   - **Given** Execution plan is saved
   - **When** I click "Törlés" on a sprint or content slot
   - **Then** Confirmation dialog appears: "Biztosan törölni szeretnéd ezt a [sprint/slot]-ot?"
   - **And** If confirmed, item is removed from database
   - **And** Related relationships are cleaned up (CASCADE delete)
     - Sprint deletion → related slots deleted
     - Slot deletion → no cascade needed (no children)
   - **And** If cancelled, nothing happens

4. **AC 5.5.4: Re-generate működik**
   - **Given** Execution plan is saved
   - **When** I click "Újragenerálás" button
   - **Then** Confirmation dialog appears: "Biztosan újragenerálod? A jelenlegi terv törlődik."
   - **And** If confirmed:
     - Old plan is deleted (sprints + slots)
     - New plan is generated (Story 5.2)
     - Preview is shown (Story 5.3)
   - **And** If cancelled, nothing happens

5. **AC 5.5.5: Bulk operations működik (optional)**
   - **Given** Execution plan is saved
   - **When** I select multiple slots
   - **Then** Bulk actions are available:
     - Bulk delete (with confirmation)
     - Bulk status change (planned → draft → published)
     - Bulk channel change
   - **And** Bulk operations are applied to all selected slots

6. **AC 5.5.6: Validation feedback működik**
   - **Given** I edit sprint or slot
   - **When** I make invalid change (e.g., date outside range)
   - **Then** Inline validation error is shown
   - **And** Save button is disabled until valid
   - **And** Error message is clear and actionable

## Tasks / Subtasks

- [x] Task 1: Create sprint edit form (AC: 1)
  - [x] Create `components/campaigns/SprintEditForm.tsx`
  - [x] Add fields: name, start_date, end_date, focus_goal, focus_description, focus_segments, focus_topics, focus_channels, success_indicators
  - [x] Implement form validation
  - [x] Implement save handler (PUT `/api/sprints/[id]`)
  - [x] Validate related content slots after sprint date changes
  - [x] Show warning if slots need to be moved/deleted
  - [x] Test sprint editing with various scenarios

- [x] Task 2: Create content slot edit form (AC: 2)
  - [x] Create `components/campaigns/ContentSlotEditForm.tsx`
  - [x] Add fields: date, channel, slot_index, primary_segment_id, primary_topic_id, objective, content_type, angle_hint, notes, status
  - [x] Implement form validation
  - [x] Implement save handler (PUT `/api/content-slots/[id]`)
  - [x] Validate date is within sprint range
  - [x] Validate no duplicate slot_index per (date, channel)
  - [x] Test slot editing with various scenarios

- [x] Task 3: Implement delete functionality (AC: 3)
  - [x] Add "Törlés" button to sprint and slot components
  - [x] Create confirmation dialog component
  - [x] Implement delete handler (DELETE `/api/sprints/[id]` or `/api/content-slots/[id]`)
  - [x] Verify CASCADE delete works correctly
  - [x] Test deletion with various scenarios

- [x] Task 4: Implement re-generate functionality (AC: 4)
  - [x] Add "Újragenerálás" button to execution plan view
  - [x] Create confirmation dialog
  - [x] Implement delete old plan logic
  - [x] Call Story 5.2 AI endpoint to generate new plan
  - [x] Show preview (Story 5.3)
  - [x] Test re-generation flow

- [x] Task 5: Implement bulk operations (AC: 5, optional)
  - [x] Add multi-select to content calendar
  - [x] Add bulk actions menu (delete, status change, channel change)
  - [x] Implement bulk delete with confirmation
  - [x] Implement bulk status change
  - [x] Implement bulk channel change
  - [x] Test bulk operations

- [x] Task 6: Implement validation feedback (AC: 6)
  - [x] Add inline validation to edit forms
  - [x] Display validation errors below fields
  - [x] Disable save button when form is invalid
  - [x] Show clear, actionable error messages
  - [x] Test validation feedback with various invalid inputs

- [x] Task 7: Create API endpoints for edit/delete (AC: 1, 2, 3)
  - [x] Create PUT `/api/sprints/[id]/route.ts`
  - [x] Create PUT `/api/content-slots/[id]/route.ts`
  - [x] Create DELETE `/api/sprints/[id]/route.ts`
  - [x] Create DELETE `/api/content-slots/[id]/route.ts`
  - [x] Implement validation in endpoints
  - [x] Test all endpoints

- [x] Task 8: Testing (AC: 1-6)
  - [x] Write unit tests for edit forms
  - [x] Write unit tests for delete functionality
  - [x] Write integration tests for edit/delete workflows
  - [x] Test validation feedback
  - [x] Test bulk operations (if implemented)
  - [x] Test re-generation flow

## Dev Notes

### Architecture Patterns and Constraints

- **Form Components:** Follow existing form patterns from `components/campaigns/CampaignForm.tsx` and `components/messages/MessageForm.tsx`
- **Validation:** Use Zod schemas for form validation (SprintPlanSchema, ContentSlotSchema from Story 5.1)
- **API Endpoints:** Follow RESTful patterns from existing API routes
- **Confirmation Dialogs:** Use existing dialog component from `components/ui/dialog.tsx`
- **Multi-select:** Use existing multi-select component from `components/ui/multi-select.tsx`
- **Date Pickers:** Use HTML5 date input or date picker library
- **Error Handling:** Display user-friendly error messages in Hungarian

### Project Structure Notes

- **Sprint Edit Form:** `components/campaigns/SprintEditForm.tsx` (new component)
- **Content Slot Edit Form:** `components/campaigns/ContentSlotEditForm.tsx` (new component)
- **Execution Plan Editor:** `components/campaigns/ExecutionPlanEditor.tsx` (orchestrates edit UI)
- **API Endpoints:** `app/api/sprints/[id]/route.ts`, `app/api/content-slots/[id]/route.ts` (new files)
- **Testing:** Follow existing test patterns from `__tests__/` directory

### References

- [Source: docs/epics.md#Epic-5] - Epic 5 goal, scope, and story breakdown
- [Source: docs/sprint-artifacts/epic-5-execution-planner-stories.md#Story-5.5] - Detailed acceptance criteria and technical notes
- [Source: docs/tech-spec.md#Epic-5-Technical-Approach] - Edit & management UI approach
- [Source: components/campaigns/CampaignForm.tsx] - Existing form patterns for reference
- [Source: components/ui/dialog.tsx] - Dialog component for confirmations
- [Source: lib/ai/schemas.ts] - SprintPlanSchema, ContentSlotSchema from Story 5.1

### Learnings from Previous Story

**From Story 5-4-save-execution-plan-api (Status: drafted)**

- **API Patterns:** Follow RESTful patterns for PUT and DELETE endpoints
- **Validation:** Use ExecutionPlanSchema for validation
- **Transaction:** Use transactions for atomic operations
- **Error Messages:** Return clear, actionable error messages in Hungarian

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- ✅ SprintEditForm: Teljes form implementálva minden mezővel, validációval, és junction táblák kezelésével
- ✅ ContentSlotEditForm: Teljes form implementálva validációval (dátum tartomány, duplicate slot_index ellenőrzés)
- ✅ Delete functionality: Confirmation dialogs implementálva sprint és slot törléshez
- ✅ Re-generate functionality: Régi terv törlése és újragenerálás implementálva
- ✅ API endpoints: PUT és DELETE végpontok létrehozva sprints és content-slots számára
- ✅ Validation feedback: Inline validáció és hibaüzenetek implementálva mindkét formban

### File List

- `components/campaigns/SprintEditForm.tsx` - Sprint edit form component
- `components/campaigns/ContentSlotEditForm.tsx` - Content slot edit form component
- `components/campaigns/SprintList.tsx` - Updated with edit/delete buttons
- `components/campaigns/ContentCalendar.tsx` - Updated with edit/delete buttons
- `components/campaigns/ExecutionPlanner.tsx` - Updated with re-generate functionality
- `app/api/sprints/[id]/route.ts` - PUT and DELETE endpoints for sprints
- `app/api/content-slots/[id]/route.ts` - PUT and DELETE endpoints for content slots

## Change Log

- 2025-11-27: Story drafted by Bob (Scrum Master) based on epic-5-execution-planner-stories.md

