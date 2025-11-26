# Story 6.4: Content Draft AI Generator Endpoint

Status: review

## Story

As a **campaign manager**,
I want **an AI endpoint that generates content drafts for a specific slot**,
so that **I can quickly create copy variants without manual writing**.

## Acceptance Criteria

1. **Given** I have a content slot with enhanced metadata
   **When** I POST to `/api/ai/content-slots/[slotId]/drafts` with `{ variant_count?: number, tone_preference?: string }`
   **Then** Endpoint generates 1-3 content draft variants (default: 1, max: 3)
   **And** Each draft includes all required fields:
   - `hook` (1-2 sentences, min 10 chars)
   - `body` (main text, min 50 chars)
   - `cta_copy` (call-to-action, min 5 chars)
   - `visual_idea` (2-5 sentences, min 20 chars)
   - `alt_text_suggestion` (if applicable)
   - `length_hint` (based on content_type, e.g., "max. 100 szó", "15s videó")
   - `tone_notes` (if tone_override present in slot)

2. **And** Drafts use slot context:
   - Primary + secondary segments (demographics, psychographics, media habits)
   - Primary + secondary topics (core narrative, content angles)
   - Related goals (goal descriptions, target metrics)
   - **Message strategy (CRITICAL - if segment × topic combination exists in message_strategies table):**
     - strategy_core (positioning_statement, core_message, supporting_messages, proof_points)
     - style_tone (tone_profile, language_style, communication_guidelines, emotional_temperature)
     - cta_funnel (funnel_stage, cta_objectives, cta_patterns, friction_reducers)
     - extra_fields (framing_type, key_phrases, risk_notes)
   - Angle type and hint from slot (which may have been informed by strategy)
   - CTA type from slot (which may have been informed by strategy)
   - Funnel stage from slot
   - Objective from slot
   - Content type from slot
   - Channel from slot

3. **And** Response format: `{ drafts: ContentDraft[] }`
   **And** All drafts have `created_by: 'ai'` and `status: 'draft'`
   **And** All drafts have `slot_id` set to the provided slotId
   **And** Optional `variant_name` can be set (e.g., "Variáns 1", "Variáns 2", "Variáns 3")

4. **And** Streaming progress shows: "Generating draft 1 of 2...", "Generating draft 2 of 2...", etc.
   **And** Streaming includes draft preview as it's generated

5. **And** Validation ensures slot exists and has required metadata
   **And** Validation ensures variant_count is between 1 and 3
   **And** Error handling for missing slot (404) or invalid variant_count (400)

6. **And** Generated drafts are saved to database automatically
   **And** Response returns saved drafts with database IDs

## Tasks / Subtasks

- [x] Task 1: Create AI prompt for content draft generation (AC: 1, 2)
  - [x] Create `lib/ai/prompts/content-draft-generator.ts`
  - [x] Design prompt to generate copy based on slot context
  - [x] Include slot metadata in prompt (segments, topics, goals, angle, CTA, funnel_stage, objective, content_type, channel)
  - [x] Include message strategy if available (segment × topic combination)
  - [x] Add guidance for hook generation (1-2 sentences, attention-grabbing)
  - [x] Add guidance for body generation (main text, engaging, min 50 chars)
  - [x] Add guidance for CTA copy generation (based on cta_type)
  - [x] Add guidance for visual idea generation (2-5 sentences, descriptive)
  - [x] Add guidance for alt text suggestion (accessibility)
  - [x] Add guidance for length hint (based on content_type)
  - [x] Add guidance for tone notes (if tone_override present)
  - [x] Support multiple variants (1-3) with slight variations

- [x] Task 2: Create AI endpoint (AC: 1-6)
  - [x] Create `app/api/ai/content-slots/[slotId]/drafts/route.ts`
  - [x] Implement POST handler
  - [x] Validate slot exists (query content_slots table)
  - [x] Validate slot has required metadata (primary_segment_id, primary_topic_id, funnel_stage, etc.)
  - [x] Parse request body: `{ variant_count?: number, tone_preference?: string }`
  - [x] Validate variant_count (1-3, default: 1)
  - [x] Load slot data with relationships (segments, topics, goals, message strategy)
  - [x] Call AI provider with content draft generator prompt
  - [x] Stream response with progress updates
  - [x] Parse AI response into ContentDraft objects
  - [x] Validate drafts against ContentDraftSchema
  - [x] Save drafts to database (content_drafts table)
  - [x] Return saved drafts: `{ drafts: ContentDraft[] }`
  - [x] Add error handling (404 for slot not found, 400 for validation, 500 for server errors)

