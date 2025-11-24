# Story 5.3: Execution Plan Preview UI

Status: in-progress

## Story

As a **campaign manager**,
I want **to preview the generated execution plan before saving**,
so that **I can review sprints and content calendar before committing**.

## Acceptance Criteria

1. **AC 5.3.1: Preview UI megjelenik**
   - **Given** Campaign detail page exists
   - **When** I view campaign detail page
   - **Then** "Sprintek & Naptár" tab exists
   - **And** "Sprintek és tartalomnaptár generálása AI-val" button exists
   - **And** Button is disabled if campaign structure is not ready for execution (with tooltip)

2. **AC 5.3.2: Generate button működik**
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

3. **AC 5.3.3: Sprint lista megjelenik**
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

4. **AC 5.3.4: Content calendar megjelenik**
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

5. **AC 5.3.5: Preview actions működik**
   - **Given** Execution plan is generated and previewed
   - **When** I view preview
   - **Then** "Mentés" button exists (primary)
   - **And** "Újragenerálás" button exists (secondary)
   - **And** "Mégse" button exists (tertiary)
   - **And** Clicking "Mentés" saves plan to database (Story 5.4)
   - **And** Clicking "Újragenerálás" shows confirmation dialog, then regenerates
   - **And** Clicking "Mégse" closes preview without saving

6. **AC 5.3.6: Error handling működik**
   - **Given** AI generation fails (network error, API error, validation error)
   - **When** Error occurs
   - **Then** Error message is displayed to user (user-friendly, Hungarian)
   - **And** "Újrapróbálás" button is available
   - **And** User can retry generation

## Tasks / Subtasks

- [x] Task 1: Add "Sprintek & Naptár" tab to campaign detail page (AC: 1)
  - [x] Update `app/campaigns/[id]/page.tsx` to add new tab
  - [x] Add "Sprintek és tartalomnaptár generálása AI-val" button
  - [x] Check campaign validation status
  - [x] Show warning if not ready for execution (with tooltip)
  - [x] Test tab navigation and button states

- [x] Task 2: Implement generate button and streaming (AC: 2)
  - [x] Create handler for generate button click
  - [x] Call `/api/ai/campaign-execution` endpoint
  - [x] Set up Server-Sent Events (SSE) client connection
  - [x] Display loading state (button disabled, spinner)
  - [x] Parse and display progress events in real-time
  - [x] Display final execution plan when complete
  - [ ] Test streaming with various campaign structures

- [x] Task 3: Create SprintList component (AC: 3)
  - [x] Create `components/campaigns/SprintList.tsx`
  - [x] Display sprint name, dates, focus goal badge
  - [x] Display focus description
  - [x] Display focus segments count, topics count, channels badges
  - [x] Order sprints by `order` field
  - [x] Implement expandable sprint details
  - [x] Create timeline view (vertical list)
  - [ ] Test with various sprint configurations

- [x] Task 4: Create ContentCalendar component (AC: 4)
  - [x] Create `components/campaigns/ContentCalendar.tsx`
  - [x] Implement weekly view (default)
  - [x] Implement monthly view
  - [x] Implement sprint view (grouped by sprint)
  - [x] Display slot details: date, channel, segment, topic, objective, content type, angle hint
  - [x] Implement color-coding by objective
  - [x] Make calendar scrollable and responsive
  - [ ] Test with various content slot configurations

- [x] Task 5: Implement preview actions (AC: 5)
  - [x] Add "Mentés" button (primary)
  - [x] Add "Újragenerálás" button (secondary)
  - [x] Add "Mégse" button (tertiary)
  - [x] Implement save handler (placeholder for Story 5.4 API)
  - [x] Implement regenerate handler with confirmation dialog
  - [x] Implement cancel handler (closes preview)
  - [ ] Test all action buttons

- [x] Task 6: Implement error handling (AC: 6)
  - [x] Handle network errors
  - [x] Handle API errors
  - [x] Handle validation errors
  - [x] Display user-friendly error messages (Hungarian)
  - [x] Add "Újrapróbálás" button on error
  - [ ] Test error scenarios

- [ ] Task 7: Testing (AC: 1-6)
  - [ ] Write unit tests for SprintList component
  - [ ] Write unit tests for ContentCalendar component
  - [ ] Write integration tests for preview UI
  - [ ] Test responsive design (mobile, tablet, desktop)
  - [ ] Test error handling scenarios
  - [ ] Test streaming progress updates

## Dev Notes

### Architecture Patterns and Constraints

- **UI Components:** Follow existing component patterns from `components/campaigns/` (e.g., CampaignWizard, CampaignForm)
- **Streaming:** Use EventSource API or fetch with streaming for SSE connection (similar to existing AI streaming in Epic 2)
- **State Management:** Use React state for execution plan data and loading/error states
- **Responsive Design:** Follow Tailwind CSS responsive patterns from existing components
- **Badges/Icons:** Reuse existing badge and icon components from `components/ui/`
- **Tab Navigation:** Follow existing tab patterns from campaign detail page
- **Error Handling:** Display user-friendly error messages in Hungarian, consistent with existing error handling

### Project Structure Notes

- **Main Component:** `components/campaigns/ExecutionPlanner.tsx` (orchestrates preview UI)
- **Sprint List:** `components/campaigns/SprintList.tsx` (new component)
- **Content Calendar:** `components/campaigns/ContentCalendar.tsx` (new component)
- **Campaign Detail Page:** `app/campaigns/[id]/page.tsx` (add new tab)
- **Testing:** Follow existing test patterns from `__tests__/` directory

### References

- [Source: docs/epics.md#Epic-5] - Epic 5 goal, scope, and story breakdown
- [Source: docs/sprint-artifacts/epic-5-execution-planner-stories.md#Story-5.3] - Detailed acceptance criteria and technical notes
- [Source: docs/tech-spec.md#Epic-5-Technical-Approach] - UI component structure
- [Source: components/campaigns/CampaignWizard.tsx] - Existing component patterns for reference
- [Source: components/ui/badge.tsx] - Badge component for focus goals, objectives, channels
- [Source: app/api/ai/campaign-execution/route.ts] - AI endpoint from Story 5.2

### Learnings from Previous Story

**From Story 5-2-execution-planner-ai-endpoint (Status: drafted)**

- **Streaming Format:** Use SSE format with progress events and final complete event
- **Progress Messages:** Progress messages are in Hungarian and user-friendly
- **Validation:** Endpoint uses soft gate validation (warns but doesn't block)
- **Schema:** Execution plan follows ExecutionPlanSchema from Story 5.1

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- `app/campaigns/[id]/page.tsx` - Added tab navigation with "Sprintek & Naptár" tab
- `components/campaigns/ExecutionPlanner.tsx` - Main orchestrator component for execution plan preview
- `components/campaigns/SprintList.tsx` - Sprint list display component
- `components/campaigns/ContentCalendar.tsx` - Content calendar component with multiple view options

## Change Log

- 2025-11-27: Story drafted by Bob (Scrum Master) based on epic-5-execution-planner-stories.md

