# Story 6.5: Slot & Draft UI Components

Status: drafted

## Story

As a **campaign manager**,
I want **enhanced UI for content slots and drafts**,
so that **I can manage slot planning and draft creation in a clear workflow**.

## Acceptance Criteria

1. **Given** I am on the sprint detail page
   **When** I view content slots
   **Then** Slot cards show:
   - Date, channel, content_type
   - Primary segment + topic (with labels)
   - Objective, funnel_stage (with badges)
   - Angle hint (truncated if long)
   - **Draft status badge** (no draft / has draft / approved / published)
   - Click to open slot detail page

2. **And** When I click on a slot
   **Then** Slot detail page opens (`/campaigns/[id]/sprints/[sprintId]/slots/[slotId]`)
   **And** Page shows two-column layout:
   - **Left side:** Slot metadata (all new fields)
   - **Right side:** Content Drafts section

3. **And** Slot detail page left side shows:
   - **Basic info:** Date, channel, content_type, time_of_day (if set)
   - **Strategic binding:** Primary segment (with profile), secondary segments (if any), primary topic (with narrative), secondary topics (if any), related goals (1-2), funnel_stage, objective
   - **Creative direction:** Angle type (badge), angle hint (full text), CTA type (badge), tone override (if set)
   - **Production info:** Asset requirements (tags), owner (if set), notes (if set)
   - **Actions:** Edit slot button, Delete slot button

4. **And** Slot detail page right side shows:
   - **Content Drafts section header**
   - "Tartalom generálása AI-jal" button (opens modal)
   - Draft list (variants with preview cards)
   - Each draft card shows:
     - Variant name or "Variáns 1", "Variáns 2", etc.
     - Preview: Hook + Body first 100 chars + CTA
     - Status badge (draft/approved/rejected/published)
     - Actions: Preview, Edit, Approve, Reject, Delete

5. **And** When I click "Tartalom generálása AI-jal"
   **Then** Modal opens with:
   - Variant count selection (1-3, default: 1)
   - Optional tone preference textarea
   - "Generálás" button
   - Cancel button
   **And** When I click "Generálás"
   **Then** AI generation starts with streaming progress
   **And** Generated drafts appear in draft list as they're created
   **And** Modal closes when all drafts generated

6. **And** When I click on a draft card
   **Then** Draft preview modal opens showing:
   - Full content: Hook + Body + CTA (formatted nicely)
   - Visual idea (full text)
   - Alt text suggestion (if present)
   - Length hint, tone notes (if present)
   - Actions: Approve, Reject, Edit, Generate New Variant, Delete

7. **And** When I click "Edit" on a draft
   **Then** Draft edit form opens (inline or modal) with:
   - Hook (textarea)
   - Body (large textarea)
   - CTA copy (textarea)
   - Visual idea (textarea)
   - Alt text suggestion (textarea, optional)
   - Length hint, tone notes (optional textareas)
   - Save and Cancel buttons

8. **And** Slot edit form (`/campaigns/[id]/sprints/[sprintId]/slots/[slotId]/edit`) includes:
   - **Basic info section:** Date, channel, content_type, time_of_day (dropdown: morning/midday/evening/unspecified)
   - **Strategic binding section:**
     - Primary segment (required, dropdown/search)
     - Secondary segments (optional, 0-2, multi-select)
     - Primary topic (required, dropdown/search)
     - Secondary topics (optional, 0-2, multi-select)
     - Related goals (required, 1-2, multi-select)
     - Funnel stage (required, dropdown)
     - Objective (required, dropdown)
   - **Creative direction section:**
     - Angle type (required, dropdown)
     - Angle hint (required, textarea, 1-2 sentences)
     - CTA type (required, dropdown)
     - Tone override (optional, textarea)
   - **Production info section:**
     - Asset requirements (optional, multi-select or tags input)
     - Owner (optional, text input)
     - Notes (optional, textarea)
   - Save and Cancel buttons

