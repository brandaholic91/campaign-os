# campaign-os - Epic Breakdown

**Date:** 2025-11-20
**Project Level:** quick-flow

---

## Epic 1: Campaign OS Sprint 1 MVP - Manual War Room

**Slug:** campaign-os-sprint1-mvp

### Goal

Build a functional, manual "War Room" tool for communication and social media campaign planning. Enable users to create campaigns, manage audience segments and topics, build message matrices, and track sprints and tasks - all without AI assistance. This MVP establishes the foundation for future AI-powered campaign orchestration.

### Scope

**In Scope:**
- Next.js 15 project initialization with App Router, TypeScript, Tailwind CSS
- Supabase PostgreSQL database schema with 8 core tables
- Campaign CRUD operations (list, create, edit, delete)
- Audience segments and topics management
- Manual message matrix UI (segment × topic combinations)
- Sprint and task board with Kanban-style status management
- Basic dashboard layout with sidebar navigation

**Out of Scope (Sprint 2-3):**
- LLM/AI integration (Campaign Orchestrator agent)
- Content calendar generation
- Risk module
- Export/PDF functionality
- Multi-user/auth system (v1 is single-user)
- Political-specific modules

### Success Criteria

1. ✅ Users can create campaigns with campaign_type, dates, and goal_type
2. ✅ Users can manage audience segments and topics for each campaign
3. ✅ Users can build message matrices by adding messages to segment × topic combinations
4. ✅ Users can create sprints and add tasks with status tracking
5. ✅ All CRUD operations work without errors
6. ✅ Database schema supports campaign-type-independent architecture
7. ✅ Responsive UI works on mobile, tablet, and desktop
8. ✅ No console errors in development mode

### Dependencies

**External:**
- Supabase account and project setup
- Node.js 20.x LTS
- Next.js 15.0.0, React 19.0.0, TypeScript 5.3.0
- Tailwind CSS 3.4.0
- Supabase JS 2.39.0

**Internal:**
- None (greenfield project)

---

## Story Map - Epic 1

```
Foundation Layer
├── Story 1: Project Setup + Database Schema
│   └── Next.js init, Supabase schema, TypeScript types
│
Core Functionality Layer
├── Story 2: Campaign CRUD + Segments/Topics Management
│   └── Campaign operations, audience and topic management
│
User Experience Layer
└── Story 3: Message Matrix + Sprint/Task Board
    └── Message matrix UI, sprint planning, Kanban board
```

---

## Stories - Epic 1

### Story 1.1: Project Setup and Database Schema

As a **developer**,
I want **a properly initialized Next.js project with Supabase database schema**,
So that **I have a solid foundation to build campaign management features on**.

**Acceptance Criteria:**

**Given** I have Node.js 20.x and a Supabase account
**When** I run the project setup commands
**Then** I have a Next.js 15 project with TypeScript, Tailwind CSS, and Supabase client configured

**And** the Supabase database has 8 tables (campaigns, goals, segments, topics, messages, channels, sprints, tasks) with proper foreign keys and constraints

**And** TypeScript types are generated from the database schema

**And** environment variables are properly configured

**Prerequisites:** None (first story)

**Technical Notes:** 
- Use `create-next-app@latest` with TypeScript and App Router
- Install Shadcn/ui for UI components
- Create Supabase migration file with all enum types and tables
- Generate TypeScript types using `supabase gen types`
- Set up path aliases in tsconfig.json

**Estimated Effort:** 3 points (2-3 days)

---

### Story 1.2: Campaign CRUD and Audience Management

As a **campaign manager**,
I want **to create and manage campaigns with audience segments and topics**,
So that **I can organize my campaign planning around specific audiences and messaging themes**.

**Acceptance Criteria:**

**Given** I am on the campaigns page
**When** I create a new campaign with name, campaign_type, dates, and goal_type
**Then** the campaign is saved to the database and appears in the campaign list

**And** I can edit campaign details and delete campaigns

**And** I can add/edit/delete audience segments with demographics and psychographics

**And** I can add/edit/delete topics for the campaign

**And** all CRUD operations work without errors

