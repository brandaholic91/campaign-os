# Epic 2 Planning Discussion - Party Mode

**Date:** 2025-11-21
**Participants:** Mary (Analyst), Winston (Architect), Bob (SM), John (PM), Amelia (Dev), Murat (TEA), Sally (UX)

## Context

Epic 1 (Sprint 1 MVP) sikeresen befejezve - manual war room tool működik.
Epic 2 célja: AI/LLM képességek bevezetése a kampánytervezés felgyorsításához.

---

## Agent Vélemények

### Mary (Analyst) 📊

**Kulcs megfigyelések:**

Az Epic 1 retro-ból kiemeltem 3 kritikus mintát:
1. **JSONB mezők kezelése** - Demographics/psychographics validáció hiányzott, de javítottuk. Az AI-nak is ezt kell kezelnie strukturált outputokkal.
2. **Manual testing gap** - Story 1.2-ben hiányzott dokumentáció. Az AI feature-ökhöz **kritikus** lesz a tesztelés, mert hallucináció rizikó van.
3. **Type safety** - `as any` problémák voltak. Az AI JSON outputoknál **Zod schema validáció kötelező**.

**Epic 2 requirements elemzés:**

Tech spec szerint Sprint 2-3 tervezett:
- Campaign Brief → Structure (goals, segments, topics, narratives)
- Message Matrix Generator
- Sprint Planner AI

ChatGPT dokumentum szerint a **Campaign Orchestrator** deep agent koncepció van, de MVP-ben **fél-deep** agent elég:
- Brief Normalizer → Strategy Designer → Message & Channel Planner
- Nem kell LangGraph, egyszerű orchestráló endpoint elég

**Kritikus kérdések:**
1. **Mi a success criteria az AI minőségére?** - Hogyan mérjük, hogy "jó" kampányt generál?
2. **User approval workflow** - Minden AI output előzetes jóváhagyásos?
3. **Fallback strategy** - Ha AI fail, lehet manuálisan folytatni?

**Ajánlás:** 
- Epic 2 fókuszáljon a **Brief → Structure** + **Message Generator**-re
- Sprint Planner AI-t halasszuk Epic 3-ra (kevésbé kritikus)
- **Zod schema validation** minden AI output-hoz kötelező
- **Preview + Approve workflow** minden AI feature-ben

---

### Winston (Architect) 🏗️

**Technikai architektúra megközelítés:**

Mary-vel egyetértek a fél-deep agent megközelítésben. **Boring technology** - ne LangChain, hanem egyszerű Next.js API routes orchestráció.

**Javasolt architektúra:**

```
lib/ai/
├── client.ts          # Anthropic client singleton
├── schemas.ts         # Zod schemas for LLM outputs
├── prompts/           # Prompt templates
│   ├── brief-normalizer.ts
│   ├── strategy-designer.ts
│   └── message-generator.ts
└── orchestrator.ts    # Simple sequential LLM calls
```

**API endpoint pattern:**
```
/api/ai/campaign-brief
  → POST { brief, campaign_type, goal_type, dates }
  → Returns: { goals, segments, topics, narratives }
  → With preview/approval workflow
```

**Kritikus technikai döntések:**

1. **Error handling** - LLM API hívások unreliable. Try-catch + retry logic + graceful degradation
2. **Rate limiting** - Anthropic API quota. Client-side rate limiting vagy queue
3. **Token costs** - Egy full campaign generation ~10-20k tokens. Caching stratégia?
4. **Type safety** - Zod schemas a `lib/ai/schemas.ts`-ben, runtime validation
5. **Database transactions** - AI több DB insert-et csinál. Atomic operations?

**Dependency injection pattern:**
- AI client dependency injection a teszthez (mock)
- Environment-based config (dev vs prod API keys)

**Ajánlás:**
- Story 2.1: LLM infrastructure **első** (foundation)
- Story 2.2: Campaign Brief AI (high value, establishes pattern)
- Story 2.3: Message Generator (builds on 2.2 context)
- **Sprint Planner AI Epic 3** - kisebb prioritás, komplexebb

---

### Bob (Scrum Master) 🏃

**Story breakdown és dependencies:**

Winston architektúrájával egyetértek. **Crisp, actionable stories** kell.

