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

Introduce AI/LLM capabilities with CopilotKit frontend integration to accelerate campaign planning. Enable users to interact with an embedded "kampánysegéd" (campaign assistant) that provides real-time, contextual help during manual campaign creation, or generate complete campaign structures from briefs. This epic transforms the manual "War Room" into an intelligent, AI-assisted campaign planning tool with bi-directional state sync and human-in-the-loop workflows.

### Scope

**In Scope:**
- Anthropic Claude API integration and infrastructure
- CopilotKit protocol integration (frontend ↔ backend agent communication)
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
- Advanced CopilotKit features (multi-agent, complex workflows)

### Success Criteria

1. ✅ Users can generate campaign structure from a text brief using AI
2. ✅ AI generates goals, segments, topics, and narratives based on campaign_type and goal_type
3. ✅ Users can generate message matrices for selected segment × topic combinations
4. ✅ All AI outputs are previewable and editable before saving
5. ✅ Error handling works for LLM API failures and rate limits
6. ✅ JSON schema validation ensures consistent AI outputs (Zod)
7. ✅ User can approve/reject AI suggestions individually
8. ✅ Zero data corruption from AI hallucinations (schema validation)
9. ✅ CopilotKit frontend integration provides real-time streaming chat with campaign assistant
10. ✅ Bi-directional state sync: agent sees form state and can suggest/prefill fields
11. ✅ Frontend tools (highlightField, prefillField, navigateToStep) execute correctly
12. ✅ Kampánysegéd provides contextual help during manual campaign creation

### Dependencies

**External:**
- Anthropic Claude API access and API key
- @anthropic-ai/sdk npm package
- CopilotKit protocol implementation (CopilotKit or custom)
- WebSocket or Server-Sent Events for real-time streaming
- Existing Epic 1 functionality (campaigns, segments, topics, messages, sprints, tasks)

**Internal:**
- Epic 1 complete (all stories done)
- Database schema from Epic 1
- Existing API routes and UI components
- Form state management (for CopilotKit state sync)

---

## Story Map - Epic 2

```
AI + CopilotKit Foundation Layer
├── Story 2.1: LLM + CopilotKit Infrastructure
│   └── Anthropic API, CopilotKit server, event streaming, state sync
│
AI Campaign Planning Layer
├── Story 2.2: Campaign Brief → Structure AI
│   └── Brief normalizer, strategy designer, DB integration (CopilotKit)
│
AI Message Generation Layer
├── Story 2.3: AI Message Matrix Generator
│   └── Message generator, preview/approval workflow (CopilotKit)
│
Frontend Integration Layer
└── Story 2.4: CopilotKit Frontend Integration
    └── Kampánysegéd UI, real-time chat, frontend tools
```

---

## Stories - Epic 2

### Story 2.1: LLM + CopilotKit Infrastructure

As a **developer**,
I want **Anthropic Claude API integration with CopilotKit protocol support, error handling, and rate limiting**,
So that **AI features can be reliably implemented with real-time frontend communication on top of a solid foundation**.

**Acceptance Criteria:**

**Given** I have an Anthropic API key
**When** I configure the LLM client and CopilotKit server
**Then** the API client is initialized with proper authentication

**And** CopilotKit server endpoint handles event streams (input/output)

**And** API calls include error handling for network failures, rate limits, and API errors

**And** rate limiting is implemented to prevent API quota exhaustion

**And** LLM responses are validated against JSON schemas (Zod)

**And** CopilotKit event streaming works (WebSocket or SSE)

**And** State sync mechanism allows agent to read/write campaign form state