- [x] Task 3: Implement streaming response (AC: 4)
  - [x] Use streaming response pattern from Story 5.2 or 5.8
  - [x] Stream progress: "Generating draft 1 of 2..."
  - [x] Stream draft preview as it's generated
  - [x] Stream completion: "Draft 1 generated successfully"
  - [x] Final response: `{ drafts: ContentDraft[] }`

- [x] Task 4: Load slot context including message strategy (AC: 2)
  - [x] Query slot with all relationships:
    - Primary segment (with demographics, psychographics, media habits)
    - Secondary segments (if any)
    - Primary topic (with core narrative, content angles)
    - Secondary topics (if any)
    - Related goals (with descriptions, target metrics)
    - **Message strategy (CRITICAL):** Query `message_strategies` table for primary_segment_id × primary_topic_id combination
      - If strategy exists, load full strategy (strategy_core, style_tone, cta_funnel, extra_fields)
      - If no strategy for primary, try secondary segment × primary topic or primary segment × secondary topic
      - Include strategy in prompt context with clear indication it should heavily influence copy generation
  - [x] Format context for AI prompt, emphasizing strategy importance when available

- [x] Task 5: Test and validate (AC: 1-6)
  - [x] Test with valid slotId and variant_count=1
  - [x] Test with variant_count=2, 3
  - [x] Test with tone_preference override
  - [x] Test with slot missing required metadata (should error)
  - [x] Test with non-existent slotId (404)
  - [x] Test with invalid variant_count (400)
  - [x] Verify drafts are saved to database
  - [x] Verify drafts have correct slot_id
  - [x] Verify drafts have created_by='ai' and status='draft'
  - [x] Verify all required fields present (hook, body, cta_copy, visual_idea)
  - [x] Verify min lengths (hook: 10, body: 50, cta_copy: 5, visual_idea: 20)

## Dev Notes

### Relevant Architecture Patterns

- **AI Prompt Pattern:** Follow existing prompt structure from `lib/ai/prompts/content-slot-planner.ts`
- **Streaming Response:** Follow existing streaming pattern from Story 5.2 or 5.8
- **Schema Validation:** Use ContentDraftSchema from Story 6.1
- **Database Operations:** Use Supabase server client
- **AI Provider:** Use AI provider abstraction from Epic 2 (Story 3.0.6)

### Source Tree Components to Touch

**AI Prompts:**
- `lib/ai/prompts/content-draft-generator.ts` - New prompt file

**API Endpoints:**
- `app/api/ai/content-slots/[slotId]/drafts/route.ts` - New AI endpoint

**Schemas:**
- `lib/ai/schemas.ts` - Use ContentDraftSchema from Story 6.1

**Database:**
- `lib/supabase/server.ts` - Use Supabase server client

### Prompt Design Details

**Input Context:**
- Slot metadata (date, channel, content_type, slot_index)
- Primary + secondary segments (full profiles)
- Primary + secondary topics (core narratives, content angles)
- Related goals (descriptions, target metrics)
- Message strategy (if segment × topic combination exists)
- Angle type and hint
- CTA type
- Funnel stage
- Objective
- Tone override (if present)

**Output Requirements:**
- Hook: 1-2 sentences, attention-grabbing, min 10 chars
- Body: Main text, engaging, min 50 chars
- CTA copy: Based on cta_type, min 5 chars
- Visual idea: 2-5 sentences, descriptive, min 20 chars
- Alt text suggestion: Accessibility-focused
- Length hint: Based on content_type
- Tone notes: If tone_override present

**Variant Generation:**
- Generate 1-3 variants with slight variations
- Each variant should be distinct but aligned with slot context
- Variants can differ in: hook approach, body tone, visual idea emphasis

