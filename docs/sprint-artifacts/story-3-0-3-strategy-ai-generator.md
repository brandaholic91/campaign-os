# Story 3.0.3: Strategy AI Generator

**Status:** done



**Status note:** Story drafted 2025-11-22 - AI-powered strategy generation for segment × topic combinations

---

## User Story

As a **campaign manager**,
I want **to generate communication strategies for segment × topic combinations using AI**,
So that **I can quickly define how to communicate each topic to each segment without manual planning**.

---

## Acceptance Criteria

**AC #1:** AI generates complete strategies with all 16 sub-fields
- **Given** I have a campaign with segments and topics
- **When** I select segments and topics and click "Generate Strategies"
- **Then** AI generates complete communication strategies for each combination
- **And** each strategy includes all 16 sub-fields across 4 categories:
  - Strategy Core (5 fields): positioning_statement, core_message, supporting_messages[], proof_points[], objections_reframes[]?
  - Style & Tone (4 fields): tone_profile{description, keywords[]}, language_style, communication_guidelines{do[], dont[]}, emotional_temperature
  - CTA & Funnel (4 fields): funnel_stage, cta_objectives[], cta_patterns[], friction_reducers[]?
  - Extra Fields (3 fields, optional): framing_type?, key_phrases[]?, risk_notes?

**AC #2:** Generated strategies respect campaign context
- **Given** I select segments and topics for generation
- **When** AI generates strategies
- **Then** strategies reflect campaign context:
  - Campaign type (political_election, brand_awareness, etc.)
  - Goal type (awareness, engagement, conversion, etc.)
  - Campaign narratives (if available)
  - Segment demographics and psychographics
  - Topic name, description, and category

**AC #3:** Preview modal displays all generated strategies
- **Given** AI has generated strategies
- **When** generation completes
- **Then** a preview modal opens showing all generated strategies
- **And** each strategy displays as a preview card with key information
- **And** I can scroll through all generated strategies
- **And** each strategy has "Approve" and "Reject" buttons

**AC #4:** Selective approval workflow works
- **Given** I have generated strategies in preview modal
- **When** I review the strategies
- **Then** I can select individual strategies to approve or reject
- **And** I can use bulk actions: "Approve All", "Reject All", "Approve Selected"
- **And** only approved strategies are saved to the database
- **And** rejected strategies are discarded

**AC #5:** Preview summary generated for each strategy
- **Given** AI generates a strategy
- **When** generation completes
- **Then** AI also generates a preview_summary for each strategy
- **And** preview_summary includes:
  - Positioning statement (first 1-2 sentences)
  - Core message (1 sentence)
  - Tone keywords (from tone_profile.keywords)
  - Funnel stage (from cta_funnel.funnel_stage)
- **And** preview_summary is editable after generation

**AC #6:** Real-time generation progress displayed
- **Given** I start strategy generation
- **When** AI generates strategies
- **Then** generation progress is streamed in real-time
- **And** progress shows: "Generating strategy for Segment X × Topic Y..."
- **And** progress bar shows: "Generated 3 of 12 strategies"
- **And** I can cancel generation mid-process

**AC #7:** Regeneration available for individual strategies
- **Given** I have a generated or saved strategy
- **When** I want to regenerate it
- **Then** I can click "Regenerate Strategy" button
- **And** AI generates a new strategy for the same segment × topic combination
- **And** I can preview the new strategy before saving
- **And** I can choose to replace or keep the existing strategy

**AC #8:** Error handling works for API failures
- **Given** strategy generation is in progress
- **When** LLM API fails, rate limit occurs, or validation error happens
- **Then** user-friendly error message is displayed
- **And** I can retry generation
- **And** partial progress is preserved (successfully generated strategies remain)

---

## Implementation Details

### Tasks / Subtasks

