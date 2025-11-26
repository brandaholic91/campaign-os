# AI Kampány Generálási Folyamat

**Utolsó frissítés:** 2025-11-26
**Státusz:** Aktuális (Epic 5 Phase 2 + Epic 6.1)

## Áttekintés

A Campaign OS mesterséges intelligencia (AI) segítségével automatizálja a kampánytervezés teljes folyamatát, a kezdeti brief-től a konkrét tartalomgyártásig. A folyamat négy fő fázisra bomlik:

1.  **Struktúra Tervezés**: Brief → Kampány alapok, Célok, Szegmensek, Témák, Narratívák.
2.  **Stratégia Alkotás**: Üzenetmátrix generálása (4 kategória, 16 mező).
3.  **Végrehajtás Tervezés (Execution Planning)**:
    *   **Fázis 1**: Sprintek tervezése (témák, fókuszok, KPI-ok).
    *   **Fázis 2**: Tartalom slotok generálása sprintenként.
4.  **Tartalom Gyártás**: Konkrét poszt vázlatok (drafts) generálása.

---

## 1. Fázis: Struktúra Tervezés (Campaign Structure)

**Cél:** A felhasználói input (wizard) átalakítása strukturált kampánytervvé.

### Folyamat
1.  **Wizard Input**: 7 lépéses űrlap (Alapadatok, Célok, Márka, Célcsoport, Üzenetek, Erőforrások, Kontextus).
2.  **Brief Normalizer**: A nyers inputot az AI egy strukturált JSON formátummá alakítja (`BriefNormalizerOutputSchema`).
3.  **Strategy Designer**: A normalizált brief alapján létrehozza a teljes adatbázis-kompatibilis struktúrát.

### Endpoint
`POST /api/ai/campaign-brief`

### Kimenet (JSON)
-   **Goals**: Funnel stage, KPI hint.
-   **Segments**: Demográfia, pszichográfia, média szokások.
-   **Topics**: Téma típus, content angles, csatornák.
-   **Narratives**: Átfogó történetívek.
-   **Segment-Topic Matrix**: Kapcsolatok fontossága és szerepe.

---

## 2. Fázis: Stratégia Alkotás (Message Strategies)

**Cél:** A szegmens-téma párokhoz (mátrix cellák) részletes kommunikációs stratégia generálása.

### Folyamat
A rendszer minden releváns mátrix cellához (ahol `importance` != null) generál egy `message_strategy` bejegyzést.

### Endpoint
`POST /api/ai/strategy-matrix`

### Kimenet (Strategy Schema)
Minden stratégiához 4 kategóriában 16 mezőt generál:
1.  **Core Strategy**: `positioning_statement`, `core_message`, `supporting_messages` (3-5 db), `proof_points` (2-3 db), `objections_reframes`.
2.  **Style & Tone**: `tone_profile` (description, keywords), `language_style`, `communication_guidelines` (do/dont), `emotional_temperature`.
3.  **CTA & Funnel**: `funnel_stage`, `cta_objectives`, `cta_patterns` (2-3 db), `friction_reducers`.
4.  **Extra Fields**: `framing_type`, `key_phrases`, `risk_notes`.

---

## 3. Fázis: Végrehajtás Tervezés (Execution Planning)

Ez a folyamat egy **kétfázisú** megközelítést alkalmaz a nagyobb kontroll és pontosság érdekében.

### 3.1. Sprint Tervezés (Sprint Generation)

**Cél:** A kampány időtartamának felosztása logikus végrehajtási szakaszokra (sprintekre).

**Endpoint:** `POST /api/ai/campaign-sprints`

**Bemenet:**
-   Kampány alapadatok (dátumok, célok).
-   Generált stratégiák és narratívák.

**Kimenet (Sprint Schema):**
-   **Időzítés**: Start/End dátumok.
-   **Fókusz**: `focus_stage` (pl. Awareness), `focus_goals`.
-   **Targeting**:
    -   `focus_segments_primary` / `_secondary`
    -   `focus_topics_primary` / `_secondary`
    -   `focus_channels_primary` / `_secondary`