**Story 2.1: LLM + CopilotKit Infrastructure** (Foundation)
- **Must have first** - minden AI feature erre épül
- AC: API client, error handling, rate limiting, Zod validation, CopilotKit server endpoint
- **5 points** - 3-5 nap (frissítve: eredetileg 3 points volt, de CopilotKit protokoll integration miatt 5 points)

**Story 2.2: Campaign Brief AI**
- **High value** - user pain point: manual data entry
- Depends on 2.1
- AC: Brief input → AI structure → preview → approve → DB save
- **5 points** - 3-5 nap, mert prompt engineering + UI workflow

**Story 2.3: Message Matrix Generator**
- **High value** - message matrix manuális kitöltése fárasztó
- Depends on 2.1, benefits from 2.2 context
- AC: Select segments/topics → AI messages → preview → selective save
- **5 points** - 3-5 nap, batch generation + approval UI

**Nem Epic 2-ben:**
- Sprint Planner AI → Epic 3 (kevésbé kritikus)
- Deep Campaign Orchestrator → jövőbeli
- Content Calendar AI → Epic 3+

**Velocity consideration:**
- Epic 1: 13 points, 3 stories, mind done
- Epic 2: 20 points, 4 stories (frissítve: 13 → 20 points az CopilotKit integration miatt, Story 2.4 hozzáadva) - **realisztikus** ha foundation first

**Critical path:**
2.1 → 2.2 → 2.3 (sequential dependency chain)

---

### Amelia (Developer) 💻

**Implementation concerns:**

**AC ID mapping:**
- Story 2.1: `lib/ai/client.ts` create, error handling, Zod schemas
- Story 2.2: `/api/ai/campaign-brief` POST, `/app/campaigns/new/ai` page
- Story 2.3: `/api/ai/message-matrix` POST, MessageMatrix component extension

**Existing code reuse:**
- `lib/supabase/client.ts` pattern → `lib/ai/client.ts` similar
- Existing campaign/segment/topic API routes → AI calls these
- MessageMatrix component → extend with AI button

**Technical debt from Epic 1:**
- JSONB validation pattern → **apply to AI outputs**
- Manual testing doc missing → **AI features need thorough testing**

**Implementation order:**
1. Install `@anthropic-ai/sdk` + `zod`
2. `lib/ai/client.ts` + `schemas.ts`
3. `/api/ai/campaign-brief` endpoint
4. UI components for AI workflows
5. Error handling + loading states

**Critical:** AI outputs **must** map to existing DB schema. No new fields without migration.

---

### Murat (TEA) 🧪

**Testing strategy:**

**Risk assessment:**
- **HIGH RISK:** AI hallucination → wrong campaign data
- **MEDIUM RISK:** API failures → user experience degradation  
- **LOW RISK:** Rate limiting → edge case

**Test coverage needed:**

**Story 2.1:**
- Unit: AI client error handling, Zod schema validation
- Integration: Mock Anthropic API responses
- Manual: Real API calls with test campaigns

**Story 2.2:**
- Unit: Prompt templates, JSON parsing
- Integration: `/api/ai/campaign-brief` with mocked LLM
- E2E: Full flow brief → preview → approve → DB
- **Edge cases:** Invalid brief, API timeout, malformed JSON

**Story 2.3:**
- Unit: Message generation logic
- Integration: Batch message generation
- E2E: Select segments → generate → preview → selective save
- **Edge cases:** Empty segments, API failure mid-batch

**Manual testing checklist:**
- [ ] AI generates valid JSON per schema
- [ ] Preview shows all fields correctly
- [ ] Approve/reject workflow works
- [ ] Error messages user-friendly
- [ ] Rate limiting prevents API abuse
- [ ] Fallback to manual entry works

**Test data:** Epic 1 campaign-ok használhatóak AI testing-hez.

---

### Sally (UX Designer) 🎨

**User experience considerations:**

**User journey - AI Campaign Creation:**

1. **Entry point:** "Create with AI" button on campaigns page
2. **Brief input:** Large textarea + campaign_type/goal_type selectors
3. **AI processing:** Loading state with progress (Brief → Structure → Done)
4. **Preview:** Accordion/card layout showing goals, segments, topics, narratives
5. **Approval:** Checkboxes per item, "Save Selected" CTA
6. **Success:** Redirect to campaign detail with saved items

