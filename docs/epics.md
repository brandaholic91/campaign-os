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
- Next.js 16 project initialization with App Router, TypeScript, Tailwind CSS
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
- Next.js 16.0.3, React 19.0.0, TypeScript 5.3.0
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
**Then** I have a Next.js 16 project with TypeScript, Tailwind CSS, and Supabase client configured

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
- Create `app/api/ai/stream/route.ts` for CopilotKit event stream endpoint (HTTP handler, rate limiting, error handling)
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
- CopilotKit client connects to `/api/ai/stream` endpoint
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
Schema Enhancement Layer
├── Story 3.0.5: Enhanced Segment & Topic Schema
│   └── Detailed profiles, priority system, segment-topic matrix
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
├── Story 3.0.4: Strategy Form + CRUD
│   └── Strategy form (4 sections), API endpoints, edit/create workflow
│
AI Infrastructure Layer
└── Story 3.0.6: AI Provider Abstraction
    └── Multi-provider support (Anthropic, OpenAI, Google, Ollama), unified interface
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

### Story 3.0.5: Enhanced Segment & Topic Schema with Priority and Matrix

As a **campaign manager**,
I want **detailed segment and topic schemas with priority classification, structured profiles, and segment-topic matrix mapping**,
So that **the AI can generate more targeted and effective campaign messages based on rich audience and content context**.

**Acceptance Criteria:**

**Given** I have Epic 1-3 database schema
**When** I run the migration
**Then** segments table is enhanced with:
- Structured demographic_profile, psychographic_profile (replaces existing JSONB)
- media_habits JSONB (primary_channels, secondary_channels, notes)
- funnel_stage_focus (awareness/engagement/consideration/conversion/mobilization)
- example_persona JSONB (name, one_sentence_story)
- priority changed from INTEGER to TEXT enum ('primary' | 'secondary')
- short_label field for UI display

**And** topics table is enhanced with:
- topic_type (benefit/problem/value/proof/story)
- related_goal_types JSONB array
- core_narrative (1-2 sentence description)
- content_angles JSONB array
- recommended_channels JSONB array
- risk_notes JSONB array
- priority TEXT enum ('primary' | 'secondary')
- short_label field for UI display

**And** segment_topic_matrix table is created:
- Maps segments to topics with importance (high/medium/low) and role (core_message/support/experimental)
- UNIQUE constraint on (segment_id, topic_id)

**And** AI prompt updated to generate:
- 3-5 primary segments (max 7 total) with priority classification
- 4-7 primary topics (max 9 total) with priority classification
- Segment-topic matrix with importance and role mapping (limit 5-6 high-importance connections)

**And** Zod schemas updated for all new structures

**And** API endpoints updated to handle new fields and matrix

**And** UI components updated to display/edit new fields

**Prerequisites:** Story 3.0.1 (database foundation), Epic 2 complete (LLM infrastructure)

**Technical Notes:**
- Create migration: `supabase/migrations/YYYYMMDD_enhanced_segments_topics.sql`
  - Enhance segments table: add new fields, migrate existing JSONB to structured format, change priority to enum
  - Enhance topics table: add new fields, add priority enum
  - Create segment_topic_matrix table with importance and role fields
  - Migrate existing priority values (INTEGER 1-2 → 'primary', 3-5 → 'secondary')
  - Preserve backward compatibility (keep old fields as fallback)
- Update Zod schemas in `lib/ai/schemas.ts`:
  - Update `SegmentSchema` with all new structured fields
  - Update `TopicSchema` with all new fields
  - Create `SegmentTopicMatrixSchema`
- Update AI prompt in `lib/ai/prompts/strategy-designer.ts`:
  - Add instructions for priority classification
  - Add instructions for segment-topic matrix generation
  - Update output schema to match new structure
- Update API endpoints:
  - `/api/ai/campaign-brief` - handle new schema in response
  - `/api/campaigns/structure` - save new fields and matrix
  - `/api/segments`, `/api/topics` - CRUD with new fields
  - Create `/api/segment-topic-matrix` - matrix CRUD operations
- Update UI components:
  - `CampaignWizard.tsx` - form fields for new schema
  - `SegmentManager.tsx`, `TopicManager.tsx` - display/edit new fields
  - `MessageMatrix.tsx` - use matrix for display

**Estimated Effort:** 13 points (5-7 days)

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

### Story 3.0.6: AI Provider Abstraction

As a **developer**,
I want **multiple AI provider support (Anthropic, OpenAI, Google Gemini, Ollama) with a unified abstraction layer**,
So that **I can switch between providers and models via environment variables without code changes, enabling cost optimization and vendor independence**.