**And** environment variables are properly secured

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Install @anthropic-ai/sdk, CopilotKit dependencies
- Create `lib/ai/client.ts` for Anthropic client
- Create `lib/ai/copilotkit/server.ts` for CopilotKit runtime configuration (CopilotRuntime, AnthropicAdapter, actions)
- Create `app/api/copilotkit/route.ts` for CopilotKit endpoint (HTTP handler, rate limiting, error handling)
- Implement `lib/ai/schemas.ts` for JSON validation (Zod)
- Add error handling utilities
- Environment variables: ANTHROPIC_API_KEY
- Rate limiting: implement simple token bucket or request queue
- State sync: define campaign form state model for CopilotKit
- Note: `lib/ai/copilotkit/server.ts` contains CopilotRuntime configuration for reusability and testability

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
- Implement `/api/ai/campaign-brief` endpoint (or CopilotKit tool)
- Two-step LLM flow: Brief Normalizer → Strategy Designer
- CopilotKit event stream output (messages, state patches, tool calls)
- JSON schema validation for outputs (Zod)
- Preview UI component for AI suggestions
- Integration with existing campaign creation flow
- CopilotKit state sync: agent receives current form state
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

**Prerequisites:** Story 2.1 (LLM + CopilotKit Infrastructure) must be complete. Story 2.2 provides campaign context patterns but not strictly required.

**Technical Notes:**
- Extend existing MessageMatrix component with AI generation button
- Implement `/api/ai/message-matrix` endpoint (or CopilotKit tool)
- LLM prompt includes campaign context, selected segments/topics
- CopilotKit event stream for real-time generation progress
- Batch generation with progress indication
- Preview modal with approve/reject per message
- Integration with existing message CRUD
- CopilotKit integration: agent can suggest messages via chat or inline

**Estimated Effort:** 5 points (3-5 days)

---

### Story 2.4: CopilotKit Frontend Integration (Kampánysegéd)

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

**And** all AI interactions happen via CopilotKit protocol with bi-directional state sync

**Prerequisites:** Story 2.1 (CopilotKit infrastructure must exist)

**Technical Notes:**
- Install CopilotKit or implement custom CopilotKit client
- Create `components/ai/CampaignAssistant.tsx` - main CopilotKit wrapper
- Create `components/ai/AssistantChat.tsx` - streaming chat UI
- Create `components/ai/InlineSuggestions.tsx` - field-level suggestions
- Implement frontend tools: highlightField, prefillField, navigateToStep, openSuggestionModal
- CopilotKit client connects to `/api/copilotkit` endpoint
- State management integration (form state sync with CopilotKit)
- Real-time message streaming display
- Tool execution feedback in UI
- Floating chat button or side panel UI
- Progressive enhancement: works without CopilotKit (fallback)

**Estimated Effort:** 5 points (3-5 days)

---

## Implementation Timeline - Epic 2

**Total Story Points:** 20 points (increased from 13 due to CopilotKit integration)

**Estimated Timeline:** 15-20 days (approximately 3-4 weeks with buffer)

**Story Sequence:**
1. Story 2.1: LLM + CopilotKit Foundation (must complete first - critical path)
2. Story 2.2: Campaign Brief AI (depends on 2.1, uses CopilotKit)
3. Story 2.3: Message Generator (depends on 2.1, uses CopilotKit, benefits from 2.2 context)
4. Story 2.4: Frontend Integration (depends on 2.1, integrates with 2.2 and 2.3)

**Notes:**
- Story 2.1 is critical path - CopilotKit foundation required for all AI features
- Stories 2.2 and 2.3 can work in parallel after 2.1, but both use CopilotKit protocol
- Story 2.4 should start after 2.1, can integrate incrementally with 2.2 and 2.3
- AI features require careful prompt engineering and iteration
- Foundation-first approach: Story 2.1 establishes CopilotKit + LLM patterns
- Preview + approve workflow maintains user control
- Bi-directional state sync enables contextual assistance
- Frontend tool integration provides seamless UX
- Sprint Planner AI deferred to Epic 3 (lower priority)
- CopilotKit enables future multi-frontend support (admin panel, mobile app)

---

