# Story 5.7: Sprint-Only AI Generation Endpoint

Status: drafted

## Story

As a **campaign manager**,
I want **an AI endpoint that generates only sprint plans without content slots**,
so that **I can create strategic execution phases first, then decide content timing separately**.

## Acceptance Criteria

1. **AC 5.7.1: Sprint-only AI endpoint exists**
   - **Given** I have a validated campaign structure (Epic 4.0 complete)
   - **When** I POST to `/api/ai/campaign-sprints` with `{ campaignId: string }`
   - **Then** Endpoint generates sprints only (no content_calendar in response)
   - **And** Response format: `{ sprints: SprintPlan[] }` (content_calendar field is absent)
   - **And** All sprints include enhanced metadata fields from Story 5.6:
     - `focus_stage`, `focus_goals[]`, `focus_segments_primary[]`, `focus_segments_secondary[]`
     - `focus_topics_primary[]`, `focus_topics_secondary[]`, `focus_channels_primary[]`, `focus_channels_secondary[]`
     - `suggested_weekly_post_volume`, `narrative_emphasis[]`, `key_messages_summary`
     - `success_criteria[]`, `risks_and_watchouts[]`
   - **And** Response validates against enhanced `SprintPlanSchema` from Story 5.6

2. **AC 5.7.2: Sprint count logic**
   - **Given** Campaign has start_date and end_date
   - **When** AI generates sprints
   - **Then** Sprint count follows guidelines:
     - 1-10 days → 1 sprint
     - 11-25 days → 2 sprints
     - 26-45 days → 3 sprints
     - 46+ days → 4-6 sprints
   - **And** Each sprint has non-overlapping date ranges
   - **And** Sprints cover entire campaign duration without gaps

3. **AC 5.7.3: Sprint focus stages follow funnel progression**
   - **Given** AI generates sprints
   - **When** I review sprint focus_stage values
   - **Then** Focus stages follow funnel progression:
     - Sprint 1: primarily 'awareness' or 'engagement'
     - Sprint 2: primarily 'engagement' or 'consideration'
     - Sprint 3+: primarily 'consideration', 'conversion', or 'mobilization'
   - **And** Each sprint has exactly one `focus_stage` value
   - **And** Focus stages progress logically through funnel

4. **AC 5.7.4: Streaming progress via SSE**
   - **Given** I POST to `/api/ai/campaign-sprints`
   - **When** AI is generating sprints
   - **Then** Server-Sent Events (SSE) stream progress updates:
     - "Analyzing campaign structure..."
     - "Determining sprint count..."
     - "Generating sprint 1 of X..."
     - "Generating sprint 2 of X..."
     - "Validating sprint plans..."
     - "Sprint generation complete!"
   - **And** Final SSE event contains: `{ type: 'done', data: { sprints: SprintPlan[] } }`
   - **And** Error events stream if generation fails: `{ type: 'error', error: string }`

5. **AC 5.7.5: AI prompt for sprint-only generation**
   - **Given** Story 5.6 enhanced schema is available
   - **When** I check `lib/ai/prompts/sprint-planner.ts`
   - **Then** Prompt instructs AI to:
     - Generate ONLY sprint plans (no content slots)
     - Include all enhanced metadata fields (focus_stage, focus_goals, etc.)
     - Follow sprint count guidelines based on campaign length
     - Follow funnel progression for focus_stage
     - Use campaign structure (goals, segments, topics, narratives) as context
   - **And** Prompt specifies output format: `{ sprints: SprintPlan[] }`

6. **AC 5.7.6: Error handling and validation**
   - **Given** Campaign structure is invalid or incomplete
   - **When** I POST to `/api/ai/campaign-sprints`
   - **Then** Endpoint returns error response:
     - 400 if campaign not found
     - 400 if campaign structure not validated (use validation endpoint)
     - 500 if AI generation fails
   - **And** Error messages are clear and actionable
   - **And** Validation errors are specific (e.g., "Campaign must have at least 1 segment")

**Prerequisites:** Story 5.6 (Enhanced schema)

**Estimated Effort:** 3-4 points (2-3 days)

## Tasks / Subtasks

- [ ] Task 1: Create sprint-only AI endpoint (AC: 1, 4)
  - [ ] Create `app/api/ai/campaign-sprints/route.ts`
  - [ ] Implement POST handler with `campaignId` parameter
  - [ ] Load campaign structure from database
  - [ ] Validate campaign structure is complete (use validation helpers)
  - [ ] Implement SSE streaming for progress updates
  - [ ] Call AI provider with sprint-planner prompt
  - [ ] Parse AI response to extract sprints array
  - [ ] Validate response against enhanced `SprintPlanSchema`
  - [ ] Return validated sprints via SSE final event
  - [ ] Handle errors and stream error events
  - [ ] Test endpoint with sample campaign

- [ ] Task 2: Implement sprint count logic (AC: 2)
  - [ ] Calculate campaign duration (end_date - start_date)
  - [ ] Implement sprint count determination logic:
    - 1-10 days → 1 sprint
    - 11-25 days → 2 sprints
    - 26-45 days → 3 sprints
    - 46+ days → 4-6 sprints (distribute evenly)
  - [ ] Calculate date ranges for each sprint (non-overlapping, cover entire duration)
  - [ ] Pass sprint count and date ranges to AI prompt as context
  - [ ] Test with campaigns of different lengths

