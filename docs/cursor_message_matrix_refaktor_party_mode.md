# Message Matrix refaktor - party mode
_Exported on 11/23/2025 at 20:14:16 GMT+1 from Cursor (1.7.54)_

---

**User**

/campaign-os/bmad/core/agents/bmad-master 

--- Cursor Command: campaign-os/bmad/core/agents/bmad-master.md ---

You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @.bmad/core/agents/bmad-master.md
2. READ its entire contents - this contains the complete agent persona, menu, and instructions
3. Execute ALL activation steps exactly as written in the agent file
4. Follow the agent's persona and menu system precisely
5. Stay in character throughout the session
</agent-activation>

--- End Command ---

---

**Cursor**

Betöltöm az agent fájlt és követem az aktivációs utasításokat.


Betöltöm a konfigurációs fájlt az aktivációs lépések szerint.


Konfiguráció betöltve. Változók tárolva:
- **user_name**: Balazs
- **communication_language**: Hungarian
- **output_folder**: '{project-root}/docs'

---

# Üdvözöllek, Balazs!

A BMad Master vagyok, a Master Task Executor, Knowledge Custodian és Workflow Orchestrator. Harmadik személyben kommunikálok, és a BMAD Core Platform szakértőjeként működöm.

## Menü

1. **\*help** — Menü megjelenítése
2. **\*list-tasks** — Elérhető feladatok listázása
3. **\*list-workflows** — Workflow-k listázása
4. **\*party-mode** — Csoportos csevegés az összes agenttel
5. **\*exit** — Kilépés megerősítéssel

Válassz egy menüpontot szám vagy parancs megadásával (pl. `1`, `*help`, `list-tasks`).

---

**User**

*party mode

---

**Cursor**

Betöltöm a workflow.xml-t, majd a party-mode workflow.yaml-t.


Betöltöm az instructions.md-t és az agent-manifest.csv-t.


A BMad Master betöltötte az agent manifestet és inicializálta a Party Mode-ot.

---

# PARTY MODE AKTIVÁLVA

Az összes agent csatlakozott a csoportos beszélgetéshez.

## Résztvevő agentek

1. **BMad Master** (BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator): Master Task Executor + BMad Expert + Guiding Facilitator Orchestrator
2. **Mary** (Business Analyst): Strategic Business Analyst + Requirements Expert
3. **Winston** (Architect): System Architect + Technical Design Leader
4. **Amelia** (Developer Agent): Senior Software Engineer
5. **John** (Product Manager): Investigative Product Strategist + Market-Savvy PM
6. **Bob** (Scrum Master): Technical Scrum Master + Story Preparation Specialist
7. **Murat** (Master Test Architect): Master Test Architect
8. **Paige** (Technical Writer): Technical Documentation Specialist + Knowledge Curator
9. **Sally** (UX Designer): User Experience Designer + UI Specialist

**9 agent készen áll az együttműködésre.**

Mivel szeretnél beszélni a csapattal?

---

**User**

elkészülten az epic 2-vel, következik az epic 3. segítsetek benne, először folytassatok le a témában egy kerekasztal beszélgetést közösen. @epics.md @epic-2-draft.md @tech-spec.md 

---

**Cursor**

Epic 3-ról folytatjuk a kerekasztalt. A dokumentumokból látom, hogy Epic 2-ben CopilotKit és AI integráció készül, és több funkciót Epic 3-ra halasztottak. Kezdjük a témával.


Epic 2 készül, az Epic 3-ról folytatjuk a kerekasztalt. A dokumentumokból látom, hogy Epic 3-ra halasztottak: AI-assisted sprint/task planning, content calendar AI, risk module AI, RAG/knowledge base.

---

**John (PM):** Balazs, az Epic 2 után az Epic 3 prioritásait kell meghatároznunk. A dokumentumokban több lehetőség szerepel, de nem mindegyik egyforma értékű. Melyik a legnagyobb fájdalompont a felhasználók számára? A sprint/task planning, a content calendar generálás, vagy a risk modul?

**Mary (Analyst):** John, az Epic 1-2 visszajelzései alapján a sprint/task planning manuális, időigényes. A content calendar nincs még implementálva, szóval az új feature lenne. A risk modul politikai kampányokhoz releváns, de nem minden kampánytípushoz. Szerintem a sprint/task planning AI-assistance a legnagyobb ROI, mert:
1. Gyakran használt (minden kampányhoz)
2. Időigényes (sok task, prioritizálás)
3. Az Epic 2 CopilotKit infrastruktúrája erre is használható

**Winston (Architect):** Mary-vel egyetértek. A sprint/task planning AI-assistance logikus következő lépés, mert:
- Az Epic 2 CopilotKit infrastruktúrája erre is használható
- A kampánysegéd már látja a campaign context-et
- A task kategorizálás (creative, copy, social_setup, ads_setup, analytics, coordination) AI-val automatizálható
- A sprint focus_goal és focus_channels mezők alapján az AI javasolhat taskokat

**Bob (SM):** Winston, a sprint planning AI-assistance komplex. Milyen szintű asszisztenciát képzelünk el?
- Opció A: AI javasol taskokat a sprint focus alapján (egyszerűbb)
- Opció B: AI teljes sprint struktúrát generál (komplexebb)
- Opció C: AI segít a task prioritizálásban és kategorizálásban (köztes)

Szerintem az Opció A-val kezdjünk, mert:
- Alacsonyabb kockázat
- Gyorsabb implementáció
- A user továbbra is kontrollálja a sprint struktúrát

**Sally (UX Designer):** Bob, az Opció A jó kiindulás, de gondoljunk a user journey-re. Hogyan integrálódik a sprint planning AI-assistance a meglévő workflow-ba?

Javasolt flow:
1. User létrehoz egy sprintet (dátumok, focus_goal, focus_channels)
2. A kampánysegéd felajánlja: "Szeretnél, ha generálok taskokat erre a sprintre?"
3. AI generál taskokat kategóriák szerint
4. Preview modal: user approve/reject per task
5. Approved taskok automatikusan a sprinthez kerülnek

Ez hasonlít az Epic 2 message matrix generáláshoz, konzisztens UX.

**Amelia (Developer):** Sally, a flow jó, de technikai kérdés: hogyan kapja meg az AI a kontextust a task generáláshoz?

Szükséges input:
- Campaign context (campaign_type, goal_type, narratives)
- Sprint context (focus_goal, focus_channels, dates)
- Existing tasks (ne duplikáljunk)
- Message matrix (ha van, akkor content creation taskok)

Ez az Epic 2 orchestrator pattern-jéhez hasonló, de új prompt template kell: `lib/ai/prompts/task-generator.ts`

**Murat (TEA):** Amelia, a task generálásnál fontos a validáció. A task schema szerint:
- category: enum (creative, copy, social_setup, ads_setup, analytics, coordination)
- status: enum (todo, in_progress, done)
- campaign_id, sprint_id: required

