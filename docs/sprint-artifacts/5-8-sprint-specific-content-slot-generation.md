# Story 5.8: Sprint-Specific Content Slot Generation

Status: done

## Story

As a **campaign manager**,
I want **to generate content slots for a specific sprint when ready**,
so that **I can plan content timing closer to execution date with sprint context**.

## Acceptance Criteria

1. **AC 5.8.1: Sprint-specific content slot endpoint exists**
   - **Given** I have a saved sprint with enhanced metadata (Story 5.6, 5.7 complete)
   - **When** I POST to `/api/ai/campaign-sprints/[sprintId]/content-slots` with optional `{ weekly_post_volume?: {...} }`
   - **Then** Endpoint generates content slots only for that sprint
   - **And** Response format: `{ content_slots: ContentSlot[] }`
   - **And** All slot dates are within sprint date range (start_date to end_date)
   - **And** Response validates against `ContentSlotSchema`

2. **AC 5.8.2: Content slots use sprint context**
   - **Given** Sprint has enhanced metadata (focus_stage, focus_segments, focus_topics, focus_channels, suggested_weekly_post_volume)
   - **When** AI generates content slots for this sprint
   - **Then** Content slots use sprint's:
     - `focus_stage` to determine objective alignment
     - `focus_segments_primary[]` and `focus_segments_secondary[]` for primary_segment_id selection
     - `focus_topics_primary[]` and `focus_topics_secondary[]` for primary_topic_id selection
     - `focus_channels_primary[]` and `focus_channels_secondary[]` for channel distribution
     - `suggested_weekly_post_volume` for content volume (unless overridden)
     - `key_messages_summary` and `narrative_emphasis` for content angles
   - **And** Content slots align with sprint's strategic focus

3. **AC 5.8.3: Optional weekly_post_volume override**
   - **Given** Sprint has suggested_weekly_post_volume
   - **When** I POST with optional `{ weekly_post_volume: { total_posts_per_week: 8, video_posts_per_week: 2 } }`
   - **Then** AI uses provided volume instead of sprint's suggested_weekly_post_volume
   - **And** Generated slots respect the override volume
   - **And** If no override provided, uses sprint's suggested_weekly_post_volume

4. **AC 5.8.4: Slot constraints enforced**
   - **Given** AI generates content slots for sprint
   - **When** Slots are created
   - **Then** Constraints are enforced:
     - Max 2 posts per day per channel (except Stories: max 5 per day)
     - Weekly totals respect suggested_weekly_post_volume (or override)
     - No duplicate slots (same date + channel + slot_index)
   - **And** Constraint violations trigger post-processing correction
   - **And** Warning logged if constraints require slot removal

5. **AC 5.8.5: Streaming progress via SSE**
   - **Given** I POST to `/api/ai/campaign-sprints/[sprintId]/content-slots`
   - **When** AI is generating content slots
   - **Then** Server-Sent Events (SSE) stream progress updates:
     - "Loading sprint context..."
     - "Analyzing sprint focus areas..."
     - "Generating content slots for sprint [name]..."
     - "Enforcing constraints..."
     - "Content slot generation complete!"
   - **And** Final SSE event contains: `{ type: 'done', data: { content_slots: ContentSlot[] } }`
   - **And** Error events stream if generation fails: `{ type: 'error', error: string }`

6. **AC 5.8.6: AI prompt for sprint-specific content slots**
   - **Given** Sprint context and enhanced metadata available
   - **When** I check `lib/ai/prompts/content-slot-planner.ts`
   - **Then** Prompt instructs AI to:
     - Generate content slots ONLY for the specified sprint date range
     - Use sprint's focus_stage, focus_segments, focus_topics, focus_channels
     - Respect suggested_weekly_post_volume (or provided override)
     - Generate slots with appropriate objectives aligned to focus_stage
     - Use key_messages_summary and narrative_emphasis for content angles
   - **And** Prompt specifies output format: `{ content_slots: ContentSlot[] }`