9. **And** All forms validate required fields
   **And** UI shows validation errors clearly (red borders, error messages)
   **And** Backward compatibility: existing slots without new fields still display correctly (show "Nincs megadva" for missing fields)

10. **And** Draft actions work:
    - **Approve:** Updates draft status to 'approved', shows success message
    - **Reject:** Updates draft status to 'rejected', shows success message
    - **Delete:** Confirms deletion, removes draft from list
    - **Generate New Variant:** Opens AI generation modal for this slot

## Tasks / Subtasks

- [ ] Task 1: Update slot card component (AC: 1)
  - [ ] Open `components/campaigns/ContentCalendar.tsx` or similar
  - [ ] Add draft status badge to slot cards
  - [ ] Show draft status: "Nincs draft" / "Van draft" / "Jóváhagyva" / "Publikálva"
  - [ ] Add click handler to open slot detail page
  - [ ] Update slot card to show new fields (primary segment/topic, objective, funnel_stage, angle hint)

- [ ] Task 2: Create slot detail page (AC: 2, 3, 4)
  - [ ] Create `app/campaigns/[id]/sprints/[sprintId]/slots/[slotId]/page.tsx`
  - [ ] Implement two-column layout (left: metadata, right: drafts)
  - [ ] Left side: Display all slot metadata (basic info, strategic binding, creative direction, production info)
  - [ ] Right side: Content Drafts section
  - [ ] Fetch slot data with relationships (segments, topics, goals)
  - [ ] Fetch drafts for slot (GET /api/content-slots/[slotId]/drafts)
  - [ ] Display draft list with preview cards
  - [ ] Add "Tartalom generálása AI-jal" button

- [ ] Task 3: Create AI draft generation modal (AC: 5)
  - [ ] Create `components/campaigns/DraftGenerationModal.tsx`
  - [ ] Modal with variant count selection (1-3, default: 1)
  - [ ] Optional tone preference textarea
  - [ ] "Generálás" and Cancel buttons
  - [ ] Call POST /api/ai/content-slots/[slotId]/drafts with streaming
  - [ ] Show streaming progress ("Generating draft 1 of 2...")
  - [ ] Add generated drafts to draft list as they're created
  - [ ] Close modal when all drafts generated

- [ ] Task 4: Create draft preview modal (AC: 6)
  - [ ] Create `components/campaigns/DraftPreviewModal.tsx`
  - [ ] Display full draft content (hook, body, CTA)
  - [ ] Display visual idea, alt text, length hint, tone notes
  - [ ] Add action buttons: Approve, Reject, Edit, Generate New Variant, Delete
  - [ ] Handle approve/reject (PUT /api/content-drafts/[draftId])
  - [ ] Handle delete (DELETE /api/content-drafts/[draftId])

- [ ] Task 5: Create draft edit form (AC: 7)
  - [ ] Create `components/campaigns/DraftEditForm.tsx`
  - [ ] Form fields: hook, body, cta_copy, visual_idea, alt_text_suggestion, length_hint, tone_notes
  - [ ] Validation: min lengths (hook: 10, body: 50, cta_copy: 5, visual_idea: 20)
  - [ ] Save button (PUT /api/content-drafts/[draftId])
  - [ ] Cancel button

- [ ] Task 6: Create slot edit form (AC: 8)
  - [ ] Create `app/campaigns/[id]/sprints/[sprintId]/slots/[slotId]/edit/page.tsx`
  - [ ] Or update existing slot form component
  - [ ] Add all new fields:
    - Basic info: time_of_day dropdown
    - Strategic binding: secondary segments/topics multi-select, related goals multi-select, funnel_stage dropdown, objective dropdown
    - Creative direction: angle_type dropdown, angle_hint textarea, cta_type dropdown, tone_override textarea
    - Production info: asset_requirements multi-select/tags, owner text input, notes textarea
  - [ ] Validate required fields
  - [ ] Save button (PUT /api/content-slots/[slotId])
  - [ ] Cancel button

