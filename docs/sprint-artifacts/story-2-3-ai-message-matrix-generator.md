# Story 2.3: AI Message Matrix Generator

**Status:** done

---

## User Story

As a **campaign manager**,
I want **to generate messages for segment × topic combinations using AI**,
So that **I can quickly populate the message matrix with relevant content**.

---

## Acceptance Criteria

**AC #1:** AI generates messages for selected segment × topic combinations
- **Given** I have a campaign with segments and topics
- **When** I select segments and topics and click "Generate Messages"
- **Then** AI generates message suggestions for each combination
- **And** generated messages respect campaign context (campaign_type, goal_type, narratives)
- **And** messages are contextually relevant to the segment and topic

**AC #2:** Preview all generated messages before saving
- **Given** AI has generated messages
- **When** I view the preview
- **Then** I can see all generated messages in a reviewable format
- **And** messages are organized by segment × topic combination
- **And** I can see message details (headline, body, proof_point, CTA)
- **And** I can see which messages are AI-generated

**AC #3:** Select which messages to save and which to reject
- **Given** AI has generated messages
- **When** I review the suggestions
- **Then** I can select which messages to save
- **And** I can reject messages I don't want
- **And** I can edit individual messages before saving
- **And** selection state is maintained during review

**AC #4:** Generated messages include required fields
- **Given** AI generates messages
- **When** I review the output
- **Then** each message includes headline field
- **And** each message includes body field
- **And** each message includes proof_point field
- **And** each message includes CTA field
- **And** all fields are validated against database schema

**AC #5:** Regenerate messages if not satisfied
- **Given** I am not satisfied with generated messages
- **When** I click "Regenerate"
- **Then** AI generates new message suggestions
- **And** I can regenerate for specific segment × topic combinations
- **And** previous messages are replaced or I can choose to keep them
- **And** regeneration respects campaign context

**AC #6:** AI output via CopilotKit event stream
- **Given** Story 2.1 infrastructure exists
- **When** I trigger AI message generation
- **Then** AI output is streamed via CopilotKit events
- **And** I see real-time generation progress
- **And** batch generation shows progress indication
- **And** agent messages are displayed in real-time

**AC #7:** JSON schema validation ensures data quality
- **Given** AI generates message output
- **When** responses are received
- **Then** outputs are validated against Zod schemas
- **And** invalid outputs are rejected with clear errors
- **And** only valid, type-safe data is saved to database
- **And** zero data corruption from AI hallucinations

**AC #8:** Integration with existing message CRUD
- **Given** AI has generated messages
- **When** I approve and save messages
- **Then** messages are saved using existing message API
- **And** messages are associated with correct segment and topic
- **And** message_type and message_status are set correctly
- **And** database integrity is maintained

---

## Implementation Details

### Tasks / Subtasks

