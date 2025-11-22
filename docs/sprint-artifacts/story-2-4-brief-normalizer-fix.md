# Brief Normalizer Hiba Javítás - Story 2.4

**Dátum:** 2025-11-21  
**Probléma:** "Failed to normalize brief" hiba a campaign brief generálásnál  
**Ok:** JSON parsing/validation hiba az AI válaszból

---

## Változtatások

### 1. `app/api/ai/campaign-brief/route.ts`

#### JSON Extraction Javítás
- **Előtte:** Közvetlen `JSON.parse()` a raw response-ra
- **Utána:** Markdown code blocks eltávolítása először
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
  - Raw output
  - Extracted JSON
  - Parsed object
  - Error details

#### Kód változások:
```typescript
// Extract JSON from response (handle markdown code blocks)
let normalizerJsonContent = normalizerContent.trim()

// Remove markdown code blocks if present
if (normalizerJsonContent.startsWith('```')) {
  const lines = normalizerJsonContent.split('\n')
  const firstLine = lines[0]
  const lastLine = lines[lines.length - 1]
  
  if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
    normalizerJsonContent = lines.slice(1, -1).join('\n')
  }
}

// Separate parse and validation errors
try {
  normalizedBrief = JSON.parse(normalizerJsonContent)
} catch (parseError) {
  // Detailed parse error logging
}

try {
  normalizedBrief = BriefNormalizerOutputSchema.parse(normalizedBrief)
} catch (validationError) {
  // Detailed validation error logging
}
```

### 2. `lib/ai/prompts/brief-normalizer.ts`

#### Prompt Javítás
- **Előtte:** "Output must be valid JSON matching the BriefNormalizerOutputSchema"
- **Utána:** Explicit JSON formátum kérés, NO markdown
- **CRITICAL szekció hozzáadva:**
  - "You must respond with ONLY valid JSON"
  - "No markdown, no explanations, no code blocks"
  - Explicit schema példa a promptban

#### User Prompt Javítás
- **Előtte:** "Return a JSON object with: - campaign_type..."
- **Utána:** "Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure: {...}"

### 3. `lib/ai/prompts/strategy-designer.ts`

#### Ugyanazokat a javításokat alkalmaztuk:
- Explicit JSON-only kérés
- NO markdown, NO code blocks
- Explicit schema példa
- Részletes struktúra leírás

---

## Problémák, amiket megold

1. **Markdown code blocks:** AI néha ` ```json ... ``` ` formátumban adja vissza
2. **Nem valid JSON:** AI néha magyarázatot ad hozzá a JSON-hoz
3. **Schema validation:** Nem egyértelmű volt, milyen formátumot várunk
4. **Error debugging:** Nehéz volt kideríteni, hol van a hiba

---

## Tesztelés

### Előtte
```
Error: Failed to normalize brief
(kevés információ a hiba okáról)
```

### Utána
```
Error: Failed to parse brief normalizer response as JSON
Details: Unexpected token 'H' in JSON at position 0

Console logs:
- Brief Normalizer JSON Parse Error: [detailed error]
- Raw Output: [teljes AI válasz]
- Extracted JSON: [JSON extraction után]
```

---

## További Javítások Szükségesek?

Ha még mindig hibák vannak, ellenőrizd:
1. **Server console logokat** - részletes error információk
2. **ANTHROPIC_MODEL** env var - helyes model név
3. **ANTHROPIC_API_KEY** - valid API kulcs
4. **Brief content** - elég részletes input

Ha a hiba továbbra is fennáll, a console logok most már részletes információt adnak a probléma okáról.

