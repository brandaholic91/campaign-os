# Story 5.4: Save Execution Plan API & Workflow

Status: drafted

## Story

As a **campaign manager**,
I want **to save the generated execution plan to the database**,
so that **I can use it for campaign execution and editing**.

## Acceptance Criteria

1. **AC 5.4.1: Save API működik**
   - **Given** Execution plan is generated and previewed
   - **When** I POST to `/api/campaigns/execution` with `{ campaignId, executionPlan }`
   - **Then** Endpoint validates execution plan against `ExecutionPlanSchema`
   - **And** All sprints are saved to `sprints` table
   - **And** All sprint-segment relationships are saved to `sprint_segments` junction table
   - **And** All sprint-topic relationships are saved to `sprint_topics` junction table
   - **And** All sprint-channel relationships are saved to `sprint_channels` junction table
   - **And** All content slots are saved to `content_slots` table
   - **And** Response returns success with saved IDs

2. **AC 5.4.2: Tranzakció atomicitás**
   - **Given** Execution plan has 3 sprints + 20 slots
   - **When** Save fails mid-way (e.g., slot validation error, constraint violation)
   - **Then** No partial data is saved (rollback)
   - **And** Error message is shown to user
   - **And** Original campaign state is preserved
   - **And** Transaction uses PostgreSQL function or batch insert with rollback logic

3. **AC 5.4.3: Validáció működik**
   - **Given** Execution plan has invalid data (e.g., slot date outside sprint range, duplicate slot_index)
   - **When** I try to save
   - **Then** Validation error is returned (400 status)
   - **And** Error message is clear and actionable (e.g., "Slot date 2025-03-15 is outside sprint date range 2025-03-01 to 2025-03-14")
   - **And** No data is saved

4. **AC 5.4.4: Duplicate save handling**
   - **Given** Execution plan is already saved
   - **When** I try to save again
   - **Then** System handles gracefully:
     - Option A: Update existing plan (delete old, insert new in transaction)
     - Option B: Return error "Execution plan already exists, use update endpoint"
   - **And** User is informed of the action taken

5. **AC 5.4.5: Date validation trigger működik (optional)**
   - **Given** DB trigger is created (from Story 5.1)
   - **When** I try to save content slot with date outside sprint range
   - **Then** DB trigger prevents insertion
   - **And** Error is returned to application layer

## Tasks / Subtasks

- [ ] Task 1: Create save API endpoint (AC: 1)
  - [ ] Create `app/api/campaigns/execution/route.ts`
  - [ ] Implement POST handler
  - [ ] Validate execution plan against ExecutionPlanSchema
  - [ ] Save sprints to `sprints` table
  - [ ] Save sprint-segment relationships to `sprint_segments` junction table
  - [ ] Save sprint-topic relationships to `sprint_topics` junction table
  - [ ] Save sprint-channel relationships to `sprint_channels` junction table
  - [ ] Save content slots to `content_slots` table
  - [ ] Return success response with saved IDs
  - [ ] Test endpoint with valid execution plan

- [ ] Task 2: Implement transaction atomicity (AC: 2)
  - [ ] Wrap all database operations in transaction
  - [ ] Use PostgreSQL transaction or Supabase transaction API
  - [ ] Implement rollback on any error
  - [ ] Test rollback with various failure scenarios
  - [ ] Verify no partial data is saved on failure

- [ ] Task 3: Implement validation (AC: 3)
  - [ ] Validate slot dates are within sprint date ranges
  - [ ] Validate no duplicate slot_index per (date, channel)
  - [ ] Validate all foreign key references exist
  - [ ] Return clear, actionable error messages
  - [ ] Return 400 status for validation errors
  - [ ] Test validation with various invalid data scenarios

- [ ] Task 4: Implement duplicate save handling (AC: 4)
  - [ ] Check if execution plan already exists for campaign
  - [ ] Implement update logic (delete old, insert new in transaction) OR
  - [ ] Return error message if update not supported
  - [ ] Inform user of action taken
  - [ ] Test duplicate save scenarios

- [ ] Task 5: Test DB trigger (AC: 5)
  - [ ] Verify DB trigger from Story 5.1 works
  - [ ] Test trigger prevents invalid date insertions
  - [ ] Test error handling when trigger fires
  - [ ] Document trigger behavior

- [ ] Task 6: Testing (AC: 1-5)
  - [ ] Write unit tests for validation logic
  - [ ] Write integration tests for save endpoint
  - [ ] Test transaction rollback scenarios
  - [ ] Test validation error scenarios
  - [ ] Test duplicate save scenarios
  - [ ] Test with various execution plan configurations

## Dev Notes

### Architecture Patterns and Constraints

- **Transaction Management:** Use Supabase transaction API or PostgreSQL transaction for atomicity
- **Validation:** Validate execution plan against ExecutionPlanSchema before saving
- **Error Handling:** Return clear, actionable error messages in Hungarian
- **Database Operations:** Use batch inserts for junction tables and content slots for performance
- **Foreign Key Constraints:** Rely on database foreign key constraints for referential integrity
- **CASCADE Deletes:** Use CASCADE delete for related records (sprint_segments, sprint_topics, sprint_channels, content_slots)

### Project Structure Notes

- **API Endpoint:** `app/api/campaigns/execution/route.ts` (new file)
- **Validation Helpers:** `lib/validation/execution-plan.ts` (new file, optional)
- **Database Operations:** Use Supabase client from `lib/supabase/client.ts`
- **Testing:** Follow existing test patterns from `__tests__/` directory

### References

- [Source: docs/epics.md#Epic-5] - Epic 5 goal, scope, and story breakdown
- [Source: docs/sprint-artifacts/epic-5-execution-planner-stories.md#Story-5.4] - Detailed acceptance criteria and technical notes
- [Source: docs/tech-spec.md#Epic-5-Technical-Approach] - Save workflow approach
- [Source: lib/ai/schemas.ts] - ExecutionPlanSchema from Story 5.1
- [Source: lib/supabase/client.ts] - Supabase client for database operations
- [Source: supabase/migrations/] - Database schema from Story 5.1

### Learnings from Previous Story

**From Story 5-3-execution-plan-preview-ui (Status: drafted)**

- **API Integration:** Preview UI calls this endpoint when "Mentés" button is clicked
- **Data Format:** Execution plan follows ExecutionPlanSchema format
- **Error Handling:** Display user-friendly error messages in Hungarian

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