### Testing Standards

- Test with various slot configurations
- Test with different variant counts (1, 2, 3)
- Test with tone_preference override
- Test error handling (missing slot, invalid variant_count)
- Verify drafts are saved correctly
- Verify all required fields present
- Verify min lengths met

### Project Structure Notes

- Follow existing AI endpoint patterns from Story 5.2 or 5.8
- Use AI provider abstraction from Epic 2
- Use ContentDraftSchema for validation
- Use streaming response pattern

### References

- [Source: docs/sprint-artifacts/content-slot-draft-separation-plan.md#5-ai-endpoint-változtatások] - AI endpoint specifications
- [Source: lib/ai/prompts/content-slot-planner.ts] - Reference prompt pattern
- [Source: app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts] - Reference endpoint pattern
- [Source: docs/epics.md#story-64] - Story 6.4 acceptance criteria

## Dev Agent Record

### Context Reference

- [Story Context XML](6-4-content-draft-ai-generator-endpoint.context.xml)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - No debug logs required

### Completion Notes List

1. **AI Prompt Creation**: Created `lib/ai/prompts/content-draft-generator.ts` with comprehensive system and user prompts. Prompt includes support for:
   - 1-3 variant generation
   - Full slot context (segments, topics, goals, message strategy)
   - All required and optional ContentDraft fields
   - Hungarian language output
   - Message strategy integration for copy guidance

2. **AI Endpoint Implementation**: Created `app/api/ai/content-slots/[slotId]/drafts/route.ts` with:
   - POST handler for draft generation
   - Slot validation (requires primary_segment_id, primary_topic_id, funnel_stage)
   - Full context loading (segments, topics, goals, message strategy with fallbacks)
   - Streaming response with progress updates
   - AI provider integration using generateStream
   - Draft validation against ContentDraftSchema
   - Database insert for all generated drafts
   - Comprehensive error handling (404, 400, 500)

3. **Message Strategy Loading**: Implemented intelligent fallback strategy:
   - Primary: segment × topic exact match
   - Fallback 1: secondary_segment × primary_topic
   - Fallback 2: primary_segment × secondary_topic
   - Graceful degradation if no strategy found

4. **Type Safety Fixes**: Fixed TypeScript errors across multiple files to support Story 6.1 schema changes:
   - `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` - Array.isArray check for focus_goals
   - `app/api/campaigns/execution/route.ts` - Added new required fields to slot inserts and GET response
   - `app/api/content-drafts/[draftId]/route.ts` - Fixed ZodError.errors → ZodError.issues
   - `app/api/content-slots/[id]/route.ts` - Fixed null vs undefined conversion
   - `app/api/content-slots/[slotId]/drafts/route.ts` (Story 6.3) - Fixed ZodError.errors → ZodError.issues
   - `components/campaigns/ContentCalendar.tsx` - Added all required Story 6.1 fields to ContentSlotRow
   - `components/campaigns/ExecutionPlanner.tsx` - Added all required Story 6.1 fields to slot insert

5. **Build Verification**: Full TypeScript build completed successfully with no errors.

### File List

**Created Files:**
- `lib/ai/prompts/content-draft-generator.ts` - AI prompt for content draft generation
- `app/api/ai/content-slots/[slotId]/drafts/route.ts` - AI endpoint for draft generation

**Modified Files (Type Safety):**
- `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts:357` - Array.isArray check for sprint.focus_goals
- `app/api/campaigns/execution/route.ts:372-394,603-626` - Added Story 6.1 required fields to slot inserts and GET response
- `app/api/content-drafts/[draftId]/route.ts:103` - Fixed ZodError.errors → ZodError.issues
- `app/api/content-slots/[id]/route.ts:121,123` - Fixed null → undefined conversion
- `app/api/content-slots/[slotId]/drafts/route.ts:80` - Fixed ZodError.errors → ZodError.issues
- `components/campaigns/ContentCalendar.tsx:241-267` - Added Story 6.1 fields to ContentSlotRow
- `components/campaigns/ExecutionPlanner.tsx:285-306` - Added Story 6.1 fields to slot insert