**Acceptance Criteria:**

**Given** I have the existing Anthropic client implementation
**When** I implement the provider abstraction
**Then** a unified `AIProvider` interface is created with `generateText()` and `generateStream()` methods

**And** provider implementations are created for Anthropic, OpenAI, Google Gemini, and Ollama

**And** factory function `getAIProvider()` selects provider based on `AI_PROVIDER` environment variable

**And** all API routes use the unified provider interface

**And** CopilotKit integration works with all providers

**And** backward compatibility is maintained (`getAnthropicClient()` still works)

**And** provider switching works via environment variables without code changes

**Prerequisites:** Epic 2 complete (LLM infrastructure), Story 2.1 (LLM + CopilotKit Infrastructure), Story 3.0.3 (Strategy AI Generator)

**Technical Notes:**
- Create `lib/ai/types.ts` with unified type definitions
- Create `lib/ai/providers/base.ts` with `BaseAIProvider` abstract class
- Implement providers: `lib/ai/providers/anthropic.ts`, `openai.ts`, `google.ts`, `ollama.ts`
- Refactor `lib/ai/client.ts` with factory pattern
- Update all API routes: `campaign-brief`, `message-matrix`, `strategy-matrix`, `regenerate-strategy`
- Update `lib/ai/copilotkit/server.ts` for multi-provider support
- Environment variables: `AI_PROVIDER`, `AI_MODEL`, provider-specific API keys
- Default provider: Anthropic (backward compatibility)
- Default model: `gpt-5-mini-2025-08-07`
- Error handling: unified `AIProviderError` class with provider-specific wrapping

**Estimated Effort:** 13 points (8-11 hours)

---

## Implementation Timeline - Epic 3.0

**Total Story Points:** 49 points (increased from 36 due to AI provider abstraction)

**Estimated Timeline:** 25-30 days (approximately 5-6 weeks with buffer)

**Story Sequence:**
1. Story 3.0.1: Database Migration (must complete first - foundation)
2. Story 3.0.5: Enhanced Segment & Topic Schema (depends on 3.0.1, enhances foundation for 3.0.2-3.0.4)
3. Story 3.0.2: UI Refactor (depends on 3.0.1 and 3.0.5 - benefits from enhanced segments/topics)
4. Story 3.0.3: Strategy AI Generator (depends on 3.0.1 and 3.0.5, uses Epic 2 LLM infrastructure)
5. Story 3.0.4: Strategy Form + CRUD (depends on 3.0.1, 3.0.2, and 3.0.5)
6. Story 3.0.6: AI Provider Abstraction (depends on Epic 2 complete, Story 2.1, Story 3.0.3 - enables multi-provider support)

**Notes:**
- Story 3.0.1 is critical path - database foundation required for all other stories
- Story 3.0.5 enhances segments/topics schema - should complete early to benefit other stories
- Story 3.0.2 and 3.0.4 can work in parallel after 3.0.1 and 3.0.5 (UI components)
- Story 3.0.3 requires careful prompt engineering for 16-field output, benefits from enhanced schema
- Story 3.0.6 enables multi-provider support - can be implemented after Story 3.0.3 (uses AI endpoints)
- Preview summary: AI-generated but editable (stored in database)
- UNIQUE constraint ensures one strategy per cell (segment × topic)
- Existing `messages` table remains for Content Calendar use (Epic 3.1)
- Story 2.3 refactor: message generator → strategy generator (same endpoint pattern, different output)
- Story 3.0.5 adds segment-topic matrix for explicit relationship mapping (importance, role)
- Priority system (primary/secondary) enables better filtering and AI generation focus
- Story 3.0.6: AI Provider Abstraction enables cost optimization and vendor independence via environment variables

---

## Epic 4.0: Strategic Data Enhancement for Sprint & Content Calendar Planning

**Slug:** campaign-os-epic4-strategic-data-enhancement

### Goal

Enhance the campaign structure data model with strategic metadata (funnel stages, priorities, goal relationships) to enable effective sprint planning and content calendar generation. The execution AI needs structured, prioritized strategic data rather than verbose text descriptions to make intelligent decisions about sprint sequencing and content scheduling.

### Scope

**In Scope:**
- Goals schema enhancement: add `funnel_stage` and `kpi_hint` fields
- Topics schema enhancement: add `related_goal_stages` (enum array) and `recommended_content_types` fields
- Narratives schema enhancement: add `primary_goal_ids`, `primary_topic_ids`, and `suggested_phase` fields
- Segment-Topic Matrix validation rules enforcement (max 2-3 high/core_message per segment)
- "Ready for Execution" validation checklist system
- AI prompt updates to generate enhanced strategic data
- Database migrations for new fields
- Validation helper functions for completeness checking
- UI enhancements: validation status indicators, checklist display