## Epic 3.0: Message Matrix Refactor - Communication Strategies

**Slug:** campaign-os-epic3-message-matrix-refactor

### Goal

Refactor the Message Matrix from concrete messages to communication strategies. The matrix should define *how* to communicate each topic to each segment (tone, guidelines, key messages), not generate specific message content. Concrete messages will be generated later in the Content Calendar based on these strategies, ensuring consistent messaging across all generated content.

### Scope

**In Scope:**
- New `message_strategies` database table with JSONB structure (4 main categories, 16 sub-fields)
- Message Matrix UI refactor: display communication strategies instead of concrete messages
- Strategy preview cards (short AI-generated summary, editable) + detail modal (full strategy)
- Strategy AI Generator: generate complete communication strategies for segment × topic combinations
- Strategy CRUD operations: create, edit, view, delete strategies
- Strategy form with 4 main sections (Strategy Core, Style & Tone, CTA & Funnel, Extra Fields)
- Migration: existing `messages` table remains for Content Calendar use
- Zod schema validation for strategy JSONB structure

**Out of Scope (Epic 3.1+):**
- Content Calendar AI generation (Epic 3.1)
- Sprint/Task Planning AI (Epic 3.2)
- Risk module AI
- Strategy versioning/history

### Success Criteria

1. ✅ Users can create communication strategies for segment × topic combinations
2. ✅ Strategy contains 4 main categories: Strategy Core, Style & Tone, CTA & Funnel, Extra Fields
3. ✅ AI generates complete strategies (16 sub-fields) for selected segment × topic combinations
4. ✅ Preview cards show short summary (AI-generated, editable) in matrix cells
5. ✅ Detail modal displays full strategy with all 16 sub-fields
6. ✅ Strategy form allows editing all strategy fields organized by category
7. ✅ One strategy per cell (segment × topic) - UNIQUE constraint enforced
8. ✅ All strategy data validated against Zod schemas
9. ✅ Existing `messages` table remains functional for Content Calendar use
10. ✅ Migration preserves backward compatibility

### Dependencies

**External:**
- Epic 2 complete (LLM infrastructure, CopilotKit)
- Anthropic Claude API (reuse from Epic 2)
- Existing Epic 1-2 functionality (campaigns, segments, topics, messages)

**Internal:**
- Epic 2 complete (all stories done)
- Database schema from Epic 1-2
- Existing MessageMatrix component (to be refactored)
- Story 2.3 AI Message Generator (to be refactored to Strategy Generator)

---

## Story Map - Epic 3.0

```
Database Migration Layer
├── Story 3.0.1: Database Migration + Schema
│   └── message_strategies table, Zod schemas, migration script
│
UI Refactor Layer
├── Story 3.0.2: Message Matrix Refactor (UI)
│   └── Strategy cells, preview cards, detail modal
│
AI Generation Layer
├── Story 3.0.3: Strategy AI Generator
│   └── Strategy generator (refactor Story 2.3), prompt template, 16-field output
│
CRUD Operations Layer
└── Story 3.0.4: Strategy Form + CRUD
    └── Strategy form (4 sections), API endpoints, edit/create workflow
```

---

## Stories - Epic 3.0

### Story 3.0.1: Database Migration + Schema

As a **developer**,
I want **a new `message_strategies` table with JSONB structure and Zod validation schemas**,
So that **communication strategies can be stored and validated properly**.

**Acceptance Criteria:**

**Given** I have Epic 2 database schema
**When** I run the migration
**Then** the `message_strategies` table is created with:
- campaign_id, segment_id, topic_id (with UNIQUE constraint)
- strategy_core JSONB (5 sub-fields)
- style_tone JSONB (4 sub-fields)
- cta_funnel JSONB (4 sub-fields)
- extra_fields JSONB (3 sub-fields, optional)
- preview_summary TEXT (AI-generated, editable)

**And** Zod schemas are defined for all JSONB structures