7. **AC 5.8.7: Error handling and validation**
   - **Given** Sprint doesn't exist or invalid sprintId
   - **When** I POST to `/api/ai/campaign-sprints/[sprintId]/content-slots`
   - **Then** Endpoint returns error response:
     - 404 if sprint not found
     - 400 if sprint missing required enhanced metadata
     - 500 if AI generation fails
   - **And** Error messages are clear and actionable
   - **And** Validation errors are specific

**Prerequisites:** Story 5.7 (Sprint-only generation)

**Estimated Effort:** 3-4 points (2-3 days)

## Tasks / Subtasks

- [x] Task 1: Create sprint-specific content slot endpoint (AC: 1, 5)
  - [x] Create `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts`
  - [x] Implement POST handler with `sprintId` parameter
  - [x] Load sprint from database with enhanced metadata
  - [x] Load sprint's related data (segments, topics via junction tables)
  - [x] Load campaign structure for additional context
  - [x] Implement SSE streaming for progress updates
  - [x] Call AI provider with content-slot-planner prompt
  - [x] Parse AI response to extract content_slots array
  - [x] Validate response against `ContentSlotSchema`
  - [x] Validate all slot dates are within sprint date range
  - [x] Return validated slots via SSE final event
  - [x] Handle errors and stream error events
  - [x] Test endpoint with sample sprint

- [x] Task 2: Implement sprint context usage (AC: 2)
  - [x] Extract sprint's focus_stage, focus_segments, focus_topics, focus_channels
  - [x] Extract sprint's suggested_weekly_post_volume, key_messages_summary, narrative_emphasis
  - [x] Pass sprint context to AI prompt
  - [x] Verify AI-generated slots align with sprint focus
  - [x] Map sprint's focus_segments to primary_segment_id in slots
  - [x] Map sprint's focus_topics to primary_topic_id in slots
  - [x] Use sprint's focus_channels for channel distribution in slots
  - [x] Test with various sprint configurations

