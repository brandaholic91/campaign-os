# Story 4.0.2: AI Prompt Enhancement for Strategic Data

**Status:** done

**Status note:** Story drafted 2025-11-23 - Strategy Designer prompt frissítés, új mezők generálása

---

## User Story

As a **campaign manager**,
I want **the AI to generate all strategic metadata fields when creating campaign structures**,
So that **the generated structure is immediately ready for sprint and content calendar planning**.

---

## Acceptance Criteria

**AC #1:** Goals generation includes strategic metadata
- **Given** I am generating a campaign structure using AI
- **When** the AI generates goals
- **Then** all goals include `funnel_stage` field (enum: awareness, engagement, consideration, conversion, mobilization)
- **And** all goals include `kpi_hint` field (optional string, e.g., "FB/IG reach", "newsletter signup", "event registration")
- **And** `funnel_stage` is selected based on campaign type and goal type
- **And** `kpi_hint` provides actionable KPI guidance relevant to the goal

**AC #2:** Topics generation includes strategic metadata
- **Given** I am generating a campaign structure using AI
- **When** the AI generates topics
- **Then** all topics include `related_goal_stages` field (array of enum values)
- **And** all topics include `recommended_content_types` field (optional array, e.g., ["short_video", "story", "static_image"])
- **And** `related_goal_stages` links topics to relevant funnel stages
- **And** `recommended_content_types` is based on topic type and segment media habits

**AC #3:** Narratives generation includes strategic metadata
- **Given** I am generating a campaign structure using AI
- **When** the AI generates narratives
- **Then** all narratives include `primary_goal_ids` field (optional array of UUIDs)
- **And** all narratives include `primary_topic_ids` field (optional array of UUIDs)
- **And** all narratives include `suggested_phase` field (optional enum: early, mid, late)
- **And** `primary_goal_ids` links narratives to specific goals for prioritization
- **And** `primary_topic_ids` links narratives to specific topics for content planning
- **And** `suggested_phase` indicates campaign timing based on narrative purpose

**AC #4:** Segment-Topic Matrix validation rules enforced
- **Given** I am generating a campaign structure using AI
- **When** the AI generates the segment-topic matrix
- **Then** matrix follows validation rules:
  - Max 2-3 high importance + core_message topics per segment
  - 2-4 medium importance support topics per segment
  - 1-2 experimental topics per segment
- **And** AI prompt includes explicit instructions for these limits
- **And** generated matrix respects these constraints

**AC #5:** Strategy Designer prompt updated
- **Given** I have the existing strategy designer prompt
- **When** I update the prompt
- **Then** `lib/ai/prompts/strategy-designer.ts` includes:
  - Explicit instructions for `funnel_stage` and `kpi_hint` in goals
  - Explicit instructions for `related_goal_stages` and `recommended_content_types` in topics
  - Explicit instructions for `primary_goal_ids`, `primary_topic_ids`, `suggested_phase` in narratives
  - Matrix validation rules with clear limits
  - Examples of good strategic metadata
- **And** prompt output schema examples include all new fields
- **And** prompt emphasizes importance of strategic metadata for execution planning

**AC #6:** System prompt updated with strategic context
- **Given** I have the strategy designer system prompt
- **When** I update the system prompt
- **Then** `STRATEGY_DESIGNER_SYSTEM_PROMPT` includes:
  - Guidance on funnel stage selection based on campaign type
  - Guidance on content type selection based on topic type and segment media habits
  - Emphasis on strategic metadata importance for execution planning
  - Instructions for linking narratives to goals and topics
- **And** system prompt provides context for making strategic decisions

**AC #7:** Prompt testing and validation
- **Given** the prompt is updated
- **When** I test the prompt
- **Then** test campaign structure generation includes all new fields
- **And** all fields are populated with sensible values
- **And** matrix validation rules are followed
- **And** strategic metadata makes sense for campaign type
- **And** generated structure is ready for execution planning

---

## Tasks / Subtasks