**And** TypeScript types are generated from the schema

**And** existing `messages` table remains unchanged (for Content Calendar use)

**Prerequisites:** Epic 2 complete

**Technical Notes:**
- Create migration: `supabase/migrations/YYYYMMDD_message_strategies.sql`
  - Use actual date format: `20251121_message_strategies.sql` (or current date)
  - Create `message_strategies` table with:
    - id (UUID, primary key, default uuid_generate_v4())
    - campaign_id (UUID, NOT NULL, FK to campaigns, ON DELETE CASCADE)
    - segment_id (UUID, NOT NULL, FK to segments, ON DELETE CASCADE)
    - topic_id (UUID, NOT NULL, FK to topics, ON DELETE CASCADE)
    - strategy_core (JSONB, NOT NULL)
    - style_tone (JSONB, NOT NULL)
    - cta_funnel (JSONB, NOT NULL)
    - extra_fields (JSONB, nullable)
    - preview_summary (TEXT, nullable)
    - created_at (TIMESTAMPTZ, default NOW())
    - updated_at (TIMESTAMPTZ, default NOW())
    - UNIQUE constraint on (campaign_id, segment_id, topic_id)
  - Create index: `CREATE INDEX idx_message_strategies_campaign ON message_strategies(campaign_id);`
  - Create trigger for updated_at: automatic timestamp update on row change
- Define JSONB structure for 4 main categories (16 sub-fields total):
  - Strategy Core (5 fields): positioning_statement, core_message, supporting_messages[], proof_points[], objections_reframes[]?
  - Style & Tone (4 fields): tone_profile{description, keywords[]}, language_style, communication_guidelines{do[], dont[]}, emotional_temperature
  - CTA & Funnel (4 fields): funnel_stage, cta_objectives[], cta_patterns[], friction_reducers[]?
  - Extra Fields (3 fields, optional): framing_type?, key_phrases[]?, risk_notes?
- Create Zod schemas in `lib/ai/schemas.ts`:
  - `StrategyCoreSchema`: z.object with positioning_statement (min 10 chars), core_message (min 5 chars), supporting_messages (array, min 3, max 5), proof_points (array, min 2, max 3), objections_reframes (optional array)
  - `StyleToneSchema`: z.object with tone_profile{description, keywords (array, min 3, max 5)}, language_style (string), communication_guidelines{do (array), dont (array)}, emotional_temperature (string)
  - `CTAFunnelSchema`: z.object with funnel_stage (enum: awareness/consideration/conversion/mobilization), cta_objectives (array), cta_patterns (array, min 2, max 3), friction_reducers (optional array)
  - `ExtraFieldsSchema`: z.object with framing_type (optional string), key_phrases (optional array), risk_notes (optional string)
  - `MessageStrategySchema`: z.object combining all 4 categories (strategy_core, style_tone, cta_funnel, extra_fields?, preview_summary?)
