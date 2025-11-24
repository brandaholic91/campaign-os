# Story 5.2: Execution Planner AI Endpoint

Status: drafted

## Story

As a **campaign manager**,
I want **an AI endpoint that generates sprint plans and content calendars from validated campaign structures**,
so that **I can quickly create execution plans without manual planning**.

## Acceptance Criteria

1. **AC 5.2.1: AI endpoint válaszol**
   - **Given** A validated campaign structure exists
   - **When** I POST to `/api/ai/campaign-execution` with `{ campaignId }`
   - **Then** Endpoint returns 200 status
   - **And** Response is a streaming response (Content-Type: text/event-stream)
   - **And** Response uses Server-Sent Events (SSE) format

2. **AC 5.2.2: Input validáció működik (soft gate)**
   - **Given** Campaign structure exists (may or may not be fully validated)
   - **When** I POST to `/api/ai/campaign-execution`
   - **Then** Endpoint checks validation status (soft gate - doesn't block)
   - **And** If not ready for execution, warning is returned but execution proceeds
   - **And** Warning includes validation issues list
   - **And** If ready for execution, execution proceeds normally

3. **AC 5.2.3: Sprint generálás működik**
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

4. **AC 5.2.4: Content slot generálás működik**
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

5. **AC 5.2.5: Streaming progress működik**
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

6. **AC 5.2.6: Zod validáció működik**
   - **Given** AI generates execution plan
   - **When** Response is validated
   - **Then** `ExecutionPlanSchema.parse()` succeeds
   - **And** Invalid plans are rejected with clear error messages
   - **And** Validation errors include field-level details

7. **AC 5.2.7: Constraint enforcement működik (post-processing)**
   - **Given** AI generates execution plan
   - **When** Plan violates constraints (e.g., too many slots per day)
   - **Then** Post-processing function enforces constraints:
     - Removes slots by priority (experimental → medium → high)
     - Attempts to move slots to other days if possible
     - Returns warnings about removed/moved slots
   - **And** Final plan respects all constraints

## Tasks / Subtasks

- [ ] Task 1: Create AI endpoint route (AC: 1)
  - [ ] Create `app/api/ai/campaign-execution/route.ts`
  - [ ] Implement POST handler with streaming response
  - [ ] Set up Server-Sent Events (SSE) format
  - [ ] Test endpoint returns 200 status
  - [ ] Test streaming response format

- [ ] Task 2: Implement input validation and soft gate (AC: 2)
  - [ ] Load campaign structure from database
  - [ ] Check validation status using validation helpers from Story 4.0.3
  - [ ] If not ready, generate warning message with validation issues
  - [ ] Continue execution even if not fully validated (soft gate)
  - [ ] Test warning generation and display

- [ ] Task 3: Create execution planner prompt (AC: 3, 4)
  - [ ] Create `lib/ai/prompts/execution-planner.ts`
  - [ ] Design system prompt with sprint planning guidelines
  - [ ] Design system prompt with content slot planning guidelines
  - [ ] Include campaign structure context (goals, segments, topics, narratives, matrix)
  - [ ] Include strategic metadata (funnel_stage, priorities, recommended_content_types)
  - [ ] Include constraint rules (max posts per day/channel, weekly totals)
  - [ ] Include priority-based generation rules
  - [ ] Test prompt with sample campaign structures

- [ ] Task 4: Implement sprint generation logic (AC: 3)
  - [ ] Calculate sprint count based on campaign length and complexity
  - [ ] Generate sprint dates (no overlaps, cover entire period)
  - [ ] Assign focus goals based on campaign goal_type and sprint count
  - [ ] Assign focus segments, topics, channels based on strategic priorities
  - [ ] Generate sprint names and descriptions
  - [ ] Test sprint generation with various campaign lengths

- [ ] Task 5: Implement content slot generation logic (AC: 4)
  - [ ] Calculate slot count based on budget and constraints
  - [ ] Distribute slots evenly across sprints
  - [ ] Assign slots to segment×topic pairs based on priority
  - [ ] Respect max posts per day per channel constraints
  - [ ] Respect max total posts per week constraints
  - [ ] Assign objectives and content types based on strategic metadata
  - [ ] Generate angle hints for each slot
  - [ ] Test slot generation with various campaign configurations

- [ ] Task 6: Implement streaming progress updates (AC: 5)
  - [ ] Send progress events during sprint planning phase
  - [ ] Send progress events during content calendar generation phase
  - [ ] Format progress messages in Hungarian
  - [ ] Send final complete event with full execution plan
  - [ ] Test streaming with frontend client

- [ ] Task 7: Implement Zod validation (AC: 6)
  - [ ] Validate AI response against ExecutionPlanSchema
  - [ ] Handle validation errors with clear messages
  - [ ] Return field-level error details
  - [ ] Test validation with valid and invalid plans

- [ ] Task 8: Implement constraint enforcement (AC: 7)
  - [ ] Create post-processing function to enforce constraints
  - [ ] Remove slots by priority if constraints violated
  - [ ] Attempt to move slots to other days if possible
  - [ ] Generate warnings about removed/moved slots
  - [ ] Test constraint enforcement with various scenarios

- [ ] Task 9: Testing (AC: 1-7)
  - [ ] Write unit tests for prompt generation
  - [ ] Write unit tests for sprint generation logic
  - [ ] Write unit tests for content slot generation logic
  - [ ] Write unit tests for constraint enforcement
  - [ ] Write integration tests for endpoint
  - [ ] Test with various campaign structures and configurations
  - [ ] Test error handling and edge cases

## Dev Notes

### Architecture Patterns and Constraints

- **Streaming Response:** Use Next.js streaming API with Server-Sent Events (SSE) format, similar to existing AI endpoints from Epic 2
- **AI Provider:** Reuse AI provider abstraction from Story 3.0.6 (Anthropic, OpenAI, Google Gemini, Ollama)
- **Prompt Engineering:** Follow existing prompt patterns from `lib/ai/prompts/strategy-designer.ts` (Epic 2)
- **Validation:** Reuse validation helpers from Story 4.0.3 (`lib/validation/campaign-structure.ts`)
- **Schema Validation:** Use Zod schemas from Story 5.1 (`ExecutionPlanSchema`)
- **Soft Gate:** Don't block execution if validation fails, but warn user (similar to validation approach in Epic 4.0)
- **Post-Processing:** Implement constraint enforcement as separate function to keep AI prompt focused on generation, not constraint checking

### Project Structure Notes

- **AI Endpoint:** `app/api/ai/campaign-execution/route.ts` (follow existing AI endpoint patterns)
- **Prompt Template:** `lib/ai/prompts/execution-planner.ts` (new file, follow existing prompt patterns)
- **Constraint Enforcement:** `lib/ai/execution-planner.ts` (new file for post-processing logic)
- **Testing:** Follow existing test patterns from `__tests__/ai/` directory

### References

- [Source: docs/epics.md#Epic-5] - Epic 5 goal, scope, and story breakdown
- [Source: docs/sprint-artifacts/epic-5-execution-planner-stories.md#Story-5.2] - Detailed acceptance criteria and technical notes
- [Source: docs/tech-spec.md#Epic-5-Technical-Approach] - AI endpoint approach and sprint/content slot planning logic
- [Source: lib/ai/prompts/strategy-designer.ts] - Existing prompt patterns for reference
- [Source: lib/ai/providers/] - AI provider abstraction from Story 3.0.6
- [Source: lib/validation/campaign-structure.ts] - Validation helpers from Story 4.0.3
- [Source: lib/ai/schemas.ts] - ExecutionPlanSchema from Story 5.1

### Learnings from Previous Story

**From Story 5-1-database-schema-execution-planning (Status: drafted)**

- **Schema Usage:** Use ExecutionPlanSchema, SprintPlanSchema, ContentSlotSchema from Story 5.1 for validation
- **Type Safety:** Use generated TypeScript types from `lib/supabase/types.ts` for database operations
- **Enum Values:** Ensure AI-generated enum values match Zod schema enums exactly

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

