# Story 2.1: LLM + CopilotKit Infrastructure

**Status:** in-progress

**Status note (2025-11-21):** CopilotKit endpoint és alapvető infrastructure implementálva, de CopilotKit provider működésének validálása szükséges Story 2.2 CopilotKit event streaming és state sync integrációjához. Status `review`-ról `in-progress`-re frissítve, mert Story 2.2 deferred tasks Story 2.1 infrastructure hiányára hivatkoznak.

---

## User Story

As a **developer**,
I want **Anthropic Claude API integration with CopilotKit protocol support, error handling, and rate limiting**,
So that **AI features can be reliably implemented with real-time frontend communication on top of a solid foundation**.

---

## Acceptance Criteria

**AC #1:** Anthropic Claude API client initialized and configured
- **Given** I have an Anthropic API key
- **When** I configure the LLM client in `lib/ai/client.ts`
- **Then** the API client is initialized with proper authentication
- **And** environment variable `ANTHROPIC_API_KEY` is properly secured
- **And** the client can make API calls to Anthropic Claude

**AC #2:** CopilotKit runtime endpoint handles event streams
- **Given** the CopilotKit infrastructure is set up
- **When** I implement `/api/copilotkit` endpoint with `CopilotRuntime`
- **Then** the endpoint handles CopilotKit event streams (input/output)
- **And** CopilotKit streaming works with `AnthropicAdapter` as serviceAdapter
- **And** `CopilotRuntime` is configured with `AnthropicAdapter` and actions
- **And** `copilotRuntimeNextJSAppRouterEndpoint` handles Next.js App Router requests
- **And** the server can receive user messages and send agent responses via CopilotKit

**AC #3:** Error handling for LLM API calls
- **Given** LLM API calls are made
- **When** network failures, rate limits, or API errors occur
- **Then** errors are caught and handled gracefully
- **And** user-friendly error messages are returned
- **And** retry logic is implemented for transient failures
- **And** error logging is implemented for debugging

**AC #4:** Rate limiting prevents API quota exhaustion
- **Given** LLM API calls are made
- **When** multiple requests are sent
- **Then** rate limiting is implemented (token bucket or request queue)
- **And** API quota is not exhausted
- **And** users receive appropriate feedback when rate limited

**AC #5:** LLM responses validated against JSON schemas
- **Given** LLM generates structured output
- **When** responses are received from Anthropic API
- **Then** responses are validated against Zod schemas in `lib/ai/schemas.ts`
- **And** invalid responses are rejected with clear error messages
- **And** type-safe interfaces are generated from schemas

**AC #6:** CopilotKit state sync mechanism allows agent to read campaign form state
- **Given** CopilotKit infrastructure is set up
- **When** the agent needs to access form state
- **Then** `useCopilotReadable` hooks are implemented in form components
- **And** agent can read current campaign form state via CopilotKit context (campaign_type, goal_type, fields)
- **And** state is exposed with proper descriptions for agent context
- **And** agent responses are contextually relevant based on exposed state
- **Note:** For write operations, use backend actions instead of direct state patches

**AC #7:** Environment variables properly secured
- **Given** sensitive API keys are used
- **When** environment variables are configured
- **Then** `ANTHROPIC_API_KEY` is in `.env.local` (not committed)
- **And** environment variables are validated on startup
- **And** proper error messages if keys are missing

---

## Implementation Details

### Tasks / Subtasks

