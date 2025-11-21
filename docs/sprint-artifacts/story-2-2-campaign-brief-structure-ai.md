# Story 2.2: Campaign Brief → Structure AI

**Status:** drafted

---

## User Story

As a **campaign manager**,
I want **to generate campaign structure from a text brief using AI**,
So that **I can quickly set up campaigns without manual data entry**.

---

## Acceptance Criteria

**AC #1:** AI generates campaign structure from text brief
- **Given** I am creating a new campaign
- **When** I provide a campaign brief (text description) with campaign_type and goal_type
- **Then** AI generates goals, segments, topics, and narratives
- **And** the AI output respects campaign_type and goal_type parameters
- **And** generated structure is contextually relevant to the brief

**AC #2:** Preview AI-generated structure before saving
- **Given** AI has generated campaign structure
- **When** I view the preview
- **Then** I can see all generated items (goals, segments, topics, narratives)
- **And** items are displayed in an organized, reviewable format
- **And** I can see which items are AI-generated vs manually added

**AC #3:** Edit or reject individual AI suggestions
- **Given** AI has generated campaign structure
- **When** I review the suggestions
- **Then** I can edit individual items
- **And** I can reject items I don't want
- **And** I can select which items to save
- **And** changes are reflected in the preview

**AC #4:** Approved items saved to database
- **Given** I have approved AI-generated items
- **When** I click "Save Selected"
- **Then** approved goals are saved to the database
- **And** approved segments are saved to the database
- **And** approved topics are saved to the database
- **And** narratives are associated with the campaign
- **And** I am redirected to campaign detail page

**AC #5:** AI output via AG-UI event stream
- **Given** Story 2.1 infrastructure exists
- **When** I trigger AI campaign generation
- **Then** AI output is streamed via AG-UI events
- **And** I see real-time progress (Brief Normalizer → Strategy Designer → Done)
- **And** agent messages are displayed in real-time
- **And** state patches update the form as AI generates content

**AC #6:** JSON schema validation ensures data quality
- **Given** AI generates structured output
- **When** responses are received
- **Then** outputs are validated against Zod schemas
- **And** invalid outputs are rejected with clear errors
- **And** only valid, type-safe data is saved to database
- **And** zero data corruption from AI hallucinations

**AC #7:** AG-UI state sync enables contextual assistance
- **Given** I am in the campaign creation flow
- **When** AI agent is active
- **Then** agent receives current form state (campaign_type, goal_type, filled fields)
- **And** agent can call frontend tools (prefillField, highlightField, navigateToStep)
- **And** agent suggestions are contextually relevant to my progress

---

## Implementation Details

### Tasks / Subtasks

