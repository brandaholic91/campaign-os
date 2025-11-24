# Story 5.9: UI Refactor - Two-Phase Model

Status: drafted

## Story

As a **campaign manager**,
I want **a UI that separates sprint generation from content slot generation**,
so that **I have control over when to generate content and can review sprints first**.

## Acceptance Criteria

1. **AC 5.9.1: Two separate buttons in sprints section**
   - **Given** I am on the campaign execution planner page (`/campaigns/[id]`)
   - **When** I view the "Sprintek" (Sprints) tab/section
   - **Then** I see two separate buttons:
     - "Sprintstruktúra generálása AI-val" button (generates sprints only via Story 5.7 endpoint)
     - Per sprint: "Tartalomnaptár létrehozása ehhez a sprinthez" button (generates content slots for that sprint via Story 5.8 endpoint)
   - **And** "Sprintstruktúra generálása" button appears when no sprints exist
   - **And** Per-sprint "Tartalomnaptár" buttons appear only for sprints that don't have content slots yet (or allow regeneration)

2. **AC 5.9.2: Enhanced sprint timeline view**
   - **Given** Sprints are generated (Story 5.7)
   - **When** I view the sprint timeline/list
   - **Then** Sprint cards show enhanced sprint metadata:
     - Focus stage badge (awareness, engagement, consideration, conversion, mobilization)
     - Focus goals list (1-3 goal names)
     - Primary/secondary segments (segment names with priority indicators)
     - Primary/secondary topics (topic names with priority indicators)
     - Primary/secondary channels (channel names with priority indicators)
     - Suggested weekly post volume (total, video, stories counts)
     - Narrative emphasis (narrative names)
     - Key messages summary (4-6 bullet points)
     - Success criteria (list of qualitative indicators)
     - Risks and watchouts (list of risk points)
   - **And** Sprint cards are visually organized and readable
   - **And** Sprint date range is clearly displayed

3. **AC 5.9.3: Sprint detail page exists**
   - **Given** I am viewing sprints
   - **When** I click on a sprint card/name
   - **Then** Sprint detail page opens at `/campaigns/[id]/sprints/[sprintId]`
   - **And** Page shows full sprint information with all enhanced metadata:
     - All fields from AC 5.9.2 in detailed format
     - Sprint name, order, date range
     - Full focus description and context
   - **And** Page includes "Tartalomnaptár generálása" button (generates content slots for this sprint)
   - **And** Page shows content calendar view if slots already generated
   - **And** Page includes edit sprint functionality (if Story 5.5 complete)

4. **AC 5.9.4: Sprint generation workflow**
   - **Given** I click "Sprintstruktúra generálása AI-val"
   - **When** AI generates sprints
   - **Then** SSE progress updates are shown:
     - "Analyzing campaign structure..."
     - "Generating sprint 1 of X..."
     - "Sprint generation complete!"
   - **And** Generated sprints appear in timeline view
   - **And** Error handling shows clear error messages if generation fails
   - **And** Loading state is shown during generation

5. **AC 5.9.5: Per-sprint content slot generation workflow**
   - **Given** I click "Tartalomnaptár létrehozása ehhez a sprinthez" on a sprint
   - **When** AI generates content slots for that sprint
   - **Then** SSE progress updates are shown:
     - "Generating content slots for sprint [name]..."
     - "Content slot generation complete!"
   - **And** Generated content slots appear in calendar view (per sprint)
   - **And** Error handling shows clear error messages if generation fails
   - **And** Loading state is shown during generation
   - **And** Optional volume override dialog can be shown before generation

6. **AC 5.9.6: Content calendar view shows slots per sprint**
   - **Given** Content slots are generated for one or more sprints
   - **When** I view the content calendar
   - **Then** Slots are grouped/organized by sprint
   - **And** Sprint sections are clearly labeled with sprint name and date range
   - **And** Slots within each sprint are shown in calendar format (date-based)
   - **And** I can filter calendar by sprint
   - **And** I can view all sprints' slots together

