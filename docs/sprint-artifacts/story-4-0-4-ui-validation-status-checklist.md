# Story 4.0.4: UI Validation Status & Checklist

**Status:** approved

**Status note:** Story drafted 2025-11-23 - Validation indicators, "Ready for Execution" checklist UI

---

## User Story

As a **campaign manager**,
I want **to see validation status indicators and a "Ready for Execution" checklist in the UI**,
So that **I can easily identify what needs to be completed before sprint planning**.

---

## Acceptance Criteria

**AC #1:** Validation status indicators in structure preview
- **Given** I am viewing a campaign structure
- **When** I look at the structure preview
- **Then** I see validation status indicators (✓/⚠/✗) for each element:
  - Goals: shows status for `funnel_stage` and `kpi_hint`
  - Segments: shows status for required fields from Epic 3.0.5
  - Topics: shows status for `related_goal_stages` and `recommended_content_types`
  - Narratives: shows status for `primary_goal_ids`, `primary_topic_ids`, `suggested_phase`
  - Matrix: shows warnings for rule violations
- **And** status icons are color-coded (green/yellow/red)
- **And** tooltip on hover shows specific missing fields

**AC #2:** Execution Readiness Checklist component
- **Given** I am viewing a campaign structure
- **When** I look at the checklist section
- **Then** I see a "Ready for Execution" checklist component showing:
  - Overall status (Ready / Not Ready) with badge or banner
  - Progress bar or percentage (e.g., "8/10 criteria met")
  - Detailed list of missing fields per element
  - Matrix rule violations with clear explanations
- **And** checklist updates in real-time as I edit the structure
- **And** checklist is expandable/collapsible by category

**AC #3:** Validation status icon component
- **Given** I need to display validation status
- **When** I use the ValidationStatusIcon component
- **Then** component accepts `status: 'complete' | 'partial' | 'missing'` prop
- **And** component renders appropriate icon with color coding:
  - Complete: ✓ (green)
  - Partial: ⚠ (yellow)
  - Missing: ✗ (red)
- **And** component is reusable across structure preview tables

**AC #4:** Campaign structure preview updated
- **Given** I have the existing CampaignStructurePreview component
- **When** I update the component
- **Then** validation status column is added to each table (Goals, Segments, Topics, Narratives)
- **And** status icons are displayed in each row
- **And** tooltip on hover shows specific missing fields
- **And** rows with validation issues are highlighted
- **And** component fetches validation status from API

**AC #5:** Execution Readiness Checklist component implementation
- **Given** I need to display execution readiness
- **When** I create the ExecutionReadinessChecklist component
- **Then** component accepts `campaignId`, `structure`, `validationStatus` props
- **And** component displays overall "Ready for Execution" status
- **And** component shows progress indicator
- **And** component has expandable sections for each validation category:
  - Goals validation (list goals with missing fields)
  - Segments validation (list segments with missing fields)
  - Topics validation (list topics with missing fields)
  - Narratives validation (list narratives with missing fields)
  - Matrix validation (list rule violations)
- **And** clicking on issue navigates to relevant element in preview
- **And** component updates in real-time when structure changes

**AC #6:** Campaign page integration
- **Given** I have the campaign detail page
- **When** I view the campaign
- **Then** validation status is fetched from `/api/campaigns/[id]/validation`
- **And** ExecutionReadinessChecklist component is displayed
- **And** validation status is shown in campaign header
- **And** validation status updates when structure is edited

**AC #7:** Responsive design and UX
- **Given** I am using the validation UI
- **When** I view on different devices
- **Then** UI works on mobile, tablet, and desktop
- **And** checklist is readable and usable on all screen sizes
- **And** status indicators are clearly visible
- **And** tooltips work on touch devices
- **And** loading states are shown during validation fetch

---

## Tasks / Subtasks

