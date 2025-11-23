# Story 4.0.3: Validation Logic & Matrix Rules

**Status:** approved

**Status note:** Story drafted 2025-11-23 - Helper functions, matrix validation, completeness checks

---

## User Story

As a **campaign manager**,
I want **validation logic that ensures campaign structures are complete and follow matrix rules**,
So that **I know when my campaign is ready for sprint and content calendar planning**.

---

## Acceptance Criteria

**AC #1:** Goal completeness validation
- **Given** I have a campaign structure
- **When** I check goal validation
- **Then** `validateGoalCompleteness(goal)` function exists
- **And** function returns `{ valid: boolean, missing: string[] }`
- **And** function checks for:
  - `funnel_stage` field presence
  - `kpi_hint` field presence (optional, but recommended)
- **And** function provides clear feedback on missing fields

**AC #2:** Segment completeness validation
- **Given** I have a campaign structure
- **When** I check segment validation
- **Then** `validateSegmentCompleteness(segment)` function exists
- **And** function returns `{ valid: boolean, missing: string[] }`
- **And** function checks for required fields from Epic 3.0.5:
  - `demographic_profile`, `psychographic_profile`, `media_habits`, `funnel_stage_focus`, `example_persona`, `priority`
- **And** function provides clear feedback on missing fields

**AC #3:** Topic completeness validation
- **Given** I have a campaign structure
- **When** I check topic validation
- **Then** `validateTopicCompleteness(topic)` function exists
- **And** function returns `{ valid: boolean, missing: string[] }`
- **And** function checks for:
  - `related_goal_stages` field presence
  - `recommended_content_types` field presence (optional, but recommended)
- **And** function provides clear feedback on missing fields

**AC #4:** Narrative completeness validation
- **Given** I have a campaign structure
- **When** I check narrative validation
- **Then** `validateNarrativeCompleteness(narrative)` function exists
- **And** function returns `{ valid: boolean, missing: string[] }`
- **And** function checks for:
  - `primary_goal_ids` field presence (optional, but recommended)
  - `primary_topic_ids` field presence (optional, but recommended)
  - `suggested_phase` field presence (optional, but recommended)
- **And** function provides clear feedback on missing fields

**AC #5:** Matrix rules validation
- **Given** I have a campaign structure with segment-topic matrix
- **When** I check matrix validation
- **Then** `validateMatrixRules(matrix, segments)` function exists
- **And** function returns `{ valid: boolean, violations: Array<{segment_id: string, issue: string}> }`
- **And** function enforces:
  - Max 2-3 high importance + core_message topics per segment
  - Max 2-4 medium importance support topics per segment
  - Max 1-2 experimental topics per segment
- **And** function groups matrix entries by segment_id
- **And** function counts topics by importance and role combination
- **And** function returns violations with clear messages

**AC #6:** Comprehensive execution readiness validation
- **Given** I have a campaign structure
- **When** I check execution readiness
- **Then** `isReadyForExecution(structure)` function exists
- **And** function returns `{ ready: boolean, issues: Array<{type: string, element: string, issue: string}> }`
- **And** function validates:
  - All goals completeness
  - All segments completeness
  - All topics completeness
  - All narratives completeness
  - Matrix rules compliance
- **And** function aggregates all validation issues
- **And** function provides clear, actionable feedback

**AC #7:** Validation API endpoint
- **Given** I have validation functions
- **When** I create the API endpoint
- **Then** `GET /api/campaigns/[id]/validation` endpoint exists
- **And** endpoint returns validation status for entire campaign structure
- **And** endpoint includes:
  - Detailed issues list
  - "ready for execution" boolean
  - Progress percentage or summary
- **And** endpoint uses validation helper functions
- **And** endpoint handles errors gracefully

