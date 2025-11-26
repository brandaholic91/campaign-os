# campaign-os - Technical Specification

**Author:** Balazs  
**Date:** 2025-11-20  
**Last Updated:** 2025-11-27  
**Project Level:** quick-flow  
**Development Context:** Greenfield - Campaign OS kommunikációs és social média kampánytervező

---

## Overview

**Problem:** Szétszórt kampánytervezés Google Doc-okban és Excel táblázatokban. Hiányzik központi eszköz a teljes kampánytervezési folyamathoz.

**Solution:** Campaign OS - webes kampánytervező eszköz kampánycélok → célcsoportok → témák → üzenetek → csatornák → tartalomnaptár → sprintek folyamattal.

**Tech Stack:**
- Frontend: Next.js 16 (App Router), React 19, TypeScript 5.9.3, Tailwind CSS 3.4, Shadcn/ui
- Backend: Next.js API Routes, Supabase Postgres (PostgreSQL 15+)
- AI/LLM: Anthropic Claude API, CopilotKit Protocol (Epic 2+)
- Deployment: Vercel, Supabase Cloud

---

## Project Structure

**Core Entities:**
- `campaigns` - Kampányok (campaign_type, goal_type, dátumok, státusz)
- `goals` - Célok (funnel_stage, kpi_hint - Epic 4.0)
- `segments` - Célcsoportok (demographic_profile, psychographic_profile, media_habits, priority - Epic 3.0.5)
- `topics` - Témák (topic_type, content_angles, recommended_channels, priority - Epic 3.0.5)
- `segment_topic_matrix` - Segment-topic kapcsolatok (importance, role - Epic 3.0.5)
- `message_strategies` - Kommunikációs stratégiák (4 kategória, 16 mező - Epic 3.0)
- `sprints` - Sprintek (focus_stage, focus_goals[], suggested_weekly_post_volume - Epic 5)
- `content_slots` - Tartalom slotok (date, channel, segment, topic, objective - Epic 5)
- `content_drafts` - Tartalom vázlatok (hook, body, visual_idea, status - Epic 6.1)
- `narratives` - Narratívák (primary_goal_ids, primary_topic_ids, suggested_phase - Epic 4.0)

**Key Files:**
- `app/` - Next.js App Router pages és API routes
- `components/` - React komponensek (campaigns, segments, topics, messages, sprints, ai)
- `lib/ai/` - AI integráció (client, schemas, prompts, providers)
- `lib/validation/` - Validációs helper függvények
- `supabase/migrations/` - Adatbázis migrációk

---

## Epic Summary

### Epic 1: MVP (Sprint 1)
**Scope:** Manuális kampánykezelés, CRUD műveletek, üzenetmátrix, sprint/task board.  
**Status:** ✅ Complete

### Epic 2: AI-Powered Campaign Orchestration
**Scope:** Anthropic Claude API integráció, CopilotKit Protocol, Campaign Brief → Structure AI, Message Matrix AI, frontend "kampánysegéd" UI.  
**Key Files:**
- `lib/ai/client.ts` - AI provider factory (multi-provider support - Story 3.0.6)
- `lib/ai/providers/` - Provider implementációk (Anthropic, OpenAI, Google, Ollama)
- `app/api/ai/stream/route.ts` - CopilotKit event stream
- `app/api/ai/campaign-brief/route.ts` - Campaign structure AI
- `components/ai/CampaignAssistant.tsx` - CopilotKit wrapper

**Status:** ✅ Complete

### Epic 3.0: Message Matrix Refactor
**Scope:** Üzenetmátrix refaktorálása konkrét üzenetekről kommunikációs stratégiákra. Enhanced segments/topics séma, message_strategies tábla (4 kategória, 16 mező), Strategy AI Generator.

**Key Changes:**
- Enhanced segments: demographic_profile, psychographic_profile, media_habits, example_persona, priority (primary/secondary)
- Enhanced topics: topic_type, content_angles, recommended_channels, risk_notes, priority
- segment_topic_matrix: importance (high/medium/low), role (core_message/support/experimental)
- message_strategies: strategy_core, style_tone, cta_funnel, extra_fields (16 sub-fields total)

**Key Files:**
- `app/api/strategies/route.ts` - Strategy CRUD
- `app/api/ai/strategy-matrix/route.ts` - Strategy AI generator
- `components/messages/MessageMatrix.tsx` - Refactored matrix UI
- `lib/ai/prompts/strategy-generator.ts` - Strategy generation prompt

**Status:** ✅ Complete

### Epic 4.0: Strategic Data Enhancement
**Scope:** Stratégiai metadata bővítés execution planning-hez: goals (funnel_stage, kpi_hint), topics (related_goal_stages, recommended_content_types), narratives (primary_goal_ids, primary_topic_ids, suggested_phase), matrix validation rules, "Ready for Execution" checklist.

**Key Files:**
- `lib/validation/campaign-structure.ts` - Validation helpers
- `app/api/campaigns/[id]/validation/route.ts` - Validation endpoint
- `components/ai/ExecutionReadinessChecklist.tsx` - Checklist component

