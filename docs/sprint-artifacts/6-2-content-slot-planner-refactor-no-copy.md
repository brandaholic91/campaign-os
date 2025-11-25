# Story 6.2: Content Slot Planner Refactor (No Copy)

Status: drafted

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

- [ ] Task 1: Refactor Content Slot Planner prompt (AC: 3)
  - [ ] Open `lib/ai/prompts/content-slot-planner.ts`
  - [ ] Remove all copy generation instructions (hook, body, cta_copy)
  - [ ] Add angle_type generation logic (based on slot context, angle_hint, and message strategy if available)
  - [ ] Add cta_type generation logic (based on objective, funnel_stage, and message strategy CTA patterns if available)
  - [ ] Add tone_override generation guidance (optional, when slot needs different tone, or from message strategy tone profile)
  - [ ] Add angle_hint generation using message strategy (strategy_core.positioning_statement, core_message) if available
  - [ ] Update prompt to emphasize tactical planning only
  - [ ] Update prompt to include new required fields (funnel_stage, related_goal_ids, angle_type, cta_type)
  - [ ] Update prompt to include optional fields (secondary_segment_ids, secondary_topic_ids, time_of_day, tone_override)
  - [ ] Add guidance: Use message strategy (if available for segment × topic combination) to inform angle_type, cta_type, tone_override, angle_hint

- [ ] Task 2: Load message strategies for slot generation (AC: 2, 3)
  - [ ] In `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts`
  - [ ] Query `message_strategies` table for campaign_id
  - [ ] Filter strategies by segment_id and topic_id matching focus segments/topics
  - [ ] Build strategy map: `Map<`${segment_id}:${topic_id}`, strategy>`
  - [ ] Pass strategy map to prompt context
  - [ ] For each slot being generated, look up strategy for primary_segment_id × primary_topic_id combination
  - [ ] Include strategy in prompt context for that slot (if available)

- [ ] Task 3: Update AI endpoint response schema (AC: 1, 2, 4)
  - [ ] Open `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts`
  - [ ] Remove any copy-related fields from response schema
  - [ ] Update response to use enhanced ContentSlotSchema from Story 6.1
  - [ ] Ensure response format: `{ content_slots: ContentSlot[] }` (no draft field)
  - [ ] Add validation for new required fields (angle_type, cta_type, funnel_stage, related_goal_ids)
  - [ ] Add campaign_id to generated slots (from sprint → campaign)
  - [ ] Add secondary_segment_ids and secondary_topic_ids generation (if applicable)

- [ ] Task 4: Update streaming response (AC: 1, 2)
  - [ ] Update streaming messages to reflect slot-only generation
  - [ ] Remove any copy generation progress messages
  - [ ] Update progress: "Generating content slots..." instead of "Generating content..."

- [ ] Task 5: Test and validate (AC: 1-5)
  - [ ] Test with campaigns that have message strategies
  - [ ] Test with campaigns without message strategies (should still work)
  - [ ] Verify slots use strategy data when available (angle_type, cta_type, tone_override, angle_hint)
  - [ ] Test endpoint with valid sprintId
  - [ ] Verify response contains only ContentSlot objects
  - [ ] Verify all new required fields are present
  - [ ] Verify no copy fields (hook, body, cta_copy) in response
  - [ ] Verify validation works (missing required fields → error)
  - [ ] Test backward compatibility: old endpoint still works

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

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

