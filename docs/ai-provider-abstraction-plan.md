# AI Szolgáltató Absztrakció Terv

**Dátum:** 2025-11-24  
**Cél:** Több AI szolgáltató támogatása (Anthropic, OpenAI, Google Gemini, Ollama) egységes interfészen keresztül

---

## 1. Áttekintés

### Jelenlegi helyzet
- Csak Anthropic modelleket támogatunk
- Hardcoded `getAnthropicClient()` hívások minden API route-ban
- Nem lehet váltani szolgáltatók között

### Célállapot
- Több AI szolgáltató támogatása (Anthropic, OpenAI, Google Gemini, Ollama)
- Környezeti változóval választható szolgáltató és modell
- Egységes interfész minden szolgáltatóhoz
- Backward compatible (meglévő kód működik továbbra is)

---

## 2. Architektúra

### 2.1 Absztrakt AI Client Réteg

```
lib/ai/
├── client.ts                    # Absztrakt interfész és factory
├── providers/
│   ├── base.ts                 # Base provider interface
│   ├── anthropic.ts            # Anthropic implementáció
│   ├── openai.ts               # OpenAI implementáció
│   ├── google.ts               # Google Gemini implementáció
│   └── ollama.ts               # Ollama (lokális) implementáció
├── types.ts                    # Közös típusok
└── errors.ts                   # Hiba osztályok (már létezik)
```

### 2.2 Interfész Design

```typescript
interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<GenerateTextResponse>
  generateStream(options: GenerateTextOptions): AsyncIterable<StreamChunk>
}

interface GenerateTextOptions {
  model: string
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant', content: string }>
  maxTokens?: number
  temperature?: number
}
```

**Fontos:** System Prompt vs Messages Tömb
- A `systemPrompt` külön mezőként kerül kezelésre, NEM a `messages` tömbben
- A `messages` tömb CSAK `'user'` és `'assistant'` role-okat tartalmazhat
- **Nincs konfliktus:** Ha egy provider (pl. OpenAI) külön `system` paramétert igényel, az implementáció a `systemPrompt` mezőt használja
- **Nincs konfliktus:** Ha egy provider (pl. Anthropic) `system` paramétert használ, az is a `systemPrompt` mezőből jön
- Ez biztosítja az egységes interfészt: minden provider ugyanúgy kapja meg a system promptot, függetlenül az API különbségektől

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

---

## 3. Implementációs Lépések

### 3.1 Fázis 1: Base Provider és Típusok

**Fájl:** `lib/ai/types.ts` (új)
- `AIProvider` interfész
- `GenerateTextOptions` típus
  - **FONTOS:** `messages` tömb CSAK `'user'` és `'assistant'` role-okat tartalmazhat
  - System prompt külön `systemPrompt` mezőként kerül kezelésre
- `GenerateTextResponse` típus
- `StreamChunk` típus
- `ProviderType` enum: `'anthropic' | 'openai' | 'google' | 'ollama'`

**Fájl:** `lib/ai/providers/base.ts` (új)
- `BaseAIProvider` absztrakt osztály
- Közös logika (pl. JSON extraction, error handling)
- Template method pattern

### 3.2 Fázis 2: Provider Implementációk

**Fájl:** `lib/ai/providers/anthropic.ts` (új)
- `AnthropicProvider` osztály
- `BaseAIProvider`-ből származik
- Meglévő Anthropic SDK használata
- `messages.create()` hívások konvertálása

**Fájl:** `lib/ai/providers/openai.ts` (új)
- `OpenAIProvider` osztály
- OpenAI SDK használata
- `chat.completions.create()` hívások

**Fájl:** `lib/ai/providers/google.ts` (új)
- `GoogleProvider` osztály
- Google Generative AI SDK használata
- `generateContent()` hívások

**Fájl:** `lib/ai/providers/ollama.ts` (új)
- `OllamaProvider` osztály
- HTTP API hívások (fetch)
- `http://localhost:11434/api/generate` endpoint

### 3.3 Fázis 3: Factory és Client

**Fájl:** `lib/ai/client.ts` (átírás)
- `getAIProvider()` factory függvény
- Környezeti változó alapú provider választás
- `AI_PROVIDER` env var: `anthropic | openai | google | ollama`
- `AI_MODEL` env var: provider-specifikus modell név
- Backward compatibility: `getAnthropicClient()` wrapper

### 3.4 Fázis 4: API Route Módosítások

**Fájlok módosítása:**
1. `app/api/ai/campaign-brief/route.ts`
2. `app/api/ai/message-matrix/route.ts`
3. `app/api/ai/strategy-matrix/route.ts`
4. `app/api/ai/regenerate-strategy/route.ts`

