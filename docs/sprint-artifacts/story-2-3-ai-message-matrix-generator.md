# Story 2.3: AI Message Matrix Generator

**Status:** drafted

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

**AC #6:** AI output via AG-UI event stream
- **Given** Story 2.1 infrastructure exists
- **When** I trigger AI message generation
- **Then** AI output is streamed via AG-UI events
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

- [ ] Extend MessageMatrix component with AI generation (AC: #1, #6)
  - Add "Generate Messages" button to existing MessageMatrix component
  - Implement segment and topic selection UI
  - Add loading state with progress indication
  - Integrate with AG-UI event streaming
  - Show real-time generation progress

- [ ] Implement `/api/ai/message-matrix` endpoint or AG-UI tool (AC: #1, #6)
  - Create API route or AG-UI tool handler
  - Implement message generation LLM flow
  - Add prompt template in `lib/ai/prompts/message-generator.ts`
  - Include campaign context in prompt (campaign_type, goal_type, narratives)
  - Include selected segments and topics in prompt
  - Stream output via AG-UI events
  - Handle batch generation for multiple combinations

- [ ] Implement message generation LLM flow (AC: #1, #4)
  - Create prompt template for message generation
  - Include segment demographics/psychographics in context
  - Include topic theme and narrative in context
  - Generate headline, body, proof_point, CTA for each combination
  - Ensure messages are tailored to segment × topic
  - Validate output with Zod schema

- [ ] Implement preview modal with approve/reject (AC: #2, #3)
  - Create `components/ai/MessageMatrixPreview.tsx`
  - Display messages in table format (segment × topic)
  - Show message details (headline, body, proof_point, CTA)
  - Add approve/reject per message
  - Add edit functionality for individual messages
  - Implement "Save Selected" functionality
  - Show generation statistics (X messages generated, Y approved)

- [ ] Implement batch generation with progress (AC: #1, #6)
  - Handle multiple segment × topic combinations
  - Show progress indicator (e.g., "Generating 5/12 messages")
  - Stream results as they are generated
  - Handle partial failures gracefully
  - Allow cancellation of generation

- [ ] Implement regeneration functionality (AC: #5)
  - Add "Regenerate" button per message or per combination
  - Allow selective regeneration (specific combinations)
  - Replace or append new messages based on user choice
  - Maintain campaign context in regeneration
  - Show regeneration progress

- [ ] Implement JSON schema validation (AC: #7)
  - Define Zod schemas for message output in `lib/ai/schemas.ts`
  - Validate headline, body, proof_point, CTA fields
  - Validate message_type and message_status
  - Reject invalid outputs with clear errors
  - Log validation failures for debugging
  - Retry on validation failure if appropriate

- [ ] Integrate with existing message CRUD (AC: #8)
  - Use existing `/api/messages/route.ts` for saving
  - Associate messages with correct segment_id and topic_id
  - Set message_type and message_status appropriately
  - Handle foreign key relationships
  - Maintain database integrity
  - Add proper error handling

- [ ] Implement AG-UI integration (AC: #6)
  - Connect to `/api/ai/stream` endpoint from Story 2.1
  - Display real-time agent messages
  - Show batch generation progress
  - Handle state patch events
  - Update UI as AI generates messages
  - Add loading states and error handling

- [ ] Add error handling and fallback (AC: #1, #6)
  - Handle AI API failures gracefully
  - Show "AI temporarily unavailable, create manually" message
  - Provide fallback to manual message creation
  - Handle empty AI results
  - Handle partial generation failures
  - Add retry logic for transient failures

- [ ] Add campaign context to prompts (AC: #1)
  - Include campaign_type in LLM prompt
  - Include goal_type in LLM prompt
  - Include narratives in LLM prompt
  - Include segment demographics/psychographics
  - Include topic themes
  - Ensure context is properly formatted for LLM

### Technical Summary

This story implements AI-powered message generation for the message matrix. The AI generates tailored messages for each segment × topic combination, respecting campaign context and narratives. AG-UI integration provides real-time streaming with batch generation progress. Preview + approve workflow maintains user control while dramatically reducing time to populate the message matrix.

**Key technical decisions:**
- Batch generation for multiple segment × topic combinations
- AG-UI event streaming for real-time progress
- Zod schema validation to prevent hallucinations
- Preview + approve workflow (not auto-save)
- Integration with existing Epic 1 message CRUD
- Campaign context included in prompts for relevance

**Dependencies:** Story 2.1 (LLM + AG-UI Infrastructure) must be complete. Story 2.2 provides campaign context patterns but not strictly required.

### Project Structure Notes

- **Files to create:**
  - `components/ai/MessageMatrixPreview.tsx` - Preview modal component
  - `lib/ai/prompts/message-generator.ts` - Message generation prompt
  - `app/api/ai/message-matrix/route.ts` - API endpoint (if not using AG-UI tools)
  - Update `lib/ai/schemas.ts` - Add message generation schemas

- **Files to update:**
  - `components/messages/MessageMatrix.tsx` - Add AI generation button and integration
  - `lib/ai/ag-ui/tools.ts` - Add message-matrix tool (if using AG-UI tools)
  - Existing message API routes - Handle AI-generated messages

- **Expected test locations:** Manual testing
  - Test message generation for selected combinations
  - Test preview and approval workflow
  - Test batch generation progress
  - Test regeneration functionality
  - Test database saves and integrity
  - Test AG-UI event streaming
  - Test error handling and fallback

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Story 2.1 (LLM integration must exist). Story 2.2 provides context but not strictly required.

### Key Code References

**Existing code to reference:**
- `components/messages/MessageMatrix.tsx` - Existing message matrix component
- `app/api/messages/route.ts` - Message CRUD API
- Epic 1 database schema for message data model
- Story 2.1 AG-UI infrastructure
- Story 2.2 campaign context patterns

**Reference documentation:**
- Anthropic Claude API: structured outputs, streaming, batch processing
- AG-UI protocol: event streaming, batch progress
- Zod: schema validation, type inference
- Prompt engineering: context inclusion, multi-output generation

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Contains:
- Epic 2 AI requirements
- Message matrix data model from Epic 1
- AG-UI integration approach
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

_To be filled by Dev Agent during implementation_

### Debug Log References

_To be filled by Dev Agent during implementation_

### Completion Notes

_To be filled when story is complete_

