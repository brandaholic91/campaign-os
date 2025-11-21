# campaign-os - Technical Specification

**Author:** Balazs
**Date:** 2025-11-20
**Project Level:** quick-flow
**Change Type:** Greenfield projekt inicializálása - Epic 1 (Sprint 1 MVP) + Epic 2 (AI/AG-UI)
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

1. LLM/AI integráció (Campaign Orchestrator agent, message generator) - **Epic 2: AG-UI + AI integration**
2. Content calendar generálás - Epic 3
3. Risk modul - Epic 3
4. Export/PDF funkcionalitás - Epic 3+
5. Multi-user/auth rendszer (v1-ben single-user) - Future
6. Politikai specifikus modulok (risk tracker, scenario board) - Future

**Note:** Epic 2 will introduce AG-UI protocol for frontend-agent communication, enabling real-time "kampánysegéd" (campaign assistant) with bi-directional state sync.

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
- AG-UI Protocol (Epic 2) - Frontend-agent communication (CopilotKit or custom)
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

**AG-UI Protocol (Epic 2):**
- @copilotkit/react-core@^1.0.0 (AG-UI React client, opcionális - vagy custom implementation)
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

**Epic 2 (AI/AG-UI):**
```
ANTHROPIC_API_KEY=your-anthropic-api-key
# AG-UI stream endpoint configuration (if custom implementation)
AG_UI_STREAM_URL=/api/ai/stream
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
- AG-UI Protocol (Epic 2: CopilotKit or custom client)

**Backend:**
- Next.js API Routes (App Router)
- Supabase Postgres (PostgreSQL 15+)
- Anthropic Claude API (Epic 2: LLM integration)
- AG-UI Server (Epic 2: event streaming)

**Database:**
- Supabase (managed PostgreSQL)
- Row Level Security (v1-ben disabled)

**AI/LLM (Epic 2):**
- Anthropic Claude API (@anthropic-ai/sdk)
- AG-UI Protocol for frontend-agent communication
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
npm install @copilotkit/react-core  # Optional - AG-UI client

# 7. Environment változók frissítése (Epic 2)
# .env.local-hez hozzáadni:
# ANTHROPIC_API_KEY=sk-ant-...
# AG_UI_STREAM_URL=/api/ai/stream  # If custom implementation

# 8. Epic 2 development
# AG-UI stream endpoint: /api/ai/stream
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

## Epic 2: AI-Powered Campaign Orchestration with AG-UI

**Date:** 2025-11-21
**Epic:** Epic 2 - AI-Powered Campaign Orchestration
**Change Type:** AI/LLM integration + AG-UI frontend protocol
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
Introduce AI/LLM capabilities with AG-UI frontend integration to accelerate campaign planning. Enable users to interact with an embedded "kampánysegéd" (campaign assistant) that provides real-time, contextual help during manual campaign creation, or generate complete campaign structures from briefs.

---

### Epic 2 Scope

**In Scope:**
1. **Anthropic Claude API integration** - LLM client setup, error handling, rate limiting
2. **AG-UI protocol integration** - Frontend ↔ backend agent communication
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
│           ├── stream/route.ts                # CREATE - AG-UI event stream endpoint
│           ├── campaign-brief/route.ts        # CREATE - Campaign brief AI endpoint
│           └── message-matrix/route.ts         # CREATE - Message matrix AI endpoint
├── lib/
│   ├── ai/
│   │   ├── client.ts                          # CREATE - Anthropic Claude client
│   │   ├── schemas.ts                         # CREATE - Zod schemas for LLM outputs
│   │   ├── ag-ui/
│   │   │   ├── server.ts                      # CREATE - AG-UI server event handler
│   │   │   ├── events.ts                      # CREATE - AG-UI event type definitions
│   │   │   ├── tools.ts                       # CREATE - Backend tool definitions
│   │   │   └── orchestrator.ts                # CREATE - Campaign Orchestrator agent
│   │   └── prompts/
│   │       ├── brief-normalizer.ts            # CREATE - Brief normalization prompt
│   │       ├── strategy-designer.ts           # CREATE - Strategy design prompt
│   │       └── message-generator.ts           # CREATE - Message generation prompt
│   └── ag-ui/
│       ├── client.ts                          # CREATE - AG-UI client (or use CopilotKit)
│       ├── events.ts                          # CREATE - Frontend event types
│       └── tools.ts                           # CREATE - Frontend tool implementations
├── components/
│   └── ai/
│       ├── CampaignAssistant.tsx             # CREATE - Main AG-UI wrapper
│       ├── AssistantChat.tsx                 # CREATE - Streaming chat UI
│       ├── InlineSuggestions.tsx             # CREATE - Field-level suggestions
│       └── AssistantButton.tsx               # CREATE - Floating chat button
├── .env.local                                 # MODIFY - Add ANTHROPIC_API_KEY
└── package.json                               # MODIFY - Add @anthropic-ai/sdk, zod, AG-UI deps
```