**Message Matrix AI:**
- **Trigger:** "Generate Messages" button on MessageMatrix page
- **Selection:** Multi-select segments + topics before generate
- **Preview:** Modal with table of generated messages, approve/reject per row
- **Feedback:** "X messages generated, Y approved" success state

**Error states:**
- API failure → "AI temporarily unavailable, create manually"
- Empty results → "Try adjusting your brief or campaign type"
- Rate limit → "Please wait a moment before generating again"

**Accessibility:**
- Loading states with ARIA labels
- Keyboard navigation for approve/reject
- Error messages screen-reader friendly

**Progressive enhancement:** Manual entry always available if AI fails.

---

### John (PM) 📋

**Product strategy summary:**

**WHY Epic 2 matters:**
Epic 1 manual tool működik, de **time-consuming**. AI integration **10x speedup** kampány setup-ban.

**Epic 2 scope validation:**

✅ **In scope (correct):**
- Campaign Brief → Structure (highest value, biggest pain point)
- Message Matrix Generator (high frequency use case)
- Foundation (LLM integration) - must have

❌ **Out of scope (correct):**
- Sprint Planner AI (Epic 3, lower priority)
- Deep Orchestrator (future, complex)
- Content Calendar (Epic 3+)

**Success metrics:**
1. User can create campaign structure in <5 min vs 30+ min manual
2. AI generates >80% acceptable quality (user approval rate)
3. Zero data corruption from AI hallucinations (Zod validation)
4. Error rate <5% (API failures handled gracefully)

**MVP approach:**
- Start with **preview + approve** workflow (not auto-save)
- User maintains control, AI accelerates
- Iterate on prompts based on user feedback

**Epic 2 ready for implementation.** Foundation-first approach, clear dependencies, realistic scope.

---

## CopilotKit Integration Discussion - Updated Planning

**New Information from Balazs:**
- CopilotKit protokoll beépítése a frontendbe
- "Kampánysegéd" koncepció: frontendbe épített AI assistant
- Real-time streaming chat, bi-directional state sync
- Frontend tool integration, human-in-the-loop workflow
- Kettős szerep: "Kampány varázsló" (full agent) + "Segéd" (manuális létrehozás közben)

---

### Updated Agent Opinions

#### Winston (Architect) 🏗️

**CopilotKit architektúra értékelés:**

CopilotKit **perfect fit** a use case-hez. Event-alapú protokoll, ami standardizálja a UI-agent kommunikációt.

**Javasolt architektúra frissítés:**

```
Frontend (Next.js/React):
├── CopilotKit Client (CopilotKit vagy custom)
│   ├── Real-time event stream handling
│   ├── State sync (campaign form state)
│   └── Frontend tool execution
│
Backend (Next.js API):
├── CopilotKit Server endpoint
│   ├── Event stream handler
│   ├── Campaign Orchestrator Agent
│   │   ├── Brief Normalizer
│   │   ├── Strategy Designer
│   │   └── Message Generator
│   └── Tool execution (DB operations)
```

**Kritikus döntések:**

1. **CopilotKit kliens választás:**
   - CopilotKit CopilotKit integráció (React-ready, kész komponensek)
   - Vagy custom CopilotKit kliens implementáció
   - **Ajánlás:** CopilotKit MVP-hez, custom ha specifikus igények

2. **State management:**
   - Campaign form state sync CopilotKit-n keresztül
   - Agent látja: current_step, form fields, campaign_type, goal_type
   - Agent módosíthat: field prefill, navigation, suggestions

3. **Frontend toolok definíciója:**
   - `highlightField(field_id)` - mező kiemelése
   - `prefillField(field_id, value)` - mező előtöltése
   - `navigateToStep(step_id)` - wizard navigáció
   - `openSuggestionModal(type, payload)` - javaslat modal

4. **Backend agent toolok:**
   - DB toolok: createCampaign, updateCampaign, createSegment, etc.
   - LLM toolok: generateMessageMatrix, generateContentCalendar
   - CopilotKit event stream output