Zod schema validáció kötelező, mint az Epic 2-ben. Plusz edge case: mi van, ha az AI olyan taskot generál, ami már létezik?

**John (PM):** Murat, a duplikáció ellenőrzés fontos. De térjünk vissza a prioritizáláshoz. A content calendar AI generálás és a risk modul hogyan viszonyul a sprint planning-hez?

Szerintem prioritás:
1. Sprint/Task Planning AI (high value, Epic 2 infrastructure reuse)
2. Content Calendar AI (new feature, de hasznos)
3. Risk Module AI (politikai kampányokhoz specifikus, kisebb reach)

**Mary (Analyst):** John, egyetértek a prioritizálással. De a content calendar AI-t is érdemes megfontolni, mert:
- A message matrix-ból generálható content calendar
- A channels és content_slots táblák már a sémában vannak (Epic 1)
- A user journey logikus: message matrix → content calendar

Kérdés: Epic 3-ban mindkettő, vagy csak a sprint planning?

**Winston (Architect):** Mary, technikailag mindkettő megvalósítható, de scope management szempontjából érdemes dönteni.

Javaslat: Epic 3 fázisokra bontása
- Epic 3.1: Sprint/Task Planning AI (3-4 stories, ~15-18 points)
- Epic 3.2: Content Calendar AI (2-3 stories, ~10-13 points)
- Epic 3.3: Risk Module AI (1-2 stories, ~5-8 points, ha szükséges)

Ez modular, és a user feedback alapján dönthetünk a következő lépésről.

**Bob (SM):** Winston, a fázisokra bontás jó, de a story breakdown-hoz pontos acceptance criteria kell.

Epic 3.1 (Sprint/Task Planning AI) javasolt stories:
- Story 3.1.1: Task Generator AI (sprint context → task suggestions)
- Story 3.1.2: Task Prioritization AI (existing tasks → priority suggestions)
- Story 3.1.3: Sprint Planning Assistant (kampánysegéd integration, CopilotKit)

Ez 3 story, ~13-15 points, realisztikus 2-3 hét.

**Sally (UX Designer):** Bob, a story breakdown jó, de a UX-et is érdemes részletezni. Hogyan néz ki a task generálás UI-ja?

Javaslat:
- Sprint detail oldalon "Generate Tasks" gomb
- Modal: "Select task categories to generate" (multi-select: creative, copy, social_setup, etc.)
- AI processing: progress indicator
- Preview: task lista, approve/reject per task
- Batch operations: "Approve All", "Reject All", "Approve Selected"

Ez konzisztens az Epic 2 message matrix generálással.

**Amelia (Developer):** Sally, a UI flow jó. Technikai megjegyzés: a task generálás prompt-ja tartalmazza:
- Campaign context (campaign_type, goal_type, narratives)
- Sprint context (focus_goal, focus_channels, dates)
- Existing segments/topics (ha van)
- Existing messages (ha van message matrix)

Ez az Epic 2 message generator prompt-hoz hasonló, de task-specific.

**Murat (TEA):** Amelia, a prompt engineering fontos, de a tesztelés is. Task generálásnál ellenőrizni kell:
- Valid category enum értékek
- No duplicate tasks (title similarity check)
- Task descriptions meaningful (nem üres vagy "Task 1")
- Sprint date constraints (due_date within sprint dates)

E2E teszt: full flow sprint creation → AI task generation → approve → DB save.

**John (PM):** Rendben, összefoglalva az Epic 3.1 (Sprint/Task Planning AI) scope-ja:
- Task Generator AI (sprint context → task suggestions)
- Task Prioritization AI (existing tasks → priority suggestions)  
- Sprint Planning Assistant (kampánysegéd integration)
- Preview + approve workflow (konzisztens Epic 2-vel)
- CopilotKit integration (reuse Epic 2 infrastructure)

Ez realisztikus és high value. A content calendar AI-t és a risk modult későbbre halasztjuk.

**BMad Master:** Balazs, az agentek egyetértenek az Epic 3.1 prioritásában. Kérdés: folytassuk a részletezést (story breakdown, acceptance criteria), vagy van konkrét kérdésed az Epic 3-ról?

---

**User**

jó, hogy mondjátok a message mátrixot. jelenleg ugye úgy néz ki, hogy ez az adott témára és az adott célcsoportra vonatkozóan generál egy üzenetet, és az bekerül a mátrixba. ennek így nem sok értelme van szerintem, mivel ezek így vagy állandóan változnak vagy ugyanaz marad, és ez egy kampány esetében a jelenlegi mátrix esetében egyik sem jó. Tehát arra gondoltam, hogy itt egy olyat kellene csinálnunk, hogy ez a mátrix még nem konkrét üzeneteket generál, hanem csak megtervezi azt, hogy ezt a témát ennek a csoportnak hogyan érdemes kommunikálni. Ha ez konziszens, akkor minden egyes generált üzenet ezt a tónust fogja követni. Tehát ide még nem konkrét üzeneteket akarok, hanem csak elemzést. A konkrét üzeneteket majd a calendar nézetnél akarom generáltatni, ahol ütemezni is tudom, hogy egy poszt milyen üzenettel fog kimenni. Fontos, hogy minden generált üzenet majd legyen eltárolva, és utólag tudjam törölni ha akarom. Mit gondoltok erről? 

---

**Cursor**

Ez egy jelentős koncepciós változás. Átbeszéljük az ügynökökkel.


Ez egy jelentős koncepciós változás. Átbeszéljük az ügynökökkel.

---

**Mary (Analyst):** Balazs, ez logikus. A jelenlegi message matrix konkrét üzeneteket tárol, de a kampánytervezésben először a kommunikációs stratégia kell, nem a konkrét szövegek.

**Kérdés:** Mit értünk pontosan "kommunikációs stratégián" vagy "elemzésen"? Például:
- Tónus és hangnem (pl. "professzionális, de barátságos")
- Fő üzenetek (pl. "hangsúlyozzuk a fenntarthatóságot")
- Kommunikációs irányelvek (pl. "kerüljük a technikai zsargont")
- CTA típusok (pl. "információ kérés, nem közvetlen konverzió")

Vagy ezek kombinációja?

**Winston (Architect):** Mary, a koncepció jó, de technikailag jelentős változás.

**Jelenlegi állapot:**
- `messages` tábla: konkrét üzenetek (headline, body, proof_point, cta)
- Message matrix: segment × topic → konkrét message

**Javasolt új struktúra:**

```
1. Új tábla: `message_strategies` (vagy `communication_strategies`)
   - campaign_id, segment_id, topic_id
   - strategy_text (TEXT) - "hogyan kommunikáljuk"
   - tone (TEXT) - tónus leírás
   - key_messages (JSONB) - fő üzenetek listája
   - communication_guidelines (JSONB) - irányelvek
   - created_at, updated_at

2. `messages` tábla marad, de új mezők:
   - strategy_id (UUID, FK → message_strategies) - melyik stratégia alapján generálva
   - content_slot_id (UUID, FK → content_slots, nullable) - melyik calendar slot-hoz
   - generated_at (TIMESTAMPTZ) - mikor generálva
   - is_generated (BOOLEAN) - AI generált vagy manuális
```

