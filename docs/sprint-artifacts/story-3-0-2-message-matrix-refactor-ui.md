# Story 3.0.2: Message Matrix Refactor (UI)

**Status:** done

**Status note:** Story drafted 2025-11-22 - UI refactor to display communication strategies instead of concrete messages

---

## User Story

As a **campaign manager**,
I want **to see communication strategies in the message matrix instead of concrete messages**,
So that **I can plan how to communicate each topic to each segment before generating specific content**.

---

## Acceptance Criteria

**AC #1:** Message Matrix displays strategies instead of messages
- **Given** I have a campaign with segments and topics
- **When** I view the message matrix page
- **Then** I see a table with segments as rows and topics as columns
- **And** the matrix fetches strategies from `/api/strategies?campaign_id=...` instead of messages
- **And** each cell displays either a strategy preview card or empty state

**AC #2:** Strategy preview cards display key information
- **Given** a cell has a strategy
- **When** I view the message matrix
- **Then** the cell shows a preview card with:
  - Positioning statement (first 1-2 sentences, truncated with ellipsis)
  - Core message (1 sentence, bold text)
  - Tone keywords (badges: "közvetlen", "őszinte", etc. from tone_profile.keywords)
  - Funnel stage badge ("awareness", "consideration", "conversion", "mobilization")
- **And** the preview card is clickable to open detail modal

**AC #3:** Empty state displays for cells without strategies
- **Given** a cell has no strategy
- **When** I view the message matrix
- **Then** the cell shows:
  - "Nincs stratégia" text
  - "Generate Strategy" button (triggers AI generation - Story 3.0.3)
  - "Create Strategy" button (opens manual form - Story 3.0.4)
- **And** clicking either button opens the appropriate workflow

**AC #4:** Detail modal displays full strategy information
- **Given** a cell has a strategy
- **When** I click the cell
- **Then** a detail modal opens showing:
  - Full strategy with all 4 categories (tabs or accordion):
    - "Stratégiai mag" (Strategy Core - 5 fields)
    - "Stílus/tónus" (Style & Tone - 4 fields)
    - "CTA/funnel" (CTA & Funnel - 4 fields)
    - "Extra" (Extra Fields - 3 fields, optional)
  - All 16 sub-fields visible and readable
  - "Edit Strategy" button (opens StrategyForm in edit mode - Story 3.0.4)
  - "Delete Strategy" button with confirmation
- **And** clicking "Edit Strategy" opens StrategyForm dialog pre-populated with strategy data
- **And** clicking "Delete Strategy" shows confirmation dialog, then deletes strategy

**AC #5:** Empty cell click opens create form
- **Given** a cell has no strategy
- **When** I click the empty cell
- **Then** a "Create Strategy" form opens (Story 3.0.4)
- **And** the form is pre-filled with campaign_id, segment_id, topic_id from cell context

**AC #6:** UI is responsive and accessible
- **Given** I view the message matrix
- **When** I access it on mobile, tablet, or desktop
- **Then** the layout adapts appropriately
- **And** all interactive elements are accessible via keyboard
- **And** loading states are displayed during data fetching
- **And** error states are displayed if data fetch fails

---

## Implementation Details

### Tasks / Subtasks