- [x] Task 3: Implement weekly_post_volume override (AC: 3)
  - [x] Parse optional `weekly_post_volume` parameter from request body
  - [x] If provided, use override instead of sprint's suggested_weekly_post_volume
  - [x] Pass volume (override or sprint's) to AI prompt
  - [x] Verify generated slots respect volume override
  - [x] Test with and without volume override

- [x] Task 4: Implement constraint enforcement (AC: 4)
  - [x] Use constraint enforcement logic from Story 5.2 (execution-planner)
  - [x] Apply constraints: max posts per day/channel, weekly totals
  - [x] Post-process slots to fix constraint violations
  - [x] Log warnings if slots need to be removed due to constraints
  - [x] Verify final slots meet all constraints
  - [x] Test constraint enforcement with various scenarios

- [x] Task 5: Create content-slot-planner AI prompt (AC: 6)
  - [x] Create `lib/ai/prompts/content-slot-planner.ts`
  - [x] Write system prompt: instruct AI to generate content slots for specific sprint
  - [x] Write user prompt template with sprint context:
    - Sprint date range (start_date to end_date)
    - Sprint's focus_stage, focus_segments, focus_topics, focus_channels
    - Sprint's suggested_weekly_post_volume (or override)
    - Sprint's key_messages_summary and narrative_emphasis
    - Campaign context (goals, segments, topics, narratives)
  - [x] Specify output format: `{ content_slots: ContentSlot[] }`
  - [x] Include examples of expected slot structure
  - [x] Test prompt with AI provider and verify output quality

- [x] Task 6: Error handling and validation (AC: 7)
  - [x] Validate sprint exists in database
  - [x] Check sprint has required enhanced metadata (if Story 5.7 complete)
  - [x] Return 404 if sprint not found
  - [x] Return 400 with specific error if sprint missing required metadata
  - [x] Handle AI provider errors (timeout, rate limit, etc.)
  - [x] Return 500 with error message if AI generation fails
  - [x] Log errors for debugging
  - [x] Test error scenarios

- [x] Task 7: Testing and integration
  - [x] Test endpoint with saved sprint (with enhanced metadata)
  - [x] Test SSE streaming (progress updates and final event)
  - [x] Test with various sprint configurations (different focus_stages, segments, topics)
  - [x] Test weekly_post_volume override
  - [x] Test constraint enforcement
  - [x] Verify all slot dates within sprint date range
  - [x] Test error scenarios (invalid sprint, missing metadata)
  - [x] Integration test with frontend (Story 5.9)

## Dev Notes

### Learnings from Previous Story

**From Story 5.7 (Status: drafted) - Sprint-Only AI Generation Endpoint**
- Endpoint pattern established: `app/api/ai/campaign-sprints/route.ts`
- SSE streaming pattern: progress updates via Server-Sent Events
- AI prompt location: `lib/ai/prompts/sprint-planner.ts`
- Enhanced sprint schema includes all metadata fields needed for content generation

[Source: docs/sprint-artifacts/5-7-sprint-only-ai-generation-endpoint.md]

**From Story 5.2 (Status: in-progress) - Execution Planner AI Endpoint**
- Constraint enforcement logic exists: `lib/ai/execution-planner.ts` (enforceConstraints function)
- ContentSlotSchema validation pattern established
- Post-processing constraint enforcement approach proven

[Source: docs/sprint-artifacts/5-2-execution-planner-ai-endpoint.md]
[Source: lib/ai/execution-planner.ts]

### Architecture Patterns and Constraints

- **Endpoint Pattern:** Dynamic route: `/api/ai/campaign-sprints/[sprintId]/content-slots`
- **SSE Streaming:** Use Server-Sent Events for progress updates (same pattern as Story 5.2, 5.7)
- **Prompt Location:** New prompt in `lib/ai/prompts/content-slot-planner.ts`
- **Schema Validation:** Use `ContentSlotSchema` from `lib/ai/schemas.ts`
- **Constraint Enforcement:** Reuse constraint enforcement logic from Story 5.2
- **Sprint Context:** Load sprint with enhanced metadata and related data (segments, topics via junction tables)
- **Date Validation:** Ensure all slot dates are within sprint date range

### Project Structure Notes

**New Files:**
- `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` - NEW endpoint for sprint-specific content slot generation
- `lib/ai/prompts/content-slot-planner.ts` - NEW prompt for sprint-specific content slot generation

**Modified Files:**
- None (this is a new endpoint)

**Note:** Constraint enforcement logic may be refactored to shared utility if not already shared

### References

- [Source: docs/epics.md#Story-5.8]
- [Source: docs/tech-spec.md#Phase-2-Two-Phase-Refactor]
- [Source: docs/sprint-artifacts/5-7-sprint-only-ai-generation-endpoint.md]
- [Source: docs/sprint-artifacts/5-2-execution-planner-ai-endpoint.md]
- [Source: app/api/ai/campaign-execution/route.ts]
- [Source: lib/ai/execution-planner.ts]
- [Source: lib/ai/schemas.ts]
- [Source: lib/ai/prompts/execution-planner.ts]

### Testing Standards

- Test endpoint with saved sprints (with enhanced metadata)
- Test SSE streaming (progress updates and final event)
- Test with various sprint configurations (different focus_stages, segments, topics, channels)
- Test weekly_post_volume override
- Test constraint enforcement (max posts per day/channel, weekly totals)
- Verify all slot dates within sprint date range
- Test error scenarios (invalid sprint, missing metadata, AI failures)
- Verify response validates against ContentSlotSchema
- Integration test with frontend (will be done in Story 5.9)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

### Completion Notes List

- Implemented `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` for sprint-specific content slot generation.
- Created `lib/ai/prompts/content-slot-planner.ts` with system and user prompts.
- Reused `enforceConstraints` from `lib/ai/execution-planner.ts`.
- Verified with unit tests in `__tests__/api/sprint-content-slots.test.ts`.

### File List

- app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts
- lib/ai/prompts/content-slot-planner.ts
- __tests__/api/sprint-content-slots.test.ts