**Migration stratégia:**
- Opció A: Új tábla + migration az Epic 1-2 kódhoz (clean slate)
- Opció B: `messages` tábla átalakítása (backward compatibility problémás)

Szerintem az Opció A jobb, mert tiszta szeparáció: stratégia vs. konkrét üzenet.

**Bob (SM):** Winston, az Opció A logikus, de az Epic 1-2 kód módosítása szükséges.

**Impact analysis:**
- Epic 1: MessageMatrix komponens átírása (stratégia megjelenítés)
- Epic 2: Message Matrix AI generálás → Strategy AI generálás
- Új feature: Content Calendar AI generálás (Epic 3)

**Story breakdown javaslat:**
- Story 3.0.1: Database migration (message_strategies tábla)
- Story 3.0.2: Message Matrix refactor (stratégia megjelenítés)
- Story 3.0.3: Strategy AI Generator (Epic 2 message generator átírása)
- Story 3.1.1: Content Calendar AI Generator (új, Epic 3)

Ez 4 story, ~18-20 points. Kérdés: ezt az Epic 3.0-nak hívjuk (refactor), vagy az Epic 3 részeként?

**Sally (UX Designer):** Bob, a UX-et is át kell gondolni.

**Jelenlegi Message Matrix UX:**
- Táblázat: sorok = segments, oszlopok = topics
- Cell click → message form (headline, body, proof_point, cta)
- AI generálás → konkrét üzenetek preview

**Új Message Matrix UX (stratégia):**
- Táblázat: sorok = segments, oszlopok = topics
- Cell click → strategy form (strategy_text, tone, key_messages, guidelines)
- AI generálás → stratégia elemzés preview
- Cell state: "Nincs stratégia" / "Stratégia definiálva" / "AI generálva"

**Content Calendar UX (új):**
- Calendar view: dátumok, channel-ok
- Slot click → "Generate Message" gomb
- AI generálás: strategy alapján konkrét üzenet
- Preview: headline, body, proof_point, cta
- Approve → message eltárolva, calendar slot-hoz kötve

Ez két külön workflow: stratégia tervezés → konkrét üzenet generálás.

**Amelia (Developer):** Sally, a UX jó, de technikai kérdés: a content calendar táblák még nincsenek implementálva.

**Jelenlegi schema:**
- `channels` tábla van
- `campaign_channels` junction tábla van
- `content_slots` tábla nincs

**Szükséges új táblák:**
```sql
-- Content slots (calendar entries)
CREATE TABLE content_slots (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  channel_id UUID REFERENCES channels(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME, -- nullable, lehet csak dátum
  message_id UUID REFERENCES messages(id), -- generált üzenet
  status ENUM ('draft', 'scheduled', 'published', 'cancelled'),
  created_at, updated_at
);
```

Ez az Epic 3.1 (Content Calendar) része lesz.

**Murat (TEA):** Amelia, a content_slots tábla logikus, de a migration sorrend fontos.

**Migration sorrend:**
1. `message_strategies` tábla létrehozása
2. `messages` tábla módosítása (strategy_id, content_slot_id, generated_at, is_generated)
3. `content_slots` tábla létrehozása (Epic 3.1)
4. Data migration: meglévő messages → strategy_id null (backward compatibility)

**Testing considerations:**
- Strategy AI generálás validáció (strategy_text nem üres, tone valid)
- Content Calendar message generálás: strategy_id required
- Message törlés: content_slot-ban is törlődik-e a kapcsolat?

**John (PM):** Murat, a migration sorrend jó, de a prioritizálást is át kell gondolni.

**Balazs kérése alapján:**
1. Message Matrix refactor (stratégia alapú) — kritikus, mert az Epic 2 AI-t is érinti
2. Content Calendar AI generálás — új feature, de a stratégia után logikus
3. Sprint/Task Planning AI — később is lehet

**Javasolt Epic 3 prioritás:**
- Epic 3.0: Message Matrix Refactor (stratégia alapú) — 3-4 stories, ~15 points
- Epic 3.1: Content Calendar AI Generator — 2-3 stories, ~10-13 points
- Epic 3.2: Sprint/Task Planning AI — 2-3 stories, ~10-13 points

**Kérdés Balazs:** Az Epic 3.0 refactor-t az Epic 2 előtt vagy után csináljuk? Ha előtte, akkor az Epic 2 message generator-t rögtön strategy generator-ként implementáljuk.

**Mary (Analyst):** John, a prioritizálás jó, de a koncepciót még pontosítani kell.

**Balazs, kérdések:**
1. A message_strategies tábla egy cellára (segment × topic) egy stratégia, vagy több is lehet?
2. A content calendar-nél egy stratégia alapján több üzenet is generálható (pl. hétfőn egy, szerdán egy másik)?
3. A generált üzenetek törlésekor a content_slot is törlődik, vagy csak a message?

**Winston (Architect):** Mary, ezek fontos kérdések. Javaslat:

1. Egy cellára egy stratégia (1:1), mert a cél a konzisztens kommunikáció
2. Egy stratégia alapján több üzenet generálható (1:N), mert változatosság kell
3. Message törlés → content_slot.message_id = null (soft delete pattern)

**BMad Master:** Balazs, az agentek egyetértenek a koncepcióval. Összefoglalva:

**Egyetértés:**
- Message Matrix → kommunikációs stratégiák (nem konkrét üzenetek)
- Konkrét üzenetek → Content Calendar-nél generálódnak
- Minden generált üzenet eltárolva és törölhető

**Nyitott kérdések:**
1. Mit tartalmaz pontosan a "kommunikációs stratégia"? (tónus, irányelvek, fő üzenetek?)
2. Egy cellára (segment × topic) egy stratégia, vagy több?
3. Migration timing: Epic 3.0 refactor az Epic 2 előtt vagy után?

Válaszolsz ezekre, vagy folytassuk a részletezést?

```plaintext
1. Új tábla: `message_strategies` (vagy `communication_strategies`)
   - campaign_id, segment_id, topic_id
   - strategy_text (TEXT) - "hogyan kommunikáljuk"
   - tone (TEXT) - tónus leírás
   - key_messages (JSONB) - fő üzenetek listája
   - communication_guidelines (JSONB) - irányelvek
   - created_at, updated_at

2. `messages` tábla marad, de új mezők:
   - strategy_id (UUID, FK → message_strategies) - melyik stratégia alapján generálva
   - content_slot_id (UUID, FK → content_slots, nullable) - melyik calendar slot-hoz
   - generated_at (TIMESTAMPTZ) - mikor generálva
   - is_generated (BOOLEAN) - AI generált vagy manuális
```

