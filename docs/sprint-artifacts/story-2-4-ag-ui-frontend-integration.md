# Story 2.4: CopilotKit Frontend Integration (Kampánysegéd)

**Status:** drafted

---

## User Story

As a **campaign manager**,
I want **an embedded AI assistant in the campaign creation UI that provides real-time help and suggestions**,
So that **I can get contextual assistance while manually creating campaigns, with the agent understanding my current progress and form state**.

---

## Acceptance Criteria

**AC #1:** Real-time streaming chat interface
- **Given** I am creating or editing a campaign
- **When** I interact with the kampánysegéd (campaign assistant)
- **Then** I see a real-time streaming chat interface
- **And** agent messages stream in real-time (typing indicators)
- **And** chat history is maintained during session
- **And** chat interface is accessible and responsive

**AC #2:** Assistant can see current form state
- **Given** I am filling out campaign forms
- **When** the assistant is active
- **Then** the assistant receives current form state (campaign_type, goal_type, filled fields)
- **And** state sync happens bi-directionally
- **And** assistant responses are contextually relevant to my progress
- **And** state updates are sent to agent in real-time

**AC #3:** Assistant can suggest field values
- **Given** the assistant understands my form state
- **When** I ask for help or the assistant proactively suggests
- **Then** the assistant can suggest field values
- **And** I can accept or reject suggestions
- **And** accepted suggestions prefill the form fields
- **And** suggestions are displayed inline or in chat

**AC #4:** Assistant can highlight fields that need attention
- **Given** I am creating a campaign
- **When** the assistant identifies fields that need attention
- **Then** the assistant can call highlightField tool
- **And** relevant fields are visually highlighted
- **And** highlight is clear and non-intrusive
- **And** highlight can be dismissed

**AC #5:** Assistant can navigate to relevant wizard steps
- **Given** I am in a multi-step campaign creation flow
- **When** the assistant recommends a step
- **Then** the assistant can call navigateToStep tool
- **And** I am navigated to the relevant wizard step
- **And** navigation is smooth and intuitive
- **And** current progress is preserved

**AC #6:** Contextual answers about campaign setup
- **Given** I ask questions about campaign setup
- **When** I interact with the assistant
- **Then** I receive contextual answers based on campaign_type and goal_type
- **And** answers reference my current progress
- **And** answers are helpful and actionable
- **And** assistant can explain campaign concepts

**AC #7:** Assistant can trigger deep campaign orchestrator
- **Given** I request full campaign generation
- **When** I ask the assistant to generate a complete campaign
- **Then** the assistant can trigger the deep campaign orchestrator agent
- **And** the orchestrator flow is initiated (Story 2.2 functionality)
- **And** I see progress of the orchestrator
- **And** results are integrated into the current form state

**AC #8:** All interactions via CopilotKit protocol with bi-directional state sync
- **Given** CopilotKit infrastructure exists (Story 2.1)
- **When** I interact with the assistant
- **Then** all communication happens via CopilotKit protocol
- **And** bi-directional state sync works reliably
- **And** frontend tools execute correctly
- **And** event streaming is stable

**AC #9:** Progressive enhancement - works without CopilotKit
- **Given** CopilotKit is unavailable or fails
- **When** I try to use the assistant
- **Then** fallback to manual campaign creation is available
- **And** error message is user-friendly
- **And** core functionality (manual creation) still works
- **And** graceful degradation is implemented

---

## Implementation Details

### Tasks / Subtasks

