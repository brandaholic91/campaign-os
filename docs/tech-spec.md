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
- Next.js 15.0.0 (App Router)
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
# CopilotKit endpoint: /api/copilotkit (hardcoded, no environment variable needed)
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
- demographics (jsonb)
- psychographics (jsonb)
- priority (int 1-5)
- created_at, updated_at (timestamps)

**topics tábla:**
- id (uuid, pk)
- campaign_id (uuid, fk → campaigns)
- name (text, not null)
- description (text)
- category (text, nullable)
- created_at, updated_at (timestamps)

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
# CopilotKit endpoint: /api/copilotkit
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
- CopilotKit client connects to `/api/copilotkit` endpoint
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
- Event stream endpoint: `/api/copilotkit`
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
5. Create `app/api/copilotkit/route.ts` - CopilotKit endpoint (HTTP handler, imports getCopilotRuntime from server.ts)
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
  "@copilotkit/react-core": "^1.0.0" // Optional - CopilotKit CopilotKit client
}
```

**Environment variables:**
```
ANTHROPIC_API_KEY=sk-ant-...
# CopilotKit endpoint: /api/copilotkit (hardcoded, no environment variable needed)
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
- `app/api/copilotkit/route.ts` - CopilotKit endpoint (HTTP handler, imports getCopilotRuntime from server.ts)

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
1. **New `message_strategies` database table** - JSONB structure (4 main categories, 16 sub-fields)
2. **Message Matrix UI refactor** - Display communication strategies instead of concrete messages
3. **Strategy preview cards** - Short AI-generated summary (editable) in matrix cells
4. **Strategy detail modal** - Full strategy view with all 16 sub-fields (4 sections)
5. **Strategy AI Generator** - Generate complete communication strategies (refactor Story 2.3)
6. **Strategy CRUD operations** - Create, edit, view, delete strategies
7. **Strategy form** - 4 main sections (Strategy Core, Style & Tone, CTA & Funnel, Extra Fields)
8. **Zod schema validation** - All strategy JSONB structures validated
9. **Migration** - Existing `messages` table remains for Content Calendar use

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
│       └── YYYYMMDD_message_strategies.sql    # CREATE - message_strategies table
├── app/
│   └── api/
│       └── strategies/
│           ├── route.ts                       # CREATE - GET, POST strategies
│           └── [id]/route.ts                 # CREATE - GET, PUT, DELETE strategy
├── lib/
│   └── ai/
│       ├── schemas.ts                         # MODIFY - Add strategy Zod schemas
│       └── prompts/
│           └── strategy-generator.ts          # CREATE - Strategy generation prompt (refactor message-generator.ts)
├── components/
│   └── messages/
│       ├── MessageMatrix.tsx                  # MODIFY - Refactor to display strategies
│       ├── StrategyCell.tsx                   # CREATE - Cell component with preview
│       ├── StrategyPreviewCard.tsx            # CREATE - Short summary card
│       ├── StrategyDetailModal.tsx            # CREATE - Full strategy view modal
│       ├── StrategyForm.tsx                   # CREATE - Strategy create/edit form
│       └── StrategyFormSections/
│           ├── StrategyCoreSection.tsx        # CREATE - Strategy Core form section
│           ├── StyleToneSection.tsx          # CREATE - Style & Tone form section
│           ├── CTAFunnelSection.tsx          # CREATE - CTA & Funnel form section
│           └── ExtraFieldsSection.tsx        # CREATE - Extra Fields form section
└── app/
    └── api/
        └── ai/
            └── strategy-matrix/
                └── route.ts                   # CREATE - Strategy AI generator (refactor message-matrix)
```

**Modified files:**
- `components/messages/MessageMatrix.tsx` - Refactor to display strategies instead of messages
- `app/campaigns/[id]/messages/page.tsx` - Fetch strategies instead of messages
- `lib/ai/schemas.ts` - Add strategy Zod schemas
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

**Phase 1: Database Migration (Story 3.0.1) - 2-3 days**

1. Create migration: `supabase/migrations/YYYYMMDD_message_strategies.sql`
2. Define JSONB structure for 4 main categories (16 sub-fields)
3. Create Zod schemas in `lib/ai/schemas.ts`
4. Generate TypeScript types: `supabase gen types`
5. Test migration and schema validation

**Phase 2: UI Refactor (Story 3.0.2) - 3-4 days**

6. Refactor `MessageMatrix.tsx` to fetch and display strategies
7. Create `StrategyCell.tsx` component
8. Create `StrategyPreviewCard.tsx` component
9. Create `StrategyDetailModal.tsx` component
10. Update `/app/campaigns/[id]/messages/page.tsx` to fetch strategies
11. Test UI components and cell states

**Phase 3: Strategy AI Generator (Story 3.0.3) - 4-5 days**

12. Create `lib/ai/prompts/strategy-generator.ts` prompt template
13. Refactor `/api/ai/message-matrix` → `/api/ai/strategy-matrix`
14. Implement 16-field JSON output generation
15. Add preview summary generation (from strategy_core)
16. Integrate CopilotKit event streaming
17. Build preview modal with approve/reject per strategy
18. Test AI generation and validation

**Phase 4: Strategy Form + CRUD (Story 3.0.4) - 3-4 days**

19. Create `/api/strategies` endpoints (GET, POST, PUT, DELETE)
20. Create `StrategyForm.tsx` component with 4 sections
21. Create form section components (StrategyCoreSection, StyleToneSection, etc.)
22. Implement form validation (Zod schemas)
23. Add preview summary editor (auto-generated, editable)
24. Integrate with StrategyDetailModal (edit mode)
25. Test CRUD operations and form validation

**Total: 15-20 days (3-4 weeks)**

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
3. No data migration needed (strategies are new concept)
4. Backward compatibility: `messages` table still used for Content Calendar (Epic 3.1)

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

**Manual testing checklist:**
- [ ] Strategy AI generates valid JSON per Zod schema (16 fields)
- [ ] Preview card shows correct summary
- [ ] Detail modal displays all 16 sub-fields
- [ ] Strategy form validates all required fields
- [ ] UNIQUE constraint prevents duplicate strategies
- [ ] Preview summary is editable
- [ ] Existing messages table still functional

---

### Epic 3.0 Acceptance Criteria Summary

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

---

### Epic 3.0 Key Code Locations

**Database:**
- `supabase/migrations/YYYYMMDD_message_strategies.sql` - Migration script
- `lib/supabase/types.ts` - Generated TypeScript types

**API Endpoints:**
- `/api/strategies/route.ts` - Strategy CRUD
- `/api/strategies/[id]/route.ts` - Single strategy operations
- `/api/ai/strategy-matrix/route.ts` - Strategy AI generator

**Frontend Components:**
- `components/messages/MessageMatrix.tsx` - Refactored matrix
- `components/messages/StrategyCell.tsx` - Cell component
- `components/messages/StrategyPreviewCard.tsx` - Preview card
- `components/messages/StrategyDetailModal.tsx` - Detail modal
- `components/messages/StrategyForm.tsx` - Create/edit form

**AI Integration:**
- `lib/ai/schemas.ts` - Strategy Zod schemas
- `lib/ai/prompts/strategy-generator.ts` - Strategy generation prompt