- [ ] Task 7: Implement draft actions (AC: 10)
  - [ ] Approve action: PUT /api/content-drafts/[draftId] with status='approved'
  - [ ] Reject action: PUT /api/content-drafts/[draftId] with status='rejected'
  - [ ] Delete action: DELETE /api/content-drafts/[draftId] with confirmation
  - [ ] Generate New Variant: Open AI generation modal
  - [ ] Show success/error messages

- [ ] Task 8: Add validation and error handling (AC: 9)
  - [ ] Form validation for required fields
  - [ ] Show validation errors (red borders, error messages)
  - [ ] Handle API errors (404, 400, 500)
  - [ ] Show error messages to user
  - [ ] Backward compatibility: handle missing fields gracefully

- [ ] Task 9: Test UI components (AC: 1-10)
  - [ ] Test slot cards display correctly
  - [ ] Test slot detail page loads and displays data
  - [ ] Test AI draft generation modal
  - [ ] Test draft preview modal
  - [ ] Test draft edit form
  - [ ] Test slot edit form
  - [ ] Test draft actions (approve, reject, delete)
  - [ ] Test validation and error handling
  - [ ] Test backward compatibility (slots without new fields)

## Dev Notes

### Relevant Architecture Patterns

- **UI Components:** Follow existing component patterns from `components/campaigns/`
- **Form Handling:** Use React Hook Form or similar (if used in project)
- **API Calls:** Use fetch or existing API client
- **State Management:** Use React state or existing state management
- **Routing:** Use Next.js App Router

### Source Tree Components to Touch

**Pages:**
- `app/campaigns/[id]/sprints/[sprintId]/slots/[slotId]/page.tsx` - Slot detail page
- `app/campaigns/[id]/sprints/[sprintId]/slots/[slotId]/edit/page.tsx` - Slot edit page

**Components:**
- `components/campaigns/ContentCalendar.tsx` - Update slot cards
- `components/campaigns/DraftGenerationModal.tsx` - New component
- `components/campaigns/DraftPreviewModal.tsx` - New component
- `components/campaigns/DraftEditForm.tsx` - New component
- `components/campaigns/DraftCard.tsx` - New component (draft preview card)
- `components/campaigns/SlotDetailView.tsx` - New component (slot metadata display)

**API Integration:**
- Use existing API endpoints from Stories 6.2, 6.3, 6.4

### UI Component Details

**Slot Card:**
- Show date, channel, content_type
- Show primary segment + topic (with labels)
- Show objective, funnel_stage (with badges)
- Show angle hint (truncated)
- Show draft status badge
- Click to open slot detail page

**Slot Detail Page:**
- Two-column layout
- Left: All slot metadata (read-only or editable)
- Right: Draft list with actions
- Responsive design (mobile: stacked layout)

**Draft Generation Modal:**
- Variant count selection (1-3)
- Tone preference (optional)
- Streaming progress
- Auto-close when done

**Draft Preview Modal:**
- Full draft content display
- Formatted nicely (hook, body, CTA separated)
- Visual idea, alt text, length hint, tone notes
- Action buttons

**Draft Edit Form:**
- Inline or modal
- All draft fields editable
- Validation
- Save/Cancel

**Slot Edit Form:**
- All new fields
- Sections: Basic info, Strategic binding, Creative direction, Production info
- Validation
- Save/Cancel

### Testing Standards

- Test all UI components render correctly
- Test all user interactions (click, form submit, etc.)
- Test API integration (success and error cases)
- Test validation
- Test backward compatibility
- Test responsive design

### Project Structure Notes

- Follow existing component patterns
- Use existing UI library (Shadcn/ui if used)
- Use existing form handling patterns
- Use existing API client patterns

### References

- [Source: docs/sprint-artifacts/content-slot-draft-separation-plan.md#7-uiux-workflow] - UI/UX workflow specifications
- [Source: components/campaigns/ContentCalendar.tsx] - Reference slot card component
- [Source: components/campaigns/ExecutionPlanner.tsx] - Reference component patterns
- [Source: docs/epics.md#story-65] - Story 6.5 acceptance criteria

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

