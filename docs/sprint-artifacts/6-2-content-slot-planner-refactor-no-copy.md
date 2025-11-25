# Story 6.2: Content Slot Planner Refactor (No Copy)

Status: review

## Story

As a **campaign manager**,
I want **Content Slot Planner AI to generate only tactical slots without copy**,
so that **I can plan content timing separately from content creation**.

## Acceptance Criteria

1. **Given** I have the Content Slot Planner endpoint from Story 5.8
   **When** I POST to `/api/ai/campaign-sprints/[sprintId]/content-slots`
   **Then** Endpoint generates ContentSlot objects only (no copy fields: hook, body, cta_copy)
   **And** Response format: `{ content_slots: ContentSlot[] }` (no draft field)

2. **And** All slots include new required fields:
   - `angle_type` (generated based on slot context, angle_hint, and message strategy if available)
   - `cta_type` (generated based on objective, funnel_stage, and message strategy CTA patterns if available)
   - `tone_override` (optional, generated if needed for specific slot or from message strategy tone profile)
   - `funnel_stage` (from sprint focus_stage)
   - `related_goal_ids` (from sprint focus_goals, min 1, max 2)
   - `secondary_segment_ids`, `secondary_topic_ids` (if applicable, 0-2 each)
   - `campaign_id` (from sprint → campaign relationship)
   - `time_of_day` (optional, generated based on channel best practices)
   - `angle_hint` (generated using message strategy core_message and positioning_statement if available)

3. **And** Prompt refactored to remove copy generation instructions
   **And** Prompt includes angle_type and cta_type generation logic
   **And** Prompt uses message strategies (if available for segment × topic combinations) to inform:
   - angle_type selection (from strategy_core.core_message, framing_type)
   - cta_type selection (from cta_funnel.cta_patterns)
   - tone_override (from style_tone.tone_profile, emotional_temperature)
   - angle_hint (from strategy_core.positioning_statement, core_message)
   **And** Prompt emphasizes tactical planning (when, where, who, what, why) without copy

4. **And** Validation ensures all required fields are present (ContentSlotSchema)
   **And** Response validates against enhanced ContentSlotSchema from Story 6.1

5. **And** Backward compatibility: old endpoint `/api/ai/campaign-execution` still works (deprecated but functional)

## Tasks / Subtasks

- [x] Task 1: Refactor Content Slot Planner prompt (AC: 3)
  - [x] Open `lib/ai/prompts/content-slot-planner.ts`
  - [x] Remove all copy generation instructions (hook, body, cta_copy)
  - [x] Add angle_type generation logic (based on slot context, angle_hint, and message strategy if available)
  - [x] Add cta_type generation logic (based on objective, funnel_stage, and message strategy CTA patterns if available)
  - [x] Add tone_override generation guidance (optional, when slot needs different tone, or from message strategy tone profile)
  - [x] Add angle_hint generation using message strategy (strategy_core.positioning_statement, core_message) if available
  - [x] Update prompt to emphasize tactical planning only
  - [x] Update prompt to include new required fields (funnel_stage, related_goal_ids, angle_type, cta_type)
  - [x] Update prompt to include optional fields (secondary_segment_ids, secondary_topic_ids, time_of_day, tone_override)
  - [x] Add guidance: Use message strategy (if available for segment × topic combination) to inform angle_type, cta_type, tone_override, angle_hint

- [x] Task 2: Load message strategies for slot generation (AC: 2, 3)
  - [x] In `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts`
  - [x] Query `message_strategies` table for campaign_id
  - [x] Filter strategies by segment_id and topic_id matching focus segments/topics
  - [x] Build strategy map: `Map<`${segment_id}:${topic_id}`, strategy>`
  - [x] Pass strategy map to prompt context
  - [x] For each slot being generated, look up strategy for primary_segment_id × primary_topic_id combination
  - [x] Include strategy in prompt context for that slot (if available)

- [x] Task 3: Update AI endpoint response schema (AC: 1, 2, 4)
  - [x] Open `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts`
  - [x] Remove any copy-related fields from response schema
  - [x] Update response to use enhanced ContentSlotSchema from Story 6.1
  - [x] Ensure response format: `{ content_slots: ContentSlot[] }` (no draft field)
  - [x] Add validation for new required fields (angle_type, cta_type, funnel_stage, related_goal_ids)
  - [x] Add campaign_id to generated slots (from sprint → campaign)
  - [x] Add secondary_segment_ids and secondary_topic_ids generation (if applicable)

- [x] Task 4: Update streaming response (AC: 1, 2)
  - [x] Update streaming messages to reflect slot-only generation
  - [x] Remove any copy generation progress messages
  - [x] Update progress: "Generating content slots..." instead of "Generating content..."

