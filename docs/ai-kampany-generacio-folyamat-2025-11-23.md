# AI által generált kampány létrehozása - Folyamat dokumentáció

## Áttekintés

A Campaign OS rendszer lehetővé teszi, hogy AI segítségével automatikusan generáljunk egy teljes kampány struktúrát egy rövid kampány-brief alapján. A folyamat kétfázisú AI folyamatot alkalmaz: először a brief-et normalizálja, majd a normalizált brief alapján létrehozza a teljes kampány struktúrát.

## Fő komponensek

### Frontend Komponensek

1. **`app/campaigns/new/ai/page.tsx`** - Az AI kampány létrehozási oldal
   - 7 lépéses wizard form, amely összegyűjti a kampány alapadatokat
   - AI generálás kezelése
   - Generált struktúra előnézete és szerkesztése
   - Mentés a database-be

2. **`components/ai/CampaignStructurePreview.tsx`** - Előnézet komponens
   - Megjeleníti az AI által generált struktúrát
   - Lehetőség szerkesztésre és kiválasztásra
   - Táblázatos nézet a goals, segments, topics, narratives elemekhez

### Backend API Endpoints

1. **`app/api/ai/campaign-brief/route.ts`** - Fő AI generálási endpoint
   - Kétfázisú AI folyamatot koordinál
   - Brief Normalizer → Strategy Designer
   - Streaming választ ad vissza

2. **`app/api/campaigns/structure/route.ts`** - Struktúra mentése
   - Mentés a Supabase adatbázisba
   - Campaign, Goals, Segments, Topics, Narratives, Segment-Topic Matrix létrehozása

### AI Infrastruktúra

1. **`lib/ai/client.ts`** - AI provider abstraction
   - Több AI provider támogatás (Anthropic, OpenAI, Google, Ollama)
   - Egységes interfész a különböző modellekhez

2. **`lib/ai/prompts/`** - Prompt fájlok
   - `brief-normalizer.ts` - Brief normalizáló promptok
   - `strategy-designer.ts` - Stratégia tervező promptok

3. **`lib/ai/schemas.ts`** - Zod sémák
   - `BriefNormalizerOutputSchema` - Brief normalizáló kimenet
   - `CampaignStructureSchema` - Teljes kampány struktúra séma

## Részletes folyamat

### 1. Felhasználói Input - Wizard Form (7 lépés)

A felhasználó kitölt egy 7 lépéses wizard formot, amely a következő információkat gyűjti:

**Lépés 1: Alapadatok**
- Kampány neve
- Kampány típusa (political_election, brand_awareness, stb.)
- Kezdés/befejezés dátuma
- Földrajzi fókusz
- Rövid leírás / kontextus (ez lesz a brief alapja)

**Lépés 2: Célok**
- Elsődleges kampánycél
- Cél típusa (awareness, engagement, conversion, stb.)
- Másodlagos célok
- Mi NEM cél

**Lépés 3: Márka/Identitás**
- Ki vagyunk mi?
- Pozicionálás
- Fő erősségek / USP-k

**Lépés 4: Célcsoport**
- Elsődleges célcsoport(ok)
- Meglévő personák
- Fontos attitűdök / hozzáállások

**Lépés 5: Üzenetirányok**
- Mit szeretnénk hangsúlyozni?
- Tabuk / kerülendő témák
- Kötelező keretek / motívumok
- Elvárt tónus

**Lépés 6: Erőforrások**
- Fő csatornák
- Biztosan NEM használt csatornák
- Költségkeret szintje
- Erőforrás limitációk

**Lépés 7: Kontextus**
- Mi működött korábban?
- Mi bukott el / nem működött?
- Referenciakampányok
- Jog / reputáció / korlátok

### 2. Brief Készítése

Amikor a felhasználó a 7. lépés után megnyomja a "Kampány Struktúra Generálása" gombot, a frontend összeállítja a brief-et:

```typescript
const brief = `${formData.description}\n\nKampány típusa: ${formData.type}\nCél: ${formData.goalType}\nElsődleges cél: ${formData.primaryGoal}`
```

