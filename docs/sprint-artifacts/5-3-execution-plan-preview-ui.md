# Story 5.3: Execution Plan Preview UI

Status: drafted

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

- [ ] Task 1: Add "Sprintek & Naptár" tab to campaign detail page (AC: 1)
  - [ ] Update `app/campaigns/[id]/page.tsx` to add new tab
  - [ ] Add "Sprintek és tartalomnaptár generálása AI-val" button
  - [ ] Check campaign validation status
  - [ ] Disable button if not ready for execution (with tooltip)
  - [ ] Test tab navigation and button states

- [ ] Task 2: Implement generate button and streaming (AC: 2)
  - [ ] Create handler for generate button click
  - [ ] Call `/api/ai/campaign-execution` endpoint
  - [ ] Set up Server-Sent Events (SSE) client connection
  - [ ] Display loading state (button disabled, spinner)
  - [ ] Parse and display progress events in real-time
  - [ ] Display final execution plan when complete
  - [ ] Test streaming with various campaign structures

- [ ] Task 3: Create SprintList component (AC: 3)
  - [ ] Create `components/campaigns/SprintList.tsx`
  - [ ] Display sprint name, dates, focus goal badge
  - [ ] Display focus description
  - [ ] Display focus segments count, topics count, channels badges
  - [ ] Order sprints by `order` field
  - [ ] Implement expandable sprint details
  - [ ] Create timeline view (horizontal or vertical)
  - [ ] Test with various sprint configurations

- [ ] Task 4: Create ContentCalendar component (AC: 4)
  - [ ] Create `components/campaigns/ContentCalendar.tsx`
  - [ ] Implement weekly view (default)
  - [ ] Implement monthly view
  - [ ] Implement sprint view (grouped by sprint)
  - [ ] Display slot details: date, channel, segment, topic, objective, content type, angle hint
  - [ ] Implement color-coding by sprint or objective
  - [ ] Make calendar scrollable and responsive
  - [ ] Test with various content slot configurations

- [ ] Task 5: Implement preview actions (AC: 5)
  - [ ] Add "Mentés" button (primary)
  - [ ] Add "Újragenerálás" button (secondary)
  - [ ] Add "Mégse" button (tertiary)
  - [ ] Implement save handler (calls Story 5.4 API)
  - [ ] Implement regenerate handler with confirmation dialog
  - [ ] Implement cancel handler (closes preview)
  - [ ] Test all action buttons

- [ ] Task 6: Implement error handling (AC: 6)
  - [ ] Handle network errors
  - [ ] Handle API errors
  - [ ] Handle validation errors
  - [ ] Display user-friendly error messages (Hungarian)
  - [ ] Add "Újrapróbálás" button on error
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

## Change Log

- 2025-11-27: Story drafted by Bob (Scrum Master) based on epic-5-execution-planner-stories.md

