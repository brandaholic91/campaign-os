# Story 3.0.6: AI Provider Abstraction

**Status:** backlog

**Status note:** Story drafted 2025-11-24 - Multi-provider AI support (Anthropic, OpenAI, Google Gemini, Ollama) with unified interface

---

## User Story

As a **developer**,
I want **multiple AI provider support (Anthropic, OpenAI, Google Gemini, Ollama) with a unified abstraction layer**,
So that **I can switch between providers and models via environment variables without code changes, enabling cost optimization and vendor independence**.

---

## Acceptance Criteria

**AC #1:** Base provider abstraction layer created
- **Given** I have the existing Anthropic client implementation
- **When** I implement the provider abstraction
- **Then** `lib/ai/types.ts` defines:
  - `AIProvider` interface with `generateText()` and `generateStream()` methods
  - `GenerateTextOptions` type with `model`, `systemPrompt`, `messages`, `maxTokens?`, `temperature?`
  - `GenerateTextResponse` type with `content`, `model`, `usage?`
  - `StreamChunk` type with `content`, `done`
  - `ProviderType` enum: `'anthropic' | 'openai' | 'google' | 'ollama'`
- **And** `lib/ai/providers/base.ts` defines `BaseAIProvider` abstract class
- **And** base class includes common logic (JSON extraction, error handling, template method pattern)
- **And** `messages` array only contains `'user' | 'assistant'` roles (no `'system'` role)
- **And** `systemPrompt` is handled as separate parameter (not in `messages` array)

**AC #2:** Provider implementations created
- **Given** I have the base provider abstraction
- **When** I implement provider classes
- **Then** `lib/ai/providers/anthropic.ts` implements `AnthropicProvider` extending `BaseAIProvider`
- **And** `lib/ai/providers/openai.ts` implements `OpenAIProvider` extending `BaseAIProvider`
- **And** `lib/ai/providers/google.ts` implements `GoogleProvider` extending `BaseAIProvider`
- **And** `lib/ai/providers/ollama.ts` implements `OllamaProvider` extending `BaseAIProvider`
- **And** all providers convert `systemPrompt` to provider-specific format correctly
- **And** all providers handle streaming correctly
- **And** all providers return unified response format

**AC #3:** Factory and client updated
- **Given** I have provider implementations
- **When** I update the client factory
- **Then** `lib/ai/client.ts` exports `getAIProvider()` factory function
- **And** factory selects provider based on `AI_PROVIDER` environment variable
- **And** factory uses `AI_MODEL` environment variable for model selection
- **And** default provider is Anthropic (if `AI_PROVIDER` not set)
- **And** default model is `gpt-5-mini-2025-08-07` (if `AI_MODEL` not set)
- **And** backward compatibility: `getAnthropicClient()` still exists and works

**AC #4:** API routes migrated to use provider abstraction
- **Given** I have the factory and provider implementations
- **When** I migrate API routes
- **Then** `app/api/ai/campaign-brief/route.ts` uses `getAIProvider()` instead of `getAnthropicClient()`
- **And** `app/api/ai/message-matrix/route.ts` uses `getAIProvider()` instead of `getAnthropicClient()`
- **And** `app/api/ai/strategy-matrix/route.ts` uses `getAIProvider()` instead of `getAnthropicClient()`
- **And** `app/api/ai/regenerate-strategy/route.ts` uses `getAIProvider()` instead of `getAnthropicClient()`
- **And** all routes use `provider.generateText()` and `provider.generateStream()` methods
- **And** all routes maintain backward compatibility (same response format)

**AC #5:** CopilotKit integration updated
- **Given** I have provider abstraction
- **When** I update CopilotKit server
- **Then** `lib/ai/copilotkit/server.ts` uses provider abstraction
- **And** CopilotKit adapter works with all supported providers
- **And** provider adapter is selected based on `AI_PROVIDER` environment variable
- **And** AnthropicAdapter remains default for backward compatibility

**AC #6:** Error handling and validation
- **Given** I have provider implementations
- **When** errors occur
- **Then** provider-specific errors are wrapped in `AIProviderError` class
- **And** `APIKeyMissingError` is thrown when API key is missing for selected provider
- **And** error messages include provider type and original error details
- **And** API routes handle errors gracefully with user-friendly messages