### 3. API Hívás - `/api/ai/campaign-brief`

A frontend POST kérést küld az `/api/ai/campaign-brief` endpointra a következő adatokkal:
- `brief` - A szöveges brief
- `campaignType` - A kampány típusa
- `goalType` - A cél típusa

### 4. Fázis 1: Brief Normalizer

Az API először a Brief Normalizer AI lépést futtatja:

**Prompt:**
- `BRIEF_NORMALIZER_SYSTEM_PROMPT` - Rendszer prompt, amely magyarázza a feladatot
- `BRIEF_NORMALIZER_USER_PROMPT(brief, campaignType, goalType)` - Felhasználói prompt a brief-tel

**Kimenet:**
A Brief Normalizer egy strukturált JSON objektumot ad vissza:
```json
{
  "campaign_type": "political_election" | "brand_awareness" | ...,
  "goal_type": "awareness" | "engagement" | ...,
  "key_themes": ["téma1", "téma2", ...],
  "target_audience_summary": "Rövid összefoglaló a célcsoportról",
  "primary_message": "Fő üzenet"
}
```

**Validáció:**
- JSON parse ellenőrzés (markdown code block eltávolítása után)
- `BriefNormalizerOutputSchema` validáció (Zod)

**Token kezelés:**
- Normál modellek: 1024 max tokens
- Reasoning modellek (gpt-5, o1): 4096 max tokens

### 5. Fázis 2: Strategy Designer (Streaming)

A normalizált brief alapján a Strategy Designer létrehozza a teljes kampány struktúrát.

**Prompt:**
- `STRATEGY_DESIGNER_SYSTEM_PROMPT` - Rendszer prompt a struktúra sémájával
- `STRATEGY_DESIGNER_USER_PROMPT(normalizedBrief)` - Felhasználói prompt a normalizált brief-tel

**Kimenet:**
A Strategy Designer egy teljes kampány struktúrát generál:
```json
{
  "goals": [
    {
      "title": "Cél címe",
      "description": "Cél leírása",
      "priority": 1
    }
  ],
  "segments": [
    {
      "name": "Szegmens neve",
      "short_label": "20-35 városi",
      "description": "Részletes leírás",
      "demographic_profile": {
        "age_range": "25-40",
        "location_type": "városi",
        ...
      },
      "psychographic_profile": {
        "values": [...],
        "attitudes_to_campaign_topic": [...],
        ...
      },
      "media_habits": {...},
      "funnel_stage_focus": "awareness",
      "example_persona": {...},
      "priority": "primary"
    }
  ],
  "topics": [
    {
      "name": "Téma neve",
      "short_label": "Zöld = spórolás",
      "description": "...",
      "topic_type": "benefit",
      "core_narrative": "...",
      "content_angles": [...],
      "recommended_channels": [...],
      "risk_notes": [...],
      "priority": "primary"
    }
  ],
  "narratives": [
    {
      "title": "Narratíva címe",
      "description": "...",
      "priority": 1
    }
  ],
  "segment_topic_matrix": [
    {
      "segment_index": 0,
      "topic_index": 1,
      "importance": "high",
      "role": "core_message",
      "summary": "2-3 mondatos összefoglaló"
    }
  ]
}
```

**Streaming:**
A válasz streaming formátumban jön vissza, hogy a felhasználó láthassa a folyamatot. A frontend feldolgozza a stream-et és összeállítja a JSON-t.

**Token kezelés:**
- Normál modellek: 8192 max tokens
- Reasoning modellek: 16384 max tokens

### 6. Frontend Feldolgozás

A frontend feldolgozza a streaming választ:

1. **Stream olvasása** - A ReadableStream chunk-jaiból építi fel a teljes JSON-t
2. **JSON tisztítás** - Eltávolítja a markdown code block-okat, ha vannak
3. **JSON repair** - Ha a JSON hiányos (pl. stream megszakadt), a `jsonrepair` könyvtárral próbálja javítani
4. **Validáció** - `CampaignStructureSchema` validáció (Zod)

### 7. Előnézet és Szerkesztés