-   **Tartalom**: `narrative_emphasis`, `key_messages_summary`.
-   **Metrikák**: `success_criteria`, `suggested_weekly_post_volume` (total, video, stories).
-   **Kockázatok**: `risks_and_watchouts`.

### 3.2. Tartalom Slot Tervezés (Content Slot Generation)

**Cél:** Egy adott sprinten belül a konkrét poszt helyek (slotok) kiosztása.

**Endpoint:** `POST /api/ai/campaign-sprints/[sprintId]/content-slots`

**Bemenet:**
-   A kiválasztott Sprint adatai.
-   A kampány szegmensei és témái.
-   Csatorna mix.

**Kimenet (Content Slot Schema):**
-   **Időzítés**: Dátum, napszak (`time_of_day`).
-   **Platform**: Csatorna (pl. Facebook, LinkedIn).
-   **Targeting**:
    -   `primary_segment_id`, `primary_topic_id`
    -   `secondary_segment_ids`, `secondary_topic_ids` (opcionális)
-   **Stratégia**:
    -   `funnel_stage`, `objective` (pl. engagement, lead)
    -   `angle_type` (pl. story, proof), `angle_hint`
    -   `content_type` (pl. short_video, carousel)
    -   `cta_type` (pl. learn_more, signup)
    -   `tone_override`
-   **Kapcsolat**: `related_goal_ids`.
-   **Egyéb**: `asset_requirements`, `notes`.

---

## 4. Fázis: Tartalom Gyártás (Content Drafting)

**Cél:** A lefoglalt slotokhoz (Content Slots) konkrét szöveges és vizuális vázlatok készítése.

**Tervezett Kimenet (Content Draft Schema):**
-   **Hook**: Figyelemfelkeltő kezdés.
-   **Body**: A poszt szövege.
-   **Visual Idea**: Kép/videó leírása.
-   **CTA**: Konkrét cselekvésre ösztönzés.
-   **Status**: Draft / Approved.

---

## Technikai Architektúra

### AI Provider Abstraction (`lib/ai/`)
A rendszer agnosztikus az AI szolgáltatóval szemben. A `lib/ai/client.ts` factory pattern-t használ:
-   **Támogatott szolgáltatók**: Anthropic (Claude), OpenAI, Google, Ollama.
-   **Konfiguráció**: `.env.local` fájlban (`AI_PROVIDER`, `AI_MODEL`).

### CopilotKit Integráció (`lib/ai/copilotkit/`)
A rendszer a **CopilotKit** keretrendszert használja az AI funkciók (chat, kontextus-érzékeny műveletek) integrálására.

#### 1. Architektúra
-   **Provider**: A `CopilotKitProvider` (`components/providers/CopilotKitProvider.tsx`) wrappeli az alkalmazást, biztosítva a globális AI kontextust és hibatűrést (Error Boundary).
-   **Backend Runtime**: A `lib/ai/copilotkit/server.ts` konfigurálja a `CopilotRuntime`-ot, kezeli az adaptereket (Anthropic, OpenAI, Google, Ollama) és definiálja a szerver oldali akciókat.
-   **API Endpoint**: A `/api/copilotkit` route kezeli a kéréseket, beépített rate limiting-gel (`TokenBucket`).

#### 2. Beépített Funkciók (Actions & Tools)
A rendszer egyedi akciókat és eszközöket definiál a CopilotKit számára:

-   **Backend Actions** (`server.ts`):
    -   `normalizeCampaignBrief`: Brief normalizálás (Step 1).
    -   `generateCampaignStrategy`: Teljes kampány struktúra generálás (Step 2).
    -   `generateMessageMatrix`: Üzenet mátrix generálás (Step 3).
    -   `describeCampaignState`: Kampány állapotának leírása az AI számára.

