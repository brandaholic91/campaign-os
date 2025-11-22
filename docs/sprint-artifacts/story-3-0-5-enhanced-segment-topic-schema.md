# Story 3.0.5: Enhanced Segment & Topic Schema with Priority and Matrix

**Status:** draft

**Status note:** Story drafted 2025-01-XX - Enhanced schema for segments and topics with detailed profiles, priority system, and segment-topic matrix mapping

---

## User Story

As a **campaign manager**,
I want **detailed segment and topic schemas with priority classification, structured profiles, and segment-topic matrix mapping**,
So that **the AI can generate more targeted and effective campaign messages based on rich audience and content context**.

---

## Acceptance Criteria

**AC #1:** Segments table enhanced with detailed profile structure
- **Given** I have Epic 1-3 database schema
- **When** I run the migration script
- **Then** the `segments` table is enhanced with:
  - `id` field: slug-based identifier (e.g., "segment_1") - NEW or migrate existing UUIDs
  - `short_label` (TEXT, nullable) - UI display label (e.g., "20–35 városi")
  - `demographic_profile` (JSONB, structured) - replaces existing demographics JSONB with structured format:
    - `age_range` (string, e.g., "20-35")
    - `location_type` (string, e.g., "városi")
    - `income_level` (string, e.g., "közepes")
    - `other_demographics` (string, optional)
  - `psychographic_profile` (JSONB, structured) - replaces existing psychographics JSONB with structured format:
    - `values` (array of strings)
    - `attitudes_to_campaign_topic` (array of strings)
    - `motivations` (array of strings)
    - `pain_points` (array of strings)
  - `media_habits` (JSONB, NEW) - structured format:
    - `primary_channels` (array of strings, e.g., ["tiktok", "instagram_reels"])
    - `secondary_channels` (array of strings)
    - `notes` (string, optional)
  - `funnel_stage_focus` (TEXT, NEW) - enum: "awareness" | "engagement" | "consideration" | "conversion" | "mobilization"
  - `example_persona` (JSONB, NEW) - structured format:
    - `name` (string, e.g., "Anna, 27")
    - `one_sentence_story` (string)
  - `priority` field: change from INTEGER (1-5) to TEXT enum: "primary" | "secondary" - NEW constraint
- **And** existing `demographics` and `psychographics` JSONB fields are migrated to new structured format (or kept as fallback)
- **And** migration handles backward compatibility (existing data preserved)

**AC #2:** Topics table enhanced with content pillar structure
- **Given** I have Epic 1-3 database schema
- **When** I run the migration script
- **Then** the `topics` table is enhanced with:
  - `id` field: slug-based identifier (e.g., "topic_1") - NEW or migrate existing UUIDs
  - `short_label` (TEXT, nullable) - UI display label (e.g., "Zöld = spórolás")
  - `topic_type` (TEXT, NEW) - enum: "benefit" | "problem" | "value" | "proof" | "story"
  - `related_goal_types` (JSONB, NEW) - array of strings (e.g., ["awareness", "engagement"])
  - `core_narrative` (TEXT, NEW) - 1-2 sentence narrative description
  - `content_angles` (JSONB, NEW) - array of strings (content approach ideas)
  - `recommended_channels` (JSONB, NEW) - array of strings (e.g., ["instagram_reels", "tiktok"])
  - `risk_notes` (JSONB, NEW) - array of strings (warnings/guidelines)
  - `priority` field (TEXT, NEW) - enum: "primary" | "secondary"
- **And** existing `category` field remains for backward compatibility
- **And** migration handles backward compatibility (existing data preserved)

**AC #3:** Segment-Topic Matrix table created
- **Given** I have segments and topics tables
- **When** I run the migration script
- **Then** a new `segment_topic_matrix` table is created with:
  - `segment_id` (UUID, NOT NULL, FK to segments, ON DELETE CASCADE)
  - `topic_id` (UUID, NOT NULL, FK to topics, ON DELETE CASCADE)
  - `importance` (TEXT, NOT NULL) - enum: "high" | "medium" | "low"
  - `role` (TEXT, NOT NULL) - enum: "core_message" | "support" | "experimental"
  - `summary` (TEXT, nullable) - AI-generated short summary for matrix display (2-3 sentences max)
  - PRIMARY KEY (segment_id, topic_id)
  - Index on segment_id for query performance
  - Index on topic_id for query performance
- **And** table supports many-to-many relationship between segments and topics
- **And** CASCADE delete ensures matrix entries are removed when segments or topics are deleted
- **And** `summary` field stores only a brief AI-generated overview (not full segment/topic data) for efficient matrix display