```sql
-- Content slots (calendar entries)
CREATE TABLE content_slots (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  channel_id UUID REFERENCES channels(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME, -- nullable, lehet csak dátum
  message_id UUID REFERENCES messages(id), -- generált üzenet
  status ENUM ('draft', 'scheduled', 'published', 'cancelled'),
  created_at, updated_at
);
```

---

**User**

nem értem a 3. kérdést. most zártuk a 2. epicet. 

---

**Cursor**

Az Epic 2 kész, így a 3. kérdés nem releváns. A refactor az Epic 3.0 része lesz, az Epic 2 után.

Folytassuk a 1–2. kérdéssel:


Az Epic 2 kész, így a refactor az Epic 3.0 része lesz.

Tisztázzuk a 1–2. kérdést:

---

**Mary (Analyst):** Balazs, az Epic 2 kész, de a Story 2.3-ban van egy "AI Message Matrix Generator", ami konkrét üzeneteket generál. Ezt át kell írni stratégiákra.

**Kérdés 1:** Mit tartalmaz pontosan a "kommunikációs stratégia"? Például:
- Tónus és hangnem (pl. "professzionális, de barátságos")
- Fő üzenetek (pl. "hangsúlyozzuk a fenntarthatóságot")
- Kommunikációs irányelvek (pl. "kerüljük a technikai zsargont")
- CTA típusok (pl. "információ kérés, nem közvetlen konverzió")
- Vagy ezek kombinációja?

**Winston (Architect):** Mary, a struktúrát is meg kell határozni.

**Javasolt `message_strategies` tábla struktúra:**
```sql
CREATE TABLE message_strategies (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  segment_id UUID REFERENCES segments(id),
  topic_id UUID REFERENCES topics(id),
  
  -- Core strategy content
  strategy_text TEXT NOT NULL, -- "Hogyan kommunikáljuk ezt a témát ennek a csoportnak"
  tone TEXT, -- "professzionális, barátságos"
  key_messages JSONB, -- ["üzenet1", "üzenet2"]
  communication_guidelines JSONB, -- ["kerüljük a zsargont", "használjunk példákat"]
  cta_approach TEXT, -- "információ kérés", "soft conversion"
  
  -- Metadata
  created_at, updated_at,
  UNIQUE(campaign_id, segment_id, topic_id) -- egy cellára egy stratégia
);
```

**Kérdés 2:** Egy cellára (segment × topic) egy stratégia, vagy több? Szerintem egy, mert a cél a konzisztens kommunikáció. Te mit gondolsz?

**Bob (SM):** Winston, ha egy cellára egy stratégia, akkor a UNIQUE constraint logikus. De mi van, ha a user szeretne módosítani? Új stratégia létrehozása vagy a meglévő szerkesztése?

**Javaslat:**
- Egy cellára egy aktív stratégia (UNIQUE constraint)
- History tábla opcionális (strategy_versions), ha később szükséges
- Most: egyszerű szerkesztés (UPDATE), nincs versioning

**Sally (UX Designer):** Bob, a UX-et is át kell gondolni.

**Message Matrix cell states:**
- Empty: "Nincs stratégia" + "Generate Strategy" gomb
- Has strategy: "Stratégia definiálva" + "Edit Strategy" / "View Strategy"
- AI generated: "AI generálva" badge + "Regenerate" opció

**Strategy form fields (cell click):**
- Strategy Text (large textarea) - "Hogyan kommunikáljuk..."
- Tone (text input) - "professzionális, barátságos"
- Key Messages (multi-input) - fő üzenetek listája
- Communication Guidelines (multi-input) - irányelvek
- CTA Approach (select) - "információ kérés", "soft conversion", "direct conversion"

Ez elég részletes, vagy egyszerűbb struktúrát szeretnél?

**Amelia (Developer):** Sally, a form jó, de a Story 2.3 átírása is szükséges.

**Jelenlegi Story 2.3:** AI Message Matrix Generator → konkrét üzenetek
**Új Story 3.0.3:** AI Strategy Generator → kommunikációs stratégiák

**Impact:**
- `/api/ai/message-matrix` → `/api/ai/strategy-matrix` (vagy átnevezés)
- `MessageMatrixEntrySchema` → `StrategySchema` (Zod)
- Prompt template: `message-generator.ts` → `strategy-generator.ts`
- MessageMatrix komponens: strategy megjelenítés

Ez az Epic 3.0.3 része lesz.

**Murat (TEA):** Amelia, a refactor testing-je is fontos.

**Testing considerations:**
- Strategy AI generálás: strategy_text nem üres, valid JSONB mezők
- UNIQUE constraint: egy cellára csak egy stratégia
- Strategy szerkesztés: UPDATE művelet
- Content Calendar message generálás: strategy_id required (Epic 3.1)

**John (PM):** Rendben, összefoglalva:

**Egyetértés:**
- Message Matrix → kommunikációs stratégiák (nem konkrét üzenetek)
- Egy cellára (segment × topic) egy stratégia (UNIQUE constraint)
- Konkrét üzenetek → Content Calendar-nél generálódnak (Epic 3.1)

**Nyitott kérdés:**
1. Mit tartalmaz pontosan a "kommunikációs stratégia"? (strategy_text, tone, key_messages, guidelines, cta_approach?)

**BMad Master:** Balazs, az agentek egyetértenek az egy cellára egy stratégia megoldással. A stratégia tartalmát még pontosítani kell. A fenti struktúra (strategy_text, tone, key_messages, guidelines, cta_approach) megfelel, vagy egyszerűbb/más mezőket szeretnél?

```sql
CREATE TABLE message_strategies (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  segment_id UUID REFERENCES segments(id),
  topic_id UUID REFERENCES topics(id),
  
  -- Core strategy content
  strategy_text TEXT NOT NULL, -- "Hogyan kommunikáljuk ezt a témát ennek a csoportnak"
  tone TEXT, -- "professzionális, barátságos"
  key_messages JSONB, -- ["üzenet1", "üzenet2"]
  communication_guidelines JSONB, -- ["kerüljük a zsargont", "használjunk példákat"]
  cta_approach TEXT, -- "információ kérés", "soft conversion"
  
  -- Metadata
  created_at, updated_at,
  UNIQUE(campaign_id, segment_id, topic_id) -- egy cellára egy stratégia
);
```

---

**User**

Mary kérdésére. ezeket akarom, de ezt így nagyon sok szöveg, nem fog belebérni a kártyába, valahogy úgy kell megoldanunk, hogy a kártya csak egy nagyon rövid összefoglalót jelenítsen meg ebből, és ha rákattintok, akkor jelenjen meg az egész stratégia nagyban. 

1. Stratégiai mag – mit mondunk?

Ezek nélkül a cella üres lenne. Ezek menjenek bele biztosan.