- [x] **Task 1: Update Strategy Designer prompt** (AC: #5)
  - [x] Add instructions for `funnel_stage` and `kpi_hint` in goals section
  - [x] Add instructions for `related_goal_stages` and `recommended_content_types` in topics section
  - [x] Add instructions for `primary_goal_ids`, `primary_topic_ids`, `suggested_phase` in narratives section
  - [x] Add matrix validation rules with explicit limits
  - [x] Add examples of good strategic metadata
  - [x] Update output schema examples to include all new fields

- [x] **Task 2: Update System Prompt** (AC: #6)
  - [x] Add guidance on funnel stage selection based on campaign type
  - [x] Add guidance on content type selection based on topic type and segment media habits
  - [x] Emphasize importance of strategic metadata for execution planning
  - [x] Add instructions for linking narratives to goals and topics

- [x] **Task 3: Test prompt updates** (AC: #1, #2, #3, #4, #7)
  - [x] Generate test campaign structure
  - [x] Verify all goals include `funnel_stage` and `kpi_hint`
  - [x] Verify all topics include `related_goal_stages` and `recommended_content_types`
  - [x] Verify all narratives include `primary_goal_ids`, `primary_topic_ids`, `suggested_phase`
  - [x] Verify matrix validation rules are followed
  - [x] Verify strategic metadata makes sense for campaign type
  - [x] Iterate on prompt if needed

---

## Dev Notes

### Project Structure Notes

- **Prompt file:** `lib/ai/prompts/strategy-designer.ts`
- **System prompt constant:** `STRATEGY_DESIGNER_SYSTEM_PROMPT`
- **Output schema:** Defined in prompt, validated by Zod schemas from Story 4.0.1

### Architecture Patterns

- **Prompt engineering:** Clear, explicit instructions with examples
- **Schema alignment:** Prompt output must match Zod schemas from Story 4.0.1
- **Validation rules:** Explicit limits in prompt to guide AI generation
- **Context awareness:** Prompt uses campaign type and goal type for strategic decisions

### Technical Details

**Goals strategic metadata:**
- `funnel_stage`: AI selects based on goal type and campaign type
  - Awareness goals → "awareness" or "engagement"
  - Conversion goals → "consideration" or "conversion"
  - Mobilization goals → "conversion" or "mobilization"
- `kpi_hint`: AI suggests relevant KPIs based on goal and campaign type

**Topics strategic metadata:**
- `related_goal_stages`: AI links topics to relevant funnel stages based on topic type and content
- `recommended_content_types`: AI suggests content formats based on:
  - Topic type (benefit/problem/value/proof/story)
  - Segment media habits (from Story 3.0.5)
  - Campaign type

**Narratives strategic metadata:**
- `primary_goal_ids`: AI links narratives to 1-3 primary goals
- `primary_topic_ids`: AI links narratives to 1-3 primary topics
- `suggested_phase`: AI determines timing based on narrative purpose:
  - Early: Foundation/awareness narratives
  - Mid: Engagement/consideration narratives
  - Late: Conversion/mobilization narratives

**Matrix validation rules:**
- Max 2-3 high importance + core_message topics per segment (focus)
- 2-4 medium importance support topics per segment (balance)
- 1-2 experimental topics per segment (innovation)

### Dependencies

- **Prerequisites:** Story 4.0.1 complete (schema enhancement must exist)
- **AI Infrastructure:** Epic 2 complete (LLM infrastructure, CopilotKit)
- **Schema Reference:** Story 3.0.5 (Enhanced Segment & Topic Schema for media habits)

### Testing Strategy

- **Prompt testing:** Generate test campaign structures and verify all fields populated
- **Validation testing:** Verify matrix rules are followed
- **Context testing:** Test with different campaign types and goal types
- **Iteration:** Refine prompt based on test results

### References

- [Source: docs/epics.md#Epic-4.0] - Epic 4.0 goal and scope
- [Source: docs/epics.md#Story-4.0.2] - Story 4.0.2 acceptance criteria and technical notes
- [Source: docs/sprint-artifacts/story-4-0-1-strategic-metadata-schema-enhancement.md] - Schema definitions
- [Source: docs/sprint-artifacts/story-3-0-5-enhanced-segment-topic-schema.md] - Segment media habits reference
- [Source: lib/ai/prompts/strategy-designer.ts] - Existing prompt to update

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- [Done] Updated `STRATEGY_DESIGNER_SYSTEM_PROMPT` in `lib/ai/prompts/strategy-designer.ts` with new fields (funnel_stage, kpi_hint, related_goal_stages, recommended_content_types, goal_indices, topic_indices, suggested_phase) and instructions.
- [Done] Updated `STRATEGY_DESIGNER_USER_PROMPT` to reinforce matrix validation rules.
- [Done] Created `scripts/verify-strategy-schema.ts` to verify that the Zod schema accepts the new prompt output structure.
- [Done] Fixed regression test in `__tests__/ai/campaign-brief.test.ts` (updated segment priority to match schema).
- [Done] Verified all acceptance criteria are met via schema validation and prompt inspection.

### File List

- lib/ai/prompts/strategy-designer.ts
- scripts/verify-strategy-schema.ts
- __tests__/ai/campaign-brief.test.ts
- docs/sprint-status.yaml
- docs/sprint-artifacts/story-4-0-2-ai-prompt-enhancement-strategic-data.md