-   **Frontend Tools** (`tools.ts`):
    -   `highlightField`: UI mezők kiemelése a felhasználó figyelmének irányítására.
    -   `prefillField`: Űrlapmezők automatikus kitöltése AI javaslatokkal.
    -   `navigateToStep`: Navigáció a varázsló lépései között.
    -   `openSuggestionModal`: Javaslatok megjelenítése modális ablakban.

### Token Limitek (Max Output Tokens)
A rendszer különböző token limiteket használ a feladat komplexitásától és a választott modelltől függően (Reasoning vs. Standard).

| Feladat | Standard Modell (pl. GPT-4o, Claude 3.5 Sonnet) | Reasoning Modell (pl. o1, GPT-5) |
| :--- | :--- | :--- |
| **Brief Normalizálás** | 1,024 token | 4,096 token |
| **Kampány Struktúra** | 16,384 token | 32,768 token |
| **Stratégia Generálás** | 4,096 token | 8,192 token |
| **Sprint Tervezés** | 8,192 token | 32,768 token |
| **Tartalom Slotok** | 4,096 token | 32,768 token |
| **Tartalom Draft** | 4,000 token | 4,000 token |

### Validáció és Adatbiztonság (Zod Schemas)
Minden AI kimenet szigorú Zod sémákkal van validálva a `lib/ai/schemas.ts` fájlban. Ez biztosítja, hogy a generált JSON mindig megfeleljen az adatbázis struktúrának és a minőségi elvárásoknak.

#### 1. Kampány Struktúra (`CampaignStructureSchema`)
-   **Goals**: 3-5 db cél kötelező.
-   **Segments**: Kötelező tömb.
-   **Topics**: Opcionális a sémában (AI hibatűrés miatt), de a rendszer elvárja.
-   **Narratives**: 2-4 db narratíva (opcionális).
-   **Matrix**: 10-25 db kapcsolat (opcionális).

#### 2. Üzenet Stratégia (`MessageStrategySchema`)
-   **Core Strategy**:
    -   `positioning_statement`: Min. 10 karakter.
    -   `core_message`: Min. 5 karakter.
    -   `supporting_messages`: 3-5 db elem.
    -   `proof_points`: 2-3 db elem.
-   **Style & Tone**:
    -   `keywords`: 3-5 db kulcsszó.
-   **CTA & Funnel**:
    -   `cta_patterns`: 2-3 db minta.

#### 3. Sprint Terv (`SprintPlanSchema`)
-   **Időzítés**: `end_date` > `start_date`.
-   **Fókusz**:
    -   `focus_goals`: 1-3 db cél ID.
    -   `focus_segments_primary`: 1-2 db szegmens ID.
    -   `focus_topics_primary`: 2-3 db téma ID.
    -   `focus_channels_primary`: 2-3 db csatorna.
-   **Metrikák**:
    -   `suggested_weekly_post_volume`: `total` > 0, `video` >= 0.
-   **Tartalom**:
    -   `key_messages_summary`: Min. 20 karakter (opcionális).
    -   `risks_and_watchouts`: 1-4 db elem (opcionális).

#### 4. Tartalom Slot (`ContentSlotSchema`)
-   **Kötelező**: `date`, `channel`, `objective`, `content_type`, `funnel_stage`, `angle_type`, `cta_type`.
-   **Kapcsolatok**:
    -   `related_goal_ids`: 1-2 db cél ID.
    -   `secondary_segment_ids`: Max. 2 db (opcionális).
    -   `secondary_topic_ids`: Max. 2 db (opcionális).

#### 5. Tartalom Vázlat (`ContentDraftSchema`)
-   **Szöveg**:
    -   `hook`: Min. 10 karakter.
    -   `body`: Min. 50 karakter.
    -   `cta_copy`: Min. 5 karakter.
-   **Vizuális**:
    -   `visual_idea`: Min. 20 karakter.
-   **Státusz**: Alapértelmezetten `draft`.

### Streaming & UI
A hosszú generálási folyamatok (pl. struktúra tervezés) **streaming** választ használnak (`CopilotKit` protocol vagy natív stream), így a felhasználó valós időben látja az eredményt, nem kell megvárnia a teljes generálás végét.