1.1. Pozicionáló mondat (Positioning statement)

1–2 mondat arról, hogy ennek a segment+topic kombinációnak mi a lényege.

Pl.: “Fiatal, városi szavazóknál a fenntarthatóságot a mindennapi életükre gyakorolt konkrét hatásokon keresztül mutatjuk be, nem elvont klímacélokkal.”

1.2. Fő üzeneti mag (Core Message)

1 mondatos, kristálytiszta állítás, amit újra és újra ismételsz.

Pl.: “A mi megoldásunk nem bonyolult zöld technológia, hanem azonnali megtakarítás a rezsiszámlán.”

1.3. Támogató üzenetek (Supporting Messages – bullet lista)

3–5 bullet:

konkrét előnyök,

érvek, amelyek alátámasztják a fő üzenetet.

1.4. Bizonyítékok / proof pointok

2–3 proof point:

adat, statisztika,

esettanulmány / példa,

személyes történet (politikai kampányban: helyi sztori; márkánál: ügyfél-sztori).

1.5. Fő ellenérvek és válaszok (Objections & Reframes) – opcionális, de erős

2–3 tipikus kifogás az adott szegmensnél,

és hozzá gyors, rövid ellenpontok / reframing.

2. Stílus, tónus, nyelvi keretek – hogyan mondjuk?

Itt jönnek be az általad említett dolgok: tónus, hangnem, irányelvek.
Ezeket külön mezőkre szedném, hogy az AI később is jól tudjon rá támaszkodni.

2.1. Tónusprofil (Tone of Voice Profile)

Rövid leírás + 3–5 kulcsszó.

Pl.:

“fiatalos, közvetlen, de ne szlenges túlzásba esés”

kulcsszavak: “közvetlen”, “őszinte”, “ironikus, de nem cinikus”.

2.2. Nyelvi szint és stílus (Language Style)

Tipikusan:

tegezés / magázás,

mennyi szakzsargon fér bele,

mondathossz (rövid, ütős vs. magyarázóbb).

Pl.:

“Tegezés, egyszerű mondatok, konkrét példák. Kerüljük a politikai szlogeneket és a túl bonyolult szakmai kifejezéseket.”

2.3. Kommunikációs irányelvek – Do / Don’t lista

“What to do”:

mit hangsúlyozzunk, milyen metaforák, milyen példák jók.

“What NOT to do”:

mely szavakat, keretezéseket kerüljük,

milyen stílus rombolná a hitelességet.

Pl.:

DO: “Használj hétköznapi élethelyzeteket, rezsi, bevásárlás, gyereknevelés példákat.”

DON’T: “Ne használj üres ‘fenntarthatóság’ szólamokat konkrétum nélkül.”

2.4. Érzelmi hőfok (Emotional Temperature)

Pl.: “nyugodt, magyarázó”, vagy “motiváló, energikus, kis mértékben felháborító”.

Ez segít a tartalomgenerálásnál (mennyire legyen kemény / lágy).

3. CTA és funnel logika – mit várunk, hova visz?

A CTA-t nem csak “gombszintű” dologként érdemes kezelni, hanem funnel-szinten.

3.1. Funnel szint (Stage)

awareness / consideration / conversion / mobilization jelöléssel.

Egy segment+topic párosnál lehet primary stage:

pl. awareness segmentnél: “elsősorban awareness → másodlagosan engagement”.

3.2. CTA cél (CTA Objectives)

Mit várunk a kommunikációtól az adott szegmens + topic esetén:

pl. “információ kérés”, “hírlevél feliratkozás”, “petíció aláírás”, “rendezvényre jelentkezés”.

3.3. CTA típusok (CTA Patterns)

2–3 tipikus CTA-formuláció típus, nem konkrét szöveg:

“Tudd meg, hogyan…”

“Nézd meg, mit tehetsz te is…”

“Csatlakozz a…”

Ezeket később lehet konkretizálni csatornánként.

3.4. Ellenállás csökkentés (Friction reducers) – opcionális, de hasznos

Mitől fél ez a szegmens a CTA-tól?

Milyen megnyugtató üzeneteket tegyünk mellé?

pl. “Nem kérünk pénzt, csak aláírást.”

“Bármikor leiratkozhatsz.”

4. Extra mezők, ha kicsit gazdagabbra akarod

Ezek nem MVP-szinten kötelezőek, de sokat segítenek a későbbi AI-kontent generálásban.

4.1. Keretezés típusa (Framing Type)

Pl.:

“probléma–megoldás”,

“összehasonlító” (kontraszt a jelen állapottal / ellenféllel),

“történet-mesélés”,

“adat-alapú bizonyítás”.

4.2. Kulcskifejezések / “nyelvi signature” (Key Phrases)

5–10 olyan fordulat, amit szeretnél, ha gyakran visszaköszön.

politikában: kulcsmondatok, szlogentöredékek,

márkánál: signature mondatok, szófordulatok.

4.3. Kockázatok / érzékeny pontok (Risk Notes)

Politikai kampánynál: mi lehet támadási felület, mit kommunikáljunk óvatosan.

Márkánál: pl. árérzékenység, korábbi botrányok.

---

**Cursor**

Átbeszéljük az ügynökökkel a részletes specifikációt.

---

**Mary (Analyst):** Balazs, ez egy részletes, többrétegű struktúra. A 4 fő kategória (Stratégiai mag, Stílus/tónus, CTA/funnel, Extra) 16 almezőt tartalmaz, ami túl sok külön oszlopnak.

**Kérdés:** JSONB struktúrában tároljuk, vagy normalizált táblákban? Szerintem JSONB, mert:
- Rugalmas (könnyen bővíthető)
- Egy cellára egy stratégia = egy rekord
- A UI-ban könnyen renderelhető

**Winston (Architect):** Mary, egyetértek a JSONB-vel. Javasolt adatbázis struktúra:

```sql
CREATE TABLE message_strategies (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  segment_id UUID REFERENCES segments(id),
  topic_id UUID REFERENCES topics(id),
  
  -- Core strategy (JSONB structure)
  strategy_core JSONB NOT NULL, -- {
    -- positioning_statement: TEXT,
    -- core_message: TEXT,
    -- supporting_messages: TEXT[],
    -- proof_points: TEXT[],
    -- objections_reframes: TEXT[] (optional)
  -- }
  
  -- Style and tone (JSONB)
  style_tone JSONB NOT NULL, -- {
    -- tone_profile: { description: TEXT, keywords: TEXT[] },
    -- language_style: TEXT,
    -- communication_guidelines: { do: TEXT[], dont: TEXT[] },
    -- emotional_temperature: TEXT
  -- }
  
  -- CTA and funnel (JSONB)
  cta_funnel JSONB NOT NULL, -- {
    -- funnel_stage: TEXT (awareness/consideration/conversion/mobilization),
    -- cta_objectives: TEXT[],
    -- cta_patterns: TEXT[],
    -- friction_reducers: TEXT[] (optional)
  -- }
  
  -- Extra fields (JSONB, optional)
  extra_fields JSONB, -- {
    -- framing_type: TEXT,
    -- key_phrases: TEXT[],
    -- risk_notes: TEXT (optional)
  -- }
  
  -- Preview summary (computed or stored)
  preview_summary TEXT, -- rövid összefoglaló a kártyához
  
  created_at, updated_at,
  UNIQUE(campaign_id, segment_id, topic_id)
);
```