**AC #8:** Integration with campaign structure endpoints
- **Given** I have validation functions and API endpoint
- **When** I update campaign structure endpoints
- **Then** campaign structure responses optionally include validation status
- **And** validation can be triggered on save (warn but don't block)
- **And** validation status is cached or computed efficiently

---

## Tasks / Subtasks

- [ ] **Task 1: Create validation helper functions** (AC: #1, #2, #3, #4)
  - [ ] Create `lib/validation/campaign-structure.ts` file
  - [ ] Implement `validateGoalCompleteness(goal)` function
  - [ ] Implement `validateSegmentCompleteness(segment)` function
  - [ ] Implement `validateTopicCompleteness(topic)` function
  - [ ] Implement `validateNarrativeCompleteness(narrative)` function
  - [ ] Add TypeScript types for validation results
  - [ ] Add unit tests for each validation function

- [ ] **Task 2: Implement matrix rules validation** (AC: #5)
  - [ ] Implement `validateMatrixRules(matrix, segments)` function
  - [ ] Add logic to group matrix entries by segment_id
  - [ ] Add logic to count topics by importance and role
  - [ ] Add logic to check limits (2-3 high/core, 2-4 medium/support, 1-2 experimental)
  - [ ] Add violation reporting with clear messages
  - [ ] Add unit tests for matrix validation

- [ ] **Task 3: Implement comprehensive execution readiness check** (AC: #6)
  - [ ] Implement `isReadyForExecution(structure)` function
  - [ ] Aggregate all validation results
  - [ ] Format issues list with type, element, and issue details
  - [ ] Add unit tests for execution readiness check

- [ ] **Task 4: Create validation API endpoint** (AC: #7)
  - [ ] Create `app/api/campaigns/[id]/validation/route.ts`
  - [ ] Implement GET handler
  - [ ] Fetch campaign structure from database
  - [ ] Run all validation functions
  - [ ] Return validation status with issues list
  - [ ] Add error handling
  - [ ] Test endpoint with sample campaigns

- [ ] **Task 5: Integrate validation with campaign structure endpoints** (AC: #8)
  - [ ] Update `GET /api/campaigns/[id]/structure` to optionally include validation status
  - [ ] Add validation trigger on save (warn but don't block)
  - [ ] Cache validation results if needed for performance
  - [ ] Test integration

---

## Dev Notes

### Project Structure Notes

- **Validation functions:** `lib/validation/campaign-structure.ts` (new file)
- **API endpoint:** `app/api/campaigns/[id]/validation/route.ts` (new file)
- **Type definitions:** Add to `lib/validation/campaign-structure.ts` or separate types file

### Architecture Patterns

- **Validation functions:** Pure functions that return validation results
- **Error handling:** Graceful degradation, validation never blocks operations
- **Performance:** Consider caching validation results for large structures
- **Type safety:** Use TypeScript types for validation results

### Technical Details

**Validation result structure:**
```typescript
type ValidationResult = {
  valid: boolean;
  missing?: string[];
  violations?: Array<{segment_id: string, issue: string}>;
};

type ExecutionReadinessResult = {
  ready: boolean;
  issues: Array<{
    type: 'goal' | 'segment' | 'topic' | 'narrative' | 'matrix';
    element: string; // element ID or name
    issue: string; // clear description
  }>;
};
```

**Matrix validation logic:**
1. Group matrix entries by `segment_id`
2. For each segment, count topics by:
   - High importance + core_message role
   - Medium importance + support role
   - Experimental role (any importance)
3. Check limits:
   - High + core_message: max 2-3
   - Medium + support: max 2-4
   - Experimental: max 1-2
4. Report violations with segment name and specific issue

**Validation API response:**
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

### Dependencies

- **Prerequisites:** 
  - Story 4.0.1 complete (schema enhancement)
  - Story 4.0.2 complete (AI prompt updates)
  - Story 3.0.5 complete (Enhanced Segment & Topic Schema)
- **Database:** Campaign structure data from Supabase
- **Types:** Zod schemas from Story 4.0.1

### Testing Strategy

- **Unit tests:** Test each validation function with various inputs
- **Integration tests:** Test API endpoint with real campaign data
- **Edge cases:** Test with missing data, invalid data, empty structures
- **Performance:** Test with large campaign structures

### References

- [Source: docs/epics.md#Epic-4.0] - Epic 4.0 goal and scope
- [Source: docs/epics.md#Story-4.0.3] - Story 4.0.3 acceptance criteria and technical notes
- [Source: docs/sprint-artifacts/story-4-0-1-strategic-metadata-schema-enhancement.md] - Schema definitions
- [Source: docs/sprint-artifacts/story-3-0-5-enhanced-segment-topic-schema.md] - Segment-topic matrix structure

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