**Változtatások:**
- `getAnthropicClient()` → `getAIProvider()`
- `client.messages.create()` → `provider.generateText()`
- Streaming: `client.messages.stream()` → `provider.generateStream()`
- Response parsing: egységes formátum

### 3.5 Fázis 5: CopilotKit Integráció

**Fájl:** `lib/ai/copilotkit/server.ts` (módosítás)
- Provider alapú adapter
- CopilotKit adapter-ek minden szolgáltatóhoz
- Fallback mechanism

---

## 4. Konfiguráció

### 4.1 Környezeti Változók

```env
# AI Provider választás (kötelező)
AI_PROVIDER=anthropic  # vagy: openai, google, ollama

# Provider-specifikus API kulcsok
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
# Ollama nem igényel API kulcsot (lokális)

# Modell választás (opcionális, provider-specifikus)
# Ha nincs megadva, alapértelmezett: gpt-5-mini-2025-08-07
AI_MODEL=claude-haiku-4-5  # Anthropic
# AI_MODEL=gpt-5-mini-2025-08-07  # OpenAI (alapértelmezett)
# AI_MODEL=gpt-4-turbo-preview  # OpenAI
# AI_MODEL=gemini-pro  # Google
# AI_MODEL=llama2  # Ollama

# Ollama konfiguráció (ha lokális)
OLLAMA_BASE_URL=http://localhost:11434
```

### 4.2 Provider-specifikus Modell Nevek

**Anthropic:**
- `claude-haiku-4-5` (alapértelmezett)
- `claude-3-5-sonnet-20241022`
- `claude-opus-20240229`

**OpenAI:**
- `gpt-5-mini-2025-08-07` (alapértelmezett)
- `gpt-4-turbo-preview`
- `gpt-4`
- `gpt-3.5-turbo`

**Google:**
- `gemini-pro`
- `gemini-pro-vision`

**Ollama:**
- `llama2`
- `mistral`
- `codellama`
- Bármilyen lokálisan telepített modell

---

## 5. API Változások

### 5.1 Új Client API

```typescript
// Egyszerű használat
import { getAIProvider } from '@/lib/ai/client'

const provider = getAIProvider()

const response = await provider.generateText({
  model: process.env.AI_MODEL || 'gpt-5-mini-2025-08-07',
  systemPrompt: 'You are a helpful assistant.',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  maxTokens: 1024
})

console.log(response.content)
```

### 5.2 Streaming API

```typescript
const stream = provider.generateStream({
  model: process.env.AI_MODEL || 'gpt-5-mini-2025-08-07',
  systemPrompt: '...',
  messages: [...]
})

for await (const chunk of stream) {
  if (!chunk.done) {
    process.stdout.write(chunk.content)
  }
}
```

### 5.3 Backward Compatibility

```typescript
// Régi API továbbra is működik
import { getAnthropicClient } from '@/lib/ai/client'

const client = getAnthropicClient()
// ... meglévő kód
```

---

## 6. Provider Implementáció Részletek

### 6.1 Anthropic Provider

**SDK:** `@anthropic-ai/sdk` (már telepítve)

**Implementáció:**
- `messages.create()` → `generateText()`
- `messages.stream()` → `generateStream()`
- Response formátum: `response.content[0].text`

### 6.2 OpenAI Provider

**SDK:** `openai` (új függőség)

**Implementáció:**
- `chat.completions.create()` → `generateText()`
- `chat.completions.create({ stream: true })` → `generateStream()`
- Response formátum: `response.choices[0].message.content`

**Különbségek:**
- `system` prompt külön paraméterként kerül átadásra (nem `messages` tömbben)
- `max_tokens` vs `maxTokens` (implementációban át kell alakítani)
- System prompt a `systemPrompt` mezőből jön, NEM a `messages` tömbből

### 6.3 Google Provider

**SDK:** `@google/generative-ai` (új függőség)

**Implementáció:**
- `model.generateContent()` → `generateText()`
- `model.generateContentStream()` → `generateStream()`
- Response formátum: `response.response.text()`

**Különbségek:**
- System prompt külön beállítás (nem `messages` tömbben)
- `systemPrompt` mezőből jön, NEM a `messages` tömbből
- Különböző API struktúra

### 6.4 Ollama Provider

**SDK:** Nincs (HTTP API)

**Implementáció:**
- `fetch('http://localhost:11434/api/generate')` → `generateText()`
- `fetch('http://localhost:11434/api/generate', { stream: true })` → `generateStream()`
- Response formátum: `response.response`

**Különbségek:**
- Lokális HTTP API
- Nincs API kulcs
- Különböző request/response formátum

---

## 7. Hiba Kezelés

### 7.1 Provider-specifikus Hibák