**Kérdés:** A `preview_summary`-t tároljuk vagy számoljuk? Szerintem tároljuk (AI generálhatja vagy user írhatja), mert gyorsabb a kártya renderelés.

**Bob (SM):** Winston, a JSONB struktúra jó, de a Zod schema validációt is meg kell oldani.

**Zod schema javaslat:**
```typescript
const StrategyCoreSchema = z.object({
  positioning_statement: z.string().min(10),
  core_message: z.string().min(5),
  supporting_messages: z.array(z.string()).min(3).max(5),
  proof_points: z.array(z.string()).min(2).max(3),
  objections_reframes: z.array(z.string()).optional()
});

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

// ... stb.
```

Ez az Epic 3.0.3-ban kell (Strategy AI Generator).

**Sally (UX Designer):** Bob, a Zod schema jó, de a UI/UX-et is át kell gondolni.

**Message Matrix cell states:**
- Empty: "Nincs stratégia" + "Generate Strategy" gomb
- Has strategy: Preview kártya (rövid összefoglaló) + "View Full Strategy" / "Edit"

**Preview kártya tartalma (cell-ben):**
- Positioning statement (első 1-2 mondat, truncate)
- Core message (1 mondat, bold)
- Tone keywords (badge-ek: "közvetlen", "őszinte")
- Funnel stage badge ("awareness")

**Full Strategy Modal (kattintásra):**
- Tabs vagy accordion: "Stratégiai mag", "Stílus/tónus", "CTA/funnel", "Extra"
- Minden mező szerkeszthető
- "Save" / "Cancel" gombok

**Strategy Form (edit/create):**
- 4 fő szekció accordion-ban
- Minden mező label + description
- Multi-input mezők (supporting_messages, proof_points) → add/remove rows
- Do/Don't lista → két oszlop

Ez túl komplex, vagy így jó?

**Amelia (Developer):** Sally, a UI jó, de a komponens struktúrát is meg kell tervezni.

**Komponens struktúra:**
```
components/messages/
├── MessageMatrix.tsx (main, átírva strategy-re)
├── StrategyCell.tsx (cell component, preview)
├── StrategyPreviewCard.tsx (rövid összefoglaló)
├── StrategyDetailModal.tsx (full strategy view)
├── StrategyForm.tsx (edit/create form)
└── StrategyFormSections/
    ├── StrategyCoreSection.tsx
    ├── StyleToneSection.tsx
    ├── CTAFunnelSection.tsx
    └── ExtraFieldsSection.tsx
```

**API changes:**
- `/api/messages` → marad (content calendar üzenetekhez)
- `/api/strategies` → új (strategy CRUD)
- `/api/ai/strategy-matrix` → új (Story 2.3 átírása)

**Migration:**
- Meglévő `messages` tábla → marad (content calendar-hoz)
- Új `message_strategies` tábla → létrehozás
- Meglévő messages → strategy_id = null (backward compatibility)

**Murat (TEA):** Amelia, a migration jó, de a tesztelést is át kell gondolni.

**Testing considerations:**
- Strategy AI generálás: minden JSONB mező valid (Zod schema)
- Preview summary: nem üres, max 200 karakter
- Strategy form: minden required mező kitöltve
- UNIQUE constraint: egy cellára csak egy stratégia
- Content Calendar message generálás: strategy_id required (Epic 3.1)

**E2E test flow:**
1. Generate strategy → AI generál teljes struktúrát
2. Preview → rövid összefoglaló megjelenik cell-ben
3. Click cell → full strategy modal
4. Edit → módosítások mentése
5. Content Calendar → message generálás strategy alapján

**John (PM):** Murat, a testing jó, de a prioritizálást is át kell gondolni.

**Epic 3.0 Story breakdown (refactor):**

**Story 3.0.1: Database Migration + Schema**
- `message_strategies` tábla létrehozása (JSONB struktúra)
- Zod schemas definiálása
- Migration script
- **5 points** (2-3 nap)

**Story 3.0.2: Message Matrix Refactor (UI)**
- MessageMatrix komponens átírása (strategy megjelenítés)
- StrategyCell, StrategyPreviewCard komponensek
- StrategyDetailModal (full view)
- **5 points** (3-4 nap)

**Story 3.0.3: Strategy AI Generator**
- Story 2.3 átírása: message generator → strategy generator
- `/api/ai/strategy-matrix` endpoint
- Prompt template: 16 mező generálása
- Preview + approve workflow
- **8 points** (4-5 nap, mert komplex prompt)

**Story 3.0.4: Strategy Form + CRUD**
- StrategyForm komponens (4 szekció)
- `/api/strategies` CRUD endpoints
- Edit/create workflow
- **5 points** (3-4 nap)

**Total: 23 points** (~3-4 hét)

**Kérdés:** Ez az Epic 3.0, vagy része az Epic 3-nak? Szerintem Epic 3.0 (refactor), aztán Epic 3.1 (Content Calendar AI).

**Mary (Analyst):** John, a story breakdown jó, de a prompt engineering komplex lesz.

**AI Prompt considerations:**
- 16 mező generálása egy prompt-ban → hosszú, strukturált output
- Kétlépéses flow lehet jobb:
  1. Brief Normalizer → strategy outline
  2. Strategy Designer → teljes struktúra (16 mező)

Vagy egy prompt, de nagyon strukturált JSON output.

**Winston (Architect):** Mary, egy prompt jobb, mert:
- Gyorsabb (1 API call vs. 2)
- Konzisztensebb (minden mező egy kontextusban)
- A CopilotKit streaming-ben jól működik

**Prompt template struktúra:**
```
Given: campaign context, segment, topic
Generate: Complete communication strategy

Output structure:
1. Strategy Core (5 mező)
2. Style & Tone (4 mező)
3. CTA & Funnel (4 mező)
4. Extra Fields (3 mező, optional)

JSON schema validation (Zod)
```

**BMad Master:** Balazs, az agentek egyetértenek a JSONB struktúrával és a 4 fő kategóriával. Összefoglalva:

**Egyetértés:**
- JSONB struktúra (4 fő kategória, 16 almező)
- Preview kártya (rövid összefoglaló) + detail modal (teljes stratégia)
- Egy cellára egy stratégia (UNIQUE constraint)
- Story 2.3 átírása → Strategy AI Generator