**AC #4:** Priority field migration (segments and topics)
- **Given** existing segments and topics have priority as INTEGER (1-5)
- **When** I run the migration script
- **Then** priority values are migrated:
  - INTEGER 1-2 → "primary"
  - INTEGER 3-5 → "secondary"
  - Or: ask user for mapping strategy
- **And** new priority constraint is enforced (CHECK constraint: priority IN ('primary', 'secondary'))
- **And** existing data is preserved with appropriate mapping

**AC #5:** Zod schemas updated for new structures
- **Given** the database schema is updated
- **When** I update Zod schemas in `lib/ai/schemas.ts`
- **Then** `SegmentSchema` is updated with:
  - `id` (string, slug format)
  - `name` (string, 2-4 words)
  - `short_label` (string, optional)
  - `description` (string, 2-3 sentences)
  - `demographic_profile` (object with structured fields)
  - `psychographic_profile` (object with structured fields)
  - `media_habits` (object with primary_channels, secondary_channels, notes)
  - `funnel_stage_focus` (enum: awareness/engagement/consideration/conversion/mobilization)
  - `example_persona` (object with name, one_sentence_story)
  - `priority` (enum: "primary" | "secondary")
- **And** `TopicSchema` is updated with:
  - `id` (string, slug format)
  - `name` (string)
  - `short_label` (string, optional)
  - `description` (string, 2-3 sentences)
  - `topic_type` (enum: benefit/problem/value/proof/story)
  - `related_goal_types` (array of strings)
  - `core_narrative` (string)
  - `content_angles` (array of strings)
  - `recommended_channels` (array of strings)
  - `risk_notes` (array of strings, optional)
  - `priority` (enum: "primary" | "secondary")
- **And** `SegmentTopicMatrixSchema` is created with:
  - `segment_id` (UUID)
  - `topic_id` (UUID)
  - `importance` (enum: "high" | "medium" | "low")
  - `role` (enum: "core_message" | "support" | "experimental")
  - `summary` (string, optional, max 500 characters) - AI-generated brief summary for matrix display
- **And** all schemas include proper validation rules (min/max lengths, required fields)
- **And** matrix summary field is validated to ensure it's concise (max 500 chars, 2-3 sentences)

**AC #6:** AI prompt updated to use new schema
- **Given** the new schema is implemented
- **When** I update the strategy designer prompt
- **Then** prompt includes instructions for:
  - Generating 3-5 primary segments (max 7 total, with priority classification)
  - Generating 4-7 primary topics (max 9 total, with priority classification)
  - Creating segment-topic matrix with importance and role mapping
  - Limiting high-importance matrix connections to 5-6 total for focus
  - **CRITICAL:** For each segment-topic matrix entry, AI must generate a short summary (2-3 sentences max) that captures the key connection between the segment and topic
  - Matrix summary should be concise and focused on the relationship, not duplicate full segment/topic data
- **And** prompt output schema matches new `SegmentSchema` and `TopicSchema`
- **And** prompt includes segment-topic matrix generation in output with `summary` field for each entry
- **And** AI generates structured demographic_profile, psychographic_profile, media_habits, example_persona for segments
- **And** AI generates topic_type, content_angles, recommended_channels, risk_notes for topics
- **And** AI generates brief matrix summaries (not full data) for efficient UI display

**AC #7:** API endpoints updated for new schema
- **Given** the new schema is implemented
- **When** I update API endpoints
- **Then** `/api/ai/campaign-brief` endpoint:
  - Accepts new schema structure in request/response
  - Validates against updated Zod schemas
  - Returns segment-topic matrix in response
- **And** `/api/campaigns/structure` endpoint:
  - Handles new segment fields (demographic_profile, psychographic_profile, media_habits, funnel_stage_focus, example_persona)
  - Handles new topic fields (topic_type, related_goal_types, core_narrative, content_angles, recommended_channels, risk_notes)
  - Saves segment-topic matrix entries
  - Validates priority enum values
- **And** `/api/segments` and `/api/topics` endpoints:
  - Support CRUD operations with new fields
  - Validate new structured JSONB fields
- **And** `/api/segment-topic-matrix` endpoint (NEW):
  - GET: retrieve matrix for a campaign
  - POST: create/update matrix entries
  - DELETE: remove matrix entries

