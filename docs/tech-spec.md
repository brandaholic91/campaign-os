# campaign-os - Technical Specification

**Author:** Balazs
**Date:** 2025-11-20
**Project Level:** quick-flow
**Change Type:** Greenfield projekt inicializálása - Epic 1 (Sprint 1 MVP) + Epic 2 (AI/CopilotKit)
**Development Context:** Greenfield - új codebase, Campaign OS kommunikációs és social média kampánytervező
**Last Updated:** 2025-11-21 (Epic 2 planning added)

---

## Context

### Available Documents

**Betöltött dokumentumok:**

✓ **ChatGPT-Campaign OS.md** - Teljes projekt koncepció és tervezés
  - Projekt: Campaign OS - kommunikációs és social média kampánytervező
  - Funkciók: kampánycélok → célcsoportok → témák → üzenetek → csatornák → tartalomnaptár → sprintek
  - Adatmodell: campaigns, goals, segments, topics, messages, channels, content_slots, sprints, tasks
  - Deep Agent: Campaign Orchestrator több al-modullal
  - Tech stack javaslat: Next.js + TypeScript + Tailwind + Supabase Postgres
  - Roadmap: 3 sprintes fejlesztési terv

○ Nincs product brief fájl (*brief*.md)
○ Nincs research dokumentum (*research*.md)
○ Nincs brownfield dokumentáció (index.md)

### Project Stack

**Projekt típus:** Greenfield projekt - új codebase

**Javasolt tech stack a dokumentumból:**

**Frontend:**
- Next.js (React framework)
- TypeScript (típusbiztonság)
- Tailwind CSS (styling)

**Backend:**
- Next.js API Routes (első körben)
- Opcionálisan: Node/Express külön backend

**Adatbázis:**
- Supabase Postgres (PostgreSQL)
- Alternatíva: lokális Postgres

**Auth:**
- v1-ben: single-user (csak te)
- Később: multi-tenant/jelölt

**Deployment:**
- Fejlesztés: local dev
- Később: Hetzner / Vercel

**Pontos verziók:**
- Next.js 16.0.3 (App Router)
- React 19.0.0
- TypeScript 5.3.0
- Tailwind CSS 3.4.0
- Supabase JS 2.39.0
- Node.js 20.x LTS
- PostgreSQL 15+ (Supabase managed)

### Existing Codebase Structure

**Greenfield projekt** - új codebase, nincs meglévő kód.

A projekt jelenleg csak dokumentációt tartalmaz:
- `docs/` mappa: projekt dokumentáció
- Nincs még `package.json`, `node_modules`, vagy forráskód

**Következő lépések inicializáláshoz:**
1. Next.js projekt létrehozása
2. TypeScript konfiguráció
3. Tailwind CSS beállítása
4. Supabase kapcsolat konfigurálása
5. Alap projekt struktúra létrehozása

---

## The Change

### Problem Statement

A kampánytervezés jelenleg szétszórt Google Doc-okban és Excel táblázatokban történik, ami nehézzé teszi a koordinációt, a követést és a stratégiai áttekintést. Hiányzik egy központi eszköz, ami támogatja a teljes kampánytervezési folyamatot: kampánycélok → célcsoportok → témák → üzenetek → csatornák → tartalomnaptár → sprintek és feladatok. A rendszernek kampánytípus-függetlennek kell lennie (politikai, márka, NGO, helyi ügy), és időablakokra optimalizáltnak (1 hét, 1 hónap, 3 hónap).

### Proposed Solution

Campaign OS - egy webes kommunikációs és social média kampánytervező eszköz, amely a teljes kampánytervezési folyamatot támogatja. Sprint 1 fókusz: működő, manuális "War Room" eszköz AI nélkül, amely lehetővé teszi a kampányok létrehozását, célcsoportok és témák kezelését, üzenetmátrix építését, valamint sprint és task board funkcionalitást. A rendszer Next.js + TypeScript + Tailwind + Supabase stack-en épül, kampánytípus-független architektúrával (campaign_type + goal_type dimenziók).

### Scope

**In Scope (Sprint 1):**

1. **Next.js projekt inicializálása** - App Router, TypeScript, Tailwind CSS
2. **Supabase adatbázis séma** - campaigns, goals, segments, topics, messages, channels, sprints, tasks táblák
3. **Kampány CRUD műveletek** - kampánylista, létrehozás, szerkesztés, törlés
4. **Célcsoportok és témák kezelése** - segments és topics CRUD műveletek
5. **Üzenetmátrix UI** - manuális üzenet rögzítés segment × topic kombinációkra
6. **Sprint és task board** - sprint létrehozás, feladatok hozzáadása, Kanban-stílusú státusz kezelés
7. **Alap dashboard layout** - sidebar navigáció, kampány overview oldalak

**Out of Scope (Sprint 2-3-re halasztva):**

1. LLM/AI integráció (Campaign Orchestrator agent, message generator) - **Epic 2: CopilotKit + AI integration**
2. Content calendar generálás - Epic 3
3. Risk modul - Epic 3
4. Export/PDF funkcionalitás - Epic 3+
5. Multi-user/auth rendszer (v1-ben single-user) - Future
6. Politikai specifikus modulok (risk tracker, scenario board) - Future

**Note:** Epic 2 will introduce CopilotKit protocol for frontend-agent communication, enabling real-time "kampánysegéd" (campaign assistant) with bi-directional state sync.

---

## Implementation Details

### Source Tree Changes

**Projekt inicializálás - új fájlok létrehozása:**

```
campaign-os/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # CREATE - Root layout sidebar navigációval
│   ├── page.tsx                            # CREATE - Dashboard home
│   ├── campaigns/
│   │   ├── page.tsx                        # CREATE - Kampánylista
│   │   ├── new/page.tsx                    # CREATE - Új kampány létrehozás
│   │   └── [id]/
│   │       ├── page.tsx                    # CREATE - Kampány detail overview
│   │       ├── segments/page.tsx           # CREATE - Célcsoportok kezelés
│   │       ├── topics/page.tsx            # CREATE - Témák kezelés
│   │       ├── messages/page.tsx           # CREATE - Üzenetmátrix UI
│   │       └── sprints/page.tsx           # CREATE - Sprint board
│   └── api/
│       ├── campaigns/
│       │   ├── route.ts                    # CREATE - GET, POST campaigns
│       │   └── [id]/route.ts              # CREATE - GET, PUT, DELETE campaign
│       ├── segments/route.ts               # CREATE - Segments CRUD
│       ├── topics/route.ts                # CREATE - Topics CRUD
│       ├── messages/route.ts              # CREATE - Messages CRUD
│       ├── sprints/route.ts               # CREATE - Sprints CRUD
│       └── tasks/route.ts                 # CREATE - Tasks CRUD
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # CREATE - Supabase client
│   │   └── types.ts                        # CREATE - Generated TypeScript types
│   └── utils.ts                           # CREATE - Helper functions
├── components/
│   ├── ui/                                 # CREATE - Shadcn/ui komponensek
│   ├── campaigns/
│   │   ├── CampaignList.tsx               # CREATE - Kampánylista komponens
│   │   ├── CampaignForm.tsx               # CREATE - Kampány form
│   │   └── CampaignCard.tsx               # CREATE - Kampány kártya
│   ├── segments/
│   │   └── SegmentManager.tsx           # CREATE - Célcsoport kezelő
│   ├── topics/
│   │   └── TopicManager.tsx               # CREATE - Téma kezelő
│   ├── messages/
│   │   └── MessageMatrix.tsx             # CREATE - Üzenetmátrix táblázat
│   └── sprints/
│       ├── SprintBoard.tsx                # CREATE - Kanban board
│       └── TaskCard.tsx                   # CREATE - Task kártya
├── supabase/
│   ├── migrations/
│   │   └── 20251120_initial_schema.sql   # CREATE - Supabase migration
│   └── seed.sql                           # CREATE - Test adatok (opcionális)
├── package.json                           # CREATE - Dependencies
├── tsconfig.json                          # CREATE - TypeScript config
├── tailwind.config.ts                     # CREATE - Tailwind config
└── next.config.js                         # CREATE - Next.js config
```

**Módosítások:** Nincs - greenfield projekt

### Technical Approach

**Frontend architektúra:**
- Next.js 15 App Router használata Server Components-sel a jobb teljesítményért
- TypeScript strict mode a típusbiztonságért
- Tailwind CSS utility-first megközelítés gyors UI fejlesztéshez
- Shadcn/ui komponenskönyvtár használata konzisztens design system-hez
- Client Components csak interaktív elemekhez (formok, drag-and-drop)

**Backend/API megközelítés:**
- Next.js API Routes (App Router route handlers) első körben
- Supabase Postgres adatbázis közvetlen kapcsolattal
- Row Level Security (RLS) v1-ben kikapcsolva (single-user)
- Supabase TypeScript típusok generálása a sémából

**Adatmodell stratégia:**
- Campaign-centric architektúra: minden entitás campaign_id-hoz kötve
- JSONB mezők használata flexibilis adatokhoz (demographics, attitudes, target_metric)
- Enum típusok PostgreSQL-ben campaign_type, goal_type, status mezőkhöz
- Soft delete pattern: deleted_at mező ahelyett, hogy törölnénk

**State management:**
- Server Components elsődleges használata, minimális client state
- React Server Actions form kezeléshez
- Optimistic updates ahol szükséges (task status változtatás)

### Existing Patterns to Follow

**Greenfield projekt** - új konvenciók létrehozása:

**Naming konvenciók:**
- Komponensek: PascalCase (CampaignList.tsx)
- Fájlok: kebab-case API routes-oknál (route.ts)
- Táblák: snake_case, többes szám (campaigns, segments, topics)
- TypeScript típusok: PascalCase, Interface suffix (Campaign, Segment)

**Kód organizáció:**
- Colocation: komponensek a használatuk közelében
- API routes: RESTful konvenciók követése
- Server Components default, Client Components csak szükség esetén
- Lib mappa: újrahasználható utility függvények

**Error handling:**
- Try-catch blokkok API routes-ban
- Standard HTTP status kódok használata
- User-friendly error üzenetek
- Console logging development módban

**TypeScript patterns:**
- Strict null checks
- Explicit return types API routes-ban
- Zod schema validáció bemenetekhez (opcionális v1-ben)
- Generated Supabase típusok használata

### Integration Points

**Supabase integráció:**
- Supabase client inicializálása environment változókból
- Database connection pooling
- Real-time subscriptions később (Sprint 2+)
- Supabase Auth később (v1-ben nincs auth)

**External API-k (Sprint 1-ben nincs):**
- Anthropic Claude API (Epic 2) - LLM integration
- CopilotKit Protocol (Epic 2) - Frontend-agent communication (CopilotKit or custom)
- Meta/Google Ads API (jövőbeli)
- Email service integráció (jövőbeli)

**Internal modulok:**
- Campaign service layer a CRUD logikához
- Segment/Topic service a validációhoz
- Message matrix service a kombinációk kezeléséhez
- Sprint/Task service a Kanban logikához

**Frontend-Backend kommunikáció:**
- Server Actions form submission-ökhöz
- Fetch API client-side data fetching-hez
- Optimistic updates task status változtatáshoz

---

## Development Context

### Relevant Existing Code

**Greenfield projekt** - nincs meglévő kód referálni.

**Inspiráció források:**
- Next.js App Router dokumentáció: Server Components, Server Actions
- Supabase dokumentáció: PostgreSQL sémák, TypeScript típusok
- Shadcn/ui komponensek: form, table, card komponensek
- Kanban board implementációk: drag-and-drop patterns

### Dependencies

**Framework/Libraries:**

**Core:**
- next@15.0.0 (React framework, App Router)
- react@19.0.0 (UI library)
- react-dom@19.0.0

**TypeScript:**
- typescript@5.3.0
- @types/node@20.10.0
- @types/react@19.0.0
- @types/react-dom@19.0.0

**Styling:**
- tailwindcss@3.4.0
- postcss@8.4.0
- autoprefixer@10.4.0
- clsx@2.0.0 (conditional classNames)
- tailwind-merge@2.2.0

**UI Components:**
- @radix-ui/react-slot@1.0.2
- @radix-ui/react-dialog@1.0.5
- @radix-ui/react-dropdown-menu@2.0.6
- @radix-ui/react-select@2.0.0
- lucide-react@0.300.0 (icons)

**Database:**
- @supabase/supabase-js@2.39.0
- @supabase/ssr@0.1.0 (Next.js SSR support)

**Utilities:**
- date-fns@3.0.0 (date formatting)
- zod@3.22.4 (schema validation, opcionális v1-ben, kötelező Epic 2-ben)

**AI/LLM (Epic 2):**
- @anthropic-ai/sdk@^0.20.0 (Anthropic Claude API client)
- zod@3.22.4 (LLM output validation, kötelező)

**CopilotKit Protocol (Epic 2):**
- @copilotkit/react-core@^1.0.0 (CopilotKit React client, opcionális - vagy custom implementation)
- WebSocket vagy Server-Sent Events for real-time streaming

**Internal Modules:**