**AC #7:** Environment configuration
- **Given** I deploy the application
- **When** I configure environment variables
- **Then** `AI_PROVIDER` can be set to: `anthropic`, `openai`, `google`, or `ollama`
- **And** `AI_MODEL` can be set to provider-specific model name
- **And** provider-specific API keys are required (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`)
- **And** Ollama configuration uses `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
- **And** missing API keys throw clear error messages

**AC #8:** Testing and validation
- **Given** I have all provider implementations
- **When** I test the system
- **Then** all API endpoints work with Anthropic provider (backward compatibility)
- **And** all API endpoints work with OpenAI provider (if configured)
- **And** all API endpoints work with Google provider (if configured)
- **And** all API endpoints work with Ollama provider (if configured and running)
- **And** provider switching via environment variable works without code changes
- **And** streaming works correctly for all providers

---

## Implementation Details

### Tasks / Subtasks

- [ ] Install required SDKs (AC: #2)
  - Install `openai@^4.50.0` for OpenAI provider
  - Install `@google/generative-ai@^0.21.0` for Google Gemini provider
  - Note: Ollama uses HTTP API (no package needed)
  - Verify versions: `npm view openai versions --json` and `npm view @google/generative-ai versions --json`

- [ ] Create base provider abstraction (AC: #1)
  - Create `lib/ai/types.ts` with all type definitions
    - `AIProvider` interface
    - `GenerateTextOptions` type (systemPrompt separate, messages only user/assistant)
    - `GenerateTextResponse` type
    - `StreamChunk` type
    - `ProviderType` enum
  - Create `lib/ai/providers/base.ts` with `BaseAIProvider` abstract class
    - Template method pattern
    - Common JSON extraction logic
    - Common error handling
    - Abstract methods: `_generateText()`, `_generateStream()`

- [ ] Implement Anthropic provider (AC: #2)
  - Create `lib/ai/providers/anthropic.ts`
  - Extend `BaseAIProvider`
  - Implement `_generateText()` using `client.messages.create()`
  - Implement `_generateStream()` using `client.messages.create({ stream: true })`
  - Convert `systemPrompt` to Anthropic `system` parameter
  - Parse Anthropic response format to unified format
  - Handle Anthropic streaming chunks

- [ ] Implement OpenAI provider (AC: #2)
  - Create `lib/ai/providers/openai.ts`
  - Extend `BaseAIProvider`
  - Implement `_generateText()` using `chat.completions.create()`
  - Implement `_generateStream()` using `chat.completions.create({ stream: true })`
  - Convert `systemPrompt` to OpenAI `system` parameter (separate from messages)
  - Parse OpenAI response format to unified format
  - Handle OpenAI streaming chunks
  - Map `maxTokens` to `max_tokens`, `temperature` to `temperature`

- [ ] Implement Google provider (AC: #2)
  - Create `lib/ai/providers/google.ts`
  - Extend `BaseAIProvider`
  - Implement `_generateText()` using `model.generateContent()`
  - Implement `_generateStream()` using `model.generateContentStream()`
  - Convert `systemPrompt` to Google system prompt format
  - Parse Google response format to unified format
  - Handle Google streaming chunks

- [ ] Implement Ollama provider (AC: #2)
  - Create `lib/ai/providers/ollama.ts`
  - Extend `BaseAIProvider`
  - Implement `_generateText()` using `fetch('http://localhost:11434/api/generate')`
  - Implement `_generateStream()` using `fetch()` with streaming
  - Convert `systemPrompt` to Ollama format
  - Parse Ollama response format to unified format
  - Handle Ollama streaming chunks
  - Add health check for Ollama availability

- [ ] Update factory and client (AC: #3)
  - Refactor `lib/ai/client.ts`
  - Create `getAIProvider()` factory function
  - Read `AI_PROVIDER` environment variable (default: `'anthropic'`)
  - Read `AI_MODEL` environment variable (default: `'gpt-5-mini-2025-08-07'`)
  - Instantiate correct provider based on `AI_PROVIDER`
  - Pass model and API keys to provider constructor
  - Keep `getAnthropicClient()` for backward compatibility (wrapper around factory)

- [ ] Migrate API routes (AC: #4)
  - Update `app/api/ai/campaign-brief/route.ts`
    - Replace `getAnthropicClient()` with `getAIProvider()`
    - Replace `client.messages.create()` with `provider.generateText()`
    - Replace streaming with `provider.generateStream()`
    - Update response parsing to unified format
  - Update `app/api/ai/message-matrix/route.ts`
    - Replace `getAnthropicClient()` with `getAIProvider()`
    - Replace `client.messages.create()` with `provider.generateText()`
    - Update response parsing
  - Update `app/api/ai/strategy-matrix/route.ts`
    - Replace `getAnthropicClient()` with `getAIProvider()`
    - Replace `client.messages.create()` with `provider.generateText()`
    - Update response parsing
  - Update `app/api/ai/regenerate-strategy/route.ts`
    - Replace `getAnthropicClient()` with `getAIProvider()`
    - Replace `client.messages.create()` with `provider.generateText()`
    - Update response parsing

- [ ] Update CopilotKit integration (AC: #5)
  - Update `lib/ai/copilotkit/server.ts`
  - Create provider-specific adapters or use provider abstraction
  - Update `AnthropicAdapter` initialization to use provider abstraction
  - Add fallback mechanism if provider doesn't support CopilotKit adapter
  - Maintain backward compatibility with existing CopilotKit functionality

- [ ] Update error handling (AC: #6)
  - Create `AIProviderError` class in `lib/ai/errors.ts`
  - Create `APIKeyMissingError` class extending `AIProviderError`
  - Wrap provider-specific errors in unified error classes
  - Update error messages to include provider type
  - Update API routes to handle new error types gracefully

- [ ] Add environment variable documentation (AC: #7)
  - Update `.env.example` with new variables
  - Document `AI_PROVIDER` options
  - Document `AI_MODEL` options for each provider
  - Document provider-specific API key requirements
  - Document Ollama configuration

- [ ] Testing (AC: #8)
  - Test with Anthropic provider (backward compatibility)
  - Test with OpenAI provider
  - Test with Google provider
  - Test with Ollama provider (if available)
  - Test provider switching via environment variable
  - Test streaming for all providers
  - Test error handling (missing API keys, invalid models)
  - Test CopilotKit integration with different providers

---

## Technical Notes

**File Structure:**
```
lib/ai/
├── client.ts                    # Factory function (refactored)
├── types.ts                     # Type definitions (new)
├── providers/
│   ├── base.ts                 # BaseAIProvider abstract class (new)
│   ├── anthropic.ts            # AnthropicProvider (new)
│   ├── openai.ts               # OpenAIProvider (new)
│   ├── google.ts               # GoogleProvider (new)
│   └── ollama.ts               # OllamaProvider (new)
├── schemas.ts                  # Zod schemas (existing)
├── errors.ts                   # Error classes (updated)
└── copilotkit/
    └── server.ts               # CopilotKit server (updated)
```

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

**Provider-specific Model Names:**
- **Anthropic:** `claude-haiku-4-5`, `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
- **OpenAI:** `gpt-5-mini-2025-08-07` (default), `gpt-4-turbo-preview`, `gpt-4`, `gpt-3.5-turbo`
- **Google:** `gemini-pro`, `gemini-pro-vision`
- **Ollama:** Any locally installed model (e.g., `llama2`, `mistral`, `codellama`)

**Backward Compatibility:**
- `getAnthropicClient()` function remains available
- Existing code using `getAnthropicClient()` continues to work
- All API endpoints maintain same response format
- CopilotKit integration maintains same behavior

**Implementation Order:**
1. Base abstraction (types, base provider)
2. Anthropic provider (easiest, already have SDK)
3. OpenAI provider
4. Factory and client update
5. API route migration (test with Anthropic)
6. Google provider
7. Ollama provider
8. CopilotKit integration
9. Testing all providers

**Estimated Effort:** 13 points (8-11 hours)

---

## Prerequisites

- Epic 2 complete (LLM infrastructure, existing Anthropic client)
- Story 2.1 (LLM + CopilotKit Infrastructure) complete
- Story 3.0.3 (Strategy AI Generator) complete (uses AI endpoints)

---

## Dependencies

**External:**
- OpenAI API access and API key (for OpenAI provider)
- Google Gemini API access and API key (for Google provider)
- Ollama local installation (for Ollama provider)

**Internal:**
- Existing `lib/ai/client.ts` (to be refactored)
- Existing API routes using `getAnthropicClient()`
- Existing CopilotKit server configuration