**AC #8:** UI components updated for new fields
- **Given** the new schema is implemented
- **When** I update UI components
- **Then** `CampaignWizard.tsx` displays new segment fields:
  - Demographic profile section (age_range, location_type, income_level, other_demographics)
  - Psychographic profile section (values, attitudes, motivations, pain_points)
  - Media habits section (primary_channels, secondary_channels, notes)
  - Funnel stage focus selector
  - Example persona section (name, one_sentence_story)
  - Priority selector (primary/secondary)
- **And** `CampaignWizard.tsx` displays new topic fields:
  - Topic type selector
  - Related goal types multi-select
  - Core narrative textarea
  - Content angles array input
  - Recommended channels multi-select
  - Risk notes array input
  - Priority selector (primary/secondary)
- **And** `SegmentManager.tsx` and `TopicManager.tsx` support editing all new fields
- **And** `MessageMatrix.tsx` uses segment-topic matrix for importance/role display
- **And** `MessageMatrix.tsx` displays only the AI-generated `summary` field in matrix cells (not full segment/topic data)
- **And** Matrix cells show brief summaries (2-3 sentences) for efficient UI rendering
- **And** Full segment/topic details are accessible via detail modal or tooltip on hover/click
- **And** UI shows priority badges (primary/secondary) for segments and topics

**AC #9:** Migration tested and validated
- **Given** migration script is created
- **When** I run the migration on local Supabase instance
- **Then** segments table structure matches spec
- **And** topics table structure matches spec
- **And** segment_topic_matrix table is created correctly
- **And** existing data is migrated properly (priority mapping, JSONB structure migration)
- **And** backward compatibility is maintained (existing API calls still work)
- **And** new fields are validated correctly (Zod schemas, database constraints)
- **And** CASCADE delete works (delete segment/topic, verify matrix entries deleted)

---

## Implementation Details

### Tasks / Subtasks