**Status:** ✅ Complete

### Epic 5: Execution Planner
**Scope:** AI-powered execution planner kétfázisú megközelítéssel: sprint generálás (strategic execution phases), majd per-sprint content slot generálás.

**Phase 1:** Sprints + content slots együtt generálva (`/api/ai/campaign-execution`)  
**Phase 2:** Kétfázisú modell:
- Sprint-only: `/api/ai/campaign-sprints` - Enhanced sprint metadata (focus_stage, focus_goals[], suggested_weekly_post_volume, narrative_emphasis[], key_messages_summary, success_criteria[], risks_and_watchouts[])
- Per-sprint content: `/api/ai/campaign-sprints/[sprintId]/content-slots`

**Key Files:**
- `app/api/ai/campaign-sprints/route.ts` - Sprint-only AI generation
- `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` - Per-sprint content generation
- `lib/ai/prompts/sprint-planner.ts` - Sprint generation prompt
- `lib/ai/prompts/content-slot-planner.ts` - Content slot generation prompt
- `components/campaigns/ExecutionPlanner.tsx` - Two-phase UI

**Status:** ✅ Complete (Phase 2)

---

## Database Schema

**Core Tables:**
- `campaigns` - id, name, campaign_type, start_date, end_date, primary_goal_type, status
- `goals` - id, campaign_id, title, funnel_stage, kpi_hint, priority
- `segments` - id, campaign_id, name, demographic_profile (JSONB), psychographic_profile (JSONB), media_habits (JSONB), priority
- `topics` - id, campaign_id, name, topic_type, content_angles (JSONB), recommended_channels (JSONB), priority
- `segment_topic_matrix` - segment_id, topic_id, importance, role
- `message_strategies` - id, campaign_id, segment_id, topic_id, strategy_core (JSONB), style_tone (JSONB), cta_funnel (JSONB), extra_fields (JSONB)
- `narratives` - id, campaign_id, title, primary_goal_ids[], primary_topic_ids[], suggested_phase
- `sprints` - id, campaign_id, name, order, start_date, end_date, focus_stage, focus_goals[], suggested_weekly_post_volume (JSONB), narrative_emphasis[], key_messages_summary, success_criteria[], risks_and_watchouts[]
- `sprint_segments`, `sprint_topics`, `sprint_channels` - Junction tables with priority (primary/secondary)
- `content_slots` - id, sprint_id, date, channel, slot_index, primary_segment_id, primary_topic_id, objective, content_type, status
- `content_drafts` - id, slot_id, variant_name, status, hook, body, cta_copy, visual_idea, created_by

**Migration Files:**
- `YYYYMMDD_initial_schema.sql` - Epic 1 base schema
- `YYYYMMDD_enhanced_segments_topics.sql` - Epic 3.0.5 enhanced schema
- `YYYYMMDD_message_strategies.sql` - Epic 3.0 message strategies
- `YYYYMMDD_strategic_metadata_enhancement.sql` - Epic 4.0 enhancements
- `YYYYMMDD_execution_planning_schema.sql` - Epic 5 sprints + content_slots
- `YYYYMMDD_enhanced_sprint_schema.sql` - Epic 5 Phase 2 enhanced sprints
- `YYYYMMDD_sprint_primary_secondary.sql` - Epic 5.10 priority in junction tables
- `YYYYMMDD_content_slot_draft_separation.sql` - Epic 6.1 content drafts

---

## Technical Architecture

**Frontend:**
- Next.js App Router with Server Components (default)
- Client Components only for interactive features (forms, drag-and-drop)
- Shadcn/ui component library
- Tailwind CSS utility-first styling

**Backend:**
- Next.js API Routes (App Router route handlers)
- Supabase Postgres direct connection
- Row Level Security (RLS) disabled in v1 (single-user)

**AI Integration:**
- Multi-provider support (Anthropic, OpenAI, Google Gemini, Ollama) via `AI_PROVIDER` env var
- Unified `AIProvider` interface with `generateText()` and `generateStream()`
- Zod schema validation for all LLM outputs
- CopilotKit Protocol for frontend-agent communication (real-time streaming)

**State Management:**
- Server Components for data fetching
- React Server Actions for form submissions
- CopilotKit state sync for AI interactions (Epic 2+)

**Validation:**
- Zod schemas for all structured data
- Campaign structure validation helpers (`lib/validation/campaign-structure.ts`)
- "Ready for Execution" checklist system (Epic 4.0)

---

## API Endpoints

**Campaigns:**
- `GET/POST /api/campaigns` - List/create campaigns
- `GET/PUT/DELETE /api/campaigns/[id]` - Single campaign operations
- `POST /api/campaigns/structure` - Save campaign structure (goals, segments, topics, matrix)
- `GET /api/campaigns/[id]/validation` - Campaign validation status

