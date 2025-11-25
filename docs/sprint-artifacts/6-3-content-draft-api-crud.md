# Story 6.3: Content Draft API CRUD

Status: drafted

## Story

As a **campaign manager**,
I want **CRUD API endpoints for content drafts**,
so that **I can create, read, update, and delete draft content for slots**.

## Acceptance Criteria

1. **Given** I have a content slot with id `slotId`
   **When** I GET `/api/content-slots/[slotId]/drafts`
   **Then** I receive list of all drafts for that slot: `{ drafts: ContentDraft[] }`
   **And** Drafts are ordered by created_at (newest first)
   **And** Response includes all draft fields (hook, body, cta_copy, visual_idea, status, variant_name, etc.)

2. **And** When I POST `/api/content-slots/[slotId]/drafts` with draft data
   **Then** Draft is created and saved to database
   **And** Response returns created draft: `{ draft: ContentDraft }`
   **And** Validation ensures required fields (hook, body, cta_copy, visual_idea)
   **And** Validation ensures hook min 10 chars, body min 50 chars, cta_copy min 5 chars, visual_idea min 20 chars
   **And** Default values: `status: 'draft'`, `created_by: 'human'` (if not specified)

3. **And** When I GET `/api/content-drafts/[draftId]`
   **Then** I receive draft details: `{ draft: ContentDraft }`
   **And** Response includes slot relationship (slot_id)
   **And** 404 error if draft not found

4. **And** When I PUT `/api/content-drafts/[draftId]` with updated data
   **Then** Draft is updated in database
   **And** Response returns updated draft: `{ draft: ContentDraft }`
   **And** Status can be updated (draft → approved → published)
   **And** Validation ensures required fields still present
   **And** 404 error if draft not found

5. **And** When I DELETE `/api/content-drafts/[draftId]`
   **Then** Draft is deleted from database
   **And** Response returns success confirmation: `{ success: true }`
   **And** 404 error if draft not found

6. **And** All endpoints validate against ContentDraftSchema from Story 6.1
   **And** Error handling returns appropriate HTTP status codes (400, 404, 500)
   **And** Foreign key constraints enforced (slot_id must exist)
   **And** CASCADE delete works (if slot deleted, drafts deleted)

## Tasks / Subtasks

- [ ] Task 1: Create GET drafts by slot endpoint (AC: 1)
  - [ ] Create `app/api/content-slots/[slotId]/drafts/route.ts`
  - [ ] Implement GET handler
  - [ ] Query content_drafts table filtered by slot_id
  - [ ] Order by created_at DESC (newest first)
  - [ ] Return `{ drafts: ContentDraft[] }`
  - [ ] Handle 404 if slot not found
  - [ ] Add error handling

- [ ] Task 2: Create POST draft endpoint (AC: 2)
  - [ ] Add POST handler to `app/api/content-slots/[slotId]/drafts/route.ts`
  - [ ] Validate request body against ContentDraftSchema
  - [ ] Validate required fields (hook, body, cta_copy, visual_idea)
  - [ ] Validate min lengths (hook: 10, body: 50, cta_copy: 5, visual_idea: 20)
  - [ ] Verify slot_id exists (foreign key check)
  - [ ] Set default values: `status: 'draft'`, `created_by: 'human'` (if not provided)
  - [ ] Insert draft into content_drafts table
  - [ ] Return created draft: `{ draft: ContentDraft }`
  - [ ] Add error handling (400 for validation, 404 for slot not found, 500 for server errors)

- [ ] Task 3: Create GET single draft endpoint (AC: 3)
  - [ ] Create `app/api/content-drafts/[draftId]/route.ts`
  - [ ] Implement GET handler
  - [ ] Query content_drafts table by id
  - [ ] Return `{ draft: ContentDraft }`
  - [ ] Handle 404 if draft not found
  - [ ] Add error handling

- [ ] Task 4: Create PUT draft endpoint (AC: 4)
  - [ ] Add PUT handler to `app/api/content-drafts/[draftId]/route.ts`
  - [ ] Validate request body against ContentDraftSchema
  - [ ] Validate required fields still present
  - [ ] Validate min lengths
  - [ ] Update draft in content_drafts table
  - [ ] Return updated draft: `{ draft: ContentDraft }`
  - [ ] Handle 404 if draft not found
  - [ ] Add error handling