- [ ] Install and configure CopilotKit client (AC: #1, #8)
  - Install `@copilotkit/react-core@^1.0.0` and `@copilotkit/react-ui@^1.0.0`
  - Configure CopilotKit client to connect to `/api/copilotkit`
  - Set up WebSocket or SSE connection
  - Implement connection lifecycle management
  - Add error handling and reconnection logic

- [ ] Create CampaignAssistant wrapper component (AC: #1, #8)
  - Create `components/ai/CampaignAssistant.tsx` - main CopilotKit wrapper
  - Wrap campaign creation/editing forms with CopilotKit provider
  - Configure CopilotKit context and state management
  - Set up bi-directional state sync
  - Handle CopilotKit initialization and cleanup

- [ ] Create AssistantChat component (AC: #1)
  - Create `components/ai/AssistantChat.tsx` - streaming chat UI
  - Implement real-time message streaming display
  - Add typing indicators
  - Implement chat history management
  - Add message input and send functionality
  - Style chat interface (floating button or side panel)
  - Add collapsible/expandable functionality

- [ ] Create InlineSuggestions component (AC: #3)
  - Create `components/ai/InlineSuggestions.tsx` - field-level suggestions
  - Display suggestions near relevant form fields
  - Implement accept/reject UI for suggestions
  - Add smooth animations for suggestion appearance
  - Handle suggestion state management
  - Integrate with form field components

- [ ] Implement frontend tools (AC: #3, #4, #5)
  - Implement `highlightField(field_id)` tool
  - Implement `prefillField(field_id, value)` tool
  - Implement `navigateToStep(step_id)` tool
  - Implement `openSuggestionModal(type, payload)` tool
  - Add tool execution feedback in UI
  - Handle tool execution errors gracefully

- [ ] Implement state management integration (AC: #2, #8)
  - Integrate CopilotKit state sync with form state
  - Send form state updates to agent in real-time
  - Receive state patches from agent
  - Update form fields based on agent state patches
  - Maintain state consistency
  - Handle state sync conflicts

- [ ] Implement CopilotKit client connection (AC: #8)
  - Connect CopilotKit client to `/api/copilotkit` endpoint
  - Handle WebSocket or SSE connection
  - Implement event stream parsing
  - Handle connection errors and reconnection
  - Add connection status indicators
  - Implement connection recovery

- [ ] Add floating chat button or side panel UI (AC: #1)
  - Implement floating chat button (bottom-right)
  - Or implement collapsible side panel
  - Add open/close animations
  - Ensure responsive design (mobile, tablet, desktop)
  - Add accessibility features (keyboard navigation, ARIA labels)

- [ ] Implement progressive enhancement (AC: #9)
  - Add fallback when CopilotKit is unavailable
  - Show user-friendly error messages
  - Ensure manual campaign creation still works
  - Implement graceful degradation
  - Add feature detection for CopilotKit availability

- [ ] Integrate with campaign creation flow (AC: #2, #5, #7)
  - Add assistant to `/app/campaigns/new/page.tsx`
  - Add assistant to campaign edit pages
  - Integrate with multi-step wizard if applicable
  - Connect to Story 2.2 orchestrator functionality
  - Maintain form state across wizard steps

- [ ] Implement contextual help and answers (AC: #6)
  - Configure agent with campaign setup knowledge
  - Include campaign_type and goal_type in agent context
  - Implement question answering based on current state
  - Add helpful explanations of campaign concepts
  - Provide actionable suggestions

- [ ] Add tool execution feedback (AC: #3, #4, #5)
  - Show visual feedback when tools execute
  - Highlight fields when highlightField is called
  - Show prefill animations when prefillField is called
  - Show navigation feedback when navigateToStep is called
  - Add loading states during tool execution
  - Handle tool execution errors

- [ ] Implement real-time message streaming display (AC: #1)
  - Parse CopilotKit event stream
  - Display messages as they stream
  - Add typing indicators
  - Handle message formatting (markdown, code blocks)
  - Implement message history
  - Add message timestamps

### Technical Summary

This story implements the frontend CopilotKit integration, creating the "Kampánysegéd" (campaign assistant) UI component. The assistant provides real-time, contextual help during manual campaign creation with bi-directional state sync. Frontend tools enable the agent to interact with the UI (prefill fields, highlight, navigate). Progressive enhancement ensures the core functionality works even if CopilotKit is unavailable.

**Key technical decisions:**
- CopilotKit client implementation
- Floating chat button or side panel UI
- Bi-directional state sync with form state
- Frontend tool execution (prefillField, highlightField, navigateToStep)
- Real-time message streaming display
- Progressive enhancement with graceful degradation

**Dependencies:** Story 2.1 (CopilotKit infrastructure) must be complete. Can integrate with Stories 2.2 and 2.3 as they are implemented.

### Project Structure Notes

- **Files to create:**
  - `components/ai/CampaignAssistant.tsx` - CopilotKit wrapper component
  - `components/ai/AssistantChat.tsx` - Streaming chat UI
  - `components/ai/InlineSuggestions.tsx` - Field-level suggestions
  - Update `lib/copilotkit/tools.ts` - Frontend tool definitions and handlers

- **Files to update:**
  - `app/campaigns/new/page.tsx` - Integrate assistant
  - `app/campaigns/[id]/edit/page.tsx` - Integrate assistant (if exists)
  - Campaign form components - Add state sync integration
  - `package.json` - Add CopilotKit client dependencies

- **Expected test locations:** Manual testing
  - Test real-time chat streaming
  - Test state sync and form updates
  - Test frontend tool execution
  - Test contextual help and answers
  - Test orchestrator trigger
  - Test progressive enhancement and fallback
  - Test responsive design
  - Test accessibility features

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Story 2.1 (CopilotKit infrastructure must exist)

### Key Code References

**Existing code to reference:**
- `app/campaigns/new/page.tsx` - Campaign creation flow
- Campaign form components from Epic 1
- Story 2.1 CopilotKit infrastructure (`/api/copilotkit`)
- Story 2.2 orchestrator functionality (if available)

**Reference documentation:**
- CopilotKit documentation
- CopilotKit protocol specification
- WebSocket/SSE patterns for real-time streaming
- React state management patterns
- Progressive enhancement best practices

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Contains:
- Epic 2 CopilotKit frontend integration requirements
- Kampánysegéd concept and UX considerations
- Frontend tool definitions
- State sync approach

**Epic Definition:** [epics.md](../epics.md) - Epic 2: AI-Powered Campaign Orchestration
- Story 2.4 acceptance criteria and technical notes
- Dependencies on Story 2.1
- Success criteria

**Epic Planning:** [epic-2-draft.md](../epic-2-draft.md) - Party mode planning
- Winston's architecture: CopilotKit frontend integration
- Sally's UX: floating chat button, inline suggestions, tool execution feedback
- Amelia's implementation: file structure, dependencies, frontend tools
- John's product strategy: 10x better UX, real-time contextual assistance

---

## Dev Agent Record

### Agent Model Used

_To be filled by Dev Agent during implementation_

### Debug Log References

_To be filled by Dev Agent during implementation_

### Completion Notes

_To be filled when story is complete_