- [ ] Create migration file `supabase/migrations/YYYYMMDD_enhanced_segments_topics.sql` (AC: #1, #2, #3, #4)
  - Enhance `segments` table:
    - Add `short_label` (TEXT, nullable)
    - Migrate `demographics` JSONB to structured `demographic_profile` JSONB
    - Migrate `psychographics` JSONB to structured `psychographic_profile` JSONB
    - Add `media_habits` JSONB (structured)
    - Add `funnel_stage_focus` TEXT with CHECK constraint
    - Add `example_persona` JSONB (structured)
    - Change `priority` from INTEGER to TEXT with CHECK constraint ('primary', 'secondary')
    - Migrate existing priority values (1-2 → primary, 3-5 → secondary)
    - Consider: add `id` slug field or keep UUID as primary key
  - Enhance `topics` table:
    - Add `short_label` (TEXT, nullable)
    - Add `topic_type` TEXT with CHECK constraint
    - Add `related_goal_types` JSONB (array)
    - Add `core_narrative` TEXT
    - Add `content_angles` JSONB (array)
    - Add `recommended_channels` JSONB (array)
    - Add `risk_notes` JSONB (array, nullable)
    - Add `priority` TEXT with CHECK constraint ('primary', 'secondary')
  - Create `segment_topic_matrix` table:
    - segment_id (UUID, FK to segments)
    - topic_id (UUID, FK to topics)
    - importance (TEXT, CHECK: 'high'|'medium'|'low')
    - role (TEXT, CHECK: 'core_message'|'support'|'experimental')
    - summary (TEXT, nullable) - AI-generated brief summary (max 500 chars, 2-3 sentences)
    - PRIMARY KEY (segment_id, topic_id)
    - Indexes on segment_id and topic_id
  - Migration strategy for existing data:
    - Preserve existing demographics/psychographics as fallback
    - Map priority INTEGER to TEXT enum
    - Handle NULL values gracefully

- [ ] Update Zod schemas in `lib/ai/schemas.ts` (AC: #5)
  - Update `SegmentSchema`:
    - Add all new fields with proper validation
    - Define `DemographicProfileSchema` (nested object)
    - Define `PsychographicProfileSchema` (nested object)
    - Define `MediaHabitsSchema` (nested object)
    - Define `ExamplePersonaSchema` (nested object)
    - Update priority to enum
  - Update `TopicSchema`:
    - Add all new fields with proper validation
    - Define topic_type enum
    - Update priority to enum
  - Create `SegmentTopicMatrixSchema`:
    - segment_id, topic_id (UUIDs)
    - importance, role (enums)
    - summary (string, optional, max 500 characters) - Brief AI-generated summary for matrix display
  - Export TypeScript types for all new schemas

- [ ] Update AI prompt in `lib/ai/prompts/strategy-designer.ts` (AC: #6)
  - Update system prompt to include new schema requirements
  - Add instructions for generating 3-5 primary segments (max 7 total)
  - Add instructions for generating 4-7 primary topics (max 9 total)
  - Add instructions for priority classification (primary/secondary)
  - Add instructions for segment-topic matrix generation:
    - Limit high-importance connections to 5-6 total
    - Map importance (high/medium/low) and role (core_message/support/experimental)
    - **CRITICAL:** For each matrix entry, generate a brief summary (2-3 sentences, max 500 chars) that captures the key connection between segment and topic
    - Summary should be concise and relationship-focused, NOT duplicate full segment/topic data
    - Summary format: "How this topic relates to this segment, key messaging angle, why this connection matters"
  - Update output JSON schema example to match new structure (include summary field in matrix entries)
  - Add examples for structured demographic_profile, psychographic_profile, media_habits
  - Add examples for topic_type, content_angles, recommended_channels
  - Add examples for matrix summary generation (concise, relationship-focused)

- [ ] Update API endpoints (AC: #7)
  - Update `/api/ai/campaign-brief/route.ts`:
    - Update `CampaignStructureSchema` validation
    - Handle segment-topic matrix in response
    - Update prompt context with new schema
  - Update `/api/campaigns/structure/route.ts`:
    - Update segment insert logic for new fields
    - Update topic insert logic for new fields
    - Add segment-topic matrix insert logic (including summary field)
    - Validate priority enum values
    - Ensure matrix summary is saved (AI-generated, not full data)
  - Update `/api/segments/route.ts`:
    - Support CRUD with new fields
    - Validate structured JSONB fields
  - Update `/api/topics/route.ts`:
    - Support CRUD with new fields
    - Validate structured JSONB fields
  - Create `/api/segment-topic-matrix/route.ts` (NEW):
    - GET: retrieve matrix for campaign (returns summary field, not full segment/topic data)
    - POST: create/update matrix entries (accepts summary field, validates max 500 chars)
    - DELETE: remove matrix entries
    - Validate importance and role enums
    - Validate summary field (max 500 characters, optional)

- [ ] Update UI components (AC: #8)
  - Update `components/campaigns/CampaignWizard.tsx`:
    - Add form sections for new segment fields
    - Add form sections for new topic fields
    - Add priority selector (primary/secondary) for segments and topics
    - Add segment-topic matrix editor (table/grid view)
  - Update `components/segments/SegmentManager.tsx`:
    - Display/edit all new segment fields
    - Add demographic profile editor
    - Add psychographic profile editor
    - Add media habits editor
    - Add example persona editor
  - Update `components/topics/TopicManager.tsx`:
    - Display/edit all new topic fields
    - Add topic type selector
    - Add content angles editor
    - Add risk notes editor
  - Update `components/messages/MessageMatrix.tsx`:
    - Display priority badges for segments and topics
    - Use segment-topic matrix for importance/role indicators
    - **CRITICAL:** Display only the AI-generated `summary` field in matrix cells (not full segment/topic data)
    - Matrix cells show brief summaries (2-3 sentences) for efficient UI rendering
    - Full segment/topic details accessible via detail modal or tooltip on hover/click
    - Show matrix connections visually with summary text

- [ ] Generate TypeScript types from database (AC: #9)
  - Run `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
  - Verify new fields are generated correctly
  - Check JSONB types match structure

- [ ] Test migration and backward compatibility (AC: #9)
  - Run migration on local Supabase instance
  - Verify table structures match spec
  - Test priority migration (INTEGER → TEXT enum)
  - Test JSONB structure migration (existing → new structured format)
  - Test segment-topic matrix CRUD operations:
    - Test summary field generation and storage
    - Test summary field validation (max 500 chars)
    - Test matrix display shows only summaries (not full segment/topic data)
  - Test CASCADE delete (delete segment/topic, verify matrix entries deleted)
  - Test backward compatibility:
    - Existing API calls still work
    - Old data format is readable
    - New fields are optional where appropriate
  - Test validation:
    - Zod schema validation for new structures
    - Database constraint validation (priority enum, importance enum, role enum)
    - Required fields validation

### Technical Summary

This story enhances the segments and topics schemas with detailed structured profiles, priority classification, and introduces a segment-topic matrix for mapping relationships. The changes enable more targeted AI generation and better campaign planning by providing rich context about audiences and content pillars.

**Key technical decisions:**
- Structured JSONB profiles instead of free-form JSONB (better validation, clearer structure)
- Priority enum (primary/secondary) instead of numeric (clearer semantics, easier filtering)
- Segment-topic matrix table for explicit relationship mapping (importance, role, summary)
- **Matrix summary field:** AI generates brief summaries (2-3 sentences, max 500 chars) for each segment-topic connection - matrix displays only summaries, not full data (efficient UI rendering)
- Backward compatibility: preserve existing data, migrate gradually
- Slug-based IDs: consider adding slug field alongside UUID (or keep UUID as primary key)

**Migration strategy:**
- Add new fields as nullable initially
- Migrate existing data to new structure
- Keep old fields as fallback during transition
- Update validation and constraints incrementally

**Critical path:** This story enhances Epic 3.0 foundation. Stories 3.0.2, 3.0.3, and 3.0.4 benefit from richer segment/topic data. The segment-topic matrix directly supports Message Matrix functionality.

### Project Structure Notes

- **Files to create:**
  - `supabase/migrations/YYYYMMDD_enhanced_segments_topics.sql` - Migration script
  - `app/api/segment-topic-matrix/route.ts` - Matrix API endpoint

- **Files to update:**
  - `lib/ai/schemas.ts` - Update SegmentSchema, TopicSchema, add SegmentTopicMatrixSchema
  - `lib/ai/prompts/strategy-designer.ts` - Update prompt with new schema
  - `app/api/ai/campaign-brief/route.ts` - Handle new schema in response
  - `app/api/campaigns/structure/route.ts` - Save new fields and matrix
  - `app/api/segments/route.ts` - CRUD with new fields
  - `app/api/topics/route.ts` - CRUD with new fields
  - `components/campaigns/CampaignWizard.tsx` - Form fields for new schema
  - `components/segments/SegmentManager.tsx` - Display/edit new fields
  - `components/topics/TopicManager.tsx` - Display/edit new fields
  - `components/messages/MessageMatrix.tsx` - Use matrix for display
  - `lib/supabase/types.ts` - Regenerate types after migration

- **Expected test locations:**
  - Manual testing: migration script, API endpoints, UI components
  - Unit tests: Zod schema validation
  - Integration tests: API endpoint validation, database constraints

- **Estimated effort:** 13 story points (5-7 days)
  - Migration script: 2 days
  - Schema updates: 1 day
  - Prompt updates: 1 day
  - API updates: 1-2 days
  - UI updates: 2-3 days
  - Testing: 1 day

- **Prerequisites:** 
  - Epic 3.0.1 complete (message_strategies table exists)
  - Epic 2 complete (LLM infrastructure, AI generation)

### Key Code References

**Existing code to reference:**
- `supabase/migrations/*.sql` - Previous migration patterns
- `lib/ai/schemas.ts` - Existing Zod schema patterns
- `lib/ai/prompts/strategy-designer.ts` - Current prompt structure
- `app/api/campaigns/structure/route.ts` - Current structure saving logic
- `components/campaigns/CampaignWizard.tsx` - Current form structure

**Reference documentation:**
- Supabase JSONB documentation: Structured JSONB patterns
- PostgreSQL ALTER TABLE: Adding columns, changing types
- Zod documentation: Nested object validation, enum validation
- Migration best practices: Backward compatibility, data migration

---

## Context References

**Epic Definition:** [epics.md](../epics.md) - Epic 3.0: Message Matrix Refactor - Communication Strategies
- Story 3.0.5 acceptance criteria and technical notes
- Dependencies and prerequisites
- Success criteria

**Related Stories:**
- Story 3.0.1: Database Migration + Schema (message_strategies table)
- Story 3.0.2: Message Matrix Refactor (UI) - benefits from enhanced segments/topics
- Story 3.0.3: Strategy AI Generator - uses new schema for better generation
- Story 3.0.4: Strategy Form + CRUD - displays new segment/topic fields

**Design Document:**
- User-provided schema specification (2025-01-XX)
  - Recommended counts: 3-5 segments (max 7), 4-7 topics (max 9)
  - Priority system: primary/secondary
  - Segment schema: detailed profiles, media habits, persona
  - Topic schema: content angles, recommended channels, risk notes
  - Segment-topic matrix: importance and role mapping
  - **CRITICAL UI Requirement:** Matrix displays only AI-generated brief summaries (2-3 sentences, max 500 chars) for each segment-topic connection, NOT full segment/topic data. Full details accessible via detail modal/tooltip.