**Modified files:**
- `components/messages/MessageMatrix.tsx` - Add AI generation button
- `app/campaigns/new/page.tsx` - Add "Create with AI" option
- Existing API routes - No changes, AI endpoints are separate

---

### Epic 2 Technical Approach

**AG-UI Protocol Architecture:**

**Frontend (Next.js/React):**
- AG-UI client connects to `/api/ai/stream` endpoint
- Real-time event streaming (WebSocket or Server-Sent Events)
- Bi-directional state sync: agent sees form state, can suggest/prefill
- Frontend tools: `highlightField()`, `prefillField()`, `navigateToStep()`, `openSuggestionModal()`
- Kampánysegéd UI: floating chat button or side panel
- Progressive enhancement: works without AG-UI (fallback to manual)

**Backend (Next.js API):**
- AG-UI server endpoint handles event streams
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
- AG-UI state sync for campaign form state
- Zustand or React Context for AG-UI client state
- Server Components for data fetching (unchanged from Epic 1)
- Client Components for interactive AI features

---

### Epic 2 Integration Points

**Anthropic Claude API:**
- Environment variable: `ANTHROPIC_API_KEY`
- Client initialization in `lib/ai/client.ts`
- Model: `claude-3-5-sonnet-20241022` or latest
- Structured outputs with JSON schema (Zod)
- Streaming support for real-time responses
- Error handling: retry logic, rate limit handling

**AG-UI Protocol:**
- Event stream endpoint: `/api/ai/stream`
- Event types: `user_message`, `agent_message`, `tool_call`, `state_patch`, `error`
- Bi-directional: UI → Agent (input, state) and Agent → UI (responses, suggestions)
- Frontend integration: CopilotKit or custom AG-UI client
- WebSocket or Server-Sent Events for real-time streaming

**Internal AI Modules:**
- `lib/ai/ag-ui/orchestrator.ts` - Campaign Orchestrator agent
- `lib/ai/prompts/` - LLM prompt templates
- `lib/ai/schemas.ts` - Zod validation schemas
- Integration with existing DB operations (Epic 1 API routes)

**Frontend-Backend Communication (Epic 2):**
- AG-UI event stream for AI interactions
- Traditional REST API fallback (Epic 1 endpoints)
- Server Actions for form submissions (unchanged)
- Real-time state sync via AG-UI

---

### Epic 2 Implementation Steps

**Phase 1: LLM + AG-UI Infrastructure (Story 2.1) - 3-5 days**

1. Install dependencies: `@anthropic-ai/sdk`, `zod`, AG-UI client (CopilotKit or custom)
2. Create `lib/ai/client.ts` - Anthropic client with error handling
3. Create `lib/ai/schemas.ts` - Zod schemas for LLM outputs
4. Create `lib/ai/ag-ui/server.ts` - AG-UI server event handler
5. Create `/api/ai/stream/route.ts` - AG-UI event stream endpoint
6. Implement rate limiting and error handling
7. Environment variables: `ANTHROPIC_API_KEY`
8. Test AG-UI event streaming

**Phase 2: Campaign Brief AI (Story 2.2) - 3-5 days**

9. Create `lib/ai/prompts/brief-normalizer.ts` - Brief normalization prompt
10. Create `lib/ai/prompts/strategy-designer.ts` - Strategy design prompt
11. Create `lib/ai/ag-ui/orchestrator.ts` - Campaign Orchestrator agent
12. Implement `/api/ai/campaign-brief` endpoint or AG-UI tool
13. Create `/app/campaigns/new/ai/page.tsx` - AI-assisted campaign creation
14. Build preview UI component for AI suggestions
15. Implement approve/reject workflow
16. Integration with existing campaign creation flow
17. Test end-to-end: brief → AI structure → preview → save