- [x] Refactor `components/messages/MessageMatrix.tsx` (AC: #1)
  - Replace message fetching with strategy fetching: `GET /api/strategies?campaign_id=...`
  - Update cell rendering logic to use StrategyCell component
  - Update state management to handle strategies instead of messages
  - Update TypeScript types to use strategy types

- [x] Create `components/messages/StrategyCell.tsx` component (AC: #1, #2, #3)
  - Props: `strategy?` (optional strategy data), `campaignId`, `segmentId`, `topicId`, `onClick`
  - Display StrategyPreviewCard if strategy exists
  - Display empty state if no strategy
  - Handle click events (open detail modal or create form)

- [x] Create `components/messages/StrategyPreviewCard.tsx` component (AC: #2)
  - Props: `strategy` (strategy data)
  - Display positioning statement (truncated to first 1-2 sentences, ellipsis)
  - Display core message (bold, 1 sentence)
  - Display tone keywords as badges (from strategy.style_tone.tone_profile.keywords)
  - Display funnel stage badge (from strategy.cta_funnel.funnel_stage)
  - Styling: card layout with hover effects

- [x] Create `components/messages/StrategyDetailModal.tsx` component (AC: #4)
  - Props: `strategy` (strategy data), `onEdit`, `onDelete`, `onClose`
  - Display strategy in 4 sections (tabs or accordion):
    - Strategy Core tab: positioning_statement, core_message, supporting_messages, proof_points, objections_reframes
    - Style & Tone tab: tone_profile, language_style, communication_guidelines, emotional_temperature
    - CTA & Funnel tab: funnel_stage, cta_objectives, cta_patterns, friction_reducers
    - Extra Fields tab: framing_type, key_phrases, risk_notes
  - "Edit Strategy" button (calls onEdit prop)
  - "Delete Strategy" button (shows confirmation, calls onDelete prop)
  - Close button or click outside to close
  - Styling: modal overlay, scrollable content area

- [x] Update `/app/campaigns/[id]/messages/page.tsx` (AC: #1)
  - Replace message fetching with strategy fetching
  - Update data fetching logic to use `/api/strategies?campaign_id=...`
  - Update component props to pass strategies instead of messages
  - Update error handling for strategy fetch failures

- [x] Implement empty state handling (AC: #3)
  - Empty state component: "Nincs stratégia" text
  - "Generate Strategy" button (triggers AI generation - Story 3.0.3 integration)
  - "Create Strategy" button (opens StrategyForm - Story 3.0.4 integration)
  - Styling: centered text, button layout

- [x] Implement responsive design (AC: #6)
  - Mobile layout: single column, stacked segments
  - Tablet layout: responsive grid
  - Desktop layout: full table layout
  - Test on multiple screen sizes (375px, 768px, 1920px)
  - Ensure touch targets are appropriate size on mobile

- [x] Implement loading and error states (AC: #6)
  - Loading state: skeleton loader or spinner during strategy fetch
  - Error state: error message with retry button if fetch fails
  - Empty state: show when no strategies exist for campaign
  - Network error handling: display user-friendly error messages

- [x] Integration with Story 3.0.3 (AI Generator) (AC: #3)
  - Connect "Generate Strategy" button to AI generation workflow
  - Show loading state during generation
  - Refresh matrix after successful generation

- [x] Integration with Story 3.0.4 (Strategy Form) (AC: #4, #5)
  - Connect "Create Strategy" button to StrategyForm dialog
  - Connect "Edit Strategy" button to StrategyForm dialog (edit mode)
  - Refresh matrix after save/update
  - Handle delete confirmation and refresh matrix

### Technical Summary

This story refactors the Message Matrix UI to display communication strategies instead of concrete messages. The matrix now shows strategy preview cards with key information (positioning, core message, tone, funnel stage) and provides detailed strategy views via modal. Empty states guide users to either generate strategies via AI or create them manually.

**Key technical decisions:**
- Strategy preview cards for quick scanning
- Detail modal for full strategy information (4 categories, 16 fields)
- Empty state with clear CTAs (Generate vs Create)
- Responsive design for mobile, tablet, desktop
- Integration with AI generator (Story 3.0.3) and strategy form (Story 3.0.4)

**Critical path:** This story depends on Story 3.0.1 (database schema). Story 3.0.4 (Strategy Form) can work in parallel, but requires this UI foundation.

### Project Structure Notes

- **Files to create:**
  - `components/messages/StrategyCell.tsx` - Cell component with preview or empty state
  - `components/messages/StrategyPreviewCard.tsx` - Preview card component
  - `components/messages/StrategyDetailModal.tsx` - Detail modal component

- **Files to modify:**
  - `components/messages/MessageMatrix.tsx` - Refactor to use strategies instead of messages
  - `app/campaigns/[id]/messages/page.tsx` - Update data fetching to use strategies API

- **Expected test locations:** Manual testing
  - Test strategy display in matrix
  - Test empty state display
  - Test detail modal opening and closing
  - Test responsive layouts (mobile, tablet, desktop)
  - Test loading and error states
  - Test integration with AI generator (Story 3.0.3)
  - Test integration with strategy form (Story 3.0.4)

- **Estimated effort:** 5 story points (3-4 days)

- **Prerequisites:** Story 3.0.1 (database schema must exist)

### Key Code References

**Existing code to reference:**
- `components/messages/MessageMatrix.tsx` - Current message matrix implementation (Epic 1)
- `components/messages/MatrixCell.tsx` - Current cell component (Epic 1)
- `components/ui/card.tsx` - Shadcn/ui card component for preview cards
- `components/ui/dialog.tsx` - Shadcn/ui dialog component for modal
- `components/ui/tabs.tsx` - Shadcn/ui tabs component for category sections
- `app/api/strategies/route.ts` - Strategies API endpoint (Story 3.0.4)

---

## Implementation Notes

**Implemented: 2025-11-22**

### Completed Integration Work

#### Story 3.0.3 Integration (AI Generator)
- [x] Connected "Generate Strategy" button via `handleBatchGenerate()` function
  - Implemented segment/topic selection checkboxes
  - Added batch generation UI panel with combination counter
  - Integrated with `/api/ai/strategy-matrix` endpoint
  - Loading state displays "Generálás folyamatban..." with spinner
- [x] Preview modal integration via `StrategyMatrixPreview` component
  - Displays all generated strategies in scrollable list
  - Approve/reject workflow with bulk actions
  - Saves approved strategies via `/api/strategies` endpoint
- [x] Matrix refresh after successful generation
  - Uses Next.js `router.refresh()` to reload strategies
  - Toast notifications for success/error feedback

#### Story 3.0.4 Integration (Strategy Form)
- [x] Connected "Create Strategy" button in `StrategyCell` empty state
  - Opens `StrategyForm` dialog with pre-filled campaign/segment/topic IDs
  - Handled via `handleCreateStrategy()` function
- [x] Connected "Edit Strategy" button in `StrategyDetailModal`
  - Opens `StrategyForm` dialog in edit mode with existing strategy data
  - Implemented in nested `StrategyForm` component within detail modal
- [x] Matrix refresh after save/update
  - Both create and edit flows call `router.refresh()` on save
  - Implemented via `handleCreateFormSave()` and modal `onRefresh` prop
- [x] Delete confirmation and refresh
  - Native browser `confirm()` dialog for delete confirmation
  - Refresh triggered after successful deletion
  - Implemented in both `StrategyDetailModal` and `StrategyForm`

### Key Components Involved
- `MessageMatrix.tsx` - Main matrix component with selection, generation, and integration logic
- `StrategyCell.tsx` - Cell component with empty state CTAs (Generate/Create)
- `StrategyDetailModal.tsx` - Detail view with Edit/Delete actions
- `StrategyForm.tsx` - CRUD form for manual strategy creation/editing
- `StrategyMatrixPreview.tsx` - Preview modal for AI-generated strategies

### Verification
- Verified batch AI generation with multiple segment × topic selections
- Verified preview modal approve/reject workflow
- Verified manual strategy creation from empty cells
- Verified strategy editing from detail modal
- Verified strategy deletion with confirmation
- Verified matrix refresh after all CRUD operations

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Epic 3.0: Message Matrix Refactor
- UI/UX approach for strategy display
- Preview card content specifications
- Detail modal structure requirements
- Responsive design requirements

**Epic Definition:** [epics.md](../epics.md) - Epic 3.0: Message Matrix Refactor - Communication Strategies
- Story 3.0.2 acceptance criteria and technical notes
- Dependencies and prerequisites
- Success criteria

