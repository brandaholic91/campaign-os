# Story 1.3: Message Matrix and Sprint/Task Board

**Status:** Draft

---

## User Story

As a **campaign manager**,
I want **to build message matrices and manage sprints with tasks**,
So that **I can plan my campaign messaging and track execution tasks**.

---

## Acceptance Criteria

**AC #1:** Message matrix UI displays segment × topic combinations
- **Given** I have a campaign with segments and topics
- **When** I view the message matrix page
- **Then** I see a table with segments as rows and topics as columns
- **And** empty cells show "Add message" CTA
- **And** cells with messages show the message headline

**AC #2:** Message creation and management
- **Given** I am on the message matrix page
- **When** I click on a segment × topic cell
- **Then** a message form modal opens
- **And** I can enter headline, body, proof_point, CTA, message_type
- **And** the message is saved to the database
- **And** I can edit and delete existing messages

**AC #3:** Sprint creation and management
- **Given** I am on the sprints page for a campaign
- **When** I create a new sprint with name, dates, and focus_goal
- **Then** the sprint is saved and appears in the sprint list
- **And** I can edit sprint details
- **And** validation prevents end_date < start_date
- **And** I can see sprint status (planned, active, closed)

**AC #4:** Task management and Kanban board
- **Given** I have a sprint
- **When** I add a task with title, description, category, channel, due_date
- **Then** the task is saved and appears in the task board
- **And** I can change task status (todo → in_progress → done)
- **And** tasks are displayed in Kanban columns
- **And** tasks are filtered by sprint_id

**AC #5:** Sprint board UI
- **Given** I am on the sprints page
- **When** I view the sprint board
- **Then** I see 3 columns: Todo, In Progress, Done
- **And** tasks are displayed as cards in appropriate columns
- **And** I can click on tasks to change status
- **And** empty columns show appropriate empty states

**AC #6:** API endpoints and data persistence
- **Given** the message, sprint, and task API routes are implemented
- **When** I perform CRUD operations
- **Then** data persists correctly in the database
- **And** foreign key relationships are maintained
- **And** errors are handled gracefully

---

## Implementation Details

### Tasks / Subtasks

- [ ] Create `/app/campaigns/[id]/messages/page.tsx` - Message matrix page (AC: #1)
- [ ] Create `MessageMatrix.tsx` component with table layout (AC: #1)
- [ ] Implement segment × topic grid rendering (AC: #1)
- [ ] Create message form modal component (AC: #2)
- [ ] Implement message creation/editing logic (AC: #2)
- [ ] Create `/app/api/messages/route.ts` - Messages API (AC: #2, #6)
- [ ] Create `/app/campaigns/[id]/sprints/page.tsx` - Sprint board page (AC: #3)
- [ ] Create `SprintBoard.tsx` Kanban component (AC: #5)
- [ ] Create `TaskCard.tsx` component (AC: #4, #5)
- [ ] Implement 3-column Kanban layout (Todo, In Progress, Done) (AC: #5)
- [ ] Implement task status change functionality (AC: #4)
- [ ] Create sprint creation form (AC: #3)
- [ ] Create `/app/api/sprints/route.ts` - Sprints API (AC: #3, #6)
- [ ] Create `/app/api/tasks/route.ts` - Tasks API (AC: #4, #6)
- [ ] Implement date validation for sprints (AC: #3)
- [ ] Add task creation form with category and channel selection (AC: #4)
- [ ] Implement empty states for message matrix and sprint board (AC: #1, #5)
- [ ] Add loading states to all components (AC: #1, #3, #4)
- [ ] Implement error handling in API routes (AC: #6)
- [ ] Test complete message matrix workflow (AC: #1, #2)
- [ ] Test complete sprint/task workflow (AC: #3, #4, #5)
- [ ] Verify responsive design on mobile/tablet/desktop (AC: #1, #5)

### Technical Summary

This story implements the message matrix UI and sprint/task board functionality. The message matrix displays as a table with segments as rows and topics as columns, allowing users to add messages to specific combinations. The sprint board is a Kanban-style interface with 3 columns for task status management. All operations use Server Components and Server Actions with proper error handling and validation.

**Key technical patterns:**
- Table-based UI for message matrix (segment × topic grid)
- Modal forms for message creation/editing
- Kanban board with 3 status columns
- Task status updates with optimistic UI
- Server Actions for form submissions
- Supabase queries with proper filtering (campaign_id, sprint_id)
- JSONB fields for focus_channels in sprints

### Project Structure Notes

- **Files to create:**
  - `app/campaigns/[id]/messages/page.tsx` - Message matrix page
  - `app/campaigns/[id]/sprints/page.tsx` - Sprint board page
  - `app/api/messages/route.ts` - Messages API
  - `app/api/sprints/route.ts` - Sprints API
  - `app/api/tasks/route.ts` - Tasks API
  - `components/messages/MessageMatrix.tsx` - Message matrix table
  - `components/sprints/SprintBoard.tsx` - Kanban board
  - `components/sprints/TaskCard.tsx` - Task card component
  - `components/sprints/SprintForm.tsx` - Sprint creation form
  - `components/sprints/TaskForm.tsx` - Task creation form

- **Expected test locations:** Manual testing (no automated tests in Sprint 1)

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Story 1.2 (campaigns, segments, topics must exist)

### Key Code References

**Tech-Spec references:**
- Section "Technical Details" - Message matrix algorithm, Kanban logic
- Section "Implementation Steps" - Phase 5-7 detailed steps
- Section "UX/UI Considerations" - Message matrix and sprint board UI patterns
- Section "Acceptance Criteria" - Message and sprint/task requirements

**Database schema:**
- `messages` table: segment_id, topic_id, message_type, headline, body, proof_point, CTA
- `sprints` table: focus_goal, focus_channels (JSONB), status
- `tasks` table: sprint_id, category, channel_id, status, due_date

**UI patterns:**
- Table layout for message matrix
- Kanban 3-column layout for sprint board
- Modal forms for message/task creation
- Status change with click handlers

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- Message matrix UI patterns and segment × topic combination logic
- Kanban board implementation details
- Sprint and task data model
- API endpoint patterns for messages, sprints, tasks
- Acceptance criteria for message matrix and sprint board

**Architecture:** Next.js 15 App Router, Server Components, Supabase Postgres

---

## Dev Agent Record

### Agent Model Used

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes

<!-- Will be populated during dev-story execution -->

### Files Modified

<!-- Will be populated during dev-story execution -->

### Test Results

<!-- Will be populated during dev-story execution -->

---

## Review Notes

<!-- Will be populated during code review -->