7. **AC 5.9.7: Backward compatibility**
   - **Given** Existing `/api/ai/campaign-execution` endpoint exists (Story 5.2)
   - **When** I use the old workflow
   - **Then** Existing endpoint still works (deprecated but functional)
   - **And** Old UI can still use it if needed
   - **And** Deprecation warning is logged (but doesn't block functionality)

**Prerequisites:** Story 5.7 (Sprint-only generation), Story 5.8 (Sprint-specific content slots)

**Estimated Effort:** 5-6 points (3-4 days)

## Tasks / Subtasks

- [ ] Task 1: Refactor ExecutionPlanner component (AC: 1)
  - [ ] Modify `components/campaigns/ExecutionPlanner.tsx`
  - [ ] Replace single "Generate Execution Plan" button with two buttons:
    - "Sprintstruktúra generálása AI-val" (calls `/api/ai/campaign-sprints`)
    - Per-sprint: "Tartalomnaptár létrehozása" (calls `/api/ai/campaign-sprints/[sprintId]/content-slots`)
  - [ ] Show "Sprintstruktúra generálása" button when no sprints exist
  - [ ] Show per-sprint buttons only for sprints without content slots (or allow regeneration)
  - [ ] Implement SSE handling for sprint generation (Story 5.7)
  - [ ] Implement SSE handling for content slot generation (Story 5.8)
  - [ ] Update loading states and error handling

- [ ] Task 2: Enhance SprintList component (AC: 2)
  - [ ] Modify `components/campaigns/SprintList.tsx`
  - [ ] Add display for all enhanced sprint metadata:
    - Focus stage badge component
    - Focus goals list display
    - Primary/secondary segments display (with priority indicators)
    - Primary/secondary topics display (with priority indicators)
    - Primary/secondary channels display (with priority indicators)
    - Suggested weekly post volume display (total, video, stories)
    - Narrative emphasis display
    - Key messages summary display (formatted as bullet points)
    - Success criteria display
    - Risks and watchouts display
  - [ ] Make sprint cards clickable (navigate to sprint detail page)
  - [ ] Improve visual design and organization of sprint cards
  - [ ] Test with various sprint configurations

- [ ] Task 3: Create sprint detail page (AC: 3)
  - [ ] Create `app/campaigns/[id]/sprints/[sprintId]/page.tsx`
  - [ ] Create `components/campaigns/SprintDetailPage.tsx`
  - [ ] Load sprint data with all enhanced metadata from database
  - [ ] Display full sprint information in detailed format
  - [ ] Add "Tartalomnaptár generálása" button (calls Story 5.8 endpoint)
  - [ ] Implement content calendar view for slots (if slots exist)
  - [ ] Add edit sprint functionality (if Story 5.5 complete, reuse SprintEditForm)
  - [ ] Handle loading states and errors
  - [ ] Add navigation back to campaign page

- [ ] Task 4: Implement sprint generation workflow UI (AC: 4)
  - [ ] Add SSE event handling for `/api/ai/campaign-sprints` endpoint
  - [ ] Display progress updates in UI:
    - "Analyzing campaign structure..."
    - "Generating sprint 1 of X..."
    - "Sprint generation complete!"
  - [ ] Show loading state during generation
  - [ ] Display generated sprints in timeline view after completion
  - [ ] Handle errors and display clear error messages
  - [ ] Disable button during generation

- [ ] Task 5: Implement per-sprint content slot generation workflow UI (AC: 5)
  - [ ] Add SSE event handling for `/api/ai/campaign-sprints/[sprintId]/content-slots` endpoint
  - [ ] Display progress updates in UI:
    - "Generating content slots for sprint [name]..."
    - "Content slot generation complete!"
  - [ ] Show loading state during generation
  - [ ] Display generated slots in calendar view after completion
  - [ ] Handle errors and display clear error messages
  - [ ] Optional: Add volume override dialog before generation
  - [ ] Disable button during generation

- [ ] Task 6: Enhance content calendar view (AC: 6)
  - [ ] Modify `components/campaigns/ContentCalendar.tsx` or create new component
  - [ ] Group slots by sprint
  - [ ] Add sprint section headers (sprint name and date range)
  - [ ] Show slots in calendar format (date-based) within each sprint
  - [ ] Add filter by sprint functionality
  - [ ] Add "View all sprints" option to show all slots together
  - [ ] Test with multiple sprints and various slot configurations

- [ ] Task 7: Backward compatibility and cleanup (AC: 7)
  - [ ] Verify existing `/api/ai/campaign-execution` endpoint still works
  - [ ] Add deprecation comment to endpoint (but keep functional)
  - [ ] Optionally: Hide old workflow in UI (or show as "Legacy" option)
  - [ ] Test backward compatibility with existing execution plans
  - [ ] Document migration path from old to new workflow

- [ ] Task 8: Testing and polish
  - [ ] Test full workflow: generate sprints → view timeline → click sprint → generate slots
  - [ ] Test error scenarios (generation failures, network errors)
  - [ ] Test with various sprint configurations
  - [ ] Test with multiple sprints and content slots
  - [ ] Verify all enhanced metadata displays correctly
  - [ ] Test responsiveness and mobile view
  - [ ] Polish UI/UX and visual design

## Dev Notes

### Learnings from Previous Story

**From Story 5.8 (Status: drafted) - Sprint-Specific Content Slot Generation**
- Endpoint pattern established: `/api/ai/campaign-sprints/[sprintId]/content-slots`
- SSE streaming pattern: progress updates via Server-Sent Events
- Content slots are generated per sprint with sprint context

[Source: docs/sprint-artifacts/5-8-sprint-specific-content-slot-generation.md]

**From Story 5.7 (Status: drafted) - Sprint-Only AI Generation Endpoint**
- Endpoint pattern established: `/api/ai/campaign-sprints`
- Sprint generation returns enhanced sprint metadata
- SSE streaming pattern established

[Source: docs/sprint-artifacts/5-7-sprint-only-ai-generation-endpoint.md]

**From Story 5.3 (Status: in-progress) - Execution Plan Preview UI**
- Existing ExecutionPlanner component structure
- Existing ContentCalendar component structure
- SSE handling patterns established
- Preview UI patterns established

[Source: docs/sprint-artifacts/5-3-execution-plan-preview-ui.md]
[Source: components/campaigns/ExecutionPlanner.tsx]
[Source: components/campaigns/ContentCalendar.tsx]

### Architecture Patterns and Constraints

- **Component Location:** Campaign-related components in `components/campaigns/`
- **Page Location:** Campaign pages in `app/campaigns/[id]/`
- **SSE Handling:** Reuse SSE handling patterns from Story 5.3
- **State Management:** Use React state for loading, progress, errors
- **Navigation:** Next.js App Router for routing (`/campaigns/[id]/sprints/[sprintId]`)
- **Data Fetching:** Load sprint data from database, call AI endpoints for generation
- **UI Patterns:** Follow existing UI patterns from Story 5.3, 5.5

### Project Structure Notes

**New Files:**
- `app/campaigns/[id]/sprints/[sprintId]/page.tsx` - NEW sprint detail page
- `components/campaigns/SprintDetailPage.tsx` - NEW sprint detail component

**Modified Files:**
- `components/campaigns/ExecutionPlanner.tsx` - MODIFY to show two buttons and handle two workflows
- `components/campaigns/SprintList.tsx` - MODIFY to show enhanced sprint metadata
- `components/campaigns/ContentCalendar.tsx` - MODIFY to group slots by sprint

**Note:** Reuse existing components where possible (SprintEditForm from Story 5.5)

### References

- [Source: docs/epics.md#Story-5.9]
- [Source: docs/tech-spec.md#Phase-2-Two-Phase-Refactor]
- [Source: docs/sprint-artifacts/5-7-sprint-only-ai-generation-endpoint.md]
- [Source: docs/sprint-artifacts/5-8-sprint-specific-content-slot-generation.md]
- [Source: docs/sprint-artifacts/5-3-execution-plan-preview-ui.md]
- [Source: components/campaigns/ExecutionPlanner.tsx]
- [Source: components/campaigns/SprintList.tsx]
- [Source: components/campaigns/ContentCalendar.tsx]

### Testing Standards

- Test full workflow: generate sprints → view timeline → click sprint → generate slots
- Test error scenarios (generation failures, network errors, invalid data)
- Test with various sprint configurations (different focus_stages, segments, topics)
- Test with multiple sprints and content slots
- Verify all enhanced metadata displays correctly
- Test SSE streaming (progress updates and completion)
- Test loading states and error messages
- Test navigation and routing
- Test responsiveness and mobile view
- Integration test with backend endpoints

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

