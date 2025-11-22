# Story 3.0.4: Strategy Form + CRUD

**Status:** done

**Status note:** Implementation completed 2025-11-22 - Full CRUD operations with form components and integrations

---

## User Story

As a **campaign manager**,
I want **to create and edit communication strategies manually**,
So that **I can fine-tune AI-generated strategies or create custom strategies without AI**.

---

## Acceptance Criteria

**AC #1:** Strategy form displays 4 main sections
- **Given** I open the strategy form
- **When** I view the form
- **Then** I see 4 main sections (accordion or tabs):
  - "Stratégiai mag" (Strategy Core - 5 fields)
  - "Stílus/tónus" (Style & Tone - 4 fields)
  - "CTA/funnel" (CTA & Funnel - 4 fields)
  - "Extra" (Extra Fields - 3 fields, optional)
- **And** all 16 sub-fields are accessible and editable

**AC #2:** Form handles multi-input fields correctly
- **Given** I am filling the strategy form
- **When** I work with array fields
- **Then** I can add/remove rows for:
  - supporting_messages (min 3, max 5 rows)
  - proof_points (min 2, max 3 rows)
  - objections_reframes (optional, no limit)
  - tone_profile.keywords (min 3, max 5 rows)
  - cta_objectives (no limit)
  - cta_patterns (min 2, max 3 rows)
  - friction_reducers (optional, no limit)
  - key_phrases (optional, no limit)
- **And** communication_guidelines displays as two-column Do/Don't lists with add/remove rows

**AC #3:** Form validation works for all fields
- **Given** I fill the strategy form
- **When** I submit the form
- **Then** all required fields are validated against Zod schemas
- **And** field-level error messages are displayed for invalid fields
- **And** submit button is disabled until all required fields are valid
- **And** validation errors are shown inline near each field

**AC #4:** Preview summary auto-generates and is editable
- **Given** I fill the Strategy Core section
- **When** I complete positioning_statement and core_message
- **Then** preview_summary auto-generates from strategy_core
- **And** I can manually edit the preview_summary in a textarea
- **And** character count is displayed
- **And** preview_summary is saved with the strategy

**AC #5:** Strategy CRUD operations work correctly
- **Given** I have a strategy form
- **When** I save a new strategy
- **Then** POST `/api/strategies` is called with strategy data
- **And** strategy is saved to database with validation
- **And** UNIQUE constraint is enforced (one strategy per segment × topic)
- **And** success notification is displayed
- **When** I edit an existing strategy
- **Then** PUT `/api/strategies/[id]` is called with updated data
- **And** updated_at timestamp is updated
- **And** success notification is displayed
- **When** I delete a strategy
- **Then** DELETE `/api/strategies/[id]` is called
- **And** strategy is removed from database
- **And** success notification is displayed

**AC #6:** Strategy form integrates with Message Matrix
- **Given** I am on the message matrix page
- **When** I click an empty cell
- **Then** StrategyForm opens in create mode
- **And** form is pre-filled with campaign_id, segment_id, topic_id from cell context
- **When** I click "Edit Strategy" on an existing strategy
- **Then** StrategyForm opens in edit mode
- **And** form is pre-populated with existing strategy data
- **And** on save, message matrix refreshes to show updated strategy

**AC #7:** Strategy form integrates with Strategy Detail Modal
- **Given** I am viewing a strategy in detail modal
- **When** I click "Edit Strategy" button
- **Then** StrategyForm opens in a dialog (edit mode)
- **And** form is pre-populated with existing strategy data
- **When** I save changes
- **Then** strategy is updated via PUT `/api/strategies/[id]`
- **And** detail modal refreshes to show updated strategy

**AC #8:** Error handling works for all scenarios
- **Given** I am using the strategy form
- **When** network error occurs
- **Then** toast notification shows error message
- **When** validation error occurs
- **Then** inline field errors are displayed
- **When** UNIQUE constraint violation occurs (strategy already exists)
- **Then** error message: "Strategy already exists for this segment × topic combination"
- **And** I can choose to update existing strategy or cancel