**Out of Scope (Epic 5+):**
- Actual sprint planner AI implementation (Epic 5)
- Content calendar AI generation (Epic 4.2)
- Advanced prioritization algorithms
- Multi-campaign strategic analysis

### Success Criteria

1. ✅ All goals have `funnel_stage` and `kpi_hint` fields populated
2. ✅ All topics have `related_goal_stages` and `recommended_content_types` fields populated
3. ✅ All narratives have `primary_goal_ids`, `primary_topic_ids`, and `suggested_phase` fields populated
4. ✅ Segment-Topic Matrix validation enforces max 2-3 high/core_message per segment
5. ✅ "Ready for Execution" checklist validates all required strategic fields
6. ✅ AI prompt generates all new strategic metadata fields
7. ✅ Database migrations preserve backward compatibility
8. ✅ UI displays validation status for each campaign structure element
9. ✅ Validation helpers provide clear feedback on missing fields
10. ✅ Campaign structure can be marked as "ready for execution" when all criteria met

### Dependencies

**External:**
- Epic 3.0 complete (enhanced segment/topic schema, segment-topic matrix)
- Epic 2 complete (LLM infrastructure)
- Anthropic Claude API (reuse from Epic 2)

**Internal:**
- Epic 3.0 complete (all stories done, especially Story 3.0.5)
- Database schema from Epic 1-3
- Existing campaign structure generation (Story 2.2)
- Segment-Topic Matrix implementation (Story 3.0.5)

---

## Story Map - Epic 4.0

```
Schema & Migration Layer
├── Story 4.0.1: Strategic Metadata Schema Enhancement
│   └── Goals, Topics, Narratives schema bővítés, DB migration
│
AI Generation Layer
├── Story 4.0.2: AI Prompt Enhancement for Strategic Data
│   └── Strategy Designer prompt frissítés, új mezők generálása
│
Validation Layer
├── Story 4.0.3: Validation Logic & Matrix Rules
│   └── Helper functions, matrix validation, completeness checks
│
User Experience Layer
└── Story 4.0.4: UI Validation Status & Checklist
    └── Validation indicators, "Ready for Execution" checklist UI
```

---

## Stories - Epic 4.0

### Story 4.0.1: Strategic Metadata Schema Enhancement

As a **developer**,
I want **enhanced schemas for Goals, Topics, and Narratives with strategic metadata fields**,
So that **the execution AI has structured, prioritized data for sprint and content calendar planning**.

**Acceptance Criteria:**

**Given** I have Epic 3.0 database schema
**When** I run the migration
**Then** goals table is enhanced with:
- `funnel_stage` TEXT enum ('awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization')
- `kpi_hint` TEXT (optional, e.g., "FB/IG reach", "newsletter signup", "event registration")

**And** topics table is enhanced with:
- `related_goal_stages` JSONB array of enum values ('awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization')
- `recommended_content_types` JSONB array (optional, e.g., ["short_video", "story", "static_image", "carousel", "email"])

**And** narratives table is created with strategic metadata:
- New `narratives` table with `id`, `campaign_id` (FK), `title`, `description`, `priority`, `suggested_phase`
- Junction tables: `narrative_goals` and `narrative_topics` for referential integrity
- `campaigns.narratives` JSONB column preserved for backward compatibility
- Migration script converts existing JSONB narratives to table structure

**And** Zod schemas are updated for all new structures

**And** TypeScript types are generated from the schema

**And** existing data remains accessible (backward compatibility preserved)

**Prerequisites:** Epic 3.0 complete (especially Story 3.0.5)

**Technical Notes:**
- Create migration: `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
  - Add `funnel_stage` and `kpi_hint` to `goals` table
  - Add `related_goal_stages` and `recommended_content_types` to `topics` table
  - Create `narratives` table with strategic metadata fields
  - Create `narrative_goals` and `narrative_topics` junction tables for referential integrity
  - Migrate existing JSONB narratives to table structure
  - Preserve `campaigns.narratives` JSONB column for backward compatibility
  - All new fields nullable initially (backward compatibility)
  - Create indexes for new enum fields and foreign keys if needed
- Update Zod schemas in `lib/ai/schemas.ts`:
  - Update `GoalSchema`: add `funnel_stage` (enum), `kpi_hint` (optional string)
  - Update `TopicSchema`: add `related_goal_stages` (array of enum), `recommended_content_types` (optional array)
  - Update `NarrativeSchema`: support both table-based (with junction tables) and JSONB-based storage, include `suggested_phase` (optional enum)
- Generate TypeScript types: `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
- Test migration:
  - Run migration on local Supabase instance
  - Verify new fields exist and are nullable
  - Test enum constraints
  - Test JSONB array fields
  - Verify backward compatibility (existing campaigns still work)