- Generate TypeScript types: `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
  - Verify `message_strategies` table types are generated
  - Export types if needed for use in components
- Test migration:
  - Run migration on local Supabase instance
  - Verify table structure matches spec
  - Test UNIQUE constraint (try inserting duplicate strategy)
  - Test CASCADE delete (delete campaign, verify strategies deleted)
  - Test JSONB structure validation

**Estimated Effort:** 5 points (2-3 days)

---

### Story 3.0.2: Message Matrix Refactor (UI)

As a **campaign manager**,
I want **to see communication strategies in the message matrix instead of concrete messages**,
So that **I can plan how to communicate each topic to each segment before generating specific content**.

**Acceptance Criteria:**

**Given** I have a campaign with segments and topics
**When** I view the message matrix page
**Then** I see a table with segments as rows and topics as columns

**And** each cell shows either:
- Empty state: "Nincs stratégia" + "Generate Strategy" button
- Strategy preview card: short summary (positioning statement + core message + tone keywords + funnel stage badge)

**And** when I click a cell with strategy, a detail modal opens showing:
- Full strategy with all 4 categories (tabs or accordion)
- "Edit Strategy" button
- All 16 sub-fields visible and readable

**And** when I click an empty cell, a "Create Strategy" form opens

**And** the UI is responsive and works on mobile, tablet, desktop

**Prerequisites:** Story 3.0.1 (database schema must exist)

**Technical Notes:**
- Refactor `components/messages/MessageMatrix.tsx`:
  - Replace message display with strategy display
  - Update cell rendering logic to use StrategyCell component
  - Fetch strategies from `/api/strategies?campaign_id=...` instead of messages
- Create new components:
  - `components/messages/StrategyCell.tsx` - cell component with preview card or empty state
  - `components/messages/StrategyPreviewCard.tsx` - short summary card component
  - `components/messages/StrategyDetailModal.tsx` - full strategy view modal (4 sections)
- Update `/app/campaigns/[id]/messages/page.tsx` to fetch strategies instead of messages
- Strategy preview card content:
  - Positioning statement (first 1-2 sentences, truncated with ellipsis)
  - Core message (1 sentence, bold text)
  - Tone keywords (badges: "közvetlen", "őszinte", etc. from tone_profile.keywords)
  - Funnel stage badge ("awareness", "consideration", "conversion", "mobilization")
- Detail modal structure:
  - Tabs or accordion for 4 main categories: "Stratégiai mag", "Stílus/tónus", "CTA/funnel", "Extra"
  - All 16 sub-fields visible and readable
  - "Edit Strategy" button that opens StrategyForm in edit mode
  - "Delete Strategy" button with confirmation
- Empty state handling:
  - Show "Nincs stratégia" text
  - "Generate Strategy" button (triggers AI generation - Story 3.0.3)
  - "Create Strategy" button (opens manual form - Story 3.0.4)
- Responsive design: mobile, tablet, desktop layouts
- Loading states and error handling

**Estimated Effort:** 5 points (3-4 days)

---

### Story 3.0.3: Strategy AI Generator

As a **campaign manager**,
I want **to generate communication strategies for segment × topic combinations using AI**,
So that **I can quickly define how to communicate each topic to each segment without manual planning**.

**Acceptance Criteria:**

**Given** I have a campaign with segments and topics
**When** I select segments and topics and click "Generate Strategies"
**Then** AI generates complete communication strategies for each combination

**And** each strategy includes all 16 sub-fields across 4 categories:
- Strategy Core (5 fields)
- Style & Tone (4 fields)
- CTA & Funnel (4 fields)
- Extra Fields (3 fields, optional)

**And** I can preview all generated strategies before saving

**And** I can select which strategies to save and which to reject

**And** generated strategies respect campaign context (campaign_type, goal_type, narratives)

**And** AI also generates preview_summary for each strategy (editable)

**And** I can regenerate strategies if not satisfied

**Prerequisites:** Story 3.0.1 (database schema), Story 2.1 (LLM infrastructure)

**Technical Notes:**
- Refactor Story 2.3: `/api/ai/message-matrix` → `/api/ai/strategy-matrix`
  - Keep existing endpoint pattern but change output structure
  - Update request body to include campaign_id, selected segment_ids, topic_ids
- Create prompt template: `lib/ai/prompts/strategy-generator.ts`
  - Single LLM call with structured JSON output (16 fields across 4 categories)
  - Prompt includes:
    - Campaign context (campaign_type, goal_type, narratives from campaigns table)
    - Segment details (name, description, demographics, psychographics)
    - Topic details (name, description, category)
    - Instructions for all 16 sub-fields with examples
    - Format requirements for each field
- Zod schema validation: `MessageStrategySchema` from Story 3.0.1
  - Validate each generated strategy before saving
  - Return validation errors if LLM output doesn't match schema
- CopilotKit event stream for real-time generation progress
  - Stream generation status for each segment × topic combination
  - Show progress: "Generating strategy for Segment X × Topic Y..."
  - Stream completed strategies as they're generated
- Batch generation with progress indication
  - Generate strategies for all selected combinations in parallel (if API allows) or sequentially
  - Show progress bar: "Generated 3 of 12 strategies"
  - Allow cancellation mid-generation
- Preview modal with approve/reject per strategy
  - Display all generated strategies in a scrollable list
  - Each strategy shows: preview card + "Approve" / "Reject" buttons
  - Bulk actions: "Approve All", "Reject All", "Approve Selected"
  - Selected strategies are saved to database via `/api/strategies` endpoint
- Preview summary generation: AI creates short summary from strategy_core
  - Extract: positioning_statement (first 1-2 sentences) + core_message + tone keywords + funnel stage
  - Format: "Positioning: [statement]. Core: [message]. Tone: [keywords]. Stage: [funnel_stage]"
  - Summary is editable after generation
- Integration with existing strategy CRUD (Story 3.0.4)
  - Use POST `/api/strategies` to save approved strategies
  - Handle UNIQUE constraint errors (strategy already exists for segment × topic)
  - Show success/error notifications
- Error handling:
  - LLM API failures: show user-friendly error, allow retry
  - Rate limiting: queue requests or show wait message
  - Schema validation errors: log error, show message, allow regeneration
- Regeneration: "Regenerate Strategy" button for individual strategies

**Estimated Effort:** 8 points (4-5 days, complex prompt engineering)

---

### Story 3.0.4: Strategy Form + CRUD

As a **campaign manager**,
I want **to create and edit communication strategies manually**,
So that **I can fine-tune AI-generated strategies or create custom strategies without AI**.

**Acceptance Criteria:**

**Given** I am on the message matrix page
**When** I click an empty cell or "Edit Strategy" on an existing strategy
**Then** a strategy form opens with 4 main sections:
- Strategy Core (positioning statement, core message, supporting messages, proof points, objections/reframes)
- Style & Tone (tone profile, language style, communication guidelines, emotional temperature)
- CTA & Funnel (funnel stage, CTA objectives, CTA patterns, friction reducers)
- Extra Fields (framing type, key phrases, risk notes)

**And** I can fill in all fields (required fields validated)

**And** I can save the strategy to the database

**And** I can edit existing strategies

**And** I can delete strategies

**And** preview_summary is auto-generated from strategy_core (editable)

**And** all strategy data is validated against Zod schemas before saving

**Prerequisites:** Story 3.0.1 (database schema), Story 3.0.2 (UI components)

**Technical Notes:**
- Create `/api/strategies` endpoints:
  - GET `/api/strategies?campaign_id=...` - list all strategies for a campaign
    - Returns array of strategies with segment and topic details (JOIN)
  - POST `/api/strategies` - create new strategy
    - Request body: { campaign_id, segment_id, topic_id, strategy_core, style_tone, cta_funnel, extra_fields?, preview_summary? }
    - Validate against MessageStrategySchema before saving
    - Handle UNIQUE constraint violation (strategy already exists)
  - GET `/api/strategies/[id]` - get single strategy by ID
    - Include segment and topic details in response
  - PUT `/api/strategies/[id]` - update existing strategy
    - Validate against MessageStrategySchema
    - Update updated_at timestamp
  - DELETE `/api/strategies/[id]` - delete strategy
    - Cascade handled by database (no additional logic needed)
- Create `components/messages/StrategyForm.tsx`:
  - Props: `campaignId`, `segmentId`, `topicId`, `initialData?` (for edit mode), `onSave`, `onCancel`
  - 4 main sections (accordion or tabs): "Stratégiai mag", "Stílus/tónus", "CTA/funnel", "Extra"
  - Multi-input fields:
    - `supporting_messages`: array of text inputs with "Add" / "Remove" buttons (min 3, max 5)
    - `proof_points`: array of text inputs with "Add" / "Remove" buttons (min 2, max 3)
    - `objections_reframes`: optional array of text inputs
    - `tone_profile.keywords`: array of text inputs (min 3, max 5)
    - `cta_objectives`: array of text inputs
    - `cta_patterns`: array of text inputs (min 2, max 3)
    - `communication_guidelines`: two-column layout (Do / Don't lists) with add/remove rows
    - `key_phrases`: optional array of text inputs
  - Form validation using Zod schemas:
    - Validate each section independently
    - Show field-level error messages
    - Disable submit until all required fields valid
  - Preview summary editor:
    - Auto-generate from strategy_core on change (or button "Generate Summary")
    - Editable textarea
    - Character count display
  - Form actions: "Save Strategy" (primary), "Cancel" (secondary), "Delete" (danger, edit mode only)
- Create form section components:
  - `components/messages/StrategyFormSections/StrategyCoreSection.tsx`
    - Fields: positioning_statement (textarea), core_message (textarea), supporting_messages (dynamic array), proof_points (dynamic array), objections_reframes (optional dynamic array)
  - `components/messages/StrategyFormSections/StyleToneSection.tsx`
    - Fields: tone_profile.description (textarea), tone_profile.keywords (dynamic array), language_style (textarea), communication_guidelines (two-column Do/Don't lists), emotional_temperature (select)
  - `components/messages/StrategyFormSections/CTAFunnelSection.tsx`
    - Fields: funnel_stage (select: awareness/consideration/conversion/mobilization), cta_objectives (dynamic array), cta_patterns (dynamic array, min 2, max 3), friction_reducers (optional dynamic array)
  - `components/messages/StrategyFormSections/ExtraFieldsSection.tsx`
    - Fields: framing_type (select, optional), key_phrases (optional dynamic array), risk_notes (optional textarea)
- Integration with StrategyDetailModal (edit mode):
  - Modal has "Edit Strategy" button that opens StrategyForm in a dialog
  - Form pre-populated with existing strategy data
  - On save: update strategy via PUT `/api/strategies/[id]`, refresh modal view
- Integration with MessageMatrix (create mode):
  - Empty cell click → opens StrategyForm dialog
  - Form requires campaign_id, segment_id, topic_id (pre-filled from cell context)
  - On save: create strategy via POST `/api/strategies`, refresh matrix
- Error handling:
  - Network errors: show toast notification
  - Validation errors: show inline field errors
  - UNIQUE constraint violation: show error "Strategy already exists for this segment × topic combination"
- Loading states:
  - Submit button shows spinner during save
  - Form fields disabled during save
  - Success toast notification after save

**Estimated Effort:** 5 points (3-4 days)

---

## Implementation Timeline - Epic 3.0

**Total Story Points:** 23 points

**Estimated Timeline:** 15-20 days (approximately 3-4 weeks with buffer)

**Story Sequence:**
1. Story 3.0.1: Database Migration (must complete first - foundation)
2. Story 3.0.2: UI Refactor (depends on 3.0.1)
3. Story 3.0.3: Strategy AI Generator (depends on 3.0.1, uses Epic 2 LLM infrastructure)
4. Story 3.0.4: Strategy Form + CRUD (depends on 3.0.1 and 3.0.2)

**Notes:**
- Story 3.0.1 is critical path - database foundation required for all other stories
- Story 3.0.2 and 3.0.4 can work in parallel after 3.0.1 (UI components)
- Story 3.0.3 requires careful prompt engineering for 16-field output
- Preview summary: AI-generated but editable (stored in database)
- UNIQUE constraint ensures one strategy per cell (segment × topic)
- Existing `messages` table remains for Content Calendar use (Epic 3.1)
- Story 2.3 refactor: message generator → strategy generator (same endpoint pattern, different output)

---