---

## Implementation Details

### Tasks / Subtasks

- [x] Create `/api/strategies` endpoints (AC: #5)
  - GET `/api/strategies?campaign_id=...` - list all strategies for a campaign
    - Returns array of strategies with segment and topic details (JOIN queries)
    - Include segment.name, topic.name in response
  - POST `/api/strategies` - create new strategy
    - Request body: { campaign_id, segment_id, topic_id, strategy_core, style_tone, cta_funnel, extra_fields?, preview_summary? }
    - Validate against MessageStrategySchema before saving
    - Handle UNIQUE constraint violation (return error if strategy already exists)
    - Return created strategy with ID
  - GET `/api/strategies/[id]` - get single strategy by ID
    - Include segment and topic details in response (JOIN queries)
    - Return 404 if strategy not found
  - PUT `/api/strategies/[id]` - update existing strategy
    - Request body: { strategy_core, style_tone, cta_funnel, extra_fields?, preview_summary? }
    - Validate against MessageStrategySchema
    - Update updated_at timestamp automatically (via database trigger)
    - Return updated strategy
  - DELETE `/api/strategies/[id]` - delete strategy
    - Cascade handled by database (no additional logic needed)
    - Return 204 No Content on success
    - Return 404 if strategy not found

- [x] Create `components/messages/StrategyForm.tsx` main form component (AC: #1, #2, #3, #4)
  - Props: `campaignId`, `segmentId`, `topicId`, `initialData?` (for edit mode), `onSave`, `onCancel`
  - 4 main sections (accordion or tabs): "Stratégiai mag", "Stílus/tónus", "CTA/funnel", "Extra"
  - Multi-input fields with add/remove buttons:
    - supporting_messages (min 3, max 5) - array of text inputs
    - proof_points (min 2, max 3) - array of text inputs
    - objections_reframes (optional) - array of text inputs
    - tone_profile.keywords (min 3, max 5) - array of text inputs
    - cta_objectives - array of text inputs
    - cta_patterns (min 2, max 3) - array of text inputs
    - friction_reducers (optional) - array of text inputs
    - key_phrases (optional) - array of text inputs
  - Communication guidelines: two-column layout (Do / Don't lists) with add/remove rows
  - Form validation using Zod schemas:
    - Validate each section independently
    - Show field-level error messages
    - Disable submit until all required fields valid
  - Preview summary editor:
    - Auto-generate from strategy_core on change (or button "Generate Summary")
    - Editable textarea
    - Character count display
  - Form actions: "Save Strategy" (primary), "Cancel" (secondary), "Delete" (danger, edit mode only)
  - Loading states: submit button spinner, disable form during save
  - Success/error notifications: toast notifications

- [x] Create `components/messages/StrategyFormSections/StrategyCoreSection.tsx` (AC: #1)
  - Fields:
    - positioning_statement (textarea, min 10 chars)
    - core_message (textarea, min 5 chars)
    - supporting_messages (dynamic array, min 3, max 5)
    - proof_points (dynamic array, min 2, max 3)
    - objections_reframes (optional dynamic array)
  - Validation: use StrategyCoreSchema
  - Error messages: inline field errors

- [x] Create `components/messages/StrategyFormSections/StyleToneSection.tsx` (AC: #1, #2)
  - Fields:
    - tone_profile.description (textarea)
    - tone_profile.keywords (dynamic array, min 3, max 5)
    - language_style (textarea)
    - communication_guidelines (two-column Do/Don't lists with add/remove rows)
    - emotional_temperature (select dropdown)
  - Validation: use StyleToneSchema
  - Error messages: inline field errors

- [x] Create `components/messages/StrategyFormSections/CTAFunnelSection.tsx` (AC: #1, #2)
  - Fields:
    - funnel_stage (select: awareness/consideration/conversion/mobilization)
    - cta_objectives (dynamic array)
    - cta_patterns (dynamic array, min 2, max 3)
    - friction_reducers (optional dynamic array)
  - Validation: use CTAFunnelSchema
  - Error messages: inline field errors

- [x] Create `components/messages/StrategyFormSections/ExtraFieldsSection.tsx` (AC: #1)
  - Fields:
    - framing_type (select, optional)
    - key_phrases (optional dynamic array)
    - risk_notes (optional textarea)
  - Validation: use ExtraFieldsSchema
  - All fields optional

- [x] Implement preview summary auto-generation (AC: #4)
  - Extract from strategy_core:
    - positioning_statement (first 1-2 sentences)
    - core_message (1 sentence)
  - Extract from style_tone:
    - tone_profile.keywords (comma-separated)
  - Extract from cta_funnel:
    - funnel_stage
  - Format: "Positioning: [statement]. Core: [message]. Tone: [keywords]. Stage: [funnel_stage]"
  - Auto-generate on Strategy Core section change
  - Editable textarea with character count

- [x] Integration with MessageMatrix (AC: #6)
  - Empty cell click → opens StrategyForm dialog in create mode
  - Form pre-filled with campaign_id, segment_id, topic_id from cell context
  - On save: create strategy via POST `/api/strategies`, refresh matrix
  - On cancel: close dialog

- [x] Integration with StrategyDetailModal (AC: #7)
  - Modal has "Edit Strategy" button
  - Button opens StrategyForm dialog in edit mode
  - Form pre-populated with existing strategy data
  - On save: update strategy via PUT `/api/strategies/[id]`, refresh modal view
  - On cancel: close dialog without changes

- [x] Implement error handling (AC: #8)
  - Network errors: show toast notification with retry option
  - Validation errors: show inline field errors
  - UNIQUE constraint violation: show error "Strategy already exists for this segment × topic combination"
  - Provide option to update existing strategy or cancel
  - Loading states: disable form during API calls

### Technical Summary

This story implements manual strategy creation and editing with full CRUD operations. The strategy form provides a comprehensive interface for all 16 sub-fields organized into 4 main categories. Users can create strategies from scratch, edit AI-generated strategies, and fine-tune their communication approach. The form integrates seamlessly with the message matrix and detail modal.

**Key technical decisions:**
- 4-section form layout (accordion or tabs) for organization
- Dynamic array fields with add/remove buttons for multi-input fields
- Two-column Do/Don't lists for communication guidelines
- Auto-generated preview summary with manual edit capability
- Zod schema validation for type safety and runtime validation
- Full CRUD API endpoints with proper error handling
- Integration with MessageMatrix and StrategyDetailModal

**Critical path:** This story depends on Story 3.0.1 (database schema) and Story 3.0.2 (UI components). Can work in parallel with Story 3.0.3 (AI Generator).

### Project Structure Notes

- **Files to create:**
  - `app/api/strategies/route.ts` - GET (list), POST (create) endpoints
  - `app/api/strategies/[id]/route.ts` - GET (single), PUT (update), DELETE endpoints
  - `components/messages/StrategyForm.tsx` - Main form component
  - `components/messages/StrategyFormSections/StrategyCoreSection.tsx` - Strategy Core section
  - `components/messages/StrategyFormSections/StyleToneSection.tsx` - Style & Tone section
  - `components/messages/StrategyFormSections/CTAFunnelSection.tsx` - CTA & Funnel section
  - `components/messages/StrategyFormSections/ExtraFieldsSection.tsx` - Extra Fields section

- **Files to modify:**
  - `components/messages/MessageMatrix.tsx` - Add StrategyForm integration (create mode)
  - `components/messages/StrategyDetailModal.tsx` - Add StrategyForm integration (edit mode)

- **Expected test locations:** Manual testing
  - Test strategy creation with all fields
  - Test strategy editing (update existing)
  - Test strategy deletion
  - Test form validation (required fields, min/max arrays)
  - Test preview summary auto-generation and editing
  - Test UNIQUE constraint handling
  - Test integration with MessageMatrix
  - Test integration with StrategyDetailModal
  - Test error handling scenarios

- **Estimated effort:** 5 story points (3-4 days)

- **Prerequisites:** Story 3.0.1 (database schema), Story 3.0.2 (UI components)

### Key Code References

**Existing code to reference:**
- `components/campaigns/CampaignForm.tsx` - Form component patterns (Epic 1)
- `components/segments/SegmentManager.tsx` - CRUD operations patterns (Epic 1)
- `app/api/campaigns/route.ts` - API endpoint patterns (Epic 1)
- `components/ui/form.tsx` - Shadcn/ui form components
- `components/ui/input.tsx` - Shadcn/ui input components
- `components/ui/textarea.tsx` - Shadcn/ui textarea components
- `components/ui/select.tsx` - Shadcn/ui select components
- `components/ui/button.tsx` - Shadcn/ui button components
- `lib/ai/schemas.ts` - MessageStrategySchema for validation (Story 3.0.1)

---

## Implementation Notes

**Implemented: 2025-11-22**

### Completed Tasks

#### API Endpoints (AC #5)
- [x] Created `/api/strategies/route.ts` with GET (list) and POST (create)
  - GET endpoint with campaign_id query parameter
  - POST endpoint with Zod schema validation
  - UNIQUE constraint enforcement (segment_id + topic_id)
  - Proper error handling and status codes
- [x] Created `/api/strategies/[id]/route.ts` with GET, PUT, DELETE
  - GET single strategy with JOIN queries for segment/topic names
  - PUT with schema validation and updated_at timestamp
  - DELETE with proper error handling

#### Form Components (AC #1, #2, #3, #4)
- [x] Created `StrategyForm.tsx` main form component
  - Tabs-based layout for 4 main sections
  - React Hook Form with Zod resolver
  - Create mode and edit mode support
  - Auto-generate preview summary functionality
  - Loading states and error handling
- [x] Created section components:
  - `StrategyCoreSection.tsx` - Strategy Core fields (5 fields)
  - `StyleToneSection.tsx` - Style & Tone fields (4 fields)
  - `CTAFunnelSection.tsx` - CTA & Funnel fields (4 fields)
  - `ExtraFieldsSection.tsx` - Extra fields (3 optional fields)
- [x] Dynamic array fields with add/remove:
  - Supporting messages, proof points, objections & reframes
  - Tone keywords, CTA objectives, CTA patterns, friction reducers
  - Communication guidelines (Do/Don't two-column layout)
  - Key phrases

#### Integration (AC #6, #7)
- [x] MessageMatrix integration
  - Empty cell click opens StrategyForm in create mode
  - Pre-filled campaign/segment/topic IDs
  - Matrix refresh after save via `router.refresh()`
- [x] StrategyDetailModal integration
  - "Edit Strategy" button opens StrategyForm in edit mode
  - Nested form component within modal
  - Pre-populated with existing strategy data
  - Modal refresh after save

#### Error Handling (AC #8)
- [x] Network error handling with toast notifications
- [x] Zod validation errors displayed inline
- [x] UNIQUE constraint violation handling (409 status)
- [x] Loading states during API calls

### Key Features
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ 16 sub-fields across 4 main categories
- ✅ Auto-generated preview summary (editable)
- ✅ Two-column Do/Don't communication guidelines
- ✅ Dynamic array fields with min/max constraints
- ✅ Seamless integration with MessageMatrix and StrategyDetailModal
- ✅ Comprehensive error handling and validation

### Verification
- Verified strategy creation from empty cell
- Verified strategy editing from detail modal
- Verified strategy deletion with confirmation
- Verified form validation (required fields, array constraints)
- Verified preview summary auto-generation
- Verified UNIQUE constraint handling
- Verified matrix/modal refresh after CRUD operations

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Epic 3.0: Message Matrix Refactor
- Strategy form requirements (4 sections, 16 fields)
- API endpoint specifications
- Integration points with MessageMatrix and StrategyDetailModal

**Epic Definition:** [epics.md](../epics.md) - Epic 3.0: Message Matrix Refactor - Communication Strategies
- Story 3.0.4 acceptance criteria and technical notes
- Dependencies and prerequisites
- Success criteria

