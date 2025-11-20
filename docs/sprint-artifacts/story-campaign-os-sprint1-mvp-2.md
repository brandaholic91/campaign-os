# Story 1.2: Campaign CRUD and Audience Management

**Status:** Draft

---

## User Story

As a **campaign manager**,
I want **to create and manage campaigns with audience segments and topics**,
So that **I can organize my campaign planning around specific audiences and messaging themes**.

---

## Acceptance Criteria

**AC #1:** Campaign list and creation
- **Given** I am on the campaigns page
- **When** I view the campaign list
- **Then** I see all existing campaigns with their name, type, dates, and status
- **And** I can click "New Campaign" to create a campaign

**AC #2:** Campaign CRUD operations
- **Given** I am creating/editing a campaign
- **When** I fill in name, campaign_type, start_date, end_date, primary_goal_type, and description
- **Then** the campaign is saved to the database
- **And** I can edit existing campaigns
- **And** I can delete campaigns with confirmation
- **And** validation prevents end_date < start_date

**AC #3:** Campaign detail page
- **Given** I click on a campaign
- **When** I view the campaign detail page
- **Then** I see all campaign information
- **And** I see tabs for Segments, Topics, Messages, Sprints
- **And** I can navigate to each section

**AC #4:** Audience segments management
- **Given** I am on the segments page for a campaign
- **When** I add a new segment with name, description, demographics, psychographics
- **Then** the segment is saved and appears in the list
- **And** I can edit and delete segments
- **And** segments are filtered by campaign_id

**AC #5:** Topics management
- **Given** I am on the topics page for a campaign
- **When** I add a new topic with name, description, and category
- **Then** the topic is saved and appears in the list
- **And** I can edit and delete topics
- **And** topics are filtered by campaign_id

**AC #6:** API endpoints work correctly
- **Given** the API routes are implemented
- **When** I make GET, POST, PUT, DELETE requests
- **Then** responses return correct data with proper HTTP status codes
- **And** errors are handled gracefully
- **And** database constraints are enforced

---

## Implementation Details

### Tasks / Subtasks

- [ ] Create `/app/campaigns/page.tsx` - Campaign list page (AC: #1)
- [ ] Create `CampaignList.tsx` component with campaign cards (AC: #1)
- [ ] Create `CampaignCard.tsx` component (AC: #1)
- [ ] Create `/app/campaigns/new/page.tsx` - New campaign form (AC: #2)
- [ ] Create `CampaignForm.tsx` component with validation (AC: #2)
- [ ] Create `/app/campaigns/[id]/page.tsx` - Campaign detail page (AC: #3)
- [ ] Implement tab navigation (Overview, Segments, Topics, Messages, Sprints) (AC: #3)
- [ ] Create `/app/api/campaigns/route.ts` - GET (list), POST (create) (AC: #6)
- [ ] Create `/app/api/campaigns/[id]/route.ts` - GET, PUT, DELETE (AC: #2, #6)
- [ ] Implement date validation (end_date > start_date) (AC: #2)
- [ ] Create `/app/campaigns/[id]/segments/page.tsx` - Segments page (AC: #4)
- [ ] Create `SegmentManager.tsx` component with CRUD (AC: #4)
- [ ] Create `/app/api/segments/route.ts` - Segments API (AC: #4, #6)
- [ ] Create `/app/campaigns/[id]/topics/page.tsx` - Topics page (AC: #5)
- [ ] Create `TopicManager.tsx` component with CRUD (AC: #5)
- [ ] Create `/app/api/topics/route.ts` - Topics API (AC: #5, #6)
- [ ] Implement error handling in API routes (AC: #6)
- [ ] Add loading states to components (AC: #1, #4, #5)
- [ ] Add empty states (no campaigns, no segments, no topics) (AC: #1, #4, #5)
- [ ] Test all CRUD operations manually (AC: #2, #4, #5, #6)

### Technical Summary

This story implements the core campaign management functionality. Users can create campaigns with campaign_type and goal_type enums, manage audience segments with JSONB demographics/psychographics fields, and manage topics. All operations use Next.js App Router with Server Components for data fetching and Server Actions for form submissions. API routes handle CRUD operations with proper error handling and validation.

**Key technical patterns:**
- Server Components for initial data loading
- Server Actions for form submissions
- Supabase client for database operations
- Shadcn/ui form components (Input, Select, Textarea, Button)
- TypeScript types from generated Supabase types
- JSONB fields for flexible demographics/psychographics data

### Project Structure Notes

- **Files to create:**
  - `app/campaigns/page.tsx` - Campaign list
  - `app/campaigns/new/page.tsx` - New campaign form
  - `app/campaigns/[id]/page.tsx` - Campaign detail
  - `app/campaigns/[id]/segments/page.tsx` - Segments management
  - `app/campaigns/[id]/topics/page.tsx` - Topics management
  - `app/api/campaigns/route.ts` - Campaigns API
  - `app/api/campaigns/[id]/route.ts` - Single campaign API
  - `app/api/segments/route.ts` - Segments API
  - `app/api/topics/route.ts` - Topics API
  - `components/campaigns/CampaignList.tsx`
  - `components/campaigns/CampaignForm.tsx`
  - `components/campaigns/CampaignCard.tsx`
  - `components/segments/SegmentManager.tsx`
  - `components/topics/TopicManager.tsx`

- **Expected test locations:** Manual testing (no automated tests in Sprint 1)

- **Estimated effort:** 5 story points (3-5 days)

- **Prerequisites:** Story 1.1 (database schema and project setup must be complete)

### Key Code References

**Tech-Spec references:**
- Section "Source Tree Changes" - exact file paths
- Section "Technical Approach" - Server Components, API routes pattern
- Section "Implementation Steps" - Phase 3-4 detailed steps
- Section "Acceptance Criteria" - Campaign CRUD requirements

**Database schema:**
- `campaigns` table: campaign_type, primary_goal_type, dates
- `segments` table: demographics, psychographics JSONB fields
- `topics` table: name, description, category

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- Complete API route patterns and error handling
- Form handling with Server Actions
- Supabase query patterns
- Component structure and naming conventions
- Acceptance criteria details

**Architecture:** Next.js 15 App Router, Server Components, Supabase Postgres

---

## Dev Agent Record

### Agent Model Used

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes

<!-- Will be populated during dev-story execution -->

### Files Modified

<!-- Will be populated during dev-story execution -->

### Test Results

<!-- Will be populated during dev-story execution -->

---

## Review Notes

<!-- Will be populated during code review -->