```typescript
class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: ProviderType,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

class APIKeyMissingError extends AIProviderError {
  constructor(provider: ProviderType) {
    super(`API key missing for ${provider}`, provider)
    this.name = 'APIKeyMissingError'
  }
}
```

### 7.2 Fallback Mechanizmus

- Ha egy provider nem elérhető, automatikus fallback
- Konfigurálható fallback sorrend
- Logging minden fallback esetén

---

## 8. Tesztelési Terv

### 8.1 Unit Tesztek

- Minden provider implementáció
- Factory függvény
- Error handling
- Response parsing

### 8.2 Integration Tesztek

- Minden API endpoint minden provider-rel
- Streaming funkcionalitás
- Error recovery

### 8.3 Manuális Tesztelés

- Anthropic (már működik)
- OpenAI (új)
- Google Gemini (új)
- Ollama lokális (új)

---

## 9. Függőségek

### 9.1 Új Package-ek

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.70.1",  // már van
    "openai": "^4.50.0",              // új - ellenőrizd a legfrissebb verziót npm-ben
    "@google/generative-ai": "^0.21.0" // új - ellenőrizd a legfrissebb verziót npm-ben
    // Ollama: nincs package, csak fetch
  }
}
```

**Megjegyzés:** Az SDK verziók ellenőrzése szükséges az npm registry-ben a telepítés előtt:
```bash
npm view openai versions --json
npm view @google/generative-ai versions --json
```

### 9.2 Dev Dependencies

Nincs új dev dependency szükséges.

---

## 10. Migrációs Útmutató

### 10.1 Lépésről Lépésre

1. **Függőségek telepítése**
   ```bash
   npm install openai @google/generative-ai
   ```

2. **Típusok és base provider létrehozása**
   - `lib/ai/types.ts`
   - `lib/ai/providers/base.ts`

3. **Provider implementációk**
   - Anthropic (legkönnyebb, már van SDK)
   - OpenAI
   - Google
   - Ollama

4. **Factory és client módosítás**
   - `lib/ai/client.ts` átírás
   - Backward compatibility

5. **API route módosítások**
   - Egy-egy route módosítása és tesztelése
   - Fokozatos migráció

6. **CopilotKit integráció**
   - Adapter módosítás
   - Tesztelés

### 10.2 Backward Compatibility

- `getAnthropicClient()` továbbra is elérhető
- Régi kód működik továbbra is
- Fokozatos migráció lehetséges

---

## 11. Kockázatok és Megoldások

### 11.1 Kockázatok

1. **API formátum különbségek**
   - Megoldás: Egységes interfész, adapter pattern

2. **Streaming különbségek**
   - Megoldás: Egységes stream formátum

3. **Hibaüzenetek különbségei**
   - Megoldás: Wrapper error osztályok

4. **Ollama elérhetőség**
   - Megoldás: Health check, fallback

### 11.2 Teljesítmény

- Ollama lokális lehet lassabb
- Provider választás alapján optimalizálás
- Caching lehetőségek

---

## 12. Dokumentáció Frissítések

### 12.1 README

- Környezeti változók dokumentálása
- Provider konfiguráció példák
- Troubleshooting útmutató

### 12.2 Tech Spec

- AI Provider architektúra
- Konfigurációs opciók
- API dokumentáció

---

## 13. Időbecslés

- **Fázis 1-2 (Base + Providers):** 2-3 óra
- **Fázis 3 (Factory):** 1 óra
- **Fázis 4 (API Routes):** 1-2 óra
- **Fázis 5 (CopilotKit):** 1 óra
- **Tesztelés:** 2-3 óra
- **Dokumentáció:** 1 óra

**Összesen:** 8-11 óra

---

## 14. Prioritások

### 14.1 MVP (Minimum Viable Product)

1. Anthropic (már van)
2. OpenAI (legnépszerűbb alternatíva)
3. Base provider és factory

### 14.2 Későbbi Bővítések

1. Google Gemini
2. Ollama lokális
3. További optimalizációk

---

## 15. Következő Lépések

1. ✅ Terv jóváhagyása
2. ⏳ Fázis 1-2 implementáció (Base + Providers)
3. ⏳ Fázis 3 implementáció (Factory)
4. ⏳ Fázis 4 implementáció (API Routes)
5. ⏳ Fázis 5 implementáció (CopilotKit)
6. ⏳ Tesztelés
7. ⏳ Dokumentáció frissítés

---

## 16. Megjegyzések

- **Ollama:** Lokális futtatás szükséges, nincs cloud
- **Költségek:** OpenAI és Google fizetős, Anthropic is, Ollama ingyenes
- **Teljesítmény:** Ollama lehet lassabb, de teljes kontroll
- **Privacyság:** Ollama teljesen lokális, nincs adat küldés

---

**Terv készítő:** AI Assistant  
**Utolsó frissítés:** 2025-11-24