**lib/supabase/** - Supabase client és típusok
**lib/utils.ts** - Utility függvények (cn helper, formatters)
**components/ui/** - Alap UI komponensek (Button, Input, Card, Table)
**components/campaigns/** - Kampány-specifikus komponensek
**components/segments/** - Célcsoport kezelő komponensek
**components/topics/** - Téma kezelő komponensek
**components/messages/** - Üzenetmátrix komponensek
**components/sprints/** - Sprint és task board komponensek

### Configuration Changes

**Environment változók (.env.local):**

**Sprint 1 (Epic 1):**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Epic 2 (AI/CopilotKit):**
```
ANTHROPIC_API_KEY=your-anthropic-api-key
# CopilotKit endpoint: /api/ai/stream (hardcoded, no environment variable needed)
```

**Next.js konfiguráció (next.config.js):**
- TypeScript strict mode
- Tailwind CSS beállítások
- Image optimization beállítások

**Supabase konfiguráció:**
- PostgreSQL 15+ adatbázis
- Row Level Security (RLS) v1-ben kikapcsolva
- API auto-generated típusok
- Migration fájlok versionálva

**TypeScript konfiguráció (tsconfig.json):**
- Strict mode enabled
- Path aliases (@/components, @/lib)
- Next.js recommended settings

### Existing Conventions (Brownfield)

**Greenfield projekt** - új konvenciók létrehozása modern best practices alapján:

**Code style:**
- 2 spaces indentation
- Semicolons használata
- Single quotes strings-hez
- Trailing commas
- ESLint + Prettier konfiguráció

**Git konvenciók:**
- Conventional commits
- Feature branches
- Meaningful commit messages

**File naming:**
- Components: PascalCase
- Utilities: camelCase
- API routes: route.ts
- Types: PascalCase interfaces

### Test Framework & Standards

**Sprint 1-ben:**
- Nincs automatikus tesztelés (manual testing)
- Supabase local development environment teszteléshez

**Sprint 2+ (tervezett):**
- Vitest unit tesztekhez
- Playwright E2E tesztekhez
- React Testing Library komponens tesztekhez
- Test coverage: 80%+ kritikus logikához

---

## Implementation Stack

**Runtime:**
- Node.js 20.x LTS
- Next.js 16.0.3 (App Router) - Epic 1 uses latest stable

**Language & Type Safety:**
- TypeScript 5.3.0
- Strict mode enabled
- Zod 3.22.4 (Epic 2: LLM output validation)

**Frontend:**
- React 19.0.0
- Tailwind CSS 3.4.0
- Shadcn/ui komponenskönyvtár
- Lucide React icons
- CopilotKit Protocol (Epic 2: CopilotKit or custom client)

**Backend:**
- Next.js API Routes (App Router)
- Supabase Postgres (PostgreSQL 15+)
- Anthropic Claude API (Epic 2: LLM integration)
- CopilotKit Server (Epic 2: event streaming)

**Database:**
- Supabase (managed PostgreSQL)
- Row Level Security (v1-ben disabled)

**AI/LLM (Epic 2):**
- Anthropic Claude API (@anthropic-ai/sdk)
- CopilotKit Protocol for frontend-agent communication
- Zod schemas for structured LLM outputs

**Development Tools:**
- ESLint + Prettier
- TypeScript strict mode
- Git version control

**Deployment:**
- Vercel (Next.js optimalizált)
- Supabase Cloud (adatbázis)
- Environment variables: Supabase + Anthropic API keys

---

## Technical Details

**Adatbázis séma részletek:**

**campaigns tábla:**
- id (uuid, primary key)
- name (text, not null)
- campaign_type (enum: political_election, political_issue, brand_awareness, product_launch, promo, ngo_issue)
- start_date (date, not null)
- end_date (date, not null)
- primary_goal_type (enum: awareness, engagement, list_building, conversion, mobilization)
- secondary_goals (jsonb array)
- description (text)
- budget_estimate (numeric)
- status (enum: planning, running, closed)
- created_at, updated_at (timestamps)

**goals tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- title (text, not null)
- description (text)
- target_metric (jsonb) - pl. {"type": "reach", "value": 100000}
- priority (int, default 1)
- created_at, updated_at (timestamps)

**segments tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- name (text, not null)
- description (text)
- short_label (text, nullable) - UI display label (e.g., "20–35 városi")
- demographics (jsonb) - Legacy field, migrated to demographic_profile
- psychographics (jsonb) - Legacy field, migrated to psychographic_profile
- demographic_profile (jsonb) - Structured: age_range, location_type, income_level, other_demographics
- psychographic_profile (jsonb) - Structured: values[], attitudes_to_campaign_topic[], motivations[], pain_points[]
- media_habits (jsonb) - Structured: primary_channels[], secondary_channels[], notes
- funnel_stage_focus (text) - Enum: awareness, engagement, consideration, conversion, mobilization
- example_persona (jsonb) - Structured: name, one_sentence_story
- priority (text) - Enum: 'primary' | 'secondary' (migrated from INTEGER 1-5)
- created_at, updated_at (timestamps)

**topics tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- name (text, not null)
- description (text)
- short_label (text, nullable) - UI display label (e.g., "Zöld = spórolás")
- category (text, nullable) - Legacy field, kept for backward compatibility
- topic_type (text) - Enum: benefit, problem, value, proof, story
- related_goal_types (jsonb) - Array of strings (e.g., ["awareness", "engagement"])
- core_narrative (text) - 1-2 sentence narrative description
- content_angles (jsonb) - Array of strings (content approach ideas)
- recommended_channels (jsonb) - Array of strings (e.g., ["instagram_reels", "tiktok"])
- risk_notes (jsonb) - Array of strings (warnings/guidelines)
- priority (text) - Enum: 'primary' | 'secondary'
- created_at, updated_at (timestamps)

**segment_topic_matrix tábla (NEW):**
- segment_id (uuid, fk → segments, on delete cascade)
- topic_id (uuid, fk → topics, on delete cascade)
- importance (text) - Enum: 'high' | 'medium' | 'low'
- role (text) - Enum: 'core_message' | 'support' | 'experimental'
- Primary key: (segment_id, topic_id)
- Indexes on segment_id and topic_id for query performance

**messages tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- segment_id (uuid, fk → segments, nullable)
- topic_id (uuid, fk → topics, nullable)
- message_type (enum: core, supporting, contrast)
- headline (text, not null)
- body (text)
- proof_point (text)
- cta (text)
- status (enum: draft, approved)
- created_at, updated_at (timestamps)

**channels tábla:**
- id (uuid, pk)
- name (text, not null, unique)
- type (enum: social, paid, owned)
- created_at, updated_at (timestamps)

**campaign_channels tábla (junction):**
- campaign_id (uuid, fk → campaigns)
- channel_id (uuid, fk → channels)
- weight (int 1-5, nullable)
- Primary key: (campaign_id, channel_id)

**sprints tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- name (text, not null)
- start_date, end_date (date, not null)
- focus_goal (text)
- focus_channels (jsonb array, default [])
- status (enum: planned, active, closed)
- created_at, updated_at (timestamps)
- Constraint: end_date > start_date

**tasks tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- sprint_id (uuid, fk → sprints, nullable)
- channel_id (uuid, fk → channels, nullable)
- title (text, not null)
- description (text)
- category (enum: creative, copy, social_setup, ads_setup, analytics, coordination)
- status (enum: todo, in_progress, done, default todo)
- assignee (text)
- due_date (date)
- created_at, updated_at (timestamps)

**channels tábla:**
- id (uuid, pk)
- name (text) - "Facebook organic", "Instagram reels", "TikTok", etc.
- type (enum: social, paid, owned)
- created_at, updated_at

**Algoritmusok és logika:**
- Message matrix kombinációk: segment × topic → message generálás
- Kanban board: task status változtatás (todo → in_progress → done)
- Campaign validation: start_date < end_date, required fields
- Sprint date overlap ellenőrzés
- Foreign key cascade delete: campaign törlés → kapcsolódó entitások törlése
- Updated_at trigger: automatikus timestamp frissítés
- JSONB query patterns: demographics, psychographics, target_metric
- Enum type safety: TypeScript + PostgreSQL enum szinkronizáció

---

## Development Setup

**Előfeltételek:**
1. Node.js 20.x LTS telepítve
2. Supabase account és projekt létrehozva
3. Git telepítve

**Projekt inicializálás (Epic 1):**
```bash
# 1. Next.js projekt létrehozása
npx create-next-app@latest campaign-os --typescript --tailwind --app --no-src-dir

# 2. Dependencies telepítése (Epic 1)
cd campaign-os
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react date-fns clsx tailwind-merge
npm install -D @types/node

# 3. Supabase migration futtatása
# Supabase CLI vagy Supabase Dashboard-on keresztül

# 4. Environment változók beállítása (Epic 1)
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL és NEXT_PUBLIC_SUPABASE_ANON_KEY beállítása

# 5. Development server indítása
npm run dev
```

**Epic 2 kiegészítő setup:**
```bash
# 6. Epic 2 dependencies telepítése
npm install @anthropic-ai/sdk zod
npm install @copilotkit/react-core  # Optional - CopilotKit client

# 7. Environment változók frissítése (Epic 2)
# .env.local-hez hozzáadni:
# ANTHROPIC_API_KEY=sk-ant-...

# 8. Epic 2 development
# CopilotKit endpoint: /api/ai/stream
# AI endpoints: /api/ai/campaign-brief, /api/ai/message-matrix
```

**Supabase setup:**
1. Új projekt létrehozása Supabase Dashboard-on
2. SQL Editor-ben migration futtatása
3. API keys másolása
4. TypeScript típusok generálása: `npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`

---

## Implementation Guide

### Setup Steps

**Pre-implementation checklist:**
1. ✅ Supabase projekt létrehozva és migration futtatva
2. ✅ Environment változók konfigurálva
3. ✅ Next.js projekt inicializálva TypeScript-szel
4. ✅ Dependencies telepítve
5. ✅ Supabase TypeScript típusok generálva
6. ✅ Git repository inicializálva
7. ✅ Shadcn/ui komponensek telepítve (button, input, card, table, dialog)

### Implementation Steps

**Sprint 1 implementációs sorrend:**

**Phase 1: Projekt alapok (1-2 nap)**
1. Next.js projekt létrehozása create-next-app-pal
2. Tailwind CSS konfigurálása
3. Shadcn/ui inicializálása
4. Supabase client setup (lib/supabase/client.ts)
5. Alap layout komponens sidebar navigációval
6. Environment változók beállítása

**Phase 2: Adatbázis séma (1 nap)**
7. Supabase migration fájl létrehozása
8. Táblák létrehozása: campaigns, goals, segments, topics, messages, channels, sprints, tasks
9. Foreign key constraint-ek beállítása
10. Enum típusok létrehozása
11. TypeScript típusok generálása Supabase-ból
12. Indexek hozzáadása (campaign_id, sprint_id)

**Phase 3: Kampány CRUD (2-3 nap)**
13. `/app/campaigns/page.tsx` - Kampánylista komponens
14. `CampaignList.tsx` komponens
15. `CampaignCard.tsx` komponens
16. `/app/api/campaigns/route.ts` - GET, POST endpoints
17. `/app/api/campaigns/[id]/route.ts` - GET, PUT, DELETE endpoints
18. `/app/campaigns/new/page.tsx` - Új kampány form
19. `CampaignForm.tsx` komponens validációval
20. `/app/campaigns/[id]/page.tsx` - Kampány detail oldal

**Phase 4: Goals, Segments és Topics (1-2 nap)**
21. `/app/campaigns/[id]/goals/page.tsx` - Célok oldal (opcionális v1-ben)
22. `GoalManager.tsx` komponens
23. `/app/api/goals/route.ts` - Goals API
24. `/app/campaigns/[id]/segments/page.tsx` - Célcsoportok oldal
25. `SegmentManager.tsx` komponens CRUD műveletekkel
26. `/app/api/segments/route.ts` - Segments API
27. `/app/campaigns/[id]/topics/page.tsx` - Témák oldal
28. `TopicManager.tsx` komponens
29. `/app/api/topics/route.ts` - Topics API

**Phase 5: Üzenetmátrix (2 nap)**
27. `/app/campaigns/[id]/messages/page.tsx` - Üzenetmátrix oldal
28. `MessageMatrix.tsx` komponens táblázatos megjelenítéssel
29. Segment × Topic kombinációk megjelenítése
30. `/app/api/messages/route.ts` - Messages API
31. Message form komponens
32. Message edit/delete funkcionalitás

**Phase 6: Sprint és Task Board (2-3 nap)**
33. `/app/campaigns/[id]/sprints/page.tsx` - Sprint board oldal
34. `SprintBoard.tsx` Kanban komponens
35. `/app/api/sprints/route.ts` - Sprints API
36. `/app/api/tasks/route.ts` - Tasks API
37. `TaskCard.tsx` komponens drag-and-drop nélkül (v1)
38. Task status változtatás (todo → in_progress → done)
39. Sprint létrehozás form
40. Task hozzáadás form

**Phase 7: Finishing touches (1 nap)**
41. Error handling API routes-ban
42. Loading states komponensekben
43. Empty states (nincs kampány, nincs task)
44. Navigation aktív state
45. Responsive design ellenőrzés

### Testing Strategy

**Sprint 1 - Manual testing fókusz:**

**Manuális tesztelési checklist:**
1. Kampány létrehozás - minden mező validáció
2. Kampány szerkesztés - mezők frissítése
3. Kampány törlés - confirmáció
4. Segments CRUD - létrehozás, szerkesztés, törlés
5. Topics CRUD - létrehozás, szerkesztés, törlés
6. Message matrix - üzenet hozzáadás segment × topic kombinációhoz
7. Sprint létrehozás - dátum validáció
8. Task hozzáadás sprinthez
9. Task status változtatás
10. Navigation - oldalak közötti navigáció
11. Responsive design - mobile, tablet, desktop

**Edge cases tesztelése:**
- Üres kampánylista
- Nincs segment/topic message matrix-ben
- Sprint dátum overlap
- Invalid dátumok (end < start)
- Hosszú szövegek (truncation)

**Sprint 2+ (tervezett automatikus tesztek):**
- Unit tesztek: utility függvények, validációk
- Integration tesztek: API endpoints
- E2E tesztek: kritikus user flows
- Component tesztek: form validációk

### Acceptance Criteria

**Sprint 1 MVP acceptance criteria:**

1. **Kampány kezelés:**
   - ✅ Felhasználó létrehozhat új kampányt campaign_type, dátumok, goal_type mezőkkel
   - ✅ Kampánylistán megjelennek az összes kampány
   - ✅ Kampány detail oldalon látható az összes kampány információ
   - ✅ Kampány szerkeszthető és törölhető

2. **Célcsoportok és témák:**
   - ✅ Felhasználó hozzáadhat/ szerkeszthet/ törölhet segmenteket egy kampányhoz
   - ✅ Felhasználó hozzáadhat/ szerkeszthet/ törölhet topiceket egy kampányhoz
   - ✅ Demographics és psychographics JSONB mezőkben tárolva

3. **Üzenetmátrix:**
   - ✅ Üzenetmátrix táblázatos formában jelenik meg (segment × topic)
   - ✅ Felhasználó hozzáadhat üzenetet konkrét segment × topic kombinációhoz
   - ✅ Üzenetek szerkeszthetők és törölhetők
   - ✅ Message type, headline, body, proof_point, CTA mezők

4. **Sprint és task board:**
   - ✅ Felhasználó létrehozhat sprinteket dátumokkal
   - ✅ Felhasználó hozzáadhat taskokat egy sprinthez
   - ✅ Task status változtatható (todo → in_progress → done)
   - ✅ Kanban-stílusú board megjelenítés (3 oszlop)

5. **Technikai követelmények:**
   - ✅ Next.js 15 App Router használata
   - ✅ TypeScript strict mode
   - ✅ Supabase adatbázis kapcsolat működik
   - ✅ Responsive design (mobile, tablet, desktop)
   - ✅ Nincs console error development módban

---

## Developer Resources

### File Paths Reference

**Teljes fájllista Sprint 1-hez:**

**App Router pages:**
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Dashboard home
- `app/campaigns/page.tsx` - Kampánylista
- `app/campaigns/new/page.tsx` - Új kampány
- `app/campaigns/[id]/page.tsx` - Kampány detail
- `app/campaigns/[id]/segments/page.tsx` - Célcsoportok
- `app/campaigns/[id]/topics/page.tsx` - Témák
- `app/campaigns/[id]/messages/page.tsx` - Üzenetmátrix
- `app/campaigns/[id]/sprints/page.tsx` - Sprint board

**API Routes:**
- `app/api/campaigns/route.ts` - Campaigns CRUD
- `app/api/campaigns/[id]/route.ts` - Single campaign
- `app/api/goals/route.ts` - Goals CRUD
- `app/api/segments/route.ts` - Segments CRUD
- `app/api/topics/route.ts` - Topics CRUD
- `app/api/messages/route.ts` - Messages CRUD
- `app/api/channels/route.ts` - Channels CRUD
- `app/api/sprints/route.ts` - Sprints CRUD
- `app/api/tasks/route.ts` - Tasks CRUD

**Components:**
- `components/ui/` - Shadcn/ui komponensek
- `components/campaigns/CampaignList.tsx`
- `components/campaigns/CampaignForm.tsx`
- `components/campaigns/CampaignCard.tsx`
- `components/segments/SegmentManager.tsx`
- `components/topics/TopicManager.tsx`
- `components/messages/MessageMatrix.tsx`
- `components/sprints/SprintBoard.tsx`
- `components/sprints/TaskCard.tsx`

**Lib:**
- `lib/supabase/client.ts` - Supabase client
- `lib/supabase/types.ts` - Generated types
- `lib/utils.ts` - Utilities

**Config:**
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind config
- `next.config.js` - Next.js config
- `.env.local` - Environment variables

**Database:**
- `supabase/migrations/20251120_initial_schema.sql` - Initial migration
- `docs/supabase-migration-example.sql` - Migration SQL referencia

### Key Code Locations

**Kritikus kód helyek:**

**Supabase client inicializálás:**
- `lib/supabase/client.ts` - createClient() függvény
- Environment változók: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

**API route pattern:**
- `app/api/[resource]/route.ts` - GET (list), POST (create)
- `app/api/[resource]/[id]/route.ts` - GET (single), PUT (update), DELETE
- Error handling: try-catch, proper HTTP status codes
- Response format: JSON, consistent error structure
- Type safety: Supabase generated types használata

**Form handling:**
- Server Actions használata form submission-ökhöz
- `CampaignForm.tsx`, `SegmentManager.tsx` - form komponensek
- Client-side validáció + server-side validáció

**Data fetching:**
- Server Components default data fetching
- `await supabase.from('campaigns').select()` pattern
- Error handling try-catch blokkokban

**Type safety:**
- `lib/supabase/types.ts` - Database típusok
- Interface definíciók komponensekhez
- Props típusok explicit definiálva

### Testing Locations

**Sprint 1 - Manual testing:**
- Browser DevTools Console - error ellenőrzés
- Network tab - API hívások ellenőrzése
- Supabase Dashboard - adatbázis adatok ellenőrzése
- Responsive design - Chrome DevTools device emulation

**Sprint 2+ (tervezett):**
- `__tests__/` vagy `*.test.ts` fájlok
- `tests/e2e/` - Playwright E2E tesztek
- `tests/unit/` - Vitest unit tesztek
- CI/CD pipeline - GitHub Actions vagy Vercel

### Documentation to Update

**Sprint 1 dokumentáció:**
- README.md - Projekt setup, development instructions
- docs/tech-spec.md - Ez a dokumentum
- Inline kommentek - komplex logika magyarázata
- API endpoint dokumentáció - JSDoc kommentek route-oknál

**Jövőbeli dokumentáció (Sprint 2+):**
- API dokumentáció (OpenAPI/Swagger)
- User guide
- Deployment guide
- Contributing guidelines

---

## UX/UI Considerations

**UI komponensek és layout:**

**Dashboard layout:**
- Sidebar navigáció bal oldalon: Kampányok, Dashboard
- Top bar: projekt neve, user info (v1-ben egyszerű)
- Main content area: oldal-specifikus tartalom
- Responsive: mobile-on sidebar hamburger menü

**Kampánylista:**
- Card-based layout kampányokhoz
- Filter opciók (status, campaign_type) - Sprint 2
- Search functionality - Sprint 2
- Empty state: "Hozz létre első kampányod"

**Kampány detail:**
- Tab navigation: Overview, Segments, Topics, Messages, Sprints
- Breadcrumb navigáció
- Action buttons: Edit, Delete
- Campaign info card: dátumok, típus, célok

**Üzenetmátrix:**
- Táblázatos megjelenítés: sorok = segments, oszlopok = topics
- Cell click → message form modal
- Empty cells: "Add message" CTA
- Message preview hover-en

**Sprint board:**
- Kanban 3 oszlop: Todo, In Progress, Done
- Task cards: title, assignee, due date
- Drag-and-drop Sprint 2-ben (v1-ben click to move)
- Sprint header: dátumok, goal summary
- Empty states oszlopokhoz

**Form komponensek:**
- Shadcn/ui Input, Select, Textarea
- Validation error messages
- Submit button loading state
- Success toast notifications

**Accessibility:**
- Keyboard navigation
- ARIA labels
- Focus management
- Color contrast WCAG AA

---

## Testing Approach

**Sprint 1 testing stratégia:**

**Manual testing fókusz:**
- Feature-by-feature testing minden CRUD műveletnél
- Cross-browser testing: Chrome, Firefox, Safari
- Responsive testing: mobile (375px), tablet (768px), desktop (1920px)
- Error scenario testing: invalid input, network errors
- Data integrity: foreign key constraint-ek, cascade delete

**Testing checklist:**
1. Kampány létrehozás minden mezővel
2. Kampány szerkesztés részleges mezők frissítésével
3. Kampány törlés confirmációval
4. Segment/Topic CRUD műveletek
5. Message matrix kombinációk
6. Sprint létrehozás dátum validációval
7. Task status workflow
8. Navigation flow teljes user journey
9. Empty states minden oldalon
10. Error states (network, validation)

**Sprint 2+ automatikus tesztelés:**
- Vitest unit tesztek utility függvényekhez
- React Testing Library komponens tesztek
- Playwright E2E kritikus flows-hoz
- API integration tesztek
- Test coverage: 80%+ kritikus logikához

---

## Deployment Strategy

### Deployment Steps

**Sprint 1 deployment (development):**
1. Supabase projekt létrehozása cloud-on
2. Migration futtatása Supabase SQL Editor-ben
3. Environment változók beállítása Supabase Dashboard-on
4. Local development: `npm run dev`
5. Vercel preview deployment (opcionális): `vercel --prod`

**Production deployment (Sprint 1 után):**
1. Vercel projekt létrehozása
2. GitHub repository connect
3. Environment variables beállítása Vercel-en
4. Supabase production database setup
5. Migration futtatása production DB-n
6. Domain konfigurálás (opcionális)
7. SSL certificate automatikus (Vercel)
8. Build és deploy: `vercel --prod`

**Deployment checklist:**
- ✅ Environment változók beállítva
- ✅ Supabase migration futtatva
- ✅ Build successful: `npm run build`
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Database connection működik
- ✅ API endpoints elérhetők

### Rollback Plan

**Rollback stratégia:**

**Vercel deployment:**
- Previous deployment instant rollback Vercel Dashboard-on
- Git revert + redeploy ha szükséges
- Environment változók visszaállítása

**Database rollback:**
- Migration rollback SQL script-tel
- Supabase backup restore (ha van)
- Manual data fix ha szükséges

**Code rollback:**
- Git revert utolsó commit
- Feature flag-ek használata (Sprint 2+)
- Database migration versioning

**Rollback trigger esetek:**
- Critical bug production-ben
- Performance degradation
- Data integrity issues
- Security vulnerability

### Monitoring

**Sprint 1 monitoring (basic):**
- Vercel Analytics - page views, performance
- Browser Console - error tracking
- Supabase Dashboard - database metrics, query performance
- Manual error reporting

**Sprint 2+ monitoring (tervezett):**
- Sentry error tracking
- Vercel Analytics detailed metrics
- Supabase monitoring - connection pool, query times
- User analytics - feature usage
- Performance monitoring - Core Web Vitals
- Uptime monitoring - external service

---

## Epic 2: AI-Powered Campaign Orchestration with CopilotKit

**Date:** 2025-11-21
**Epic:** Epic 2 - AI-Powered Campaign Orchestration
**Change Type:** AI/LLM integration + CopilotKit frontend protocol
**Development Context:** Building on Epic 1 foundation, adding intelligent campaign assistance

---

### Epic 2 Context

**Epic 1 Foundation (Complete):**
- ✅ Manual campaign management (CRUD)
- ✅ Audience segments and topics management
- ✅ Message matrix UI
- ✅ Sprint and task board
- ✅ Database schema with 8 core tables
- ✅ Next.js 16 + TypeScript + Tailwind + Supabase

**Epic 2 Goal:**
Introduce AI/LLM capabilities with CopilotKit frontend integration to accelerate campaign planning. Enable users to interact with an embedded "kampánysegéd" (campaign assistant) that provides real-time, contextual help during manual campaign creation, or generate complete campaign structures from briefs.

---

### Epic 2 Scope

**In Scope:**
1. **Anthropic Claude API integration** - LLM client setup, error handling, rate limiting
2. **CopilotKit protocol integration** - Frontend ↔ backend agent communication
3. **Campaign Brief → Structure AI** - Generate goals, segments, topics, narratives from text brief
4. **AI Message Matrix Generator** - Generate messages for segment × topic combinations
5. **Frontend "kampánysegéd" UI** - Real-time streaming chat, bi-directional state sync
6. **Frontend tool integration** - highlightField, prefillField, navigateToStep
7. **JSON schema validation** - Zod schemas for all LLM outputs
8. **User approval workflow** - Preview and approve/reject AI suggestions

**Out of Scope (Epic 3+):**
- AI-assisted sprint and task planning
- Full Campaign Orchestrator deep agent (multi-step autonomous)
- Content calendar AI generation
- Risk module AI
- RAG/knowledge base integration

---

### Epic 2 Source Tree Changes

**New files for Epic 2:**

```
campaign-os/
├── app/
│   ├── campaigns/
│   │   ├── new/
│   │   │   └── ai/page.tsx                    # CREATE - AI-assisted campaign creation
│   │   └── [id]/
│   │       └── messages/
│   │           └── page.tsx                   # MODIFY - Add AI generation button
│   └── api/
│       └── ai/
│           ├── stream/route.ts                # CREATE - CopilotKit event stream endpoint
│           ├── campaign-brief/route.ts        # CREATE - Campaign brief AI endpoint
│           └── message-matrix/route.ts         # CREATE - Message matrix AI endpoint
├── lib/
│   ├── ai/
│   │   ├── client.ts                          # CREATE - Anthropic Claude client
│   │   ├── schemas.ts                         # CREATE - Zod schemas for LLM outputs
│   │   ├── copilotkit/
│   │   │   ├── server.ts                      # CREATE - CopilotKit server event handler
│   │   │   ├── events.ts                      # CREATE - CopilotKit event type definitions
│   │   │   ├── tools.ts                       # CREATE - Backend tool definitions
│   │   │   └── orchestrator.ts                # CREATE - Campaign Orchestrator agent
│   │   └── prompts/
│   │       ├── brief-normalizer.ts            # CREATE - Brief normalization prompt
│   │       ├── strategy-designer.ts           # CREATE - Strategy design prompt
│   │       └── message-generator.ts           # CREATE - Message generation prompt
│   └── copilotkit/
│       ├── client.ts                          # CREATE - CopilotKit client
│       ├── events.ts                          # CREATE - Frontend event types
│       └── tools.ts                           # CREATE - Frontend tool implementations
├── components/
│   └── ai/
│       ├── CampaignAssistant.tsx             # CREATE - Main CopilotKit wrapper
│       ├── AssistantChat.tsx                 # CREATE - Streaming chat UI
│       ├── InlineSuggestions.tsx             # CREATE - Field-level suggestions
│       └── AssistantButton.tsx               # CREATE - Floating chat button
├── .env.local                                 # MODIFY - Add ANTHROPIC_API_KEY
└── package.json                               # MODIFY - Add @anthropic-ai/sdk, zod, CopilotKit deps
```

**Modified files:**
- `components/messages/MessageMatrix.tsx` - Add AI generation button
- `app/campaigns/new/page.tsx` - Add "Create with AI" option
- Existing API routes - No changes, AI endpoints are separate

---

### Epic 2 Technical Approach

**CopilotKit Protocol Architecture:**

**Frontend (Next.js/React):**
- CopilotKit client connects to `/api/ai/stream` endpoint
- Real-time event streaming (WebSocket or Server-Sent Events)
- Bi-directional state sync: agent sees form state, can suggest/prefill
- Frontend tools: `highlightField()`, `prefillField()`, `navigateToStep()`, `openSuggestionModal()`
- Kampánysegéd UI: floating chat button or side panel
- Progressive enhancement: works without CopilotKit (fallback to manual)

**Backend (Next.js API):**
- CopilotKit server endpoint handles event streams
- Campaign Orchestrator agent with sub-modules:
  - Brief Normalizer: structure chaotic input
  - Strategy Designer: generate goals, segments, topics, narratives
  - Message Generator: generate message matrix
- Backend tools: DB operations (createCampaign, createSegment, etc.)
- LLM tool calls: Anthropic Claude API with structured outputs
- State sync: agent receives campaign form state, sends state patches

**LLM Integration:**
- Anthropic Claude API via `@anthropic-ai/sdk`
- Structured outputs with Zod schema validation
- Two-step flows: Brief Normalizer → Strategy Designer
- Error handling: network failures, rate limits, API errors
- Rate limiting: token bucket or request queue
- Prompt engineering: campaign_type and goal_type aware

**State Management (Epic 2):**
- CopilotKit state sync for campaign form state
- Zustand or React Context for CopilotKit client state
- Server Components for data fetching (unchanged from Epic 1)
- Client Components for interactive AI features

---

### Epic 2 Integration Points

**Anthropic Claude API:**
- Environment variable: `ANTHROPIC_API_KEY`
- Client initialization in `lib/ai/client.ts`
- Model: Configurable via `ANTHROPIC_MODEL` env var, defaults to `claude-haiku-4-5`
- Structured outputs with JSON schema (Zod)
- Streaming support for real-time responses
- Error handling: retry logic, rate limit handling

**CopilotKit Protocol:**
- Event stream endpoint: `/api/ai/stream`
- Event types: `user_message`, `agent_message`, `tool_call`, `state_patch`, `error`
- Bi-directional: UI → Agent (input, state) and Agent → UI (responses, suggestions)
- Frontend integration: CopilotKit or custom CopilotKit client
- WebSocket or Server-Sent Events for real-time streaming

**Internal AI Modules:**
- `lib/ai/copilotkit/orchestrator.ts` - Campaign Orchestrator agent
- `lib/ai/prompts/` - LLM prompt templates
- `lib/ai/schemas.ts` - Zod validation schemas
- Integration with existing DB operations (Epic 1 API routes)

**Frontend-Backend Communication (Epic 2):**
- CopilotKit event stream for AI interactions
- Traditional REST API fallback (Epic 1 endpoints)
- Server Actions for form submissions (unchanged)
- Real-time state sync via CopilotKit

---

### Epic 2 Implementation Steps

**Phase 1: LLM + CopilotKit Infrastructure (Story 2.1) - 3-5 days**

1. Install dependencies: `@anthropic-ai/sdk`, `zod`, `@copilotkit/runtime`, `@copilotkit/react-core`
2. Create `lib/ai/client.ts` - Anthropic client with error handling
3. Create `lib/ai/schemas.ts` - Zod schemas for LLM outputs
4. Create `lib/ai/copilotkit/server.ts` - CopilotKit runtime configuration (CopilotRuntime, AnthropicAdapter, actions)
5. Create `app/api/ai/stream/route.ts` - CopilotKit event stream endpoint (HTTP handler, imports getCopilotRuntime from server.ts)
6. Implement rate limiting and error handling
7. Environment variables: `ANTHROPIC_API_KEY`
8. Test CopilotKit event streaming

**Phase 2: Campaign Brief AI (Story 2.2) - 3-5 days**

9. Create `lib/ai/prompts/brief-normalizer.ts` - Brief normalization prompt
10. Create `lib/ai/prompts/strategy-designer.ts` - Strategy design prompt
11. Create `lib/ai/copilotkit/orchestrator.ts` - Campaign Orchestrator agent
12. Implement `/api/ai/campaign-brief` endpoint or CopilotKit tool
13. Create `/app/campaigns/new/ai/page.tsx` - AI-assisted campaign creation
14. Build preview UI component for AI suggestions
15. Implement approve/reject workflow
16. Integration with existing campaign creation flow
17. Test end-to-end: brief → AI structure → preview → save

**Phase 3: Message Matrix AI (Story 2.3) - 3-5 days**

18. Create `lib/ai/prompts/message-generator.ts` - Message generation prompt
19. Implement `/api/ai/message-matrix` endpoint or CopilotKit tool
20. Extend `MessageMatrix.tsx` with AI generation button
21. Implement batch message generation
22. Build preview modal with approve/reject per message
23. Integration with existing message CRUD
24. Test: select segments/topics → generate → preview → selective save

**Phase 4: CopilotKit Frontend Integration (Story 2.4) - 3-5 days**

25. Install and configure CopilotKit or implement custom CopilotKit client
26. Create `lib/copilotkit/client.ts` - CopilotKit client setup
27. Create `components/ai/CampaignAssistant.tsx` - Main CopilotKit wrapper
28. Create `components/ai/AssistantChat.tsx` - Streaming chat UI
29. Create `components/ai/InlineSuggestions.tsx` - Field-level suggestions
30. Implement frontend tools: highlightField, prefillField, navigateToStep
31. Implement state sync: form state → CopilotKit → agent
32. Add floating chat button or side panel UI
33. Test bi-directional state sync and tool execution
34. Progressive enhancement: fallback without CopilotKit

**Total: 15-20 days (3-4 weeks)**

---

### Epic 2 Technical Details

**CopilotKit Event Types:**

```typescript
// User → Agent
interface UserMessageEvent {
  type: 'user_message';
  content: string;
  metadata?: { campaign_id?, step?, form_state? };
}

// Agent → UI
interface AgentMessageEvent {
  type: 'agent_message';
  content: string;
  streaming?: boolean;
}

interface ToolCallEvent {
  type: 'tool_call';
  tool: string;
  args: Record<string, any>;
}

interface StatePatchEvent {
  type: 'state_patch';
  patch: Partial<CampaignFormState>;
}
```

**Campaign Form State (CopilotKit visible):**

```typescript
interface CampaignFormState {
  current_step: number;
  campaign_type: string;
  goal_type: string;
  start_date: string;
  end_date: string;
  form_fields: {
    name: string;
    description: string;
    budget_estimate?: number;
  };
  existing_segments: Array<Segment>;
  existing_topics: Array<Topic>;
  existing_messages: Array<Message>;
}
```

**LLM Output Schemas (Zod):**

```typescript
// Brief → Structure output
const CampaignStructureSchema = z.object({
  goals: z.array(z.object({
    title: z.string(),
    description: z.string(),
    target_metric: z.record(z.any()).optional(),
    priority: z.number()
  })),
  segments: z.array(z.object({
    name: z.string(),
    description: z.string(),
    demographics: z.record(z.any()).optional(),
    psychographics: z.record(z.any()).optional(),
    priority: z.number()
  })),
  topics: z.array(z.object({
    name: z.string(),
    description: z.string(),
    category: z.string().optional()
  })),
  narratives: z.array(z.string())
});

// Message Matrix output
const MessageMatrixSchema = z.array(z.object({
  segment_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  headline: z.string(),
  body: z.string(),
  proof_point: z.string().optional(),
  cta: z.string().optional(),
  message_type: z.enum(['core', 'supporting', 'contrast'])
}));
```

**Backend Tools (Agent can execute):**

```typescript
interface BackendTools {
  createCampaign(data: CampaignInput): Promise<Campaign>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign>;
  createSegment(campaign_id: string, data: SegmentInput): Promise<Segment>;
  createTopic(campaign_id: string, data: TopicInput): Promise<Topic>;
  createMessage(campaign_id: string, data: MessageInput): Promise<Message>;
  generateMessageMatrix(context: MessageContext): Promise<Message[]>;
}
```

**Frontend Tools (Agent can call):**

```typescript
interface FrontendTools {
  highlightField(field_id: string): void;
  prefillField(field_id: string, value: any): void;
  navigateToStep(step_id: number): void;
  openSuggestionModal(type: string, payload: any): void;
  updateFormState(patch: Partial<CampaignFormState>): void;
}
```

---

### Epic 2 Dependencies

**New npm packages:**
```json
{
  "@anthropic-ai/sdk": "^0.20.0",
  "zod": "^3.22.4",
  "@copilotkit/react-core": "^1.0.0" // Optional - CopilotKit client
}
```

**Environment variables:**
```
ANTHROPIC_API_KEY=sk-ant-...
# CopilotKit endpoint: /api/ai/stream (hardcoded, no environment variable needed)
```

**External services:**
- Anthropic Claude API access
- WebSocket or Server-Sent Events support (Next.js)

---

### Epic 2 Testing Strategy

**Story 2.1 (LLM + CopilotKit Infrastructure):**
- Unit tests: AI client error handling, Zod schema validation
- Integration tests: Mock Anthropic API responses, CopilotKit event parsing
- Manual tests: Real API calls, event streaming

**Story 2.2 (Campaign Brief AI):**
- Unit tests: Prompt templates, JSON parsing
- Integration tests: `/api/ai/campaign-brief` with mocked LLM
- E2E tests: Full flow brief → preview → approve → DB
- Edge cases: Invalid brief, API timeout, malformed JSON

**Story 2.3 (Message Generator):**
- Unit tests: Message generation logic
- Integration tests: Batch message generation
- E2E tests: Select segments → generate → preview → selective save
- Edge cases: Empty segments, API failure mid-batch

**Story 2.4 (Frontend Integration):**
- Unit tests: Frontend tool execution, state sync
- Integration tests: CopilotKit client-server communication
- E2E tests: Full flow with real-time chat, tool execution, state sync
- Edge cases: Connection loss, state sync conflicts

**Manual testing checklist:**
- [ ] AI generates valid JSON per Zod schema
- [ ] Preview shows all fields correctly
- [ ] Approve/reject workflow works
- [ ] Error messages user-friendly
- [ ] Rate limiting prevents API abuse
- [ ] CopilotKit event streaming stable
- [ ] Bi-directional state sync accurate
- [ ] Frontend tools execute correctly
- [ ] Fallback to manual entry works

---

### Epic 2 Acceptance Criteria Summary

1. ✅ Users can generate campaign structure from text brief using AI
2. ✅ AI generates goals, segments, topics, narratives based on campaign_type and goal_type
3. ✅ Users can generate message matrices for selected segment × topic combinations
4. ✅ All AI outputs previewable and editable before saving
5. ✅ Error handling works for LLM API failures and rate limits
6. ✅ JSON schema validation ensures consistent AI outputs (Zod)
7. ✅ User can approve/reject AI suggestions individually
8. ✅ Zero data corruption from AI hallucinations (schema validation)
9. ✅ CopilotKit frontend integration provides real-time streaming chat
10. ✅ Bi-directional state sync: agent sees form state and can suggest/prefill fields
11. ✅ Frontend tools (highlightField, prefillField, navigateToStep) execute correctly
12. ✅ Kampánysegéd provides contextual help during manual campaign creation

---

### Epic 2 Key Code Locations

**AI Infrastructure:**
- `lib/ai/client.ts` - Anthropic Claude client
- `lib/ai/schemas.ts` - Zod validation schemas
- `lib/ai/copilotkit/server.ts` - CopilotKit runtime configuration (CopilotRuntime, AnthropicAdapter, actions)
- `app/api/ai/stream/route.ts` - CopilotKit event stream endpoint (HTTP handler, imports getCopilotRuntime from server.ts)

**AI Endpoints:**
- `/api/ai/campaign-brief/route.ts` - Campaign brief AI
- `/api/ai/message-matrix/route.ts` - Message matrix AI

**Frontend AI Components:**
- `components/ai/CampaignAssistant.tsx` - Main CopilotKit wrapper
- `components/ai/AssistantChat.tsx` - Streaming chat UI
- `components/ai/InlineSuggestions.tsx` - Field suggestions

**AI Prompts:**
- `lib/ai/prompts/brief-normalizer.ts`
- `lib/ai/prompts/strategy-designer.ts`
- `lib/ai/prompts/message-generator.ts`

**Agent Orchestration:**
- `lib/ai/copilotkit/orchestrator.ts` - Campaign Orchestrator agent

**AI Provider Abstraction (Story 3.0.6):**
- `lib/ai/types.ts` - Unified type definitions (AIProvider, GenerateTextOptions, etc.)
- `lib/ai/providers/base.ts` - BaseAIProvider abstract class
- `lib/ai/providers/anthropic.ts` - AnthropicProvider implementation
- `lib/ai/providers/openai.ts` - OpenAIProvider implementation
- `lib/ai/providers/google.ts` - GoogleProvider implementation
- `lib/ai/providers/ollama.ts` - OllamaProvider implementation
- `lib/ai/client.ts` - Factory function (refactored for multi-provider support)

---

## Epic 3.0: Message Matrix Refactor - Communication Strategies

**Date:** 2025-11-21
**Epic:** Epic 3.0 - Message Matrix Refactor
**Change Type:** Database schema refactor + UI refactor + AI generator refactor
**Development Context:** Refactoring Message Matrix from concrete messages to communication strategies

---

### Epic 3.0 Context

**Epic 1-2 Foundation (Complete):**
- ✅ Manual campaign management (CRUD)
- ✅ Audience segments and topics management
- ✅ Message matrix UI (concrete messages)
- ✅ AI-powered message generator (Story 2.3)
- ✅ CopilotKit infrastructure
- ✅ Database schema with 8 core tables

**Epic 3.0 Goal:**
Refactor the Message Matrix from concrete messages to communication strategies. The matrix should define *how* to communicate each topic to each segment (tone, guidelines, key messages), not generate specific message content. Concrete messages will be generated later in the Content Calendar (Epic 3.1) based on these strategies, ensuring consistent messaging across all generated content.

---

### Epic 3.0 Scope

**In Scope:**
1. **Enhanced segments and topics schema** - Detailed profiles, priority system, segment-topic matrix (Story 3.0.5)
2. **New `message_strategies` database table** - JSONB structure (4 main categories, 16 sub-fields)
3. **Message Matrix UI refactor** - Display communication strategies instead of concrete messages
4. **Strategy preview cards** - Short AI-generated summary (editable) in matrix cells
5. **Strategy detail modal** - Full strategy view with all 16 sub-fields (4 sections)
6. **Strategy AI Generator** - Generate complete communication strategies (refactor Story 2.3)
7. **Strategy CRUD operations** - Create, edit, view, delete strategies
8. **Strategy form** - 4 main sections (Strategy Core, Style & Tone, CTA & Funnel, Extra Fields)
9. **Zod schema validation** - All strategy JSONB structures validated
10. **Migration** - Existing `messages` table remains for Content Calendar use

**Out of Scope (Epic 3.1+):**
- Content Calendar AI generation (Epic 3.1)
- Sprint/Task Planning AI (Epic 3.2)
- Risk module AI
- Strategy versioning/history

---

### Epic 3.0 Source Tree Changes

**New files for Epic 3.0:**

```
campaign-os/
├── supabase/
│   └── migrations/
│       ├── YYYYMMDD_enhanced_segments_topics.sql  # CREATE - Enhanced segments/topics schema + matrix table
│       └── YYYYMMDD_message_strategies.sql       # CREATE - message_strategies table
├── app/
│   └── api/
│       ├── strategies/
│       │   ├── route.ts                          # CREATE - GET, POST strategies
│       │   └── [id]/route.ts                    # CREATE - GET, PUT, DELETE strategy
│       └── segment-topic-matrix/
│           └── route.ts                          # CREATE - Matrix CRUD operations
├── lib/
│   └── ai/
│       ├── schemas.ts                            # MODIFY - Add strategy Zod schemas + enhanced segment/topic schemas
│       └── prompts/
│           ├── strategy-designer.ts              # MODIFY - Update with new segment/topic schema
│           └── strategy-generator.ts             # CREATE - Strategy generation prompt (refactor message-generator.ts)
├── components/
│   ├── campaigns/
│   │   └── CampaignWizard.tsx                    # MODIFY - Add new segment/topic fields
│   ├── segments/
│   │   └── SegmentManager.tsx                   # MODIFY - Display/edit new structured fields
│   ├── topics/
│   │   └── TopicManager.tsx                     # MODIFY - Display/edit new fields
│   └── messages/
│       ├── MessageMatrix.tsx                    # MODIFY - Refactor to display strategies, use matrix
│       ├── StrategyCell.tsx                      # CREATE - Cell component with preview
│       ├── StrategyPreviewCard.tsx               # CREATE - Short summary card
│       ├── StrategyDetailModal.tsx               # CREATE - Full strategy view modal
│       ├── StrategyForm.tsx                      # CREATE - Strategy create/edit form
│       └── StrategyFormSections/
│           ├── StrategyCoreSection.tsx           # CREATE - Strategy Core form section
│           ├── StyleToneSection.tsx              # CREATE - Style & Tone form section
│           ├── CTAFunnelSection.tsx              # CREATE - CTA & Funnel form section
│           └── ExtraFieldsSection.tsx            # CREATE - Extra Fields form section
└── app/
    └── api/
        ├── ai/
        │   ├── campaign-brief/
        │   │   └── route.ts                      # MODIFY - Handle new segment/topic schema
        │   └── strategy-matrix/
        │       └── route.ts                      # CREATE - Strategy AI generator (refactor message-matrix)
        └── campaigns/
            └── structure/
                └── route.ts                      # MODIFY - Save new fields and matrix
```

**Modified files:**
- `components/messages/MessageMatrix.tsx` - Refactor to display strategies instead of messages, use segment-topic matrix
- `app/campaigns/[id]/messages/page.tsx` - Fetch strategies instead of messages
- `components/campaigns/CampaignWizard.tsx` - Add new segment/topic fields and matrix editor
- `components/segments/SegmentManager.tsx` - Display/edit structured demographic/psychographic profiles, media habits, persona
- `components/topics/TopicManager.tsx` - Display/edit topic_type, content_angles, recommended_channels, risk_notes
- `lib/ai/schemas.ts` - Add strategy Zod schemas + enhanced segment/topic schemas + matrix schema
- `lib/ai/prompts/strategy-designer.ts` - Update with new schema requirements (priority, matrix generation)
- `app/api/ai/campaign-brief/route.ts` - Handle new segment/topic schema in response
- `app/api/campaigns/structure/route.ts` - Save new fields and segment-topic matrix
- `app/api/segments/route.ts` - CRUD with new structured fields
- `app/api/topics/route.ts` - CRUD with new fields
- `lib/ai/prompts/message-generator.ts` - Deprecated (replaced by strategy-generator.ts)

**Unchanged files (for Content Calendar use):**
- `app/api/messages/route.ts` - Remains for Content Calendar message generation
- `messages` database table - Remains for Content Calendar use

---

### Epic 3.0 Technical Approach

**Database Schema:**

```sql
CREATE TABLE message_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  
  -- Strategy Core (JSONB) - 5 sub-fields
  strategy_core JSONB NOT NULL,
  -- {
  --   "positioning_statement": "1-2 sentences about essence",
  --   "core_message": "1 sentence, crystal clear statement",
  --   "supporting_messages": ["bullet 1", "bullet 2", "bullet 3-5"],
  --   "proof_points": ["proof 1", "proof 2", "proof 3"],
  --   "objections_reframes": ["objection 1 + reframe", ...] (optional)
  -- }
  
  -- Style & Tone (JSONB) - 4 sub-fields
  style_tone JSONB NOT NULL,
  -- {
  --   "tone_profile": {
  --     "description": "short description",
  --     "keywords": ["keyword1", "keyword2", "keyword3-5"]
  --   },
  --   "language_style": "tegezés/magázás, szakzsargon level, sentence length",
  --   "communication_guidelines": {
  --     "do": ["guideline 1", "guideline 2", ...],
  --     "dont": ["avoid 1", "avoid 2", ...]
  --   },
  --   "emotional_temperature": "nyugodt/motiváló/energikus"
  -- }
  
  -- CTA & Funnel (JSONB) - 4 sub-fields
  cta_funnel JSONB NOT NULL,
  -- {
  --   "funnel_stage": "awareness/consideration/conversion/mobilization",
  --   "cta_objectives": ["objective 1", "objective 2", ...],
  --   "cta_patterns": ["pattern 1", "pattern 2", "pattern 3"],
  --   "friction_reducers": ["reducer 1", ...] (optional)
  -- }
  
  -- Extra Fields (JSONB, optional) - 3 sub-fields
  extra_fields JSONB,
  -- {
  --   "framing_type": "probléma-megoldás/összehasonlító/történet-mesélés/adat-alapú",
  --   "key_phrases": ["phrase 1", "phrase 2", ...],
  --   "risk_notes": "sensitive points, attack surfaces" (optional)
  -- }
  
  -- Preview summary (AI-generated, editable)
  preview_summary TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, segment_id, topic_id)
);

CREATE INDEX idx_message_strategies_campaign ON message_strategies(campaign_id);
```

**Zod Schema Validation:**

```typescript
// Strategy Core Schema
const StrategyCoreSchema = z.object({
  positioning_statement: z.string().min(10, "Positioning statement must be at least 10 characters"),
  core_message: z.string().min(5, "Core message must be at least 5 characters"),
  supporting_messages: z.array(z.string()).min(3).max(5),
  proof_points: z.array(z.string()).min(2).max(3),
  objections_reframes: z.array(z.string()).optional()
});

// Style & Tone Schema
const StyleToneSchema = z.object({
  tone_profile: z.object({
    description: z.string(),
    keywords: z.array(z.string()).min(3).max(5)
  }),
  language_style: z.string(),
  communication_guidelines: z.object({
    do: z.array(z.string()),
    dont: z.array(z.string())
  }),
  emotional_temperature: z.string()
});

// CTA & Funnel Schema
const CTAFunnelSchema = z.object({
  funnel_stage: z.enum(['awareness', 'consideration', 'conversion', 'mobilization']),
  cta_objectives: z.array(z.string()),
  cta_patterns: z.array(z.string()).min(2).max(3),
  friction_reducers: z.array(z.string()).optional()
});

// Extra Fields Schema
const ExtraFieldsSchema = z.object({
  framing_type: z.string().optional(),
  key_phrases: z.array(z.string()).optional(),
  risk_notes: z.string().optional()
});

// Complete Strategy Schema
const MessageStrategySchema = z.object({
  strategy_core: StrategyCoreSchema,
  style_tone: StyleToneSchema,
  cta_funnel: CTAFunnelSchema,
  extra_fields: ExtraFieldsSchema.optional(),
  preview_summary: z.string().optional()
});
```

**UI/UX Approach:**

**Message Matrix Cell States:**
- Empty: "Nincs stratégia" + "Generate Strategy" button
- Has strategy: Preview card showing:
  - Positioning statement (first 1-2 sentences, truncated)
  - Core message (1 sentence, bold)
  - Tone keywords (badges: "közvetlen", "őszinte")
  - Funnel stage badge ("awareness", "consideration", etc.)

**Strategy Detail Modal:**
- Tabs or accordion: "Stratégiai mag", "Stílus/tónus", "CTA/funnel", "Extra"
- All 16 sub-fields visible and readable
- "Edit Strategy" button
- Full strategy content organized by category

**Strategy Form:**
- 4 main sections (accordion or tabs):
  1. Strategy Core (5 fields)
  2. Style & Tone (4 fields)
  3. CTA & Funnel (4 fields)
  4. Extra Fields (3 fields, optional)
- Multi-input fields (supporting_messages, proof_points) → add/remove rows
- Do/Don't lists (communication_guidelines) → two-column layout
- Preview summary editor (auto-generated from strategy_core, editable)

**AI Generation Approach:**

**Strategy Generator Prompt:**
- Single LLM call with structured JSON output (16 fields)
- Prompt includes:
  - Campaign context (campaign_type, goal_type, narratives)
  - Segment details (demographics, psychographics)
  - Topic details (name, description, category)
  - Instructions for all 16 sub-fields
- Zod schema validation ensures consistent output
- Preview summary auto-generated from strategy_core
- CopilotKit event stream for real-time generation progress

---

### Epic 3.0 Integration Points

**Database:**
- New `message_strategies` table with JSONB structure
- UNIQUE constraint: (campaign_id, segment_id, topic_id) - one strategy per cell
- Existing `messages` table remains unchanged (for Content Calendar use)

**API Endpoints:**
- `/api/strategies` - GET (list), POST (create)
- `/api/strategies/[id]` - GET (single), PUT (update), DELETE
- `/api/ai/strategy-matrix` - POST (generate strategies, refactor from `/api/ai/message-matrix`)

**Frontend Components:**
- `MessageMatrix.tsx` - Refactored to display strategies
- `StrategyCell.tsx` - Cell component with preview card
- `StrategyDetailModal.tsx` - Full strategy view
- `StrategyForm.tsx` - Create/edit form with 4 sections

**AI Integration:**
- Reuse Epic 2 LLM infrastructure (`lib/ai/client.ts`)
- New prompt template: `lib/ai/prompts/strategy-generator.ts`
- Zod schema validation: `MessageStrategySchema`
- CopilotKit event streaming (reuse from Epic 2)

---

### Epic 3.0 Implementation Steps

**Phase 1: Enhanced Segments & Topics Schema (Story 3.0.5) - 5-7 days**

1. Create migration: `supabase/migrations/YYYYMMDD_enhanced_segments_topics.sql`
2. Enhance segments table: add structured profiles, media_habits, funnel_stage_focus, example_persona
3. Migrate priority from INTEGER to TEXT enum (primary/secondary)
4. Enhance topics table: add topic_type, related_goal_types, core_narrative, content_angles, recommended_channels, risk_notes
5. Create segment_topic_matrix table with importance and role fields
6. Update Zod schemas for enhanced segment/topic structures
7. Update AI prompt (strategy-designer.ts) with new schema requirements
8. Update API endpoints to handle new fields and matrix
9. Update UI components (CampaignWizard, SegmentManager, TopicManager) for new fields
10. Test migration, backward compatibility, and new field validation

**Phase 2: Database Migration (Story 3.0.1) - 2-3 days**

11. Create migration: `supabase/migrations/YYYYMMDD_message_strategies.sql`
12. Define JSONB structure for 4 main categories (16 sub-fields)
13. Create Zod schemas in `lib/ai/schemas.ts`
14. Generate TypeScript types: `supabase gen types`
15. Test migration and schema validation

**Phase 3: UI Refactor (Story 3.0.2) - 3-4 days**

16. Refactor `MessageMatrix.tsx` to fetch and display strategies
17. Create `StrategyCell.tsx` component
18. Create `StrategyPreviewCard.tsx` component
19. Create `StrategyDetailModal.tsx` component
20. Update `/app/campaigns/[id]/messages/page.tsx` to fetch strategies
21. Integrate segment-topic matrix display (importance/role indicators)
22. Test UI components and cell states

**Phase 4: Strategy AI Generator (Story 3.0.3) - 4-5 days**

23. Create `lib/ai/prompts/strategy-generator.ts` prompt template
24. Refactor `/api/ai/message-matrix` → `/api/ai/strategy-matrix`
25. Implement 16-field JSON output generation
26. Add preview summary generation (from strategy_core)
27. Integrate CopilotKit event streaming
28. Build preview modal with approve/reject per strategy
29. Test AI generation and validation

**Phase 5: Strategy Form + CRUD (Story 3.0.4) - 3-4 days**

30. Create `/api/strategies` endpoints (GET, POST, PUT, DELETE)
31. Create `StrategyForm.tsx` component with 4 sections
32. Create form section components (StrategyCoreSection, StyleToneSection, etc.)
33. Implement form validation (Zod schemas)
34. Add preview summary editor (auto-generated, editable)
35. Integrate with StrategyDetailModal (edit mode)
36. Test CRUD operations and form validation

**Total: 20-25 days (4-5 weeks)**

---

### Epic 3.0 Technical Details

**Strategy JSONB Structure:**

```typescript
interface MessageStrategy {
  strategy_core: {
    positioning_statement: string;        // 1-2 sentences
    core_message: string;                 // 1 sentence
    supporting_messages: string[];        // 3-5 bullets
    proof_points: string[];               // 2-3 proofs
    objections_reframes?: string[];       // 2-3 objections + reframes (optional)
  };
  style_tone: {
    tone_profile: {
      description: string;
      keywords: string[];                 // 3-5 keywords
    };
    language_style: string;               // tegezés/magázás, szakzsargon, sentence length
    communication_guidelines: {
      do: string[];
      dont: string[];
    };
    emotional_temperature: string;        // nyugodt/motiváló/energikus
  };
  cta_funnel: {
    funnel_stage: 'awareness' | 'consideration' | 'conversion' | 'mobilization';
    cta_objectives: string[];
    cta_patterns: string[];               // 2-3 patterns
    friction_reducers?: string[];         // optional
  };
  extra_fields?: {
    framing_type?: string;                // probléma-megoldás/összehasonlító/történet-mesélés/adat-alapú
    key_phrases?: string[];               // 5-10 phrases
    risk_notes?: string;                  // sensitive points (optional)
  };
  preview_summary?: string;               // AI-generated, editable
}
```

**Preview Summary Generation:**

AI generates preview summary from `strategy_core`:
- Positioning statement (first 1-2 sentences)
- Core message (1 sentence, bold)
- Tone keywords (from `style_tone.tone_profile.keywords`)
- Funnel stage (from `cta_funnel.funnel_stage`)

User can edit preview summary manually.

**Migration Strategy:**

1. Create `message_strategies` table
2. Existing `messages` table remains unchanged

---

### Story 3.0.6: AI Provider Abstraction

**Date:** 2025-11-24
**Story:** Story 3.0.6 - AI Provider Abstraction
**Change Type:** Infrastructure refactor - multi-provider support
**Development Context:** Abstracting AI provider implementations to support multiple providers (Anthropic, OpenAI, Google Gemini, Ollama) with unified interface

---

#### Story 3.0.6 Context

**Goal:**
Enable multiple AI provider support with a unified abstraction layer, allowing provider switching via environment variables without code changes. This enables cost optimization, vendor independence, and flexibility in model selection.

**Scope:**
- Unified `AIProvider` interface with `generateText()` and `generateStream()` methods
- Provider implementations: Anthropic, OpenAI, Google Gemini, Ollama
- Factory pattern for provider selection based on environment variables
- Backward compatibility with existing Anthropic client
- CopilotKit integration support for all providers

**Technical Architecture:**

**File Structure:**
```
lib/ai/
├── client.ts                    # Factory function (refactored)
├── types.ts                     # Type definitions (new)
├── providers/
│   ├── base.ts                  # BaseAIProvider abstract class (new)
│   ├── anthropic.ts             # AnthropicProvider (new)
│   ├── openai.ts                # OpenAIProvider (new)
│   ├── google.ts                # GoogleProvider (new)
│   └── ollama.ts                # OllamaProvider (new)
├── schemas.ts                   # Zod schemas (existing)
├── errors.ts                    # Error classes (updated)
└── copilotkit/
    └── server.ts                # CopilotKit server (updated)
```

**Interface Design:**
```typescript
interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<GenerateTextResponse>
  generateStream(options: GenerateTextOptions): AsyncIterable<StreamChunk>
}

interface GenerateTextOptions {
  model: string
  systemPrompt: string  // Separate field, NOT in messages array
  messages: Array<{ role: 'user' | 'assistant', content: string }>
  maxTokens?: number
  temperature?: number
}

interface GenerateTextResponse {
  content: string
  model: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

interface StreamChunk {
  content: string
  done: boolean
}
```

**Important Design Decisions:**
- `systemPrompt` is a separate field, NOT included in `messages` array
- `messages` array only contains `'user' | 'assistant'` roles (no `'system'` role)
- Each provider implementation converts `systemPrompt` to provider-specific format
- Unified response format across all providers

**Environment Variables:**
```env
# AI Provider selection (required)
AI_PROVIDER=anthropic  # or: openai, google, ollama

# Model selection (optional, provider-specific)
AI_MODEL=gpt-5-mini-2025-08-07  # Default model
# AI_MODEL=claude-haiku-4-5  # Anthropic
# AI_MODEL=gpt-4-turbo-preview  # OpenAI
# AI_MODEL=gemini-pro  # Google
# AI_MODEL=llama2  # Ollama

# Provider-specific API keys
ANTHROPIC_API_KEY=sk-ant-...  # Required if AI_PROVIDER=anthropic
OPENAI_API_KEY=sk-...  # Required if AI_PROVIDER=openai
GOOGLE_API_KEY=...  # Required if AI_PROVIDER=google
# Ollama doesn't require API key (local)

# Ollama configuration (if AI_PROVIDER=ollama)
OLLAMA_BASE_URL=http://localhost:11434
```

**Provider-Specific Implementation Details:**

**Anthropic Provider:**
- SDK: `@anthropic-ai/sdk` (already installed)
- Conversion: `systemPrompt` → `system` parameter in `messages.create()`
- Response: `response.content[0].text`
- Streaming: `messages.create({ stream: true })` → `content_block_delta` chunks

**OpenAI Provider:**
- SDK: `openai@^4.50.0` (new dependency)
- Conversion: `systemPrompt` → `system` parameter (separate from messages)
- Response: `response.choices[0].message.content`
- Streaming: `chat.completions.create({ stream: true })` → `delta.content` chunks
- Mapping: `maxTokens` → `max_tokens`

**Google Provider:**
- SDK: `@google/generative-ai@^0.21.0` (new dependency)
- Conversion: `systemPrompt` → system prompt configuration
- Response: `response.response.text()`
- Streaming: `model.generateContentStream()` → stream chunks

**Ollama Provider:**
- No SDK: HTTP API using `fetch()`
- Endpoint: `http://localhost:11434/api/generate` (configurable via `OLLAMA_BASE_URL`)
- Conversion: `systemPrompt` → Ollama format
- Response: `response.response`
- Streaming: `fetch()` with streaming enabled
- Health check: Verify Ollama availability before use

**Backward Compatibility:**
- `getAnthropicClient()` function remains available (wrapper around factory)
- Existing code using `getAnthropicClient()` continues to work
- All API endpoints maintain same response format
- CopilotKit integration maintains same behavior

**Error Handling:**
- Unified `AIProviderError` class with provider type information
- `APIKeyMissingError` for missing API keys
- Provider-specific errors wrapped in unified error classes
- User-friendly error messages in API responses

**Implementation Order:**
1. Base abstraction (types, base provider) - 2-3 hours
2. Anthropic provider (easiest, already have SDK) - 1 hour
3. OpenAI provider - 1-2 hours
4. Factory and client update - 1 hour
5. API route migration (test with Anthropic) - 1-2 hours
6. Google provider - 1-2 hours
7. Ollama provider - 1-2 hours
8. CopilotKit integration - 1 hour
9. Testing all providers - 2-3 hours

**Total Estimated Effort:** 13 points (8-11 hours)

**Dependencies:**
- Epic 2 complete (LLM infrastructure, existing Anthropic client)
- Story 2.1 (LLM + CopilotKit Infrastructure) complete
- Story 3.0.3 (Strategy AI Generator) complete (uses AI endpoints)

**Success Criteria:**
1. ✅ All API endpoints work with Anthropic provider (backward compatibility)
2. ✅ All API endpoints work with OpenAI provider (if configured)
3. ✅ All API endpoints work with Google provider (if configured)
4. ✅ All API endpoints work with Ollama provider (if configured and running)
5. ✅ Provider switching via environment variable works without code changes
6. ✅ Streaming works correctly for all providers
7. ✅ CopilotKit integration works with all providers
8. ✅ Error handling provides clear, provider-specific error messages

---

### Epic 3.0 Dependencies

**External:**
- Epic 2 complete (LLM infrastructure, CopilotKit)
- Anthropic Claude API (reuse from Epic 2)
- Existing Epic 1-2 functionality

**Internal:**
- Epic 2 complete (all stories done)
- Database schema from Epic 1-2
- Existing MessageMatrix component (to be refactored)
- Story 2.3 AI Message Generator (to be refactored to Strategy Generator)

---

### Epic 3.0 Testing Strategy

**Story 3.0.5 (Enhanced Segments & Topics Schema):**
- Unit tests: Zod schema validation for new structured fields
- Integration tests: Database migration script, priority migration, JSONB structure migration
- Manual tests: Verify table structures, segment-topic matrix CRUD, backward compatibility
- Edge cases: Priority migration (INTEGER → TEXT), existing data preservation, UNIQUE constraint

**Story 3.0.1 (Database Migration):**
- Unit tests: Zod schema validation
- Integration tests: Database migration script
- Manual tests: Verify table structure and constraints

**Story 3.0.2 (UI Refactor):**
- Unit tests: StrategyCell, StrategyPreviewCard components
- Integration tests: MessageMatrix refactored display
- E2E tests: View strategies in matrix, open detail modal

**Story 3.0.3 (Strategy AI Generator):**
- Unit tests: Prompt template, JSON parsing
- Integration tests: `/api/ai/strategy-matrix` with mocked LLM
- E2E tests: Generate strategies → preview → approve → save
- Edge cases: Invalid input, API timeout, malformed JSON

**Story 3.0.4 (Strategy Form + CRUD):**
- Unit tests: Form validation, CRUD operations
- Integration tests: `/api/strategies` endpoints
- E2E tests: Create → edit → delete strategy
- Edge cases: UNIQUE constraint violation, invalid JSONB

**Story 3.0.6 (AI Provider Abstraction):**
- Unit tests: Provider implementations, factory function, error handling
- Integration tests: All API endpoints with each provider (Anthropic, OpenAI, Google, Ollama)
- E2E tests: Provider switching via environment variables, streaming for all providers
- Edge cases: Missing API keys, invalid models, provider unavailability, streaming interruptions

**Manual testing checklist:**
- [ ] Strategy AI generates valid JSON per Zod schema (16 fields)
- [ ] Preview card shows correct summary
- [ ] Detail modal displays all 16 sub-fields
- [ ] Strategy form validates all required fields
- [ ] UNIQUE constraint prevents duplicate strategies
- [ ] Preview summary is editable
- [ ] Existing messages table still functional
- [ ] All API endpoints work with Anthropic provider (backward compatibility)
- [ ] All API endpoints work with OpenAI provider (if configured)
- [ ] All API endpoints work with Google provider (if configured)
- [ ] All API endpoints work with Ollama provider (if configured and running)
- [ ] Provider switching via environment variable works without code changes
- [ ] Streaming works correctly for all providers
- [ ] CopilotKit integration works with all providers

---

### Epic 3.0 Acceptance Criteria Summary

**Story 3.0.5 (Enhanced Segments & Topics Schema):**
1. ✅ Segments table enhanced with structured profiles (demographic_profile, psychographic_profile, media_habits, example_persona)
2. ✅ Topics table enhanced with content pillar fields (topic_type, content_angles, recommended_channels, risk_notes)
3. ✅ Priority system migrated from INTEGER to TEXT enum (primary/secondary)
4. ✅ Segment-topic matrix table created with importance and role mapping
5. ✅ AI prompt updated to generate 3-5 primary segments (max 7), 4-7 primary topics (max 9) with priority
6. ✅ AI generates segment-topic matrix with importance (high/medium/low) and role (core_message/support/experimental)
7. ✅ All new fields validated against Zod schemas
8. ✅ Backward compatibility maintained (existing data preserved, old fields as fallback)

**Story 3.0.1-3.0.4 (Message Strategies):**
9. ✅ Users can create communication strategies for segment × topic combinations
10. ✅ Strategy contains 4 main categories: Strategy Core, Style & Tone, CTA & Funnel, Extra Fields
11. ✅ AI generates complete strategies (16 sub-fields) for selected segment × topic combinations
12. ✅ Preview cards show short summary (AI-generated, editable) in matrix cells
13. ✅ Detail modal displays full strategy with all 16 sub-fields
14. ✅ Strategy form allows editing all strategy fields organized by category
15. ✅ One strategy per cell (segment × topic) - UNIQUE constraint enforced
16. ✅ All strategy data validated against Zod schemas
17. ✅ Existing `messages` table remains functional for Content Calendar use
18. ✅ Migration preserves backward compatibility

**Story 3.0.6 (AI Provider Abstraction):**
19. ✅ Multiple AI provider support (Anthropic, OpenAI, Google Gemini, Ollama) with unified interface
20. ✅ Provider selection via `AI_PROVIDER` environment variable works without code changes
21. ✅ Model selection via `AI_MODEL` environment variable works correctly
22. ✅ All API endpoints work with all supported providers
23. ✅ Streaming works correctly for all providers
24. ✅ CopilotKit integration works with all providers
25. ✅ Backward compatibility maintained (`getAnthropicClient()` still works)
26. ✅ Error handling provides clear, provider-specific error messages

---

### Epic 3.0 Key Code Locations

**Database (Story 3.0.5):**
- `supabase/migrations/YYYYMMDD_enhanced_segments_topics.sql` - Enhanced segments/topics + matrix migration
- `lib/supabase/types.ts` - Generated TypeScript types (includes new fields)

**Database (Story 3.0.1):**
- `supabase/migrations/YYYYMMDD_message_strategies.sql` - Message strategies migration script
- `lib/supabase/types.ts` - Generated TypeScript types

**API Endpoints (Story 3.0.5):**
- `/api/segment-topic-matrix/route.ts` - Matrix CRUD operations
- `/api/campaigns/structure/route.ts` - Save new fields and matrix
- `/api/segments/route.ts` - CRUD with new structured fields
- `/api/topics/route.ts` - CRUD with new fields
- `/api/ai/campaign-brief/route.ts` - Handle new schema in response

**API Endpoints (Story 3.0.1-3.0.4):**
- `/api/strategies/route.ts` - Strategy CRUD
- `/api/strategies/[id]/route.ts` - Single strategy operations
- `/api/ai/strategy-matrix/route.ts` - Strategy AI generator

**Frontend Components (Story 3.0.5):**
- `components/campaigns/CampaignWizard.tsx` - Form fields for new schema and matrix editor
- `components/segments/SegmentManager.tsx` - Display/edit structured fields
- `components/topics/TopicManager.tsx` - Display/edit new fields

**Frontend Components (Story 3.0.2-3.0.4):**
- `components/messages/MessageMatrix.tsx` - Refactored matrix (uses segment-topic matrix)
- `components/messages/StrategyCell.tsx` - Cell component
- `components/messages/StrategyPreviewCard.tsx` - Preview card
- `components/messages/StrategyDetailModal.tsx` - Detail modal
- `components/messages/StrategyForm.tsx` - Create/edit form

**AI Integration (Story 3.0.5):**
- `lib/ai/schemas.ts` - Enhanced segment/topic Zod schemas + matrix schema
- `lib/ai/prompts/strategy-designer.ts` - Updated prompt with new schema requirements

**AI Integration (Story 3.0.3):**
- `lib/ai/schemas.ts` - Strategy Zod schemas
- `lib/ai/prompts/strategy-generator.ts` - Strategy generation prompt

---

## Epic 4.0: Strategic Data Enhancement for Sprint & Content Calendar Planning

**Date:** 2025-11-XX
**Epic:** Epic 4.0 - Strategic Data Enhancement
**Change Type:** Schema enhancement + validation + UI improvements
**Development Context:** Enhancing campaign structure with strategic metadata for execution planning

---

### Epic 4.0 Context

**Epic 1-3 Foundation (Complete):**
- ✅ Manual campaign management (CRUD)
- ✅ Audience segments and topics management with enhanced schema (Epic 3.0.5)
- ✅ Communication strategies (Epic 3.0)
- ✅ AI-powered campaign structure generation (Epic 2)
- ✅ Segment-topic matrix with importance and role mapping (Epic 3.0.5)
- ✅ Database schema with enhanced segments/topics

**Epic 4.0 Goal:**
Enhance the campaign structure data model with strategic metadata (funnel stages, priorities, goal relationships) to enable effective sprint planning and content calendar generation. The execution AI needs structured, prioritized strategic data rather than verbose text descriptions to make intelligent decisions about sprint sequencing and content scheduling.

---

### Epic 4.0 Scope

**In Scope:**
1. **Goals schema enhancement** - Add `funnel_stage` and `kpi_hint` fields
2. **Topics schema enhancement** - Add `related_goal_stages` (enum array) and `recommended_content_types` fields
3. **Narratives schema enhancement** - Add `primary_goal_ids`, `primary_topic_ids`, and `suggested_phase` fields
4. **Segment-Topic Matrix validation rules** - Enforce max 2-3 high/core_message per segment
5. **"Ready for Execution" validation checklist** - Comprehensive validation system
6. **AI prompt updates** - Generate all new strategic metadata fields
7. **Database migrations** - Add new fields with backward compatibility
8. **Validation helper functions** - Completeness checking for all elements
9. **UI enhancements** - Validation status indicators, checklist display

**Out of Scope (Epic 5+):**
- Actual sprint planner AI implementation (Epic 5)
- Content calendar AI generation (Epic 4.2)
- Advanced prioritization algorithms
- Multi-campaign strategic analysis

---

### Epic 4.0 Source Tree Changes

**New files for Epic 4.0:**

```
campaign-os/
├── supabase/
│   └── migrations/
│       └── YYYYMMDD_strategic_metadata_enhancement.sql  # CREATE - Goals, Topics, Narratives schema enhancement
├── lib/
│   ├── validation/
│   │   └── campaign-structure.ts                       # CREATE - Validation helper functions
│   └── ai/
│       ├── schemas.ts                                   # MODIFY - Add new strategic metadata fields to schemas
│       └── prompts/
│           └── strategy-designer.ts                    # MODIFY - Update prompt with new fields and matrix rules
├── app/
│   └── api/
│       └── campaigns/
│           └── [id]/
│               └── validation/
│                   └── route.ts                        # CREATE - Campaign validation endpoint
└── components/
    └── ai/
        └── ExecutionReadinessChecklist.tsx             # CREATE - "Ready for Execution" checklist component
```

**Modified files:**
- `lib/ai/schemas.ts` - Add funnel_stage, kpi_hint to GoalSchema; related_goal_stages, recommended_content_types to TopicSchema; primary_goal_ids, primary_topic_ids, suggested_phase to NarrativeSchema
- `lib/ai/prompts/strategy-designer.ts` - Add instructions for new strategic metadata fields and matrix validation rules
- `components/ai/CampaignStructurePreview.tsx` - Add validation status indicators
- `app/campaigns/[id]/page.tsx` - Display ExecutionReadinessChecklist component
- `app/api/campaigns/structure/route.ts` - Handle new fields in save operation
- `app/api/ai/campaign-brief/route.ts` - Handle new fields in AI response

---

### Epic 4.0 Technical Approach

**Database Schema Enhancements:**

```sql
-- Goals table enhancement
ALTER TABLE goals
  ADD COLUMN funnel_stage TEXT CHECK (funnel_stage IN ('awareness', 'engagement', 'consideration', 'conversion', 'mobilization')),
  ADD COLUMN kpi_hint TEXT;

-- Topics table enhancement
ALTER TABLE topics
  ADD COLUMN related_goal_stages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN recommended_content_types JSONB;

-- Narratives: create new table + junction tables for referential integrity
CREATE TABLE IF NOT EXISTS narratives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER,
  suggested_phase TEXT CHECK (suggested_phase IN ('early', 'mid', 'late')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS narrative_goals (
  narrative_id UUID NOT NULL REFERENCES narratives(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  PRIMARY KEY (narrative_id, goal_id)
);

CREATE TABLE IF NOT EXISTS narrative_topics (
  narrative_id UUID NOT NULL REFERENCES narratives(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (narrative_id, topic_id)
);

-- Preserve campaigns.narratives JSONB column for backward compatibility (read-only or synced)
-- Migration script converts existing JSONB narratives to table structure
```

**Zod Schema Updates:**

```typescript
// Enhanced GoalSchema
export const GoalSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  target_metric: z.record(z.string(), z.any()).optional(),
  priority: z.number().int().nonnegative(),
  funnel_stage: z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization']).optional(),
  kpi_hint: z.string().optional(), // e.g., "FB/IG reach", "newsletter signup", "event registration"
});

// Enhanced TopicSchema
export const TopicSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  short_label: z.string().optional(),
  description: z.string().optional(),
  topic_type: z.enum(['benefit', 'problem', 'value', 'proof', 'story']).optional(),
  related_goal_types: flexibleStringArray().optional(),
  related_goal_stages: z.array(z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization'])).optional(),
  recommended_content_types: z.array(z.enum(['short_video', 'story', 'static_image', 'carousel', 'email'])).optional(),
  core_narrative: z.string().optional(),
  content_angles: flexibleStringArray().optional(),
  recommended_channels: flexibleStringArray().optional(),
  risk_notes: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
    if (typeof val === 'string') {
      return val.trim() ? [val] : []
    }
    return val
  }),
  priority: z.enum(['primary', 'secondary']).default('secondary'),
  category: z.string().optional(),
});

// Enhanced NarrativeSchema
export const NarrativeSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.number().int().nonnegative().optional(),
  primary_goal_ids: z.array(z.string().uuid()).optional(),
  primary_topic_ids: z.array(z.string().uuid()).optional(),
  suggested_phase: z.enum(['early', 'mid', 'late']).optional(),
});
```

**Validation Logic:**

```typescript
// lib/validation/campaign-structure.ts
export function validateGoalCompleteness(goal: GoalSchema): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!goal.funnel_stage) missing.push('funnel_stage');
  if (!goal.kpi_hint) missing.push('kpi_hint');
  return { valid: missing.length === 0, missing };
}

export function validateTopicCompleteness(topic: TopicSchema): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!topic.related_goal_stages || topic.related_goal_stages.length === 0) missing.push('related_goal_stages');
  if (!topic.recommended_content_types || topic.recommended_content_types.length === 0) missing.push('recommended_content_types');
  return { valid: missing.length === 0, missing };
}

export function validateNarrativeCompleteness(narrative: NarrativeSchema): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!narrative.primary_goal_ids || narrative.primary_goal_ids.length === 0) missing.push('primary_goal_ids');
  if (!narrative.primary_topic_ids || narrative.primary_topic_ids.length === 0) missing.push('primary_topic_ids');
  if (!narrative.suggested_phase) missing.push('suggested_phase');
  return { valid: missing.length === 0, missing };
}

export function validateMatrixRules(
  matrix: SegmentTopicMatrixEntry[],
  segments: SegmentSchema[]
): { valid: boolean; violations: Array<{ segment_id: string; issue: string }> } {
  const violations: Array<{ segment_id: string; issue: string }> = [];
  
  // Group matrix entries by segment
  const segmentMap = new Map<string, SegmentTopicMatrixEntry[]>();
  matrix.forEach(entry => {
    const segmentId = entry.segment_id || segments[entry.segment_index]?.id;
    if (!segmentMap.has(segmentId)) {
      segmentMap.set(segmentId, []);
    }
    segmentMap.get(segmentId)!.push(entry);
  });
  
  // Check rules per segment
  segmentMap.forEach((entries, segmentId) => {
    const highCore = entries.filter(e => e.importance === 'high' && e.role === 'core_message');
    const mediumSupport = entries.filter(e => e.importance === 'medium' && e.role === 'support');
    const experimental = entries.filter(e => e.role === 'experimental');
    
    if (highCore.length > 3) {
      violations.push({ segment_id: segmentId, issue: `Too many high/core_message topics (${highCore.length}, max 3)` });
    }
    if (mediumSupport.length > 4) {
      violations.push({ segment_id: segmentId, issue: `Too many medium/support topics (${mediumSupport.length}, max 4)` });
    }
    if (experimental.length > 2) {
      violations.push({ segment_id: segmentId, issue: `Too many experimental topics (${experimental.length}, max 2)` });
    }
  });
  
  return { valid: violations.length === 0, violations };
}

export function isReadyForExecution(structure: CampaignStructure): {
  ready: boolean;
  issues: Array<{ type: string; element: string; issue: string }>;
} {
  const issues: Array<{ type: string; element: string; issue: string }> = [];
  
  // Validate goals
  structure.goals.forEach((goal, index) => {
    const validation = validateGoalCompleteness(goal);
    if (!validation.valid) {
      validation.missing.forEach(field => {
        issues.push({ type: 'goal', element: `Goal ${index + 1} (${goal.title})`, issue: `Missing ${field}` });
      });
    }
  });
  
  // Validate topics
  structure.topics.forEach((topic, index) => {
    const validation = validateTopicCompleteness(topic);
    if (!validation.valid) {
      validation.missing.forEach(field => {
        issues.push({ type: 'topic', element: `Topic ${index + 1} (${topic.name})`, issue: `Missing ${field}` });
      });
    }
  });
  
  // Validate narratives
  structure.narratives?.forEach((narrative, index) => {
    const validation = validateNarrativeCompleteness(narrative);
    if (!validation.valid) {
      validation.missing.forEach(field => {
        issues.push({ type: 'narrative', element: `Narrative ${index + 1} (${narrative.title})`, issue: `Missing ${field}` });
      });
    }
  });
  
  // Validate matrix rules
  if (structure.segment_topic_matrix) {
    const matrixValidation = validateMatrixRules(structure.segment_topic_matrix, structure.segments);
    if (!matrixValidation.valid) {
      matrixValidation.violations.forEach(violation => {
        issues.push({ type: 'matrix', element: `Segment ${violation.segment_id}`, issue: violation.issue });
      });
    }
  }
  
  return { ready: issues.length === 0, issues };
}
```

**UI/UX Approach:**

**Validation Status Indicators:**
- ✓ (green) - Complete: all required fields present
- ⚠ (yellow) - Partial: some fields missing
- ✗ (red) - Missing: critical fields missing

**Execution Readiness Checklist:**
- Overall status badge: "Ready for Execution" / "Not Ready"
- Progress indicator: "8/10 criteria met"
- Expandable sections per validation category
- Click on issue → navigate to relevant element
- Real-time updates when structure changes

---

### Epic 4.0 Integration Points

**Database:**
- Goals table: new `funnel_stage` and `kpi_hint` columns
- Topics table: new `related_goal_stages` and `recommended_content_types` columns
- Narratives table: new `narratives` table with `suggested_phase` field + junction tables (`narrative_goals`, `narrative_topics`) for referential integrity
- `campaigns.narratives` JSONB column preserved for backward compatibility
- All new fields nullable for backward compatibility

**API Endpoints:**
- `/api/campaigns/[id]/validation` - GET validation status for campaign
- `/api/campaigns/structure` - MODIFY to handle new fields
- `/api/ai/campaign-brief` - MODIFY to generate new fields

**Frontend Components:**
- `ExecutionReadinessChecklist.tsx` - New checklist component
- `CampaignStructurePreview.tsx` - MODIFY to show validation status
- `ValidationStatusIcon.tsx` - New status icon component

**AI Integration:**
- Reuse Epic 2-3 LLM infrastructure
- Update `strategy-designer.ts` prompt with new field requirements
- Add matrix validation rules to prompt

---

### Epic 4.0 Implementation Steps

**Phase 1: Schema Enhancement (Story 4.0.1) - 2-3 days**

1. Create migration: `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql`
2. Add `funnel_stage` and `kpi_hint` to goals table
3. Add `related_goal_stages` and `recommended_content_types` to topics table
4. Create narratives table and junction tables, migrate existing JSONB narratives to table structure, preserve JSONB column for backward compatibility
5. Update Zod schemas in `lib/ai/schemas.ts` (GoalSchema, TopicSchema; verify NarrativeSchema)
6. Generate TypeScript types: `supabase gen types`
7. Test migration and backward compatibility

**Phase 2: AI Prompt Enhancement (Story 4.0.2) - 2-3 days**

8. Update `lib/ai/prompts/strategy-designer.ts`:
   - Add instructions for `funnel_stage` and `kpi_hint` in goals
   - Add instructions for `related_goal_stages` and `recommended_content_types` in topics
   - Add instructions for `primary_goal_ids`, `primary_topic_ids`, `suggested_phase` in narratives
   - Add matrix validation rules to prompt
9. Update output schema examples in prompt
10. Test AI generation with new fields

**Phase 3: Validation Logic (Story 4.0.3) - 3-4 days**

11. Create `lib/validation/campaign-structure.ts` with helper functions
12. Implement `validateGoalCompleteness()`
13. Implement `validateTopicCompleteness()`
14. Implement `validateNarrativeCompleteness()`
15. Implement `validateMatrixRules()`
16. Implement `isReadyForExecution()`
17. Create `/api/campaigns/[id]/validation` endpoint
18. Test validation logic with various campaign structures

**Phase 4: UI Validation Status (Story 4.0.4) - 3-4 days**

19. Create `components/ui/ValidationStatusIcon.tsx`
20. Update `components/ai/CampaignStructurePreview.tsx` with validation status
21. Create `components/ai/ExecutionReadinessChecklist.tsx`
22. Update `app/campaigns/[id]/page.tsx` to display checklist
23. Implement real-time validation updates
24. Test UI components and validation display

**Total: 13-16 days (2.5-3 weeks)**

---

### Epic 4.0 Technical Details

**Strategic Metadata Fields:**

```typescript
// Goals enhancement
interface EnhancedGoal {
  title: string;
  description?: string;
  priority: number;
  funnel_stage?: 'awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization';
  kpi_hint?: string; // e.g., "FB/IG reach", "newsletter signup", "event registration"
}

// Topics enhancement
interface EnhancedTopic {
  name: string;
  description?: string;
  related_goal_stages?: Array<'awareness' | 'engagement' | 'consideration' | 'conversion' | 'mobilization'>;
  recommended_content_types?: Array<'short_video' | 'story' | 'static_image' | 'carousel' | 'email'>;
  // ... existing fields
}

// Narratives enhancement
interface EnhancedNarrative {
  title: string;
  description: string;
  priority?: number;
  primary_goal_ids?: string[]; // UUID array
  primary_topic_ids?: string[]; // UUID array
  suggested_phase?: 'early' | 'mid' | 'late';
}
```

**Matrix Validation Rules:**
- Max 2-3 high importance + core_message topics per segment
- Max 2-4 medium importance + support topics per segment
- Max 1-2 experimental topics per segment

**"Ready for Execution" Checklist Criteria:**
1. All goals have `funnel_stage` and `kpi_hint`
2. All segments have required fields (from Epic 3.0.5)
3. All topics have `related_goal_stages` and `recommended_content_types`
4. All narratives have `primary_goal_ids`, `primary_topic_ids`, and `suggested_phase`
5. Matrix follows validation rules (max limits per segment)

---

### Epic 4.0 Dependencies

**External:**
- Epic 3.0 complete (especially Story 3.0.5 - Enhanced Segment & Topic Schema)
- Epic 2 complete (LLM infrastructure)
- Anthropic Claude API (reuse from Epic 2)

**Internal:**
- Epic 3.0 complete (all stories done)
- Database schema from Epic 1-3
- Existing campaign structure generation (Story 2.2)
- Segment-Topic Matrix implementation (Story 3.0.5)

---

### Epic 4.0 Testing Strategy

**Story 4.0.1 (Schema Enhancement):**
- Unit tests: Zod schema validation for new fields
- Integration tests: Database migration script, backward compatibility
- Manual tests: Verify new columns exist, nullable fields work, enum constraints

**Story 4.0.2 (AI Prompt Enhancement):**
- Unit tests: Prompt template includes new fields
- Integration tests: AI generates new fields correctly
- E2E tests: Generate campaign structure → verify all new fields populated

**Story 4.0.3 (Validation Logic):**
- Unit tests: Validation helper functions with various inputs
- Integration tests: `/api/campaigns/[id]/validation` endpoint
- E2E tests: Validation status updates correctly

**Story 4.0.4 (UI Validation Status):**
- Unit tests: ValidationStatusIcon, ExecutionReadinessChecklist components
- Integration tests: Validation status display in CampaignStructurePreview
- E2E tests: Checklist updates in real-time, navigation to issues works

**Manual testing checklist:**
- [ ] All new fields save correctly to database
- [ ] AI generates all new strategic metadata fields
- [ ] Validation detects missing fields correctly
- [ ] Matrix validation rules enforced
- [ ] "Ready for Execution" checklist shows correct status
- [ ] Validation status icons display correctly
- [ ] Real-time validation updates work
- [ ] Backward compatibility maintained (existing campaigns work)

---

### Epic 4.0 Acceptance Criteria Summary

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

---

### Epic 4.0 Key Code Locations

**Database:**
- `supabase/migrations/YYYYMMDD_strategic_metadata_enhancement.sql` - Schema enhancement migration
- `lib/supabase/types.ts` - Generated TypeScript types (includes new fields)

**Validation Logic:**
- `lib/validation/campaign-structure.ts` - Validation helper functions
- `app/api/campaigns/[id]/validation/route.ts` - Validation endpoint

**API Endpoints:**
- `/api/campaigns/structure/route.ts` - MODIFY to handle new fields
- `/api/ai/campaign-brief/route.ts` - MODIFY to generate new fields

**Frontend Components:**
- `components/ai/ExecutionReadinessChecklist.tsx` - Checklist component
- `components/ui/ValidationStatusIcon.tsx` - Status icon component
- `components/ai/CampaignStructurePreview.tsx` - MODIFY to show validation status
- `app/campaigns/[id]/page.tsx` - Display checklist

**AI Integration:**
- `lib/ai/schemas.ts` - MODIFY to add new fields to schemas
- `lib/ai/prompts/strategy-designer.ts` - MODIFY to include new field requirements and matrix rules

---

## Epic 5: Execution Planner - Sprint & Content Calendar AI

**Date:** 2025-11-27
**Epic:** Epic 5 - Execution Planner
**Change Type:** AI-powered execution planning + database schema + UI
**Development Context:** Building execution planner that generates sprints and content calendars from validated campaign structures

---

### Epic 5 Context

**Epic 1-4 Foundation (Complete):**
- ✅ Manual campaign management (CRUD)
- ✅ AI-powered campaign structure generation (Epic 2)
- ✅ Communication strategies (Epic 3.0)
- ✅ Strategic metadata enhancement (Epic 4.0)
- ✅ Validation checklist system (Epic 4.0)

**Epic 5 Goal:**
Build an AI-powered execution planner that generates sprint plans and content calendars from validated campaign structures. The planner creates 2-4 sprints based on campaign length and complexity, then generates content slots distributed evenly across sprints, respecting channel constraints and strategic priorities.

---

### Epic 5 Scope

**In Scope:**
1. **Database schema** - `sprints`, `sprint_segments`, `sprint_topics`, `sprint_channels`, `content_slots` tables
2. **AI endpoint** - `POST /api/ai/campaign-execution` with streaming progress (SSE)
3. **Execution plan preview UI** - Sprint list + content calendar view
4. **Save execution plan API** - Transaction support with rollback
5. **Edit & management UI** - Edit sprints/slots, delete, re-generate
6. **Zod schema validation** - All execution plan data validated
7. **Constraint enforcement** - Max posts per day/channel, max total per week

**Out of Scope (Epic 6+):**
- Content copy generation for slots
- Advanced sprint optimization algorithms
- Multi-campaign execution coordination
- Execution analytics and reporting

---

### Epic 5 Source Tree Changes

**New files for Epic 5:**

```
campaign-os/
├── supabase/
│   └── migrations/
│       └── YYYYMMDD_execution_planning_schema.sql  # CREATE - sprints, content_slots tables
├── app/
│   └── api/
│       ├── ai/
│       │   └── campaign-execution/
│       │       └── route.ts                         # CREATE - Execution planner AI endpoint
│       └── campaigns/
│           └── execution/
│               └── route.ts                         # CREATE - Save execution plan API
├── lib/
│   ├── ai/
│   │   ├── schemas.ts                               # MODIFY - Add SprintPlanSchema, ContentSlotSchema, ExecutionPlanSchema
│   │   └── prompts/
│   │       └── execution-planner.ts                 # CREATE - Execution planner prompt
│   └── validation/
│       └── execution-plan.ts                        # CREATE - Execution plan validation helpers
└── components/
    └── campaigns/
        ├── ExecutionPlanner.tsx                     # CREATE - Main execution planner component
        ├── SprintList.tsx                            # CREATE - Sprint list component
        ├── ContentCalendar.tsx                       # CREATE - Content calendar component
        └── ExecutionPlanEditor.tsx                  # CREATE - Edit execution plan component
```

**Modified files:**
- `app/campaigns/[id]/page.tsx` - Add "Sprintek & Naptár" tab
- `lib/ai/schemas.ts` - Add execution plan Zod schemas

---

### Epic 5 Technical Approach

**Database Schema:**

```sql
-- Sprints table (junction tables for relationships)
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  focus_goal TEXT NOT NULL, -- enum: awareness, engagement, consideration, conversion, mobilization
  focus_description TEXT,
  success_indicators JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date)
);

-- Junction tables
CREATE TABLE sprint_segments (
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  PRIMARY KEY (sprint_id, segment_id)
);

CREATE TABLE sprint_topics (
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (sprint_id, topic_id)
);

CREATE TABLE sprint_channels (
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  channel_key TEXT NOT NULL,
  PRIMARY KEY (sprint_id, channel_key)
);

-- Content slots table
CREATE TABLE content_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  channel TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  primary_segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  primary_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  objective TEXT NOT NULL, -- enum: reach, engagement, traffic, lead, conversion, mobilization
  content_type TEXT NOT NULL, -- enum: short_video, story, static_image, carousel, live, long_post, email
  angle_hint TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- enum: planned, draft, published
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, channel, slot_index)
);
```

**AI Endpoint:**
- Streaming response (SSE) with progress updates
- Soft gate validation (warns but doesn't block)
- Priority-based slot generation (high → medium → experimental)
- Post-processing constraint enforcement

**Sprint Planning Logic:**
- Flexible logic with guidelines (not rigid rules)
- Sprint count based on campaign length + complexity
- Sprint focus goals based on campaign goal_type + length

**Content Slot Planning:**
- Dynamic calculation with constraints
- Per channel, per day limits (max 2, except Stories: 5)
- Weekly total limits (budget-based)
- Priority-based generation (high-importance pairs always get slots)

---

### Epic 5 Dependencies

**External:**
- Epic 4.0 complete (strategic metadata enhancement, validation checklist)
- Epic 3.0 complete (message strategies, segment-topic matrix)
- Epic 2 complete (LLM infrastructure, CopilotKit)

**Internal:**
- Epic 4.0 complete (all stories done, especially validation)
- Database schema from Epic 1-4
- Existing campaign structure generation (Story 2.2)

---

### Epic 5 Key Code Locations

**Database:**
- `supabase/migrations/YYYYMMDD_execution_planning_schema.sql` - Execution planning schema migration
- `lib/supabase/types.ts` - Generated TypeScript types

**AI Integration:**
- `lib/ai/schemas.ts` - Execution plan Zod schemas (SprintPlanSchema, ContentSlotSchema, ExecutionPlanSchema)
- `lib/ai/prompts/execution-planner.ts` - Execution planner prompt template
- `app/api/ai/campaign-execution/route.ts` - Execution planner AI endpoint

**API Endpoints:**
- `/api/ai/campaign-execution` - Generate execution plan (streaming)
- `/api/campaigns/execution` - Save execution plan

**Frontend Components:**
- `components/campaigns/ExecutionPlanner.tsx` - Main execution planner component
- `components/campaigns/SprintList.tsx` - Sprint list component
- `components/campaigns/ContentCalendar.tsx` - Content calendar component
- `components/campaigns/ExecutionPlanEditor.tsx` - Edit execution plan component

**Validation:**
- `lib/validation/execution-plan.ts` - Execution plan validation helpers

**Detailed story breakdown:** `docs/sprint-artifacts/epic-5-execution-planner-stories.md`