**Estimated Effort:** 5 points (2-3 days)

---

### Story 4.0.2: AI Prompt Enhancement for Strategic Data

As a **campaign manager**,
I want **the AI to generate all strategic metadata fields when creating campaign structures**,
So that **the generated structure is immediately ready for sprint and content calendar planning**.

**Acceptance Criteria:**

**Given** I am generating a campaign structure using AI
**When** the AI generates goals, topics, and narratives
**Then** all goals include `funnel_stage` and `kpi_hint` fields

**And** all topics include `related_goal_stages` and `recommended_content_types` fields

**And** all narratives include `primary_goal_ids`, `primary_topic_ids`, and `suggested_phase` fields

**And** the Segment-Topic Matrix follows validation rules:
- Max 2-3 high importance + core_message topics per segment
- 2-4 medium importance support topics per segment
- 1-2 experimental topics per segment

**And** the AI output respects campaign type and goal type for strategic metadata

**Prerequisites:** Story 4.0.1 (schema enhancement must exist)

**Technical Notes:**
- Update `lib/ai/prompts/strategy-designer.ts`:
  - Add explicit instructions for `funnel_stage` and `kpi_hint` in goals
  - Add explicit instructions for `related_goal_stages` and `recommended_content_types` in topics
  - Add explicit instructions for `primary_goal_ids`, `primary_topic_ids`, `suggested_phase` in narratives
  - Add matrix validation rules to prompt:
    - "For each segment, assign maximum 2-3 high importance + core_message topics"
    - "Assign 2-4 medium importance support topics per segment"
    - "Limit experimental topics to 1-2 per segment"
  - Update output schema examples in prompt to include all new fields
  - Add examples of good strategic metadata:
    - Goal: `funnel_stage: "awareness"`, `kpi_hint: "FB/IG reach"`
    - Topic: `related_goal_stages: ["awareness", "engagement"]`, `recommended_content_types: ["short_video", "story"]`
    - Narrative: `suggested_phase: "early"`, `primary_goal_ids: [...]`
- Update `STRATEGY_DESIGNER_SYSTEM_PROMPT`:
  - Emphasize importance of strategic metadata for execution planning
  - Add guidance on funnel stage selection based on campaign type
  - Add guidance on content type selection based on topic type and segment media habits
- Test prompt updates:
  - Generate test campaign structure
  - Verify all new fields are populated
  - Verify matrix validation rules are followed
  - Check that strategic metadata makes sense for campaign type

**Estimated Effort:** 5 points (2-3 days, prompt engineering)

---

### Story 4.0.3: Validation Logic & Matrix Rules

As a **campaign manager**,
I want **validation logic that ensures campaign structures are complete and follow matrix rules**,
So that **I know when my campaign is ready for sprint and content calendar planning**.

**Acceptance Criteria:**

**Given** I have a campaign structure
**When** I check validation
**Then** I get clear feedback on:
- Which goals are missing `funnel_stage` or `kpi_hint`
- Which topics are missing `related_goal_stages` or `recommended_content_types`
- Which narratives are missing `primary_goal_ids`, `primary_topic_ids`, or `suggested_phase`
- Which segments violate matrix rules (too many high/core_message topics)

**And** validation helper functions exist for:
- `validateGoalCompleteness(goal)` - checks funnel_stage and kpi_hint
- `validateSegmentCompleteness(segment)` - checks required fields from Epic 3.0.5
- `validateTopicCompleteness(topic)` - checks related_goal_stages and recommended_content_types
- `validateNarrativeCompleteness(narrative)` - checks primary_goal_ids, primary_topic_ids, suggested_phase
- `validateMatrixRules(matrix, segments)` - checks max limits per segment
- `isReadyForExecution(structure)` - comprehensive validation

**And** matrix validation enforces:
- Max 2-3 high importance + core_message topics per segment
- Max 2-4 medium importance support topics per segment
- Max 1-2 experimental topics per segment

**Prerequisites:** Story 4.0.1 (schema enhancement), Story 4.0.2 (prompt updates)