- [x] Refactor `/api/ai/message-matrix` → `/api/ai/strategy-matrix` endpoint (AC: #1)
  - Rename endpoint to `/api/ai/strategy-matrix/route.ts`
  - Update request body to include campaign_id, selected segment_ids, topic_ids
  - Change output structure from messages to strategies (16 fields)
  - Update response format to return strategies instead of messages
  - Keep existing endpoint pattern but change output structure

- [x] Create prompt template `lib/ai/prompts/strategy-generator.ts` (AC: #1, #2)
  - Single LLM call with structured JSON output (16 fields across 4 categories)
  - Prompt includes campaign context:
    - Campaign type, goal type, narratives from campaigns table
    - Segment details (name, description, demographics, psychographics)
    - Topic details (name, description, category)
  - Instructions for all 16 sub-fields with examples:
    - Strategy Core: positioning_statement, core_message, supporting_messages (3-5), proof_points (2-3), objections_reframes (optional)
    - Style & Tone: tone_profile{description, keywords (3-5)}, language_style, communication_guidelines{do[], dont[]}, emotional_temperature
    - CTA & Funnel: funnel_stage (awareness/consideration/conversion/mobilization), cta_objectives[], cta_patterns (2-3), friction_reducers (optional)
    - Extra Fields: framing_type (optional), key_phrases[] (optional), risk_notes (optional)
  - Format requirements for each field
  - Examples of well-formed strategy structures

- [x] Implement Zod schema validation (AC: #1)
  - Use `MessageStrategySchema` from Story 3.0.1
  - Validate each generated strategy before saving
  - Return validation errors if LLM output doesn't match schema
  - Log validation errors for debugging
  - Provide user-friendly error messages for validation failures

- [ ] Implement CopilotKit event streaming for progress (AC: #6) **(Deferred)**
  - Stream generation status for each segment × topic combination
  - Show progress: "Generating strategy for Segment X × Topic Y..."
  - Stream completed strategies as they're generated
  - Update progress bar: "Generated 3 of 12 strategies"
  - Allow cancellation mid-generation

- [x] Implement batch generation logic (AC: #1, #6)
  - Generate strategies for all selected combinations
  - Parallel generation if API allows, otherwise sequential
  - Track progress for each combination
  - Handle partial failures gracefully
  - Continue generation even if one combination fails

- [x] Create preview modal component `components/ai/StrategyMatrixPreview.tsx` (AC: #3, #4)
  - Display all generated strategies in scrollable list
  - Each strategy shows preview card with key information
  - Individual approve/reject buttons per strategy
  - Bulk actions: "Approve All", "Reject All", "Approve Selected"
  - Selected strategies saved to database via POST `/api/strategies`
  - Handle UNIQUE constraint errors (strategy already exists)
  - Show success/error notifications

- [x] Implement preview summary generation (AC: #5)
  - Generate summary from strategy_core:
    - Extract positioning_statement (first 1-2 sentences)
    - Extract core_message (1 sentence)
    - Extract tone keywords (from style_tone.tone_profile.keywords)
    - Extract funnel stage (from cta_funnel.funnel_stage)
  - Format: "Positioning: [statement]. Core: [message]. Tone: [keywords]. Stage: [funnel_stage]"
  - Make summary editable after generation (via StrategyForm - Story 3.0.4)

- [x] Integration with strategy CRUD (Story 3.0.4) (AC: #4) **(Completed in Story 3.0.4)**
  - Use POST `/api/strategies` to save approved strategies
  - Handle UNIQUE constraint errors (strategy already exists for segment × topic)
  - Show success/error notifications
  - Refresh message matrix after save

- [x] Implement regeneration functionality (AC: #7)
  - "Regenerate Strategy" button on strategy preview/detail
  - Regenerate for single segment × topic combination
  - Preview new strategy before saving
  - Option to replace or keep existing strategy
  - Handle UNIQUE constraint (replace existing strategy)
  - **Completed: 2025-11-22** - Implemented single-strategy regeneration with comparison dialog

- [x] Implement error handling (AC: #8)
  - LLM API failures: show user-friendly error, allow retry
  - Rate limiting: queue requests or show wait message
  - Schema validation errors: log error, show message, allow regeneration
  - Network errors: show retry option
  - Partial failures: preserve successfully generated strategies, show error for failed ones

### Technical Summary

This story refactors Story 2.3's message generator to create a strategy generator that produces complete communication strategies (16 fields across 4 categories) instead of concrete messages. The generator uses AI to create strategies based on campaign context, segment details, and topic information. Users can preview, selectively approve, and regenerate strategies as needed.

**Key technical decisions:**
- Single LLM call with structured JSON output (16 fields)
- CopilotKit event streaming for real-time progress
- Batch generation with progress tracking
- Selective approval workflow (individual and bulk actions)
- Preview summary generation from strategy_core
- Regeneration support for iterative improvement

**Critical path:** This story depends on Story 3.0.1 (database schema) and Story 2.1 (LLM infrastructure). Story 3.0.2 (UI refactor) provides the UI foundation, but generation can work independently.

### Project Structure Notes

- **Files to create:**
  - `app/api/ai/strategy-matrix/route.ts` - Strategy AI generator endpoint (refactor from message-matrix)
  - `lib/ai/prompts/strategy-generator.ts` - Strategy generation prompt template
  - `components/ai/StrategyMatrixPreview.tsx` - Preview modal component

- **Files to modify:**
  - `lib/ai/schemas.ts` - Ensure MessageStrategySchema is available (from Story 3.0.1)
  - `components/messages/MessageMatrix.tsx` - Add "Generate Strategies" button integration

- **Files to deprecate:**
  - `app/api/ai/message-matrix/route.ts` - Keep for backward compatibility but mark as deprecated
  - `lib/ai/prompts/message-generator.ts` - Keep for reference but mark as deprecated

- **Expected test locations:** Manual testing
  - Test strategy generation with various campaign types
  - Test batch generation with multiple segment × topic combinations
  - Test preview modal and approve/reject workflow
  - Test regeneration functionality
  - Test error handling scenarios (API failures, rate limits, validation errors)
  - Test progress streaming and cancellation

- **Estimated effort:** 8 story points (4-5 days, complex prompt engineering)

- **Prerequisites:** Story 3.0.1 (database schema), Story 2.1 (LLM infrastructure)

### Key Code References

**Existing code to reference:**
- `app/api/ai/message-matrix/route.ts` - Message generator endpoint (Story 2.3) to refactor
- `lib/ai/prompts/message-generator.ts` - Message generation prompt (Story 2.3) to reference
- `lib/ai/client.ts` - Anthropic client (Story 2.1)
- `lib/ai/schemas.ts` - MessageStrategySchema (Story 3.0.1)
- `components/ai/MessageMatrixPreview.tsx` - Message preview modal (Story 2.3) to reference

**Reference documentation:**
- Anthropic Claude API: structured outputs, JSON mode
- CopilotKit event streaming: real-time progress updates
- Zod schema validation: runtime validation, error handling

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Epic 3.0: Message Matrix Refactor
- Strategy AI generator approach
- Prompt engineering requirements (16-field output)
- CopilotKit event streaming integration
- Preview summary generation logic

**Epic Definition:** [epics.md](../epics.md) - Epic 3.0: Message Matrix Refactor - Communication Strategies
- Story 3.0.3 acceptance criteria and technical notes
- Dependencies and prerequisites
- Success criteria


---

## Implementation Notes

**Implemented: 2025-11-22**

### Completed Tasks
- [x] Refactor `/api/ai/message-matrix` → `/api/ai/strategy-matrix` endpoint
  - Implemented new endpoint `/api/ai/strategy-matrix/route.ts`
  - Validates input with `MessageGenerationRequestSchema`
  - Generates strategies with 16 fields using `MessageStrategySchema`
- [x] Create prompt template `lib/ai/prompts/strategy-generator.ts`
  - Implemented `STRATEGY_GENERATOR_SYSTEM_PROMPT` with strict JSON schema
  - Implemented `STRATEGY_GENERATOR_USER_PROMPT` with campaign context
- [x] Implement Zod schema validation
  - Used `MessageStrategySchema` to validate AI output
- [x] Create preview modal component `components/ai/StrategyMatrixPreview.tsx`
  - Displays generated strategies in a scrollable list
  - Shows Strategy Core, Style & Tone, and CTA & Funnel details
  - Implemented Approve/Reject workflow (mock save)
- [x] Integration with UI
  - Updated `MessageMatrix.tsx` to use the new endpoint
  - Added "Stratégiák Generálása" button functionality

### Deviations
- **CopilotKit Streaming:** Deferred to a future story or optimization phase. Currently using standard request/response model with a loading state, which is sufficient for the current MVP.
- **Preview Summary:** Generated manually in the API if missing from AI output, ensuring AC #5 is met even if the LLM doesn't strictly follow the optional field instruction.

### Regeneration Functionality (Completed: 2025-11-22)
- [x] Created `/api/ai/regenerate-strategy/route.ts` endpoint
  - Single-strategy regeneration using same AI logic as batch generation
  - Returns generated strategy without saving to database
  - Proper validation and error handling
- [x] Created `StrategyRegenerationDialog.tsx` component
  - Side-by-side comparison (Original | New) with distinct styling
  - Tabbed interface showing all 4 strategy sections
  - "Keep Original" and "Replace with New" action buttons
  - Loading states during replace operation
- [x] Integrated into `StrategyDetailModal.tsx`
  - "Újragenerálás" button with Sparkles icon
  - Regeneration state management (isRegenerating, regeneratedStrategy, etc.)
  - Uses existing PUT `/api/strategies/[id]` endpoint for replacement
  - Success/error toast notifications
- [x] Updated `MessageMatrix.tsx`
  - Now passes campaignId, segmentId, topicId to detail modal
  - Enables regeneration feature with proper context

### Verification
- Verified regeneration endpoint generates valid strategies
- Verified comparison dialog displays correctly
- Verified replace functionality updates strategy in database
- Verified matrix refresh after strategy replacement

### Integration with Story 3.0.2 (Completed: 2025-11-22)
- [x] Connected batch generation button in `MessageMatrix.tsx`
  - Segment/topic selection via checkboxes
  - Batch generation via `handleBatchGenerate()` function
  - Loading state with spinner and progress message
- [x] Preview modal integration
  - `StrategyMatrixPreview` component displays all generated strategies
  - Approve/reject workflow with individual and bulk actions
  - Save to database via `/api/strategies` endpoint
- [x] Matrix refresh after generation
  - Uses `router.refresh()` to reload strategies after save
  - Toast notifications for user feedback

### Integration with Story 3.0.4 (Completed: 2025-11-22)
- [x] Strategy CRUD endpoints used for saving approved strategies
  - POST `/api/strategies` for creating new strategies
  - Handles UNIQUE constraint violations (409 status)
  - Proper error handling and user feedback

### Verification
- Verified strategy generation with various segment/topic combinations.
- Verified preview modal rendering and interaction.
- Verified schema validation and error handling.