**Epic 2 scope frissítés:**
- **Story 2.1:** LLM + CopilotKit infrastructure (kritikus!)
- **Story 2.2:** Campaign Brief AI (CopilotKit-n keresztül)
- **Story 2.3:** Message Generator (CopilotKit-n keresztül)
- **Story 2.4 (új):** CopilotKit Frontend Integration (kampánysegéd UI)

**Ajánlás:** CopilotKit foundation Story 2.1-ben, frontend integration Story 2.4-ben.

---

#### Mary (Analyst) 📊

**CopilotKit use case elemzés:**

Kettős workflow támogatás:
1. **Manuális kampány + AI segéd:** User wizard-ban, agent real-time segít
2. **Full agent mód:** Brief → komplett kampány generálás

**Requirements frissítés:**

**Story 2.1 új AC-k:**
- CopilotKit server endpoint implementálva
- Event stream handling (input/output)
- State sync mechanism

**Story 2.4 (új story):**
- Frontend CopilotKit kliens integráció
- Kampánysegéd UI komponens (chat/sidekick panel)
- Frontend tool execution
- Real-time streaming chat display
- Inline suggestions UI

**Success criteria frissítés:**
- User látja real-time, mit csinál az agent
- Agent látja a form state-et
- Frontend toolok (prefill, highlight) működnek
- Bi-directional sync stabil

---

#### Bob (Scrum Master) 🏃

**Story breakdown frissítés:**

**Story 2.1: LLM + CopilotKit Infrastructure** (3 → 5 points)
- **Frissített scope:** LLM client + CopilotKit server endpoint
- CopilotKit event stream handling
- State sync mechanism
- **5 points** - komplexebb, mert CopilotKit protokoll is kell

**Story 2.2: Campaign Brief AI** (5 points, változatlan)
- Most CopilotKit-n keresztül működik
- Event stream output
- State patch events

**Story 2.3: Message Generator** (5 points, változatlan)
- CopilotKit event stream
- Frontend tool integration

**Story 2.4: CopilotKit Frontend Integration** (új, 5 points)
- CopilotKit vagy custom CopilotKit kliens
- Kampánysegéd UI komponens
- Frontend tool execution
- Real-time chat display
- State sync UI

**Total: 20 points** (13 → 20, mert CopilotKit integration)

**Alternative:** CopilotKit frontend → Epic 3, ha túl nagy scope.

---

#### Amelia (Developer) 💻

**Implementation concerns:**

**New dependencies:**
- `@copilotkit/react-core` vagy custom CopilotKit kliens
- WebSocket vagy Server-Sent Events CopilotKit stream-hez
- State management (Zustand/Recoil) CopilotKit state sync-hez

**File structure:**
```
lib/ai/
├── client.ts (Anthropic)
├── copilotkit/
│   ├── server.ts (CopilotKit server handler)
│   ├── events.ts (event types)
│   └── tools.ts (backend tools)
├── schemas.ts (Zod)
└── orchestrator.ts

components/
└── ai/
    ├── CampaignAssistant.tsx (CopilotKit kliens wrapper)
    ├── AssistantChat.tsx (chat UI)
    └── InlineSuggestions.tsx (field suggestions)
```

**AC mapping:**
- Story 2.1: `lib/ai/copilotkit/server.ts` (CopilotRuntime configuration), `app/api/copilotkit/route.ts` (endpoint)
- Story 2.4: `components/ai/CampaignAssistant.tsx`, CopilotKit kliens setup

---

#### Sally (UX Designer) 🎨

**UX considerations - CopilotKit integration:**

**Kampánysegéd UI design:**

1. **Entry points:**
   - Floating chat button (bottom-right)
   - Inline suggestions (mezők mellett)
   - "Ask Assistant" gombok wizard lépéseknél

2. **Chat interface:**
   - Collapsible side panel
   - Real-time message streaming
   - Typing indicators
   - Tool execution feedback

3. **Inline suggestions:**
   - Mezők fölött/mellett "AI suggests: ..." badge
   - "Accept" / "Reject" gombok
   - Smooth animations

4. **State sync feedback:**
   - Mezők highlightolása, amikor agent módosít
   - Navigation automatikus, ha agent "next step" tool-t hív
   - Loading states tool execution-nél

**Progressive enhancement:** CopilotKit nélkül is működik (fallback manual flow).

---