- [ ] **Task 1: Create ValidationStatusIcon component** (AC: #3)
  - [ ] Create `components/ui/ValidationStatusIcon.tsx`
  - [ ] Implement status prop with type safety
  - [ ] Add icon rendering (✓/⚠/✗) with color coding
  - [ ] Add tooltip support
  - [ ] Style component with Tailwind CSS

- [ ] **Task 2: Update CampaignStructurePreview component** (AC: #1, #4)
  - [ ] Add validation status column to Goals table
  - [ ] Add validation status column to Segments table
  - [ ] Add validation status column to Topics table
  - [ ] Add validation status display for Narratives (table-based with junction tables)
  - [ ] Add matrix validation warnings display
  - [ ] Fetch validation status from API
  - [ ] Display status icons in each row
  - [ ] Add tooltips showing missing fields
  - [ ] Highlight rows with validation issues
  - [ ] Handle loading and error states

- [ ] **Task 3: Create ExecutionReadinessChecklist component** (AC: #2, #5)
  - [ ] Create `components/ai/ExecutionReadinessChecklist.tsx`
  - [ ] Implement overall status display (badge/banner)
  - [ ] Implement progress indicator
  - [ ] Implement expandable sections for each category
  - [ ] Add navigation to relevant elements on click
  - [ ] Add real-time updates when structure changes
  - [ ] Style component with Tailwind CSS
  - [ ] Handle loading and error states

- [ ] **Task 4: Integrate with campaign page** (AC: #6)
  - [ ] Update `app/campaigns/[id]/page.tsx`
  - [ ] Fetch validation status from API
  - [ ] Display ExecutionReadinessChecklist component
  - [ ] Show validation status in campaign header
  - [ ] Update validation status when structure is edited
  - [ ] Handle loading and error states

- [ ] **Task 5: Responsive design and UX polish** (AC: #7)
  - [ ] Test on mobile devices
  - [ ] Test on tablet devices
  - [ ] Test on desktop
  - [ ] Ensure tooltips work on touch devices
  - [ ] Add loading states
  - [ ] Add error handling
  - [ ] Polish animations and transitions

---

## Dev Notes

### Project Structure Notes

- **Validation icon component:** `components/ui/ValidationStatusIcon.tsx` (new file)
- **Checklist component:** `components/ai/ExecutionReadinessChecklist.tsx` (new file)
- **Structure preview:** `components/ai/CampaignStructurePreview.tsx` (update existing)
- **Campaign page:** `app/campaigns/[id]/page.tsx` (update existing)

### Architecture Patterns

- **Component composition:** Reusable ValidationStatusIcon component
- **Real-time updates:** React state management for validation status
- **API integration:** Fetch validation status from `/api/campaigns/[id]/validation`
- **Navigation:** Link validation issues to relevant elements in preview

### Technical Details

**ValidationStatusIcon component:**
```typescript
type ValidationStatus = 'complete' | 'partial' | 'missing';

interface ValidationStatusIconProps {
  status: ValidationStatus;
  tooltip?: string;
}
```

**ExecutionReadinessChecklist component:**
```typescript
interface ExecutionReadinessChecklistProps {
  campaignId: string;
  structure: CampaignStructure;
  validationStatus: ValidationStatusResponse;
}
```

**Validation status API response:**
```typescript
{
  ready: boolean;
  issues: Array<{type, element, issue}>;
  summary: {
    goals: {total: number, complete: number},
    segments: {total: number, complete: number},
    topics: {total: number, complete: number},
    narratives: {total: number, complete: number},
    matrix: {valid: boolean, violations: number}
  };
}
```

**UI Components:**
- Status icons: Use Lucide React icons (CheckCircle, AlertCircle, XCircle)
- Progress bar: Use shadcn/ui Progress component or custom
- Expandable sections: Use shadcn/ui Accordion or Collapsible
- Badges: Use shadcn/ui Badge component

### Dependencies

- **Prerequisites:** 
  - Story 4.0.3 complete (validation logic and API endpoint)
  - Story 4.0.1 complete (schema enhancement)
  - Story 4.0.2 complete (AI prompt updates)
- **UI Components:** shadcn/ui components (Badge, Accordion, Progress)
- **Icons:** Lucide React
- **API:** Validation endpoint from Story 4.0.3

### Testing Strategy

- **Component testing:** Test ValidationStatusIcon with different statuses
- **Integration testing:** Test ExecutionReadinessChecklist with real validation data
- **UI testing:** Test on different screen sizes
- **User testing:** Verify tooltips and navigation work correctly

### References

- [Source: docs/epics.md#Epic-4.0] - Epic 4.0 goal and scope
- [Source: docs/epics.md#Story-4.0.4] - Story 4.0.4 acceptance criteria and technical notes
- [Source: docs/sprint-artifacts/story-4-0-3-validation-logic-matrix-rules.md] - Validation logic and API
- [Source: components/ai/CampaignStructurePreview.tsx] - Existing component to update

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