- [ ] Task 5: Create DELETE draft endpoint (AC: 5)
  - [ ] Add DELETE handler to `app/api/content-drafts/[draftId]/route.ts`
  - [ ] Verify draft exists
  - [ ] Delete draft from content_drafts table
  - [ ] Return success confirmation: `{ success: true }`
  - [ ] Handle 404 if draft not found
  - [ ] Add error handling

- [ ] Task 6: Test all endpoints (AC: 1-6)
  - [ ] Test GET drafts by slot (with and without drafts)
  - [ ] Test POST draft (valid and invalid data)
  - [ ] Test GET single draft (existing and non-existing)
  - [ ] Test PUT draft (valid and invalid updates)
  - [ ] Test DELETE draft (existing and non-existing)
  - [ ] Test foreign key constraints (slot_id must exist)
  - [ ] Test CASCADE delete (delete slot, verify drafts deleted)
  - [ ] Test validation errors (missing fields, min length violations)
  - [ ] Test status transitions (draft → approved → published)

## Dev Notes

### Relevant Architecture Patterns

- **RESTful API:** Follow existing API route patterns from Story 5.4
- **Error Handling:** Use standard HTTP status codes (400, 404, 500)
- **Validation:** Use ContentDraftSchema from Story 6.1 for validation
- **Database Queries:** Use Supabase client from `lib/supabase/server.ts`

### Source Tree Components to Touch

**API Endpoints:**
- `app/api/content-slots/[slotId]/drafts/route.ts` - GET, POST handlers
- `app/api/content-drafts/[draftId]/route.ts` - GET, PUT, DELETE handlers

**Schemas:**
- `lib/ai/schemas.ts` - Use ContentDraftSchema from Story 6.1

**Database:**
- `lib/supabase/server.ts` - Use Supabase server client

### API Endpoint Details

**GET /api/content-slots/[slotId]/drafts**
- Query: `SELECT * FROM content_drafts WHERE slot_id = $1 ORDER BY created_at DESC`
- Response: `{ drafts: ContentDraft[] }`
- Errors: 404 if slot not found, 500 for server errors

**POST /api/content-slots/[slotId]/drafts**
- Body: ContentDraft (without id, slot_id, created_at, updated_at)
- Validation: ContentDraftSchema, required fields, min lengths
- Insert: `INSERT INTO content_drafts (...) VALUES (...) RETURNING *`
- Response: `{ draft: ContentDraft }`
- Errors: 400 for validation, 404 if slot not found, 500 for server errors

**GET /api/content-drafts/[draftId]**
- Query: `SELECT * FROM content_drafts WHERE id = $1`
- Response: `{ draft: ContentDraft }`
- Errors: 404 if draft not found, 500 for server errors

**PUT /api/content-drafts/[draftId]**
- Body: Partial ContentDraft (fields to update)
- Validation: ContentDraftSchema, required fields if updating
- Update: `UPDATE content_drafts SET ... WHERE id = $1 RETURNING *`
- Response: `{ draft: ContentDraft }`
- Errors: 400 for validation, 404 if draft not found, 500 for server errors

**DELETE /api/content-drafts/[draftId]**
- Delete: `DELETE FROM content_drafts WHERE id = $1`
- Response: `{ success: true }`
- Errors: 404 if draft not found, 500 for server errors

### Testing Standards

- Test all CRUD operations
- Test validation (required fields, min lengths)
- Test foreign key constraints
- Test CASCADE delete
- Test error handling (404, 400, 500)
- Test status transitions

### Project Structure Notes

- Follow existing API route patterns from `app/api/campaigns/` or `app/api/sprints/`
- Use Supabase server client for database operations
- Use ContentDraftSchema for validation

### References

- [Source: docs/sprint-artifacts/content-slot-draft-separation-plan.md#6-api-endpoint-változtatások] - API endpoint specifications
- [Source: lib/ai/schemas.ts] - ContentDraftSchema definition
- [Source: app/api/campaigns/execution/route.ts] - Reference API pattern
- [Source: docs/epics.md#story-63] - Story 6.3 acceptance criteria

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

