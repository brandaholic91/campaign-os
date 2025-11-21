# Message Matrix Generálás Hiba Javítás - Story 2.4

**Dátum:** 2025-11-21  
**Probléma:** "Failed to generate any messages" hiba az üzenetgenerálásnál  
**Ok:** JSON parsing/validation hibák az AI válaszaiból

---

## Változtatások

### 1. `app/api/ai/message-matrix/route.ts`

#### JSON Extraction Javítás
- **Előtte:** Közvetlen `JSON.parse()` a raw response-ra
- **Utána:** Markdown code blocks eltávolítása először (ugyanaz, mint campaign-brief-nél)
- **Logika:** 
  - Trim whitespace
  - Ellenőrzi, hogy ````json` vagy ```` ` kezdetű-e
  - Eltávolítja a code block marker sorokat
  - Majd parse-olja a JSON-t

#### Jobb Error Handling
- **Külön parse és validation hibák:**
  - `JSON.parse()` hiba → részletes parse error log
  - Schema validation hiba → részletes validation error log
- **Részletes logging:**
  - Segment és topic nevek (nem csak ID-k)
  - Raw output
  - Extracted JSON
  - Parsed messageData
  - Error details

#### Jobb "No messages" hiba
- **Előtte:** Egyszerű "Failed to generate any messages"
- **Utána:** Részletes információ:
  - Hány kombinációt próbált
  - Melyik segmentek és témák
  - "Check server logs for details"

#### Kód változások:
```typescript
// Extract JSON from response (handle markdown code blocks)
let jsonContent = content.trim()

// Remove markdown code blocks if present
if (jsonContent.startsWith('```')) {
  const lines = jsonContent.split('\n')
  const firstLine = lines[0]
  const lastLine = lines[lines.length - 1]
  
  if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
    jsonContent = lines.slice(1, -1).join('\n')
  }
}

// Separate parse and validation errors
try {
  messageData = JSON.parse(jsonContent)
} catch (parseError) {
  console.error(`JSON parse error for segment ${segment.name}...`)
  continue
}

try {
  const validated = validateGeneratedMessage({...messageData, campaign_id})
  generatedMessages.push(validated)
} catch (validationError) {
  console.error(`Validation error for segment ${segment.name}...`)
  continue
}
```

### 2. `lib/ai/prompts/message-generator.ts`

#### System Prompt Javítás
- **Előtte:** "Output must be valid JSON matching the MessageMatrixEntrySchema"
- **Utána:** Explicit JSON formátum kérés, NO markdown
- **CRITICAL szekció hozzáadva:**
  - "You must respond with ONLY valid JSON"
  - "No markdown, no explanations, no code blocks"
  - Explicit schema példa a promptban

#### User Prompt Javítás
- **Előtte:** "Generate a JSON object with: - segment_id..."
- **Utána:** "Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure: {...}"
- Explicit JSON struktúra példa

---

## Problémák, amiket megold

1. **Markdown code blocks:** AI néha ` ```json ... ``` ` formátumban adja vissza
2. **Nem valid JSON:** AI néha magyarázatot ad hozzá a JSON-hoz
3. **Schema validation:** Nem egyértelmű volt, milyen formátumot várunk
4. **Error debugging:** Nehéz volt kideríteni, melyik kombinációnál van hiba
5. **"No messages" hiba:** Nem volt információ, miért nem sikerült egyetlen üzenet sem

---

## Tesztelés

### Előtte
```
Error: Failed to generate any messages
(kevés információ a hiba okáról)
```

### Utána
```
Error: Failed to generate any messages
Details: Attempted 6 combinations but none succeeded. Check server logs for details.

Server console logs:
- JSON parse error for segment [name] ([id]), topic [name] ([id]): [error]
- Raw output: [teljes AI válasz]
- Extracted JSON: [JSON extraction után]
- Validation error for segment [name] ([id]), topic [name] ([id]): [error]
- Parsed messageData: [parsed object]
```

---

## További Javítások Szükségesek?

Ha még mindig hibák vannak, ellenőrizd:
1. **Server console logokat** - részletes error információk minden kombinációra
2. **ANTHROPIC_MODEL** env var - helyes model név
3. **ANTHROPIC_API_KEY** - valid API kulcs
4. **Segment és topic adatok** - van-e elegendő kontextus
5. **Campaign narratives** - van-e narratives adat a campaign-ben

A részletes logging most már pontosan megmutatja, melyik segment × topic kombinációnál van probléma és miért.