**Prerequisites:** Story 1.1 (database schema must exist)

**Technical Notes:**
- Implement `/app/campaigns` pages (list, new, [id])
- Create API routes: `/api/campaigns`, `/api/segments`, `/api/topics`
- Use Server Components for data fetching
- Implement form validation
- Use Shadcn/ui form components

**Estimated Effort:** 5 points (3-5 days)

---

### Story 1.3: Message Matrix and Sprint/Task Board

As a **campaign manager**,
I want **to build message matrices and manage sprints with tasks**,
So that **I can plan my campaign messaging and track execution tasks**.

**Acceptance Criteria:**

**Given** I have a campaign with segments and topics
**When** I view the message matrix page
**Then** I see a table with segments as rows and topics as columns

**And** I can add messages to any segment × topic combination

**And** I can create sprints with dates and focus goals

**And** I can add tasks to sprints and change their status (todo → in_progress → done)

**And** the sprint board displays tasks in Kanban columns

**And** all data persists correctly in the database

**Prerequisites:** Story 1.2 (campaigns, segments, topics must exist)

**Technical Notes:**
- Implement message matrix UI with table layout
- Create `/api/messages`, `/api/sprints`, `/api/tasks` endpoints
- Build Kanban board component (3 columns)
- Implement task status updates
- Add proper error handling and loading states

**Estimated Effort:** 5 points (3-5 days)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 13 points

**Estimated Timeline:** 8-13 days (approximately 2-3 weeks with buffer)

**Story Sequence:**
1. Story 1.1: Foundation (must complete first)
2. Story 1.2: Core functionality (depends on 1.1)
3. Story 1.3: User experience (depends on 1.2)

---

## Epic 2: AI-Powered Campaign Orchestration

**Slug:** campaign-os-sprint2-ai-orchestration

### Goal

Introduce AI/LLM capabilities with AG-UI frontend integration to accelerate campaign planning. Enable users to interact with an embedded "kampánysegéd" (campaign assistant) that provides real-time, contextual help during manual campaign creation, or generate complete campaign structures from briefs. This epic transforms the manual "War Room" into an intelligent, AI-assisted campaign planning tool with bi-directional state sync and human-in-the-loop workflows.

### Scope

**In Scope:**
- Anthropic Claude API integration and infrastructure
- AG-UI protocol integration (frontend ↔ backend agent communication)
- Campaign Brief → Structure AI module (goals, segments, topics, narratives)
- AI-powered message matrix generator
- Frontend "kampánysegéd" UI component with real-time streaming chat
- Bi-directional state sync (agent sees form state, can suggest/prefill fields)
- Frontend tool integration (highlightField, prefillField, navigateToStep)
- Error handling and rate limiting for LLM calls
- User approval workflow for AI-generated content
- JSON schema validation for LLM outputs (Zod)

**Out of Scope (Epic 3+):**
- AI-assisted sprint and task planning (Epic 3)
- Full Campaign Orchestrator deep agent (multi-step autonomous planning)
- Content calendar AI generation
- Risk module AI
- RAG/knowledge base integration
- Multi-model LLM support
- Export/PDF functionality
- Advanced AG-UI features (multi-agent, complex workflows)

### Success Criteria

1. ✅ Users can generate campaign structure from a text brief using AI
2. ✅ AI generates goals, segments, topics, and narratives based on campaign_type and goal_type
3. ✅ Users can generate message matrices for selected segment × topic combinations
4. ✅ All AI outputs are previewable and editable before saving
5. ✅ Error handling works for LLM API failures and rate limits
6. ✅ JSON schema validation ensures consistent AI outputs (Zod)
7. ✅ User can approve/reject AI suggestions individually
8. ✅ Zero data corruption from AI hallucinations (schema validation)
9. ✅ AG-UI frontend integration provides real-time streaming chat with campaign assistant
10. ✅ Bi-directional state sync: agent sees form state and can suggest/prefill fields
11. ✅ Frontend tools (highlightField, prefillField, navigateToStep) execute correctly
12. ✅ Kampánysegéd provides contextual help during manual campaign creation

### Dependencies