- [x] Task 5: Test and validate (AC: 1-5)
  - [x] Test with campaigns that have message strategies
  - [x] Test with campaigns without message strategies (should still work)
  - [x] Verify slots use strategy data when available (angle_type, cta_type, tone_override, angle_hint)
  - [x] Test endpoint with valid sprintId
  - [x] Verify response contains only ContentSlot objects
  - [x] Verify all new required fields are present
  - [x] Verify no copy fields (hook, body, cta_copy) in response
  - [x] Verify validation works (missing required fields → error)
  - [x] Test backward compatibility: old endpoint still works

## Dev Notes

### Relevant Architecture Patterns

- **AI Prompt Pattern:** Follow existing prompt structure from `lib/ai/prompts/content-slot-planner.ts`
- **Schema Validation:** Use enhanced ContentSlotSchema from Story 6.1
- **Streaming Response:** Follow existing streaming pattern from Story 5.8
- **Backward Compatibility:** Keep old endpoint functional (deprecated but not removed)

### Source Tree Components to Touch

**AI Prompts:**
- `lib/ai/prompts/content-slot-planner.ts` - Refactor prompt to remove copy generation

**API Endpoints:**
- `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` - Load message strategies, update response schema and validation

**Database:**
- `message_strategies` table - Query strategies for segment × topic combinations

**Schemas:**
- `lib/ai/schemas.ts` - Use enhanced ContentSlotSchema from Story 6.1

### Prompt Refactoring Details

**Remove:**
- Copy generation instructions (hook, body, cta_copy)
- Copywriting guidance
- Content writing examples

**Add:**
- Message strategy integration: Load strategies from `message_strategies` table for segment × topic combinations
- Angle type generation logic (story, proof, how_to, comparison, behind_the_scenes, testimonial, other)
  - Use strategy_core.core_message and extra_fields.framing_type if strategy available
- CTA type generation logic (soft_info, learn_more, signup, donate, attend_event, share, comment)
  - Use cta_funnel.cta_patterns if strategy available
- Tone override guidance (when and why to use, or from style_tone.tone_profile)
- Angle hint generation using strategy_core.positioning_statement and core_message if strategy available
- Secondary segment/topic selection logic
- Time of day generation (based on channel best practices)

**Emphasize:**
- Tactical planning focus (when, where, who, what, why)
- Strategic alignment (segment, topic, goal, funnel_stage)
- Content type and channel matching
- No copy generation needed at this stage

### Testing Standards

- Test with various sprint configurations
- Verify all new fields are generated correctly
- Verify no copy fields in response
- Test validation with missing required fields
- Test backward compatibility

### Project Structure Notes

- Follow existing AI endpoint patterns from Story 5.8
- Use enhanced ContentSlotSchema from Story 6.1
- Maintain streaming response format

### References

- [Source: docs/sprint-artifacts/content-slot-draft-separation-plan.md#5-ai-endpoint-változtatások] - AI endpoint refactoring specification
- [Source: lib/ai/prompts/content-slot-planner.ts] - Current prompt implementation
- [Source: app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts] - Current endpoint implementation
- [Source: docs/epics.md#story-62] - Story 6.2 acceptance criteria

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/6-2-content-slot-planner-refactor-no-copy.context.xml`

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A

### Completion Notes List

- **Task 1 (Prompt Refactor):** Updated `ContentSlotPlannerContext` interface to include `message_strategies_map`. Completely refactored system prompt to remove copy generation instructions and add angle_type, cta_type, tone_override, funnel_stage generation logic. Updated user prompt to include message strategy context and new required fields guidance.

- **Task 2 (Message Strategy Loading):** Added message_strategies table query in API endpoint. Built strategy map with "segment_id:topic_id" key format. Passed strategiesMap to plannerContext for prompt usage.

- **Task 3 (Response Schema Update):** Added validation helpers for new enums (angle_type, cta_type, funnel_stage, time_of_day). Updated slotWithFixedId object to include all new required fields (campaign_id, funnel_stage, related_goal_ids, angle_type, cta_type) and optional fields (secondary_segment_ids, secondary_topic_ids, time_of_day, tone_override). Enhanced validation with normalization functions.

- **Task 4 (Streaming Update):** Updated progress messages to reflect slot-only generation ("Tartalom slotok tervezése", "Message strategy-k betöltése", "Slot metadata generálása"). Changed final message from "Generálás kész!" to "Slot tervezés kész!".

- **Task 5 (Verification):** All acceptance criteria verified. Implementation complete with proper validation, message strategy integration, and enhanced schema support.

### File List

- `lib/ai/prompts/content-slot-planner.ts` - Prompt refactored with message strategy integration
- `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` - Message strategies loaded, response schema updated, validation enhanced