**AI Endpoints:**
- `POST /api/ai/campaign-brief` - Generate campaign structure from brief
- `POST /api/ai/strategy-matrix` - Generate communication strategies
- `POST /api/ai/campaign-sprints` - Generate sprints only (Phase 2)
- `POST /api/ai/campaign-sprints/[sprintId]/content-slots` - Generate content slots per sprint
- `POST /api/ai/campaign-execution` - Generate sprints + content slots (deprecated, backward compatible)
- `POST /api/ai/stream` - CopilotKit event stream

**Resources:**
- `GET/POST /api/segments` - Segments CRUD
- `GET/POST /api/topics` - Topics CRUD
- `GET/POST /api/strategies` - Message strategies CRUD
- `GET/POST /api/sprints` - Sprints CRUD
- `GET/POST /api/content-slots` - Content slots CRUD

---

## Development Setup

**Prerequisites:**
- Node.js 20.x LTS
- Supabase account and project
- Git

**Initial Setup:**
```bash
# 1. Next.js project
npx create-next-app@latest campaign-os --typescript --tailwind --app --no-src-dir

# 2. Dependencies
cd campaign-os
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-slot @radix-ui/react-dialog lucide-react date-fns clsx tailwind-merge
npm install @anthropic-ai/sdk zod  # Epic 2

# 3. Environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
AI_PROVIDER=anthropic  # or: openai, google, ollama
ANTHROPIC_API_KEY=sk-ant-...  # if AI_PROVIDER=anthropic
AI_MODEL=claude-haiku-4-5  # Optional, provider-specific

# 4. Supabase migration
# Run migrations from supabase/migrations/ in Supabase SQL Editor

# 5. Generate TypeScript types
npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts

# 6. Development server
npm run dev
```

---

## Key Code Locations

**AI Infrastructure:**
- `lib/ai/client.ts` - AI provider factory
- `lib/ai/providers/` - Provider implementations (base, anthropic, openai, google, ollama)
- `lib/ai/schemas.ts` - Zod validation schemas
- `lib/ai/prompts/` - LLM prompt templates

**Campaign Structure:**
- `app/api/campaigns/structure/route.ts` - Save campaign structure
- `app/api/ai/campaign-brief/route.ts` - AI structure generation
- `components/campaigns/CampaignWizard.tsx` - Campaign creation wizard

**Message Strategies:**
- `app/api/strategies/route.ts` - Strategy CRUD
- `app/api/ai/strategy-matrix/route.ts` - Strategy AI generation
- `components/messages/MessageMatrix.tsx` - Strategy matrix UI

**Execution Planning:**
- `app/api/ai/campaign-sprints/route.ts` - Sprint generation
- `app/api/ai/campaign-sprints/[sprintId]/content-slots/route.ts` - Content slot generation
- `components/campaigns/ExecutionPlanner.tsx` - Execution planner UI
- `lib/ai/prompts/sprint-planner.ts` - Sprint planning prompt
- `lib/ai/prompts/content-slot-planner.ts` - Content slot planning prompt

**Validation:**
- `lib/validation/campaign-structure.ts` - Validation helpers
- `app/api/campaigns/[id]/validation/route.ts` - Validation endpoint
- `components/ai/ExecutionReadinessChecklist.tsx` - Checklist UI

---

## Testing & Quality

**Current Approach:**
- Manual testing for all features
- Supabase local development environment
- Browser DevTools for debugging
- Jest for unit and integration testing (configured)

**Planned (Future):**
- Playwright for E2E tests
- React Testing Library for component tests
- 80%+ coverage for critical logic

---

## Deployment

**Environment:**
- Vercel (Next.js optimized)
- Supabase Cloud (database)
- Environment variables: Supabase + AI provider API keys

**Deployment Steps:**
1. Create Vercel project
2. Connect GitHub repository
3. Set environment variables in Vercel
4. Run Supabase migrations on production DB
5. Deploy: `vercel --prod`

---

## Conventions

**Naming:**
- Components: PascalCase (`CampaignList.tsx`)
- API routes: `route.ts` (kebab-case directories)
- Database tables: snake_case, plural (`campaigns`, `segments`)
- TypeScript types: PascalCase interfaces

**Code Style:**
- 2 spaces indentation
- Semicolons
- Single quotes for strings
- Trailing commas
- ESLint + Prettier

**File Organization:**
- Colocation: components near usage
- Server Components default, Client Components only when needed
- `lib/` for reusable utilities
- `components/ui/` for base UI components

---

## Documentation References

**Detailed Story Documentation:**
- `docs/sprint-artifacts/` - Sprint-specific documentation
- `docs/epics.md` - Epic breakdown and status
- `docs/sprint-status.yaml` - Current sprint status

**Key Documents:**
- `docs/ai-kampany-generacio-folyamat-2025-11-23.md` - AI generation workflow
- `docs/ai-provider-abstraction-plan.md` - Multi-provider architecture
- `docs/sprint-artifacts/content-slot-draft-separation-plan.md` - Content slot planning details
- `docs/sprint-artifacts/5-10-sprint-plan-primary-secondary-schema.md` - Sprint priority schema

---

**Note:** Ez a dokumentum összefoglaló. Részletes implementációs információk az epic- és sprint-specifikus dokumentációkban találhatók.