**External:**
- Anthropic Claude API access and API key
- @anthropic-ai/sdk npm package
- AG-UI protocol implementation (CopilotKit or custom)
- WebSocket or Server-Sent Events for real-time streaming
- Existing Epic 1 functionality (campaigns, segments, topics, messages, sprints, tasks)

**Internal:**
- Epic 1 complete (all stories done)
- Database schema from Epic 1
- Existing API routes and UI components
- Form state management (for AG-UI state sync)

---

## Story Map - Epic 2

```
AI + AG-UI Foundation Layer
├── Story 2.1: LLM + AG-UI Infrastructure
│   └── Anthropic API, AG-UI server, event streaming, state sync
│
AI Campaign Planning Layer
├── Story 2.2: Campaign Brief → Structure AI
│   └── Brief normalizer, strategy designer, DB integration (AG-UI)
│
AI Message Generation Layer
├── Story 2.3: AI Message Matrix Generator
│   └── Message generator, preview/approval workflow (AG-UI)
│
Frontend Integration Layer
└── Story 2.4: AG-UI Frontend Integration
    └── Kampánysegéd UI, real-time chat, frontend tools
```

---

## Stories - Epic 2

### Story 2.1: LLM + AG-UI Infrastructure

As a **developer**,
I want **Anthropic Claude API integration with AG-UI protocol support, error handling, and rate limiting**,
So that **AI features can be reliably implemented with real-time frontend communication on top of a solid foundation**.

**Acceptance Criteria:**

**Given** I have an Anthropic API key
**When** I configure the LLM client and AG-UI server
**Then** the API client is initialized with proper authentication

**And** AG-UI server endpoint handles event streams (input/output)

**And** API calls include error handling for network failures, rate limits, and API errors

**And** rate limiting is implemented to prevent API quota exhaustion

**And** LLM responses are validated against JSON schemas (Zod)

**And** AG-UI event streaming works (WebSocket or SSE)

**And** State sync mechanism allows agent to read/write campaign form state

**And** environment variables are properly secured

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Install @anthropic-ai/sdk, AG-UI dependencies (CopilotKit or custom)
- Create `lib/ai/client.ts` for Anthropic client
- Create `lib/ai/ag-ui/server.ts` for AG-UI server handler
- Implement `lib/ai/schemas.ts` for JSON validation (Zod)
- Implement `lib/ai/ag-ui/events.ts` for AG-UI event types
- Create `/api/ai/stream` endpoint for AG-UI event streaming
- Add error handling utilities
- Environment variables: ANTHROPIC_API_KEY
- Rate limiting: implement simple token bucket or request queue
- State sync: define campaign form state model for AG-UI

**Estimated Effort:** 5 points (3-5 days)

---

### Story 2.2: Campaign Brief → Structure AI

As a **campaign manager**,
I want **to generate campaign structure from a text brief using AI**,
So that **I can quickly set up campaigns without manual data entry**.

**Acceptance Criteria:**

**Given** I am creating a new campaign
**When** I provide a campaign brief (text description) with campaign_type and goal_type
**Then** AI generates goals, segments, topics, and narratives

**And** I can preview the AI-generated structure before saving

**And** I can edit or reject individual AI suggestions

**And** approved items are saved to the database

**And** the AI output respects campaign_type and goal_type parameters

**Prerequisites:** Story 2.1 (LLM integration must exist)

**Technical Notes:**
- Create `/app/campaigns/new/ai` page for AI-assisted campaign creation
- Implement `/api/ai/campaign-brief` endpoint (or AG-UI tool)
- Two-step LLM flow: Brief Normalizer → Strategy Designer
- AG-UI event stream output (messages, state patches, tool calls)
- JSON schema validation for outputs (Zod)
- Preview UI component for AI suggestions
- Integration with existing campaign creation flow
- AG-UI state sync: agent receives current form state
- Frontend tools: agent can call prefillField, highlightField, navigateToStep

**Estimated Effort:** 5 points (3-5 days)

---

### Story 2.3: AI Message Matrix Generator

As a **campaign manager**,
I want **to generate messages for segment × topic combinations using AI**,
So that **I can quickly populate the message matrix with relevant content**.