**Technical Notes:**
- Create `lib/validation/campaign-structure.ts`:
  - `validateGoalCompleteness(goal: GoalSchema)`: returns { valid: boolean, missing: string[] }
  - `validateSegmentCompleteness(segment: SegmentSchema)`: returns { valid: boolean, missing: string[] }
  - `validateTopicCompleteness(topic: TopicSchema)`: returns { valid: boolean, missing: string[] }
  - `validateNarrativeCompleteness(narrative: NarrativeSchema)`: returns { valid: boolean, missing: string[] }
  - `validateMatrixRules(matrix: SegmentTopicMatrixEntry[], segments: SegmentSchema[])`: returns { valid: boolean, violations: Array<{segment_id: string, issue: string}> }
  - `isReadyForExecution(structure: CampaignStructure)`: returns { ready: boolean, issues: Array<{type: string, element: string, issue: string}> }
- Matrix validation logic:
  - Group matrix entries by segment_id
  - For each segment, count:
    - High importance + core_message topics (max 2-3)
    - Medium importance + support topics (max 2-4)
    - Experimental topics (max 1-2)
  - Return violations with clear messages
- Create API endpoint: `GET /api/campaigns/[id]/validation`
  - Returns validation status for entire campaign structure
  - Includes detailed issues list
  - Includes "ready for execution" boolean