Az `CampaignStructurePreview` komponens megjeleníti a generált struktúrát:

- **Táblázatos nézet** - Külön tab-ok a goals, segments, topics, narratives, matrix-hoz
- **Szerkesztési lehetőség** - A felhasználó szerkesztheti az elemeket
- **Kiválasztás** - Checkbox-okkal kiválaszthatja, mely elemeket menti
- **Matrix szerkesztő** - Külön komponens a segment-topic matrix szerkesztéséhez

### 8. Mentés - `/api/campaigns/structure`

Amikor a felhasználó rákattint a "Kiválasztottak Mentése" gombra, a frontend POST kérést küld az `/api/campaigns/structure` endpointra:

**Request body:**
```json
{
  "campaign": {
    "name": "Kampány neve",
    "description": "...",
    "startDate": "2024-01-01",
    "endDate": "2024-02-01",
    "campaignType": "political_election",
    "goalType": "awareness"
  },
  "structure": {
    // A CampaignStructureSchema objektuma
  },
  "wizardData": {
    // Az összes wizard form adat (opcionális)
  }
}
```

**Mentési folyamat:**

1. **Campaign létrehozása/update**
   - Új kampány beszúrása vagy meglévő frissítése
   - Ha update, először törli a kapcsolódó adatokat

2. **Goals létrehozása**
   - Minden goal-t beszúr a `goals` táblába

3. **Segments létrehozása**
   - Beszúrja a szegmenseket
   - Index → ID mapping készít (a matrix-hez kell)

4. **Topics létrehozása**
   - Beszúrja a témákat
   - Index → ID mapping készít (a matrix-hez kell)

5. **Segment-Topic Matrix létrehozása**
   - Az index-eket ID-kra fordítja
   - Beszúrja a matrix bejegyzéseket

6. **Válasz**
   - `{ success: true, campaignId: "..." }` - Sikeres mentés
   - Vagy hiba üzenet

### 9. Redirect

Sikeres mentés után a frontend átirányítja a felhasználót a kampány részletek oldalára:
```typescript
window.location.href = `/campaigns/${campaignId}`
```

## Adatfolyam diagram

```
┌─────────────────┐
│  User Wizard    │
│   (7 steps)     │
└────────┬────────┘
         │
         │ brief, campaignType, goalType
         ▼
┌─────────────────────────┐
│ /api/ai/campaign-brief  │
│   POST                  │
└────────┬────────────────┘
         │
         ├─► Brief Normalizer AI
         │   └─► normalizedBrief (JSON)
         │
         └─► Strategy Designer AI (Streaming)
             └─► Campaign Structure (JSON)
                      │
                      ▼
         ┌────────────────────────┐
         │  Frontend Processing   │
         │  - Stream → JSON       │
         │  - Clean & Repair      │
         │  - Validate Schema     │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │  CampaignStructure     │
         │  Preview Component     │
         │  - Edit                │
         │  - Select Items        │
         └────────┬───────────────┘
                  │
                  │ selectedStructure
                  ▼
         ┌────────────────────────┐
         │ /api/campaigns/        │
         │    structure           │
         │   POST                 │
         └────────┬───────────────┘
                  │
                  ├─► Create Campaign
                  ├─► Create Goals
                  ├─► Create Segments
                  ├─► Create Topics
                  ├─► Create Matrix
                  │
                  ▼
         ┌────────────────────────┐
         │  Supabase Database     │
         └────────────────────────┘
```

## Technikai részletek

### AI Provider Abstraction

A rendszer több AI provider-t támogat:
- **Anthropic** (Claude) - alapértelmezett
- **OpenAI** (GPT models)
- **Google** (Gemini)
- **Ollama** (local models)

A provider-t az `AI_PROVIDER` environment változóval lehet beállítani. A `lib/ai/client.ts` fájl biztosítja az egységes interfészt.

### Schema Validáció

A rendszer Zod sémákat használ a validációhoz:
- `BriefNormalizerOutputSchema` - Brief normalizáló kimenet
- `CampaignStructureSchema` - Teljes struktúra
- Minden AI kimenet validálva van ezekkel a sémákkal