**Acceptance Criteria:**

**Given** I have a campaign with segments and topics
**When** I select segments and topics and click "Generate Messages"
**Then** AI generates message suggestions for each combination

**And** I can preview all generated messages before saving

**And** I can select which messages to save and which to reject

**And** generated messages respect campaign context (campaign_type, goal_type, narratives)

**And** messages include headline, body, proof_point, and CTA fields

**And** I can regenerate messages if not satisfied

**Prerequisites:** Story 2.2 (campaign structure AI should exist for context)

**Technical Notes:**
- Extend existing MessageMatrix component with AI generation button
- Implement `/api/ai/message-matrix` endpoint (or AG-UI tool)
- LLM prompt includes campaign context, selected segments/topics
- AG-UI event stream for real-time generation progress
- Batch generation with progress indication
- Preview modal with approve/reject per message
- Integration with existing message CRUD
- AG-UI integration: agent can suggest messages via chat or inline

**Estimated Effort:** 5 points (3-5 days)

---

### Story 2.4: AG-UI Frontend Integration (Kampánysegéd)

As a **campaign manager**,
I want **an embedded AI assistant in the campaign creation UI that provides real-time help and suggestions**,
So that **I can get contextual assistance while manually creating campaigns, with the agent understanding my current progress and form state**.

**Acceptance Criteria:**

**Given** I am creating or editing a campaign
**When** I interact with the kampánysegéd (campaign assistant)
**Then** I see a real-time streaming chat interface

**And** the assistant can see my current form state (campaign_type, goal_type, filled fields)

**And** the assistant can suggest field values and I can accept/reject them

**And** the assistant can highlight fields that need attention

**And** the assistant can navigate me to relevant wizard steps

**And** I can ask questions about campaign setup and get contextual answers

**And** the assistant can trigger the deep campaign orchestrator agent when I request full campaign generation

**And** all AI interactions happen via AG-UI protocol with bi-directional state sync

**Prerequisites:** Story 2.1 (AG-UI infrastructure must exist)

**Technical Notes:**
- Install CopilotKit or implement custom AG-UI client
- Create `components/ai/CampaignAssistant.tsx` - main AG-UI wrapper
- Create `components/ai/AssistantChat.tsx` - streaming chat UI
- Create `components/ai/InlineSuggestions.tsx` - field-level suggestions
- Implement frontend tools: highlightField, prefillField, navigateToStep, openSuggestionModal
- AG-UI client connects to `/api/ai/stream` endpoint
- State management integration (form state sync with AG-UI)
- Real-time message streaming display
- Tool execution feedback in UI
- Floating chat button or side panel UI
- Progressive enhancement: works without AG-UI (fallback)

**Estimated Effort:** 5 points (3-5 days)

---

## Implementation Timeline - Epic 2

**Total Story Points:** 20 points (increased from 13 due to AG-UI integration)

**Estimated Timeline:** 15-20 days (approximately 3-4 weeks with buffer)

**Story Sequence:**
1. Story 2.1: LLM + AG-UI Foundation (must complete first - critical path)
2. Story 2.2: Campaign Brief AI (depends on 2.1, uses AG-UI)
3. Story 2.3: Message Generator (depends on 2.1, uses AG-UI, benefits from 2.2 context)
4. Story 2.4: Frontend Integration (depends on 2.1, integrates with 2.2 and 2.3)

**Notes:**
- Story 2.1 is critical path - AG-UI foundation required for all AI features
- Stories 2.2 and 2.3 can work in parallel after 2.1, but both use AG-UI protocol
- Story 2.4 should start after 2.1, can integrate incrementally with 2.2 and 2.3
- AI features require careful prompt engineering and iteration
- Foundation-first approach: Story 2.1 establishes AG-UI + LLM patterns
- Preview + approve workflow maintains user control
- Bi-directional state sync enables contextual assistance
- Frontend tool integration provides seamless UX
- Sprint Planner AI deferred to Epic 3 (lower priority)
- AG-UI enables future multi-frontend support (admin panel, mobile app)

---