- [ ] Task 3: Implement funnel progression logic (AC: 3)
  - [ ] Define funnel stage progression mapping based on sprint number
  - [ ] Pass expected focus_stage progression to AI prompt
  - [ ] Validate AI-generated focus_stage values follow progression
  - [ ] Post-process or request regeneration if focus_stage doesn't match progression
  - [ ] Test funnel progression with various sprint counts

- [ ] Task 4: Create sprint-planner AI prompt (AC: 5)
  - [ ] Create `lib/ai/prompts/sprint-planner.ts`
  - [ ] Write system prompt: instruct AI to generate sprint plans only (no content slots)
  - [ ] Write user prompt template with campaign context:
    - Campaign goals, segments, topics, narratives
    - Campaign start_date and end_date
    - Sprint count and date ranges
    - Expected focus_stage progression
  - [ ] Specify output format: `{ sprints: SprintPlan[] }` with enhanced fields
  - [ ] Include examples of expected sprint structure
  - [ ] Test prompt with AI provider and verify output quality

- [ ] Task 5: Error handling and validation (AC: 6)
  - [ ] Validate campaign exists in database
  - [ ] Check campaign structure completeness (use validation helpers from Epic 4.0)
  - [ ] Return 400 with specific error if campaign structure incomplete
  - [ ] Handle AI provider errors (timeout, rate limit, etc.)
  - [ ] Return 500 with error message if AI generation fails
  - [ ] Log errors for debugging
  - [ ] Test error scenarios

- [ ] Task 6: Testing and integration
  - [ ] Test endpoint with validated campaign
  - [ ] Test SSE streaming (progress updates and final event)
  - [ ] Test with campaigns of different lengths (1-10, 11-25, 26-45, 46+ days)
  - [ ] Verify funnel progression in generated sprints
  - [ ] Test error scenarios (invalid campaign, incomplete structure)
  - [ ] Verify response validates against enhanced SprintPlanSchema
  - [ ] Integration test with frontend (Story 5.9)

## Dev Notes

### Learnings from Previous Story

**From Story 5.6 (Status: drafted) - Enhanced Sprint Schema & Database Migration**
- Enhanced sprint schema includes: `focus_stage`, `focus_goals[]`, `suggested_weekly_post_volume`, `narrative_emphasis[]`, `key_messages_summary`, `success_criteria[]`, `risks_and_watchouts[]`
- `SprintPlanSchema` in `lib/ai/schemas.ts` has been enhanced with new optional fields
- TypeScript types exported: `SprintFocusStage`, `SuggestedWeeklyPostVolume`, `EnhancedSprintPlan`

[Source: docs/sprint-artifacts/5-6-enhanced-sprint-schema-database-migration.md]

**From Story 5.2 (Status: in-progress) - Execution Planner AI Endpoint**
- Existing endpoint pattern: `app/api/ai/campaign-execution/route.ts` generates both sprints and content slots
- SSE streaming pattern established: progress updates via Server-Sent Events
- AI prompt location: `lib/ai/prompts/execution-planner.ts`
- Campaign validation helpers available from Epic 4.0
- AI provider abstraction from Epic 3.0.6 (multi-provider support)

[Source: docs/sprint-artifacts/5-2-execution-planner-ai-endpoint.md]
[Source: app/api/ai/campaign-execution/route.ts]

### Architecture Patterns and Constraints

- **Endpoint Pattern:** Follow existing AI endpoint pattern from Story 5.2 (`/api/ai/campaign-execution`)
- **SSE Streaming:** Use Server-Sent Events for progress updates (same pattern as Story 5.2)
- **Prompt Location:** New prompts in `lib/ai/prompts/sprint-planner.ts`
- **Schema Validation:** Use enhanced `SprintPlanSchema` from Story 5.6
- **Campaign Validation:** Use validation helpers from Epic 4.0 to check campaign structure completeness
- **AI Provider:** Use AI provider abstraction from Epic 3.0.6 (`lib/ai/providers/`)
- **Response Format:** `{ sprints: SprintPlan[] }` (NO content_calendar field)

### Project Structure Notes

**New Files:**
- `app/api/ai/campaign-sprints/route.ts` - NEW endpoint for sprint-only generation
- `lib/ai/prompts/sprint-planner.ts` - NEW prompt for sprint-only generation

**Modified Files:**
- None (this is a new endpoint, not modifying existing one)

**Note:** Existing `/api/ai/campaign-execution` endpoint remains unchanged (backward compatibility)

### References

- [Source: docs/epics.md#Story-5.7]
- [Source: docs/tech-spec.md#Phase-2-Two-Phase-Refactor]
- [Source: docs/sprint-artifacts/5-6-enhanced-sprint-schema-database-migration.md]
- [Source: docs/sprint-artifacts/5-2-execution-planner-ai-endpoint.md]
- [Source: app/api/ai/campaign-execution/route.ts]
- [Source: lib/ai/prompts/execution-planner.ts]
- [Source: lib/ai/schemas.ts]
- [Source: lib/validation/campaign-structure.ts]

### Testing Standards

- Test endpoint with validated campaigns
- Test SSE streaming (progress updates and final event)
- Test with campaigns of various lengths (1-10, 11-25, 26-45, 46+ days)
- Verify funnel progression in generated sprints
- Test error scenarios (invalid campaign, incomplete structure, AI failures)
- Verify response validates against enhanced SprintPlanSchema
- Integration test with frontend (will be done in Story 5.9)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