**Phase 3: Message Matrix AI (Story 2.3) - 3-5 days**

18. Create `lib/ai/prompts/message-generator.ts` - Message generation prompt
19. Implement `/api/ai/message-matrix` endpoint or AG-UI tool
20. Extend `MessageMatrix.tsx` with AI generation button
21. Implement batch message generation
22. Build preview modal with approve/reject per message
23. Integration with existing message CRUD
24. Test: select segments/topics → generate → preview → selective save

**Phase 4: AG-UI Frontend Integration (Story 2.4) - 3-5 days**

25. Install and configure CopilotKit or implement custom AG-UI client
26. Create `lib/ag-ui/client.ts` - AG-UI client setup
27. Create `components/ai/CampaignAssistant.tsx` - Main AG-UI wrapper
28. Create `components/ai/AssistantChat.tsx` - Streaming chat UI
29. Create `components/ai/InlineSuggestions.tsx` - Field-level suggestions
30. Implement frontend tools: highlightField, prefillField, navigateToStep
31. Implement state sync: form state → AG-UI → agent
32. Add floating chat button or side panel UI
33. Test bi-directional state sync and tool execution
34. Progressive enhancement: fallback without AG-UI

**Total: 15-20 days (3-4 weeks)**

---

### Epic 2 Technical Details

**AG-UI Event Types:**

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

**Campaign Form State (AG-UI visible):**

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
  "@copilotkit/react-core": "^1.0.0" // Optional - CopilotKit AG-UI client
}
```

**Environment variables:**
```
ANTHROPIC_API_KEY=sk-ant-...
AG_UI_STREAM_URL=/api/ai/stream  // If custom implementation
```

**External services:**
- Anthropic Claude API access
- WebSocket or Server-Sent Events support (Next.js)

---

### Epic 2 Testing Strategy

**Story 2.1 (LLM + AG-UI Infrastructure):**
- Unit tests: AI client error handling, Zod schema validation
- Integration tests: Mock Anthropic API responses, AG-UI event parsing
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
- Integration tests: AG-UI client-server communication
- E2E tests: Full flow with real-time chat, tool execution, state sync
- Edge cases: Connection loss, state sync conflicts

**Manual testing checklist:**
- [ ] AI generates valid JSON per Zod schema
- [ ] Preview shows all fields correctly
- [ ] Approve/reject workflow works
- [ ] Error messages user-friendly
- [ ] Rate limiting prevents API abuse
- [ ] AG-UI event streaming stable
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
9. ✅ AG-UI frontend integration provides real-time streaming chat
10. ✅ Bi-directional state sync: agent sees form state and can suggest/prefill fields
11. ✅ Frontend tools (highlightField, prefillField, navigateToStep) execute correctly
12. ✅ Kampánysegéd provides contextual help during manual campaign creation

---

### Epic 2 Key Code Locations

**AI Infrastructure:**
- `lib/ai/client.ts` - Anthropic Claude client
- `lib/ai/schemas.ts` - Zod validation schemas
- `lib/ai/ag-ui/server.ts` - AG-UI server handler
- `/api/ai/stream/route.ts` - AG-UI event stream endpoint

**AI Endpoints:**
- `/api/ai/campaign-brief/route.ts` - Campaign brief AI
- `/api/ai/message-matrix/route.ts` - Message matrix AI

**Frontend AI Components:**
- `components/ai/CampaignAssistant.tsx` - Main AG-UI wrapper
- `components/ai/AssistantChat.tsx` - Streaming chat UI
- `components/ai/InlineSuggestions.tsx` - Field suggestions

**AI Prompts:**
- `lib/ai/prompts/brief-normalizer.ts`
- `lib/ai/prompts/strategy-designer.ts`
- `lib/ai/prompts/message-generator.ts`

**Agent Orchestration:**
- `lib/ai/ag-ui/orchestrator.ts` - Campaign Orchestrator agent