- [x] Install Anthropic SDK and CopilotKit dependencies (AC: #1)
  - Install `@anthropic-ai/sdk@^0.20.0` for Anthropic Claude API
  - Install `zod@3.22.4` for schema validation
  - Install CopilotKit runtime: `@copilotkit/runtime` (for backend/self-hosting)
  - Install CopilotKit frontend: `@copilotkit/react-core@^1.0.0` and `@copilotkit/react-ui@^1.0.0`
  - Note: Self-hosting requires `@copilotkit/runtime`, frontend requires `@copilotkit/react-core` and `@copilotkit/react-ui`

- [x] Create Anthropic client in `lib/ai/client.ts` (AC: #1, #7)
  - Initialize Anthropic client with API key from environment
  - Create singleton pattern for client instance
  - Add client configuration (model, temperature, max_tokens)
  - Implement environment variable validation
  - Add error handling for missing API key

- [x] Create CopilotKit runtime configuration (AC: #2)
  - Create `lib/ai/copilotkit/server.ts` for CopilotRuntime configuration
  - Import `CopilotRuntime` and `AnthropicAdapter` from `@copilotkit/runtime`
  - Import `Anthropic` from `@anthropic-ai/sdk` or use `getAnthropicClient()` from `lib/ai/client.ts`
  - Initialize Anthropic client with API key
  - Create `AnthropicAdapter` instance with Anthropic client
  - Create `CopilotRuntime` instance with actions generator function
  - Configure runtime with actions generator function (Parameter[] format, not JSON Schema)
  - Set up middleware (onBeforeRequest, etc.)
  - Export `getCopilotRuntime()` function for reusability
  - Export `serviceAdapter` for use in endpoint
  - Note: Separating CopilotRuntime configuration enables reusability, testability, and future extensibility
  - Note: serviceAdapter is passed to copilotRuntimeNextJSAppRouterEndpoint, not to CopilotRuntime constructor

- [x] Create `/api/copilotkit` endpoint (AC: #2)
  - Create `app/api/copilotkit/route.ts` for Next.js App Router
  - Import `getCopilotRuntime` and `serviceAdapter` from `@/lib/ai/copilotkit/server`
  - Import `copilotRuntimeNextJSAppRouterEndpoint` from `@copilotkit/runtime`
  - Get CopilotRuntime instance: `const runtime = getCopilotRuntime()`
  - Implement POST handler using `copilotRuntimeNextJSAppRouterEndpoint({ runtime, serviceAdapter, endpoint: '/api/copilotkit' })`
  - Add rate limiting and error handling in POST handler
  - Handle NextRequest and return streaming response
  - Implement GET handler for method validation
  - Note: Vercel timeout limits may require `vercel.json` config: `{"functions": {"api/copilotkit/**/*": {"maxDuration": 60}}}`
  - Note: Endpoint focuses on HTTP handling, CopilotRuntime logic is in server.ts

- [x] Implement Zod schemas in `lib/ai/schemas.ts` (AC: #5)
  - Define schemas for LLM outputs (goals, segments, topics, messages)
  - Create type-safe interfaces from schemas
  - Add validation helpers
  - Document expected LLM output formats

- [x] Implement error handling utilities (AC: #3)
  - Create `lib/ai/errors.ts` for error types
  - Implement retry logic with exponential backoff
  - Add error logging
  - Create user-friendly error messages
  - Handle specific error types (rate limit, network, API errors)

- [x] Implement rate limiting (AC: #4)
  - Create `lib/ai/rate-limit.ts` utility
  - Implement token bucket or request queue
  - Add rate limit headers/messages
  - Configure limits based on API quota
  - Add rate limit status to responses

- [x] Implement CopilotKit state sync mechanism (AC: #6)
  - Use `useCopilotReadable` hook from `@copilotkit/react-core`
  - Define campaign form state model for CopilotKit context
  - Implement `useCopilotReadable` in form components to expose state to agent
  - Use `useCopilotWritable` for bi-directional state updates (if needed)
  - Add description and value to `useCopilotReadable` calls
  - Implement state validation and type safety
  - Note: State is exposed via `useCopilotReadable` hook, agent can read it as context

- [x] Add environment variable configuration (AC: #7)
  - Update `.env.local.example` with `ANTHROPIC_API_KEY`
  - Add environment variable validation on app startup
  - Add error handling for missing keys
  - Document required environment variables

- [x] Create CopilotKit backend actions (AC: #2, #6)
  - Define backend actions in `CopilotRuntime` constructor `actions` parameter
  - Actions is a generator function: `actions: ({properties, url}) => [...]`
  - Each action has: `name`, `description`, `parameters`, `handler`
  - Implement handler functions for backend operations (e.g., database operations)
  - Use `properties` and `url` parameters to conditionally expose actions
  - Document available actions for agents
  - Note: Actions are defined in runtime constructor, not separate file

### Technical Summary

This story establishes the AI and CopilotKit foundation for Epic 2. We're integrating Anthropic Claude API for LLM capabilities and implementing CopilotKit for real-time frontend-agent communication. The infrastructure includes proper error handling, rate limiting, and JSON schema validation to ensure reliable AI features. CopilotKit state sync enables bi-directional communication between the frontend and AI agent.

**Key technical decisions:**
- Anthropic Claude API for LLM (reliable, structured outputs)
- CopilotKit for standardized frontend-agent communication
- CopilotKit backend with Anthropic provider integration
- Zod schema validation for type-safe LLM outputs
- CopilotKit streaming for real-time communication
- Token bucket rate limiting to prevent API quota exhaustion
- CopilotKit state management for bi-directional state sync

**Critical path:** This story is the foundation for all Epic 2 AI features. Stories 2.2, 2.3, and 2.4 depend on this infrastructure.

### Project Structure Notes

- **Files to create:**
  - `lib/ai/client.ts` - Anthropic client
  - `lib/ai/schemas.ts` - Zod schemas for LLM outputs
  - `lib/ai/copilotkit/server.ts` - CopilotKit runtime configuration (CopilotRuntime, AnthropicAdapter, actions, middleware)
  - `app/api/copilotkit/route.ts` - CopilotKit endpoint (HTTP handler, rate limiting, error handling)
  - `lib/ai/errors.ts` - Error handling utilities
  - `lib/ai/rate-limit.ts` - Rate limiting
  - Note: `lib/ai/copilotkit/server.ts` exports `getCopilotRuntime()` for reusability and testability
  - Note: `app/api/copilotkit/route.ts` imports and uses the CopilotRuntime from server.ts
  - Note: State management uses `useCopilotReadable` hooks in React components (frontend)

- **Files to update:**
  - `.env.local` - Add `ANTHROPIC_API_KEY`
  - `package.json` - Add new dependencies: `@copilotkit/runtime`, `@copilotkit/react-core`, `@copilotkit/react-ui`, `@anthropic-ai/sdk`, `zod`
  - `.env.local.example` - Document new environment variables
  - `vercel.json` (optional) - Configure timeout for `/api/copilotkit` endpoint if deploying to Vercel

- **Expected test locations:** Manual testing (no automated tests in Epic 2 MVP)
  - Test Anthropic API connection via CopilotKit
  - Test CopilotKit event streaming at `/api/copilotkit` endpoint
  - Test `useCopilotReadable` state exposure in React components
  - Test backend actions execution
  - Test error handling scenarios (API failures, rate limits)
  - Test rate limiting behavior
  - Test AnthropicAdapter configuration
  - Verify CopilotRuntime with actions generator works correctly

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Epic 1 complete (all stories done)

### Key Code References

**Existing code to reference:**
- `lib/supabase/client.ts` - Client initialization pattern (singleton pattern)
- `app/api/*/route.ts` - API route patterns for Next.js App Router
- Epic 1 database schema for state sync model and backend actions

**Example CopilotKit structure:**
```typescript
// lib/ai/copilotkit/server.ts
import { CopilotRuntime, AnthropicAdapter } from '@copilotkit/runtime';
import { getAnthropicClient } from '@/lib/ai/client';

const anthropic = getAnthropicClient();
const serviceAdapter = new AnthropicAdapter({ anthropic, model: 'claude-haiku-4-5' });

export function getCopilotRuntime() {
  return new CopilotRuntime({
    serviceAdapter,
    actions: ({ properties, url }) => createCopilotActions(properties, url),
    middleware: { /* ... */ }
  });
}

// app/api/copilotkit/route.ts
import { getCopilotRuntime } from '@/lib/ai/copilotkit/server';
import { copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime';
import { NextRequest, NextResponse } from 'next/server';

const runtime = getCopilotRuntime();
const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter: runtime.serviceAdapter,
  endpoint: '/api/copilotkit',
});

export async function POST(req: NextRequest) {
  // Rate limiting, error handling
  return handleRequest(req);
}
```
  serviceAdapter,
  actions: ({properties, url}) => [
    // Define backend actions here
  ]
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });
  return handleRequest(req);
};
```

**Reference documentation:**
- Anthropic SDK docs: `@anthropic-ai/sdk` API client, streaming, error handling
- CopilotKit self-hosting guide: `/api/copilotkit` endpoint setup with `@copilotkit/runtime`
- CopilotKit AnthropicAdapter: `AnthropicAdapter` from `@copilotkit/runtime`
- CopilotKit backend actions: `CopilotRuntime` actions generator function
- CopilotKit state management: `useCopilotReadable` and `useCopilotWritable` from `@copilotkit/react-core`
- CopilotKit Next.js App Router: `copilotRuntimeNextJSAppRouterEndpoint` function
- Zod documentation: schema validation, type inference
- Official docs: https://docs.copilotkit.ai

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Contains:
- Epic 2 AI/CopilotKit requirements
- Anthropic Claude API integration details
- CopilotKit protocol implementation approach
- Environment variable configuration
- Dependencies and versions

**Epic Definition:** [epics.md](../epics.md) - Epic 2: AI-Powered Campaign Orchestration
- Story 2.1 acceptance criteria and technical notes
- Dependencies and prerequisites
- Success criteria

**Epic Planning:** [epic-2-draft.md](../epic-2-draft.md) - Party mode planning discussion
- CopilotKit integration architecture decisions
- Winston's technical architecture recommendations
- Mary's requirements analysis
- Bob's story breakdown and dependencies

---

## Dev Agent Record

### Agent Model Used

Anthropic Claude (`@anthropic-ai/sdk` + Claude-3.5 parameters) routed through `@copilotkit/runtime` for AG‑UI streaming inside `/api/copilotkit/route.ts`.

### Debug Log References

1. Added Anthropic + CopilotKit + Zod dependencies and installed them so runtime imports resolve.
2. Built `lib/ai/client.ts`, `schemas.ts`, `errors.ts`, and `rate-limit.ts` to cover authentication, validation, retries, logging, and throttling.
3. Authored CopilotKit runtime endpoint with actions, rate limiting, and error sanitization; validated schema before returning contextual summaries.
4. Hooked `CampaignForm` to `useCopilotReadable` via `lib/ai/copilot-state.ts` so AG‑UI can read the campaign form state.

### Completion Notes

- Implemented the story’s ACs: Anthropic client, Zod validation, Copilot runtime + actions, rate limiting, Copilot-readable state, and documented env enforcement.
- Manual validation plan: run local dev server, POST to `/api/copilotkit`, confirm rate limiting and error handling logging, check form state appears in Copilot inspector.
- `npm run lint` currently fails with `Invalid project directory provided, no such directory: /root/campaign-os/lint`; Next.js appears to misinterpret the `lint` command directory. Investigate Next.js lint configuration if that remains blocking.