#### Murat (TEA) 🧪

**Testing strategy - CopilotKit:**

**New test scenarios:**

**Story 2.1:**
- CopilotKit event stream parsing
- State sync correctness
- Tool execution error handling
- WebSocket/SSE connection stability

**Story 2.4:**
- Frontend tool execution
- Real-time chat rendering
- State sync UI updates
- Connection recovery

**E2E tests:**
- Full flow: user input → CopilotKit event → agent response → UI update
- Tool execution: agent calls prefillField → form updates
- State sync: agent sees form changes → adapts response

---

#### John (PM) 📋

**Product strategy - CopilotKit integration:**

**WHY CopilotKit matters:**
- **10x better UX** - real-time, contextual assistance
- **Flexible workflows** - manuális + full agent egy protokollon
- **Future-proof** - más frontend-ek is ráakaszthatók

**Scope decision:**

**Option A: Epic 2 with CopilotKit** (20 points)
- Story 2.1: LLM + CopilotKit infrastructure
- Story 2.2: Brief AI (CopilotKit)
- Story 2.3: Message Generator (CopilotKit)
- Story 2.4: Frontend integration
- **Timeline:** 3-4 weeks

**Option B: CopilotKit → Epic 3** (13 points Epic 2)
- Epic 2: Traditional REST API AI endpoints
- Epic 3: CopilotKit upgrade + frontend integration
- **Timeline:** 2-3 weeks Epic 2

**Recommendation:** **Option A** - CopilotKit foundation most, mert:
1. Később refactor nehezebb
2. Real-time UX jelentős érték
3. 20 points még realisztikus 1 epic-ben

**Success metrics:**
- User engagement: >70% uses AI assistant
- Time saved: <3 min campaign setup (vs 30+ min manual)
- Tool execution success rate: >95%

---

## Updated Consensus

**Epic 2 Definition (Updated):**
- **Goal:** AI-powered campaign orchestration with CopilotKit frontend integration
- **Stories:** 4 (LLM+CopilotKit Foundation, Brief AI, Message Generator, Frontend Integration)
- **Points:** 20 (increased from 13 due to CopilotKit complexity)
- **Timeline:** 3-4 weeks
- **Dependencies:** Epic 1 complete ✅

**Key Decisions (Updated):**
1. ✅ CopilotKit protokoll foundation Story 2.1-ben
2. ✅ CopilotKit vagy custom CopilotKit kliens
3. ✅ Kampánysegéd UI komponens (Story 2.4)
4. ✅ Bi-directional state sync
5. ✅ Frontend tool integration
6. ✅ Real-time streaming chat
7. ✅ Zod schema validation mandatory
8. ✅ Preview + approve workflow (not auto-save)
9. ✅ Sprint Planner AI → Epic 3

**Architecture:**
- CopilotKit event stream: UI ↔ Agent backend
- Campaign Orchestrator agent CopilotKit-n keresztül
- Frontend tools: prefill, highlight, navigate
- Backend tools: DB operations, LLM calls

**Next Steps:**
1. ✅ Update `epics.md` with CopilotKit integration
2. ✅ Add Story 2.4 to epic definition
3. Create story files for 2.1, 2.2, 2.3, 2.4
4. Begin Story 2.1 implementation (LLM + CopilotKit foundation)

---

## CopilotKit Architecture Details

### Protocol Overview

**CopilotKit (Agent-UI Protocol)** standardizálja a frontend és backend agent közötti kommunikációt:

- **Event-based:** JSON event stream (chat messages, tool calls, state patches)
- **Bi-directional:** UI → Agent (user input, UI events) és Agent → UI (responses, suggestions)
- **Real-time:** WebSocket vagy Server-Sent Events streaming
- **State sync:** Agent látja és módosíthatja a UI state-et
- **Tool integration:** Agent hívhat frontend toolokat (prefill, highlight, navigate)

### Architecture Components

#### Frontend (Next.js/React)

```
components/ai/
├── CampaignAssistant.tsx      # Main CopilotKit wrapper, connects to stream
├── AssistantChat.tsx          # Streaming chat UI component
├── InlineSuggestions.tsx      # Field-level AI suggestions
└── AssistantButton.tsx        # Floating chat button

lib/copilotkit/
├── client.ts                  # CopilotKit client implementation
├── events.ts                  # Event type definitions
└── tools.ts                  # Frontend tool implementations
```