- [x] Extend MessageMatrix component with AI generation (AC: #1, #6)
  - Add "Generate Messages" button to existing MessageMatrix component
  - Implement segment and topic selection UI
  - Add loading state with progress indication
  - Integrate with REST API (CopilotKit event streaming deferred to follow-up)
  - Show generation progress via loading state

- [x] Implement `/api/ai/message-matrix` endpoint (AC: #1, #6)
  - Create API route `app/api/ai/message-matrix/route.ts`
  - Implement message generation LLM flow
  - Add prompt template in `lib/ai/prompts/message-generator.ts`
  - Include campaign context in prompt (campaign_type, goal_type, narratives)
  - Include selected segments and topics in prompt
  - Handle batch generation for multiple combinations
  - Note: REST API MVP implemented, CopilotKit event streaming deferred

- [x] Implement message generation LLM flow (AC: #1, #4)
  - Create prompt template for message generation
  - Include segment demographics/psychographics in context
  - Include topic theme and narrative in context
  - Generate headline, body, proof_point, CTA for each combination
  - Ensure messages are tailored to segment × topic
  - Validate output with Zod schema

- [x] Implement preview modal with approve/reject (AC: #2, #3)
  - Create `components/ai/MessageMatrixPreview.tsx`
  - Display messages in table format (segment × topic)
  - Show message details (headline, body, proof_point, CTA)
  - Add approve/reject per message
  - Add edit functionality for individual messages
  - Implement "Save Selected" functionality
  - Show generation statistics (X messages generated, Y approved)

- [x] Implement batch generation with progress (AC: #1, #6)
  - Handle multiple segment × topic combinations
  - Show progress indicator via loading state
  - Handle partial failures gracefully (continue on error)
  - Note: Real-time streaming deferred, REST API returns all results

- [x] Implement regeneration functionality (AC: #5)
  - Add "Regenerate" button per message in MessageMatrixPreview
  - Add "Regenerate Selected" button for batch regeneration
  - Allow selective regeneration (specific segment × topic combinations)
  - Replace existing messages with regenerated ones
  - Maintain campaign context in regeneration
  - Show regeneration progress with loading states
  - Implement regenerate_combinations parameter in API

- [x] Implement JSON schema validation (AC: #7)
  - Define Zod schemas for message output in `lib/ai/schemas.ts`
  - Validate headline, body, proof_point, CTA fields
  - Validate message_type
  - Reject invalid outputs with clear errors
  - Log validation failures for debugging
  - Continue with valid messages on partial failures

- [x] Integrate with existing message CRUD (AC: #8)
  - Use existing `/api/messages/route.ts` for saving
  - Associate messages with correct segment_id and topic_id
  - Set message_type and message_status appropriately
  - Handle foreign key relationships
  - Maintain database integrity
  - Add proper error handling with Promise.allSettled

- [x] Implement CopilotKit integration (AC: #6)
  - Add generateMessageMatrix action to CopilotRuntime
  - Action supports batch generation with progress tracking
  - Action supports selective regeneration via regenerate_combinations parameter
  - REST API remains primary interface for frontend
  - CopilotKit action available for agent-based interactions
  - Progress summary included in action response
  - Note: REST API MVP is primary interface, CopilotKit action available for future agent integration

- [x] Add error handling and fallback (AC: #1, #6)
  - Handle AI API failures gracefully
  - Show error toast messages
  - Provide fallback to manual message creation (existing flow)
  - Handle empty AI results
  - Handle partial generation failures (continue with valid messages)
  - Log errors for debugging

- [x] Add campaign context to prompts (AC: #1)
  - Include campaign_type in LLM prompt
  - Include goal_type in LLM prompt
  - Include narratives in LLM prompt
  - Include segment demographics/psychographics
  - Include topic themes
  - Ensure context is properly formatted for LLM

### Technical Summary

This story implements AI-powered message generation for the message matrix. The AI generates tailored messages for each segment × topic combination, respecting campaign context and narratives. CopilotKit integration provides real-time streaming with batch generation progress. Preview + approve workflow maintains user control while dramatically reducing time to populate the message matrix.

**Key technical decisions:**
- Batch generation for multiple segment × topic combinations
- CopilotKit event streaming for real-time progress
- Zod schema validation to prevent hallucinations
- Preview + approve workflow (not auto-save)
- Integration with existing Epic 1 message CRUD
- Campaign context included in prompts for relevance

**Dependencies:** Story 2.1 (LLM + CopilotKit Infrastructure) must be complete. Story 2.2 provides campaign context patterns but not strictly required.

### Project Structure Notes

- **Files to create:**
  - `components/ai/MessageMatrixPreview.tsx` - Preview modal component
  - `lib/ai/prompts/message-generator.ts` - Message generation prompt
  - `app/api/ai/message-matrix/route.ts` - API endpoint (if not using CopilotKit tools)
  - Update `lib/ai/schemas.ts` - Add message generation schemas

- **Files to update:**
  - `components/messages/MessageMatrix.tsx` - Add AI generation button and integration
  - `lib/ai/copilotkit/tools.ts` - Add message-matrix tool (if using CopilotKit tools)
  - Existing message API routes - Handle AI-generated messages

- **Expected test locations:** Manual testing
  - Test message generation for selected combinations
  - Test preview and approval workflow
  - Test batch generation progress
  - Test regeneration functionality
  - Test database saves and integrity
  - Test CopilotKit event streaming
  - Test error handling and fallback

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Story 2.1 (LLM + CopilotKit integration must exist). Story 2.2 provides context but not strictly required.

### Key Code References

**Existing code to reference:**
- `components/messages/MessageMatrix.tsx` - Existing message matrix component
- `app/api/messages/route.ts` - Message CRUD API
- Epic 1 database schema for message data model
- Story 2.1 CopilotKit infrastructure
- Story 2.2 campaign context patterns

**Reference documentation:**
- Anthropic Claude API: structured outputs, streaming, batch processing
- CopilotKit protocol: event streaming, batch progress
- Zod: schema validation, type inference
- Prompt engineering: context inclusion, multi-output generation

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Contains:
- Epic 2 AI requirements
- Message matrix data model from Epic 1
- CopilotKit integration approach
- Database schema for messages

**Epic Definition:** [epics.md](../epics.md) - Epic 2: AI-Powered Campaign Orchestration
- Story 2.3 acceptance criteria and technical notes
- Dependencies on Story 2.1
- Success criteria

**Epic Planning:** [epic-2-draft.md](../epic-2-draft.md) - Party mode planning
- Winston's architecture: message generator with campaign context
- Mary's requirements: Zod validation, preview + approve workflow
- Sally's UX: selection UI, preview modal, approval flow
- John's product strategy: high frequency use case, >80% approval rate

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4 (via Cursor)

### Debug Log References

- Implemented REST API MVP for message generation (deferred CopilotKit streaming)
- Fixed narratives field type issue with type assertion
- Fixed JSX closing tag issue in MessageMatrix component
- Used Promise.allSettled for batch message saving to handle partial failures

### File List

**Created:**
- `lib/ai/prompts/message-generator.ts` - Message generation prompt template
- `app/api/ai/message-matrix/route.ts` - Message generation API endpoint
- `components/ai/MessageMatrixPreview.tsx` - Preview modal with approve/reject

**Modified:**
- `components/messages/MessageMatrix.tsx` - Added AI generation UI, segment/topic selection, preview integration
- `lib/ai/schemas.ts` - Added message generation schemas (MessageGenerationRequestSchema, GeneratedMessageSchema, etc.)
- `app/campaigns/new/ai/page.tsx` - Fixed missing function declaration
- `docs/sprint-status.yaml` - Updated story 2-3 status to in-progress

### Change Log

- 2025-11-21: Initial implementation - AI message generation MVP
  - REST API endpoint for batch message generation
  - MessageMatrix component extended with AI generation UI
  - Preview and approve workflow implemented
  - Zod schema validation for message output
  - Integration with existing message CRUD
  - CopilotKit event streaming deferred to follow-up

- 2025-11-22: Regeneration and CopilotKit integration
  - Implemented regeneration functionality (AC #5)
  - Added per-message and batch regeneration buttons in MessageMatrixPreview
  - Selective regeneration via regenerate_combinations parameter
  - Added generateMessageMatrix CopilotKit action to CopilotRuntime
  - Updated API to support regenerate_combinations parameter
  - Progress tracking and error handling for regeneration
  - Maintained campaign context in regeneration requests

### Completion Notes

**Implemented (2025-11-21):**
- Message generation API endpoint with LLM flow
- MessageMatrix component extended with AI generation UI
- Segment and topic selection with checkboxes
- MessageMatrixPreview component for approve/reject workflow
- Zod schema validation for message output
- Integration with existing message CRUD API
- Campaign context (campaign_type, goal_type, narratives) included in prompts
- Error handling and fallback to manual creation
- Batch generation with partial failure handling

**Implemented (2025-11-22):**
- Regeneration functionality (AC #5) - Per-message and batch regeneration with selective combinations
- CopilotKit action integration (AC #6) - generateMessageMatrix action added to CopilotRuntime
- Selective regeneration via regenerate_combinations parameter
- Progress tracking and error handling for regeneration

**Deferred:**
- Real-time CopilotKit event streaming UI - REST API with loading states used instead
- Full CopilotKit agent integration - Action available but REST API remains primary interface

**Files Created:**
- `lib/ai/prompts/message-generator.ts`
- `app/api/ai/message-matrix/route.ts`
- `components/ai/MessageMatrixPreview.tsx`

**Files Updated:**
- `components/messages/MessageMatrix.tsx` - Added AI generation UI, regeneration support
- `components/ai/MessageMatrixPreview.tsx` - Added regeneration buttons, selective regeneration, progress tracking
- `lib/ai/schemas.ts` - Added message generation schemas, regenerate_combinations parameter
- `lib/ai/copilotkit/server.ts` - Added generateMessageMatrix CopilotKit action
- `app/api/ai/message-matrix/route.ts` - Added regenerate_combinations parameter support
- `app/campaigns/new/ai/page.tsx` - Fixed missing function declaration