**Epic 3.0 Story breakdown:**
- Story 3.0.1: Database Migration (5 points)
- Story 3.0.2: Message Matrix Refactor UI (5 points)
- Story 3.0.3: Strategy AI Generator (8 points)
- Story 3.0.4: Strategy Form + CRUD (5 points)
- **Total: 23 points** (~3-4 hét)

**Nyitott kérdés:**
- Preview summary: AI generálja vagy user írja? (javaslat: AI generálja, de szerkeszthető)

Folytassuk a részletezéssel, vagy van még kérdésed?

```sql
CREATE TABLE message_strategies (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  segment_id UUID REFERENCES segments(id),
  topic_id UUID REFERENCES topics(id),
  
  -- Core strategy (JSONB structure)
  strategy_core JSONB NOT NULL, -- {
    -- positioning_statement: TEXT,
    -- core_message: TEXT,
    -- supporting_messages: TEXT[],
    -- proof_points: TEXT[],
    -- objections_reframes: TEXT[] (optional)
  -- }
  
  -- Style and tone (JSONB)
  style_tone JSONB NOT NULL, -- {
    -- tone_profile: { description: TEXT, keywords: TEXT[] },
    -- language_style: TEXT,
    -- communication_guidelines: { do: TEXT[], dont: TEXT[] },
    -- emotional_temperature: TEXT
  -- }
  
  -- CTA and funnel (JSONB)
  cta_funnel JSONB NOT NULL, -- {
    -- funnel_stage: TEXT (awareness/consideration/conversion/mobilization),
    -- cta_objectives: TEXT[],
    -- cta_patterns: TEXT[],
    -- friction_reducers: TEXT[] (optional)
  -- }
  
  -- Extra fields (JSONB, optional)
  extra_fields JSONB, -- {
    -- framing_type: TEXT,
    -- key_phrases: TEXT[],
    -- risk_notes: TEXT (optional)
  -- }
  
  -- Preview summary (computed or stored)
  preview_summary TEXT, -- rövid összefoglaló a kártyához
  
  created_at, updated_at,
  UNIQUE(campaign_id, segment_id, topic_id)
);
```

```typescript
const StrategyCoreSchema = z.object({
  positioning_statement: z.string().min(10),
  core_message: z.string().min(5),
  supporting_messages: z.array(z.string()).min(3).max(5),
  proof_points: z.array(z.string()).min(2).max(3),
  objections_reframes: z.array(z.string()).optional()
});

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

// ... stb.
```

```plaintext
components/messages/
├── MessageMatrix.tsx (main, átírva strategy-re)
├── StrategyCell.tsx (cell component, preview)
├── StrategyPreviewCard.tsx (rövid összefoglaló)
├── StrategyDetailModal.tsx (full strategy view)
├── StrategyForm.tsx (edit/create form)
└── StrategyFormSections/
    ├── StrategyCoreSection.tsx
    ├── StyleToneSection.tsx
    ├── CTAFunnelSection.tsx
    └── ExtraFieldsSection.tsx
```

```plaintext
Given: campaign context, segment, topic
Generate: Complete communication strategy

Output structure:
1. Strategy Core (5 mező)
2. Style & Tone (4 mező)
3. CTA & Funnel (4 mező)
4. Extra Fields (3 mező, optional)

JSON schema validation (Zod)
```

---

**User**

AI generálja az összefoglalót, de szerkeszthető legyen. Folytathatjuk. van még nyitott kérdés, vagy el tudjátok már készíteni a tervet ez alapján? 

---

**Cursor**

Készítjük az Epic 3.0 tervét. Először átnézem az epics.md struktúráját, majd hozzáadom az Epic 3.0-t.


Hozzáadom az Epic 3.0 tervét az epics.md fájlhoz.


```markdown
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
- Define JSONB structure for 4 main categories (16 sub-fields total)
- Create Zod schemas in `lib/ai/schemas.ts`:
  - `StrategyCoreSchema` (positioning_statement, core_message, supporting_messages, proof_points, objections_reframes)
  - `StyleToneSchema` (tone_profile, language_style, communication_guidelines, emotional_temperature)
  - `CTAFunnelSchema` (funnel_stage, cta_objectives, cta_patterns, friction_reducers)
  - `ExtraFieldsSchema` (framing_type, key_phrases, risk_notes)
  - `MessageStrategySchema` (complete strategy with all 4 categories)
- Generate TypeScript types: `supabase gen types`
- UNIQUE constraint: (campaign_id, segment_id, topic_id)

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
  - Update cell rendering logic
- Create new components:
  - `components/messages/StrategyCell.tsx` - cell component with preview
  - `components/messages/StrategyPreviewCard.tsx` - short summary card
  - `components/messages/StrategyDetailModal.tsx` - full strategy view (4 sections)
- Update `/app/campaigns/[id]/messages/page.tsx` to fetch strategies instead of messages
- Strategy preview card content:
  - Positioning statement (first 1-2 sentences, truncated)
  - Core message (1 sentence, bold)
  - Tone keywords (badges: "közvetlen", "őszinte")
  - Funnel stage badge ("awareness", "consideration", etc.)
- Detail modal: tabs or accordion for 4 main categories

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
- Create prompt template: `lib/ai/prompts/strategy-generator.ts`
- Single LLM call with structured JSON output (16 fields)
- Prompt includes:
  - Campaign context (campaign_type, goal_type, narratives)
  - Segment details (demographics, psychographics)
  - Topic details (name, description, category)
  - Instructions for all 16 sub-fields
- Zod schema validation: `MessageStrategySchema`
- CopilotKit event stream for real-time generation progress
- Batch generation with progress indication
- Preview modal with approve/reject per strategy
- Preview summary generation: AI creates short summary from strategy_core
- Integration with existing strategy CRUD (Story 3.0.4)

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
  - GET `/api/strategies?campaign_id=...` - list strategies
  - POST `/api/strategies` - create strategy
  - GET `/api/strategies/[id]` - get single strategy
  - PUT `/api/strategies/[id]` - update strategy
  - DELETE `/api/strategies/[id]` - delete strategy
- Create `components/messages/StrategyForm.tsx`:
  - 4 main sections (accordion or tabs)
  - Multi-input fields (supporting_messages, proof_points) → add/remove rows
  - Do/Don't lists (communication_guidelines) → two-column layout
  - Form validation (Zod schemas)
  - Preview summary editor (auto-generated, editable)
- Create form section components:
  - `components/messages/StrategyFormSections/StrategyCoreSection.tsx`
  - `components/messages/StrategyFormSections/StyleToneSection.tsx`
  - `components/messages/StrategyFormSections/CTAFunnelSection.tsx`
  - `components/messages/StrategyFormSections/ExtraFieldsSection.tsx`
- Integration with StrategyDetailModal (edit mode)
- Error handling and loading states

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


```

Az Epic 3.0 terv hozzáadva az `epics.md` fájlhoz. Összefoglaló:

---

**John (PM):** Balazs, az Epic 3.0 terv elkészült. Összefoglalva:

