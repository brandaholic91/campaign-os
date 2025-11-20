# campaign-os - Technical Specification

**Author:** Balazs
**Date:** 2025-11-20
**Project Level:** quick-flow
**Change Type:** Greenfield projekt inicializálása - Sprint 1 MVP
**Development Context:** Greenfield - új codebase, Campaign OS kommunikációs és social média kampánytervező

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

1. LLM/AI integráció (Campaign Orchestrator agent, message generator)
2. Content calendar generálás
3. Risk modul
4. Export/PDF funkcionalitás
5. Multi-user/auth rendszer (v1-ben single-user)
6. Politikai specifikus modulok (risk tracker, scenario board)

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
- Anthropic Claude API (Sprint 2)
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
- zod@3.22.4 (schema validation, opcionális v1-ben)

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
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
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
- Next.js 15.0.0 (App Router)

**Language & Type Safety:**
- TypeScript 5.3.0
- Strict mode enabled

**Frontend:**
- React 19.0.0
- Tailwind CSS 3.4.0
- Shadcn/ui komponenskönyvtár
- Lucide React icons

**Backend:**
- Next.js API Routes (App Router)
- Supabase Postgres (PostgreSQL 15+)

**Database:**
- Supabase (managed PostgreSQL)
- Row Level Security (v1-ben disabled)

**Development Tools:**
- ESLint + Prettier
- TypeScript strict mode
- Git version control

**Deployment (Sprint 1 után):**
- Vercel (Next.js optimalizált)
- Supabase Cloud (adatbázis)

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

**Projekt inicializálás:**
```bash
# 1. Next.js projekt létrehozása
npx create-next-app@latest campaign-os --typescript --tailwind --app --no-src-dir

# 2. Dependencies telepítése
cd campaign-os
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react date-fns clsx tailwind-merge
npm install -D @types/node

# 3. Supabase migration futtatása
# Supabase CLI vagy Supabase Dashboard-on keresztül

# 4. Environment változók beállítása
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL és NEXT_PUBLIC_SUPABASE_ANON_KEY beállítása

# 5. Development server indítása
npm run dev
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