### Error Handling

**JSON Parse Errors:**
- Markdown code block eltávolítása
- `jsonrepair` könyvtár használata hiányos JSON-hoz
- Részletes error logging

**Validation Errors:**
- Zod validation error üzenetek
- Részletes logging a debug-hoz

**Streaming Errors:**
- Stream megszakadás kezelése
- Partial JSON recovery

### Progress Tracking

A frontend követi a generálási folyamatot:
- `progressStage`: `'idle' | 'brief-normalizer' | 'strategy-designer' | 'done'`
- Visual indicator a UI-ban
- Loading states minden lépésnél

## Kód példák

### Brief készítése

```typescript:app/campaigns/new/ai/page.tsx
const brief = `${formData.description}\n\nKampány típusa: ${formData.type}\nCél: ${formData.goalType}\nElsődleges cél: ${formData.primaryGoal}`

const response = await fetch('/api/ai/campaign-brief', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brief,
    campaignType: formData.type,
    goalType: formData.goalType
  })
})
```

### Streaming feldolgozás

```typescript:app/campaigns/new/ai/page.tsx
const reader = response.body?.getReader()
const decoder = new TextDecoder()
let resultText = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  resultText += decoder.decode(value, { stream: true })
}

// JSON tisztítás
let jsonContent = resultText.trim()
if (jsonContent.startsWith('```')) {
  const lines = jsonContent.split('\n')
  if (lines[0].match(/^```(json)?$/) && lines[lines.length - 1].match(/^```$/)) {
    jsonContent = lines.slice(1, -1).join('\n')
  }
}

// Parse és validáció
let structure
try {
  structure = JSON.parse(jsonContent)
} catch (e) {
  const repaired = jsonrepair(jsonContent)
  structure = JSON.parse(repaired)
}

const validated = CampaignStructureSchema.safeParse(structure)
```

### Mentés folyamat

```typescript:app/api/campaigns/structure/route.ts
// 1. Campaign
const { data: campaignData } = await supabase
  .schema('campaign_os')
  .from('campaigns')
  .insert({...})
  .select()
  .single()

// 2. Goals
await supabase
  .schema('campaign_os')
  .from('goals')
  .insert(structure.goals.map(g => ({...})))

// 3. Segments (ID mapping)
const { data: createdSegments } = await supabase
  .schema('campaign_os')
  .from('segments')
  .insert(...)
  .select('id')

segmentIdMap.set(index, seg.id)

// 4. Topics (ID mapping)
// ...

// 5. Matrix (index → ID konverzió)
const validMatrixEntries = structure.segment_topic_matrix
  .map(entry => ({
    segment_id: segmentIdMap.get(entry.segment_index),
    topic_id: topicIdMap.get(entry.topic_index),
    ...
  }))
```

## Hibakeresés

### Gyakori problémák

1. **"Empty response from Brief Normalizer"**
   - Ok: AI model nem adott vissza választ
   - Megoldás: Token limit növelése, model váltás

2. **"Failed to parse brief normalizer response as JSON"**
   - Ok: AI markdown code block-ban adott vissza JSON-t
   - Megoldás: A kód már kezeli ezt (code block eltávolítás)

3. **"Failed to validate campaign structure"**
   - Ok: AI kimenet nem felel meg a sémának
   - Megoldás: Prompt finomhangolás, schema ellenőrzés

4. **"Matrix creation failed"**
   - Ok: Index → ID konverzió hiba
   - Megoldás: Logging hozzáadása, index validáció

### Debug logging

A kódban részletes logging van minden lépésnél:
- Brief Normalizer response
- JSON parse errors
- Validation errors
- Matrix generation details

## Jövőbeli fejlesztések

1. **CopilotKit integráció** - Interaktív AI assistant a wizard-ben
2. **Incremental generation** - Lépésről lépésre generálás
3. **Regenerate** - Egyes elemek újragenerálása
4. **Template system** - Előre definiált kampány sablonok
5. **Multi-language support** - Több nyelv támogatása