**Frontend Tools (Agent can call):**
- `highlightField(field_id)` - Visual highlight of form field
- `prefillField(field_id, value)` - Auto-fill form field with suggestion
- `navigateToStep(step_id)` - Navigate wizard to specific step
- `openSuggestionModal(type, payload)` - Show suggestion modal
- `updateFormState(patch)` - Update form state directly

#### Backend (Next.js API)

```
lib/ai/
├── client.ts                  # Anthropic Claude client
├── copilotkit/
│   ├── server.ts             # CopilotKit server event handler
│   ├── events.ts             # CopilotKit event types
│   ├── tools.ts              # Backend tool definitions
│   └── orchestrator.ts       # Campaign Orchestrator agent
├── schemas.ts                # Zod validation schemas
└── prompts/                  # LLM prompt templates
    ├── brief-normalizer.ts
    ├── strategy-designer.ts
    └── message-generator.ts

app/api/
├── copilotkit/route.ts       # CopilotKit endpoint (HTTP handler, imports getCopilotRuntime from lib/ai/copilotkit/server)
├── ai/
│   ├── campaign-brief/route.ts   # Traditional REST (fallback)
│   └── message-matrix/route.ts   # Traditional REST (fallback)
```

**Backend Tools (Agent can execute):**
- `createCampaign(data)` - DB: Create campaign
- `updateCampaign(id, data)` - DB: Update campaign
- `createSegment(campaign_id, data)` - DB: Create segment
- `createTopic(campaign_id, data)` - DB: Create topic
- `generateMessageMatrix(context)` - LLM: Generate messages
- `generateContentCalendar(context)` - LLM: Generate calendar (future)

### Use Case Flows

#### Flow 1: Manuális Kampány + AI Segéd

1. User starts campaign creation wizard
2. Frontend sends CopilotKit event: `{ type: "ui_state", payload: { step: 1, campaign_type: "brand_awareness" } }`
3. Agent receives state, analyzes context
4. Agent sends CopilotKit event: `{ type: "message", content: "Milyen célcsoportra fókuszálsz?" }`
5. User answers in chat or fills form
6. Agent suggests: `{ type: "tool_call", tool: "prefillField", args: { field: "segments", value: [...] } }`
7. Frontend executes tool, updates UI
8. User accepts/rejects suggestion
9. Repeat until campaign complete

#### Flow 2: Full Agent Mode (Brief → Campaign)

1. User clicks "Create with AI" button
2. User provides brief text
3. Frontend sends CopilotKit event: `{ type: "user_message", content: brief }`
4. Agent triggers Campaign Orchestrator:
   - Brief Normalizer → normalized brief
   - Strategy Designer → goals, segments, topics, narratives
   - Message Generator → message matrix
5. Agent sends CopilotKit events: state patches for each generated item
6. Frontend displays preview, user approves/rejects
7. Agent calls backend tools to save approved items
8. Campaign created, user redirected to campaign detail

### Integration Options

**Option A: CopilotKit (Recommended for MVP)**
- Pre-built React components
- CopilotKit protocol support
- Easy integration
- `@copilotkit/react-core` package

**Option B: Custom CopilotKit Client**
- Full control
- Lighter weight
- More implementation work
- Custom WebSocket/SSE handling

**Recommendation:** Start with CopilotKit MVP, evaluate custom if needed.

### State Sync Model

**Campaign Form State (CopilotKit visible):**
```typescript
{
  current_step: number,
  campaign_type: string,
  goal_type: string,
  start_date: string,
  end_date: string,
  form_fields: {
    name: string,
    description: string,
    // ... other fields
  },
  existing_segments: Array<Segment>,
  existing_topics: Array<Topic>,
  existing_messages: Array<Message>
}
```

Agent can read this state and send state patches to update it.

### Success Metrics

- **User engagement:** >70% of users interact with kampánysegéd
- **Time saved:** <3 min campaign setup (vs 30+ min manual)
- **Tool execution success:** >95% frontend tool calls succeed
- **State sync accuracy:** 100% - agent always sees current form state
- **Real-time latency:** <500ms event stream delay