- Integration with existing campaign structure endpoints:
  - Add validation status to campaign structure responses
  - Optionally validate on save (warn but don't block)

**Estimated Effort:** 8 points (3-4 days)

---

### Story 4.0.4: UI Validation Status & Checklist

As a **campaign manager**,
I want **to see validation status indicators and a "Ready for Execution" checklist in the UI**,
So that **I can easily identify what needs to be completed before sprint planning**.

**Acceptance Criteria:**

**Given** I am viewing a campaign structure
**When** I look at the structure preview
**Then** I see validation status indicators (✓/⚠/✗) for each element:
- Goals: shows status for funnel_stage and kpi_hint
- Segments: shows status for required fields
- Topics: shows status for related_goal_stages and recommended_content_types
- Narratives: shows status for primary_goal_ids, primary_topic_ids, suggested_phase
- Matrix: shows warnings for rule violations

**And** I see a "Ready for Execution" checklist section showing:
- Overall status (Ready / Not Ready)
- Progress bar or percentage
- Detailed list of missing fields per element
- Matrix rule violations with clear explanations

**And** I can click on validation issues to navigate to the relevant element

**And** the checklist updates in real-time as I edit the structure

**Prerequisites:** Story 4.0.3 (validation logic must exist)

**Technical Notes:**
- Update `components/ai/CampaignStructurePreview.tsx`:
  - Add validation status column to each table (Goals, Segments, Topics, Narratives)
  - Display status icons: ✓ (complete), ⚠ (partial), ✗ (missing)
  - Add tooltip on hover showing specific missing fields
- Create `components/ai/ExecutionReadinessChecklist.tsx`:
  - Props: `campaignId`, `structure`, `validationStatus`
  - Display overall "Ready for Execution" status (badge or banner)
  - Progress indicator (e.g., "8/10 criteria met")
  - Expandable sections for each validation category:
    - Goals validation (list goals with missing fields)
    - Segments validation (list segments with missing fields)
    - Topics validation (list topics with missing fields)
    - Narratives validation (list narratives with missing fields)
    - Matrix validation (list rule violations)
  - Click on issue → navigate to relevant element in preview
  - Real-time updates when structure changes
- Create `components/ui/ValidationStatusIcon.tsx`:
  - Props: `status: 'complete' | 'partial' | 'missing'`
  - Renders appropriate icon with color coding
- Update `app/campaigns/[id]/page.tsx`:
  - Fetch validation status from `/api/campaigns/[id]/validation`
  - Display ExecutionReadinessChecklist component
  - Show validation status in campaign header
- Integration with CampaignStructurePreview:
  - Call validation API when structure loads
  - Display validation status in each table row
  - Highlight rows with validation issues
- Responsive design: mobile, tablet, desktop layouts
- Loading states and error handling

**Estimated Effort:** 8 points (3-4 days)

---

## Implementation Timeline - Epic 4.0

**Total Story Points:** 26 points

**Estimated Timeline:** 13-16 days (approximately 2.5-3 weeks with buffer)

**Story Sequence:**
1. Story 4.0.1: Schema Enhancement (must complete first - foundation)
2. Story 4.0.2: AI Prompt Enhancement (depends on 4.0.1 - uses new schema)
3. Story 4.0.3: Validation Logic (depends on 4.0.1 and 4.0.2 - validates new fields)
4. Story 4.0.4: UI Validation Status (depends on 4.0.3 - displays validation results)

**Notes:**
- Story 4.0.1 is critical path - schema foundation required for all other stories
- Story 4.0.2 can start immediately after 4.0.1 (prompt updates)
- Story 4.0.3 requires both 4.0.1 and 4.0.2 (validates new fields and AI output)
- Story 4.0.4 depends on 4.0.3 (displays validation results)
- All new fields are nullable initially for backward compatibility
- Matrix validation rules are enforced but don't block saving (warnings only)
- "Ready for Execution" is informational, not a hard gate
- Epic 5 will implement actual sprint planner AI using this strategic data
- Epic 4.2 will implement content calendar AI generation using this strategic data

---

## Epic 5: Execution Planner - Sprint & Content Calendar AI

**Slug:** campaign-os-epic5-execution-planner

### Goal

Build an AI-powered execution planner with a two-phase approach: first generating sprint plans (strategic execution phases), then allowing content slot generation per sprint when ready. This separates strategic planning from tactical content scheduling, giving users more control over content creation timing. The planner creates 2-4 sprints based on campaign length and complexity, with rich sprint metadata to guide future content slot generation.

### Scope

**In Scope:**
- Database schema: `sprints`, `sprint_segments`, `sprint_topics`, `sprint_channels`, `content_slots` tables
- Enhanced sprint schema: `focus_stage`, `focus_goals[]`, `suggested_weekly_post_volume`, `narrative_emphasis[]`, `key_messages_summary`, `success_criteria[]`, `risks_and_watchouts[]`
- Two-phase AI generation:
  - Phase 1: Sprint-only generation (`POST /api/ai/campaign-sprints`) - strategic execution phases
  - Phase 2: Sprint-specific content slot generation (`POST /api/ai/campaign-sprints/[sprintId]/content-slots`) - tactical content scheduling
- Sprint timeline UI with enhanced sprint metadata display
- Sprint detail page for per-sprint content slot generation
- Save sprints API (can save sprints independently, without content slots)
- Edit & management UI for sprints and content slots
- Zod schema validation for all execution plan data
- Constraint enforcement (max posts per day/channel, max total per week)
- Backward compatibility: existing `/api/ai/campaign-execution` endpoint deprecated but functional

**Out of Scope (Epic 6+):**
- Content copy generation for slots (future epic)
- Advanced sprint optimization algorithms
- Multi-campaign execution coordination
- Execution analytics and reporting

### Success Criteria

1. ✅ Users can generate sprint plans from validated campaign structures (sprints only, no content slots)
2. ✅ AI generates 2-4 sprints based on campaign length and complexity with enhanced metadata
3. ✅ Sprint plans include strategic metadata: focus_stage, focus_goals, suggested_weekly_post_volume, narrative_emphasis, key_messages_summary, success_criteria, risks_and_watchouts
4. ✅ Users can generate content slots per sprint when ready (sprint-specific generation)
5. ✅ Content slots respect sprint focus and channel constraints
6. ✅ Sprint plans can be previewed and saved independently of content slots
7. ✅ Sprint detail page allows per-sprint content slot generation
8. ✅ Execution plan can be edited after saving
9. ✅ All execution plan data validated against Zod schemas

### Dependencies

**External:**
- Epic 4.0 complete (strategic metadata enhancement, validation checklist)
- Epic 3.0 complete (message strategies, segment-topic matrix)
- Epic 2 complete (LLM infrastructure, CopilotKit)

**Internal:**
- Epic 4.0 complete (all stories done, especially validation)
- Database schema from Epic 1-4
- Existing campaign structure generation (Story 2.2)

---

## Story Map - Epic 5

```
Database Foundation Layer
├── Story 5.1: Database Schema for Execution Planning
│   └── sprints, junction tables, content_slots, Zod schemas
│
AI Generation Layer (Phase 1 - Current Implementation)
├── Story 5.2: Execution Planner AI Endpoint
│   └── POST /api/ai/campaign-execution, streaming, prompt engineering (generates both sprints + content slots)
│
User Experience Layer (Phase 1 - Current Implementation)
├── Story 5.3: Execution Plan Preview UI
│   └── Sprint list, content calendar, progress feedback
│
Persistence Layer (Phase 1 - Current Implementation)
├── Story 5.4: Save Execution Plan API & Workflow
│   └── POST /api/campaigns/execution, transaction, rollback
│
Management Layer (Phase 1 - Current Implementation)
└── Story 5.5: Execution Plan Edit & Management UI
    └── Edit sprints/slots, delete, re-generate

Two-Phase Refactor (Phase 2 - New Implementation)
├── Story 5.6: Enhanced Sprint Schema & Database Migration
│   └── Sprint schema enhancement, new fields, DB migration, backward compatibility
│
├── Story 5.7: Sprint-Only AI Generation Endpoint
│   └── POST /api/ai/campaign-sprints, sprint-only generation with enhanced metadata
│
├── Story 5.8: Sprint-Specific Content Slot Generation
│   └── POST /api/ai/campaign-sprints/[sprintId]/content-slots, per-sprint content generation
│
└── Story 5.9: UI Refactor - Two-Phase Model
    └── ExecutionPlanner refactor, sprint timeline, sprint detail page, per-sprint content generation
```

---

## Stories - Epic 5

### Story 5.1: Database Schema for Execution Planning

As a **developer**,
I want **database tables for sprints and content slots with proper relationships**,
So that **execution plans can be stored and managed in the database**.

**Prerequisites:** Epic 4.0 complete (strategic metadata)

**Estimated Effort:** 5 points (2-3 days)

---

### Story 5.2: Execution Planner AI Endpoint

As a **campaign manager**,
I want **an AI endpoint that generates sprint plans and content calendars from validated campaign structures**,
So that **I can quickly create execution plans without manual planning**.

**Prerequisites:** Story 5.1 (DB schema), Epic 2 complete (LLM infrastructure)

**Estimated Effort:** 8 points (4-5 days, complex prompt engineering)

---

### Story 5.3: Execution Plan Preview UI

As a **campaign manager**,
I want **to preview the generated execution plan before saving**,
So that **I can review sprints and content calendar before committing**.

**Prerequisites:** Story 5.2 (AI endpoint)

**Estimated Effort:** 5 points (3-4 days)

---

### Story 5.4: Save Execution Plan API & Workflow

As a **campaign manager**,
I want **to save the generated execution plan to the database**,
So that **I can use it for campaign execution and editing**.

**Prerequisites:** Story 5.1 (DB schema), Story 5.2 (AI endpoint)

**Estimated Effort:** 5 points (3-4 days)

---

### Story 5.5: Execution Plan Edit & Management UI

As a **campaign manager**,
I want **to edit sprints and content slots after saving**,
So that **I can fine-tune the execution plan to match reality**.

**Prerequisites:** Story 5.3 (Preview UI), Story 5.4 (Save API)

**Estimated Effort:** 8 points (4-5 days)

---

### Story 5.6: Enhanced Sprint Schema & Database Migration

As a **developer**,
I want **an enhanced sprint schema with strategic metadata fields and database migration**,
So that **sprints contain enough information to guide future content slot generation without micromanagement**.

**Acceptance Criteria:**

**Given** I have Epic 5 Phase 1 database schema
**When** I run the migration
**Then** sprints table is enhanced with:
- `focus_stage` TEXT enum ('awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization')
- `focus_goals` JSONB array (goal_id UUIDs, 1-3 goals per sprint)
- `suggested_weekly_post_volume` JSONB (total_posts_per_week, video_posts_per_week, stories_per_week)
- `narrative_emphasis` JSONB array (narrative_id UUIDs, 1-2 narratives per sprint)
- `key_messages_summary` TEXT (4-6 bullet points: what we emphasize in this sprint)
- `success_criteria` JSONB array (qualitative indicators: "ha ezt látjuk, jó irányban vagyunk")
- `risks_and_watchouts` JSONB array (2-4 points: what to watch for)

**And** SprintPlanSchema is updated with all new fields
**And** TypeScript types are regenerated
**And** Existing sprints remain compatible (new fields nullable initially)

**Prerequisites:** Story 5.1 (Phase 1 database schema)

**Estimated Effort:** 2-3 points (1-2 days)

---

### Story 5.7: Sprint-Only AI Generation Endpoint

As a **campaign manager**,
I want **an AI endpoint that generates only sprint plans without content slots**,
So that **I can create strategic execution phases first, then decide content timing separately**.

**Acceptance Criteria:**

**Given** I have a validated campaign structure
**When** I POST to `/api/ai/campaign-sprints` with `{ campaignId }`
**Then** Endpoint generates sprints only (no content_calendar in response)
**And** Response format: `{ sprints: SprintPlan[] }` (content_calendar absent)
**And** All sprints include enhanced metadata fields from Story 5.6
**And** Sprint count follows guidelines:
- 1-10 days → 1 sprint
- 11-25 days → 2 sprints
- 26-45 days → 3 sprints
- 46+ days → 4-6 sprints
**And** Sprint focus stages follow funnel progression (awareness → engagement → consideration → conversion)
**And** Streaming progress shows sprint generation status
**And** Response validates against enhanced SprintPlanSchema

**Prerequisites:** Story 5.6 (Enhanced schema)

**Estimated Effort:** 3-4 points (2-3 days)

---

### Story 5.8: Sprint-Specific Content Slot Generation

As a **campaign manager**,
I want **to generate content slots for a specific sprint when ready**,
So that **I can plan content timing closer to execution date with sprint context**.

**Acceptance Criteria:**

**Given** I have a saved sprint with enhanced metadata
**When** I POST to `/api/ai/campaign-sprints/[sprintId]/content-slots` with optional `{ weekly_post_volume?: {...} }`
**Then** Endpoint generates content slots only for that sprint
**And** Content slots use sprint's focus_stage, focus_segments, focus_topics, focus_channels, suggested_weekly_post_volume
**And** Optional weekly_post_volume parameter allows overriding suggested volume
**And** Response format: `{ content_slots: ContentSlot[] }`
**And** All slot dates are within sprint date range
**And** Slot constraints are enforced (max posts per day/channel, weekly totals)
**And** Streaming progress shows content slot generation status

**Prerequisites:** Story 5.7 (Sprint-only generation)

**Estimated Effort:** 3-4 points (2-3 days)

---

### Story 5.9: UI Refactor - Two-Phase Model

As a **campaign manager**,
I want **a UI that separates sprint generation from content slot generation**,
So that **I have control over when to generate content and can review sprints first**.

**Acceptance Criteria:**

**Given** I am on the campaign execution planner page
**When** I view the sprints section
**Then** I see two separate buttons:
- "Sprintstruktúra generálása AI-val" (generates sprints only)
- Per sprint: "Tartalomnaptár létrehozása ehhez a sprinthez" (generates content slots for that sprint)

**And** Sprint timeline view shows enhanced sprint metadata:
- Focus stage badge
- Focus goals list
- Primary/secondary segments and topics
- Primary/secondary channels
- Suggested weekly post volume (total, video, stories)
- Narrative emphasis
- Key messages summary
- Success criteria
- Risks and watchouts

**And** I can click on a sprint to open sprint detail page (`/campaigns/[id]/sprints/[sprintId]`)
**And** Sprint detail page shows:
- Full sprint information with all enhanced metadata
- "Tartalomnaptár generálása" button (generates content slots for this sprint)
- Content calendar view (if slots already generated)
- Edit sprint functionality

**And** Content slots are shown per sprint in calendar view
**And** Backward compatibility: existing `/api/ai/campaign-execution` endpoint still works (deprecated but functional)

**Prerequisites:** Story 5.7 (Sprint-only generation), Story 5.8 (Sprint-specific content slots)

**Estimated Effort:** 5-6 points (3-4 days)

---

## Implementation Timeline - Epic 5

**Phase 1 (Stories 5.1-5.5) - Initial Implementation:**
**Total Story Points:** 31 points
**Estimated Timeline:** 18-22 days (approximately 4-5 weeks with buffer)

**Phase 2 (Stories 5.6-5.9) - Two-Phase Refactor:**
**Total Story Points:** 13-17 points
**Estimated Timeline:** 8-12 days (approximately 2-3 weeks with buffer)

**Phase 1 Story Sequence:**
1. Story 5.1: Database Schema (must complete first - foundation, critical path)
2. Story 5.2: AI Endpoint (depends on 5.1, critical path)
3. Story 5.3: Preview UI (depends on 5.2, can start in parallel with 5.4)
4. Story 5.4: Save API (depends on 5.1 and 5.2, can start in parallel with 5.3)
5. Story 5.5: Edit UI (depends on 5.3 and 5.4)

**Phase 2 Story Sequence:**
6. Story 5.6: Enhanced Sprint Schema & Database Migration (foundation for refactor)
7. Story 5.7: Sprint-Only AI Generation Endpoint (depends on 5.6)
8. Story 5.8: Sprint-Specific Content Slot Generation (depends on 5.7)
9. Story 5.9: UI Refactor - Two-Phase Model (depends on 5.7, can start in parallel with 5.8)

**Notes:**
**Phase 1:**
- Story 5.1 is critical path - database foundation required for all other stories
- Story 5.2 is critical path - AI endpoint required for preview and save
- Stories 5.3 and 5.4 can work in parallel after 5.2 (UI and API)
- Story 5.5 requires both 5.3 and 5.4 (edit functionality needs both UI and API)
- AI prompt engineering requires careful iteration (Story 5.2)
- Constraint enforcement is critical for realistic execution plans
- Transaction support ensures data integrity (Story 5.4)

**Phase 2:**
- Story 5.6 enhances sprint schema - foundation for two-phase model
- Story 5.7 creates sprint-only generation - separates strategic from tactical
- Story 5.8 enables per-sprint content generation - user controls timing
- Story 5.9 refactors UI - two separate buttons/workflows
- Backward compatibility: existing `/api/ai/campaign-execution` remains functional (deprecated)
- Detailed story breakdown: `docs/sprint-artifacts/epic-5-execution-planner-stories.md`

---