- [ ] Create AI-assisted campaign creation page (AC: #1, #2, #3)
  - Create `/app/campaigns/new/ai` page
  - Add "Create with AI" entry point on campaigns page
  - Implement brief input UI (large textarea + campaign_type/goal_type selectors)
  - Add loading state with progress indication
  - Implement preview UI component (accordion/card layout)

- [ ] Implement `/api/ai/campaign-brief` endpoint or AG-UI tool (AC: #1, #5)
  - Create API route or AG-UI tool handler
  - Implement two-step LLM flow: Brief Normalizer → Strategy Designer
  - Add prompt templates in `lib/ai/prompts/brief-normalizer.ts`
  - Add prompt templates in `lib/ai/prompts/strategy-designer.ts`
  - Integrate with Anthropic client from Story 2.1
  - Stream output via AG-UI events

- [ ] Implement Brief Normalizer LLM step (AC: #1)
  - Create prompt template for brief normalization
  - Extract key information from unstructured brief
  - Identify campaign_type and goal_type if not provided
  - Output structured brief summary
  - Validate output with Zod schema

- [ ] Implement Strategy Designer LLM step (AC: #1)
  - Create prompt template for strategy design
  - Generate goals based on campaign_type and goal_type
  - Generate segments (audience demographics/psychographics)
  - Generate topics (message themes)
  - Generate narratives (key messaging)
  - Include campaign context in prompt
  - Validate output with Zod schema

- [ ] Implement preview UI component (AC: #2, #3)
  - Create `components/ai/CampaignStructurePreview.tsx`
  - Display goals, segments, topics, narratives
  - Add approve/reject checkboxes per item
  - Add edit functionality for individual items
  - Show AI-generated vs manual distinction
  - Implement "Save Selected" CTA

- [ ] Implement approval workflow (AC: #3, #4)
  - Add selection state management
  - Implement save logic for approved items
  - Create database transactions for atomic saves
  - Handle goals, segments, topics, narratives creation
  - Add success feedback and redirect
  - Handle partial saves (some items approved, some rejected)

- [ ] Integrate with existing campaign creation flow (AC: #4)
  - Connect to existing campaign CRUD API
  - Use existing segment/topic creation endpoints
  - Maintain data consistency with Epic 1 schema
  - Handle foreign key relationships
  - Add proper error handling

- [ ] Implement AG-UI event streaming (AC: #5)
  - Connect to `/api/ai/stream` endpoint from Story 2.1
  - Display real-time agent messages
  - Show progress indicators (Brief → Structure → Done)
  - Handle state patch events
  - Update UI as AI generates content
  - Add loading states and error handling

- [ ] Implement JSON schema validation (AC: #6)
  - Define Zod schemas for campaign structure output
  - Add validation in `lib/ai/schemas.ts`
  - Validate goals, segments, topics, narratives
  - Reject invalid outputs with clear errors
  - Log validation failures for debugging
  - Retry on validation failure if appropriate

- [ ] Implement AG-UI state sync (AC: #7)
  - Send current form state to agent
  - Include campaign_type, goal_type, filled fields
  - Implement frontend tool handlers (prefillField, highlightField, navigateToStep)
  - Handle tool execution feedback
  - Update UI based on agent tool calls

- [ ] Add error handling and fallback (AC: #1, #5)
  - Handle AI API failures gracefully
  - Show "AI temporarily unavailable, create manually" message
  - Provide fallback to manual campaign creation
  - Handle empty AI results
  - Add retry logic for transient failures

### Technical Summary

This story implements AI-powered campaign structure generation from a text brief. The two-step LLM flow (Brief Normalizer → Strategy Designer) ensures high-quality, contextually relevant outputs. AG-UI integration provides real-time streaming and bi-directional state sync. Preview + approve workflow maintains user control while accelerating campaign setup from 30+ minutes to under 5 minutes.

**Key technical decisions:**
- Two-step LLM flow for better output quality
- AG-UI event streaming for real-time UX
- Zod schema validation to prevent hallucinations
- Preview + approve workflow (not auto-save)
- Integration with existing Epic 1 database schema
- Frontend tool integration for contextual assistance

**Dependencies:** Story 2.1 (LLM + AG-UI Infrastructure) must be complete

### Project Structure Notes

- **Files to create:**
  - `app/campaigns/new/ai/page.tsx` - AI-assisted campaign creation page
  - `components/ai/CampaignStructurePreview.tsx` - Preview component
  - `lib/ai/prompts/brief-normalizer.ts` - Brief normalization prompt
  - `lib/ai/prompts/strategy-designer.ts` - Strategy design prompt
  - `app/api/ai/campaign-brief/route.ts` - API endpoint (if not using AG-UI tools)
  - Update `lib/ai/schemas.ts` - Add campaign structure schemas

- **Files to update:**
  - `app/campaigns/page.tsx` - Add "Create with AI" button
  - `lib/ai/ag-ui/tools.ts` - Add campaign-brief tool (if using AG-UI tools)
  - Existing campaign, segment, topic API routes - Handle AI-generated data

- **Expected test locations:** Manual testing
  - Test brief input and AI generation
  - Test preview and approval workflow
  - Test database saves
  - Test AG-UI event streaming
  - Test error handling and fallback
  - Test state sync and frontend tools

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Story 2.1 (LLM integration must exist)

### Key Code References

**Existing code to reference:**
- `app/campaigns/new/page.tsx` - Manual campaign creation flow
- `app/api/campaigns/route.ts` - Campaign CRUD API
- `app/api/segments/route.ts` - Segment CRUD API
- `app/api/topics/route.ts` - Topic CRUD API
- Epic 1 database schema for data model
- Story 2.1 AG-UI infrastructure

**Reference documentation:**
- Anthropic Claude API: structured outputs, streaming
- AG-UI protocol: event streaming, state sync, tools
- Zod: schema validation, type inference
- Prompt engineering best practices

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Contains:
- Epic 2 AI requirements
- Campaign structure data model
- AG-UI integration approach
- Database schema from Epic 1

**Epic Definition:** [epics.md](../epics.md) - Epic 2: AI-Powered Campaign Orchestration
- Story 2.2 acceptance criteria and technical notes
- Dependencies on Story 2.1
- Success criteria

**Epic Planning:** [epic-2-draft.md](../epic-2-draft.md) - Party mode planning
- Winston's architecture: two-step LLM flow (Brief Normalizer → Strategy Designer)
- Mary's requirements: Zod validation, preview + approve workflow
- Sally's UX: brief input, preview UI, approval flow
- John's product strategy: 10x speedup, >80% approval rate

---

## Dev Agent Record

### Agent Model Used

_To be filled by Dev Agent during implementation_

### Debug Log References

_To be filled by Dev Agent during implementation_

### Completion Notes

_To be filled when story is complete_