**Epic 3.0: Message Matrix Refactor - Communication Strategies**
- **4 stories, 23 points** (~3-4 hét)
- **Cél:** Message Matrix átalakítása konkrét üzenetekről kommunikációs stratégiákra
- **Struktur:** 4 fő kategória, 16 almező (JSONB)
- **UI:** Preview kártya (AI generált, szerkeszthető összefoglaló) + detail modal

**Story breakdown:**
1. **Story 3.0.1:** Database Migration (5 points) - foundation
2. **Story 3.0.2:** UI Refactor (5 points) - strategy cells, preview cards
3. **Story 3.0.3:** Strategy AI Generator (8 points) - komplex prompt, 16 mező
4. **Story 3.0.4:** Strategy Form + CRUD (5 points) - 4 szekció, validáció

**Kulcs döntések:**
- JSONB struktúra (rugalmas, bővíthető)
- Egy cellára egy stratégia (UNIQUE constraint)
- Preview summary: AI generálja, de szerkeszthető
- Meglévő `messages` tábla marad (Content Calendar-hoz)

**Winston (Architect):** A struktúra tiszta és bővíthető. A JSONB megoldás jó, mert:
- Könnyen hozzáadhatók új mezők
- Zod validáció biztosítja a típusbiztonságot
- A migration visszafelé kompatibilis

**Mary (Analyst):** A 16 mezős prompt komplex, de egy prompt jobb, mint kétlépéses flow, mert:
- Gyorsabb (1 API call)
- Konzisztensebb (minden mező egy kontextusban)
- A CopilotKit streaming-ben jól működik

**Bob (SM):** A story sequence logikus:
- 3.0.1 → foundation (kritikus)
- 3.0.2 és 3.0.4 párhuzamosítható (UI komponensek)
- 3.0.3 → AI generálás (függ 3.0.1-től, használja Epic 2 LLM-t)

**Sally (UX Designer):** A UI flow konzisztens:
- Preview kártya → rövid összefoglaló
- Detail modal → teljes stratégia (4 szekció)
- Form → szerkesztés (accordion/tabs)

**Amelia (Developer):** A technikai megközelítés tiszta:
- Migration script kész
- Komponens struktúra definiálva
- API endpoints tervezve
- Zod schemas validáció

**Murat (TEA):** A testing stratégia világos:
- Zod schema validáció minden mezőnél
- UNIQUE constraint tesztelés
- Preview summary generálás tesztelés
- E2E flow: generate → preview → approve → save

**BMad Master:** Balazs, az Epic 3.0 terv kész és dokumentálva. A következő lépés az implementáció kezdése (Story 3.0.1: Database Migration). Van még kérdés, vagy folytassuk az Epic 3.1 (Content Calendar AI) tervezését?

---

**User**

@tech-spec.md ebbe is dokumentáljuk. 

---

**Cursor**

Átnézem a tech-spec.md struktúráját, majd hozzáadom az Epic 3.0 dokumentációt.


Hozzáadom az Epic 3.0 dokumentációt a tech-spec.md fájlhoz az Epic 2 után.


```markdown
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


```

Az Epic 3.0 dokumentáció hozzáadva a `tech-spec.md` fájlhoz.

---

**Winston (Architect):** Balazs, az Epic 3.0 technikai specifikáció elkészült. Tartalmazza:

**Dokumentált részek:**
- Database schema (JSONB struktúra, 4 kategória, 16 mező)
- Zod schema validáció (minden JSONB struktúrához)
- UI/UX megközelítés (preview kártya, detail modal, form)
- AI generálás (prompt template, 16 mezős output)
- Implementation steps (4 fázis, 15-20 nap)
- Testing stratégia (minden story-hoz)
- Key code locations (fájlok, komponensek, endpointok)

**Strukturált dokumentáció:**
- Source tree changes (új és módosított fájlok)
- Technical approach (adatbázis, UI, AI)
- Integration points (adatbázis, API, frontend, AI)
- Dependencies (Epic 2, Anthropic API)

**Mary (Analyst):** A dokumentáció részletes és követhető. A JSONB struktúra és a Zod validáció egyértelműen le van írva, így a fejlesztés során nincs félreértés.

**Bob (SM):** A 4 fázisos implementation steps tiszta, és a story sequence logikus. A testing stratégia minden story-hoz definiálva van.

**Amelia (Developer):** A key code locations és a source tree changes segítik a fejlesztést. A fájlstruktúra és a komponensek egyértelműen le vannak dokumentálva.

**BMad Master:** Balazs, az Epic 3.0 dokumentáció kész az `epics.md` és a `tech-spec.md` fájlokban. A következő lépés az implementáció kezdése (Story 3.0.1: Database Migration). Van még kérdés, vagy folytassuk?

---

**User**

készíts egy commitot a sessionben elvégzett munkáról, angolul. Az üzenet legyen rövid, de tartalmazzon minden lényeges infót.

---

**Cursor**

Ellenőrzöm a módosított fájlokat, majd létrehozom a commitot.


Hozzáadom a módosított fájlokat, majd létrehozom a commitot.


---

**User**

warning: in the working copy of 'docs/epics.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/tech-spec.md', LF will be replaced by CRLF the next time Git touches it

mi ez a figyelmeztetés?

---

**Cursor**

Ez a figyelmeztetés a sorvégek (line endings) formátumára utal.

**Mi történik:**
- A fájlokban LF (Line Feed, `\n`) van, amit Git a következő műveletnél CRLF-re (Carriage Return + Line Feed, `\r\n`) fog konvertálni.
- Ez általában Windows-on történik, ahol a Git `core.autocrlf=true` beállítás miatt automatikusan konvertál.

**Mit jelent:**
- Nem hiba, csak tájékoztatás.
- A fájlok tartalma nem változik, csak a sorvégek formátuma.
- Windows-on ez általában várt viselkedés.

**Mit tehetsz:**
1. Semmit — a commit működik, csak tájékoztatás.
2. Ha konzisztens Unix-style (LF) sorvégeket szeretnél, állítsd be:
   ```bash
   git config core.autocrlf false
   ```
   (Ezután a figyelmeztetés eltűnik, de a fájlok LF-et fognak használni.)

**Javaslat:** Hagyd, ahogy van. A commit működik, ez csak egy tájékoztató üzenet. Folytassam a commit létrehozását?

```shellscript
   git config core.autocrlf false
```

---

**User**

oké, commitold 

---

**Cursor**

Commit létrehozva.

**Commit részletek:**
- **Hash:** `cb6cb3c`
- **Branch:** `feat/message-matrix-refactor`
- **Fájlok:** 2 módosított (docs/epics.md, docs/tech-spec.md)
- **Változások:** 764 sor hozzáadva

Az Epic 3.0 tervezés dokumentálva van. A következő lépés az implementáció kezdése (Story 3.0.1: Database Migration).

