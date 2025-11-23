# Story 3.0.1: Database Migration + Schema

**Status:** done

**Status note:** Story drafted 2025-11-22 - Foundation for Epic 3.0 message matrix refactor

---

## User Story

As a **developer**,
I want **a new `message_strategies` table with JSONB structure and Zod validation schemas**,
So that **communication strategies can be stored and validated properly**.

---

## Acceptance Criteria

**AC #1:** `message_strategies` table created with proper structure
- **Given** I have Epic 2 database schema
- **When** I run the migration script
- **Then** the `message_strategies` table is created with:
  - id (UUID, primary key, default uuid_generate_v4())
  - campaign_id (UUID, NOT NULL, FK to campaigns, ON DELETE CASCADE)
  - segment_id (UUID, NOT NULL, FK to segments, ON DELETE CASCADE)
  - topic_id (UUID, NOT NULL, FK to topics, ON DELETE CASCADE)
  - strategy_core (JSONB, NOT NULL)
  - style_tone (JSONB, NOT NULL)
  - cta_funnel (JSONB, NOT NULL)
  - extra_fields (JSONB, nullable)
  - preview_summary (TEXT, nullable)
  - created_at (TIMESTAMPTZ, default NOW())
  - updated_at (TIMESTAMPTZ, default NOW())
- **And** UNIQUE constraint exists on (campaign_id, segment_id, topic_id)
- **And** index created on campaign_id for query performance
- **And** trigger created for automatic updated_at timestamp updates

**AC #2:** JSONB structure defined for 4 main categories (16 sub-fields)
- **Given** the table structure is created
- **When** I define the JSONB structure
- **Then** Strategy Core (5 fields) structure is defined:
  - positioning_statement (string, 1-2 sentences)
  - core_message (string, 1 sentence)
  - supporting_messages (array, 3-5 items)
  - proof_points (array, 2-3 items)
  - objections_reframes (optional array)
- **And** Style & Tone (4 fields) structure is defined:
  - tone_profile{description, keywords[]} (keywords array, 3-5 items)
  - language_style (string)
  - communication_guidelines{do[], dont[]} (arrays)
  - emotional_temperature (string)
- **And** CTA & Funnel (4 fields) structure is defined:
  - funnel_stage (enum: awareness/consideration/conversion/mobilization)
  - cta_objectives (array)
  - cta_patterns (array, 2-3 items)
  - friction_reducers (optional array)
- **And** Extra Fields (3 fields, optional) structure is defined:
  - framing_type (optional string)
  - key_phrases (optional array)
  - risk_notes (optional string)

**AC #3:** Zod schemas defined for all JSONB structures
- **Given** the JSONB structure is defined
- **When** I create Zod schemas in `lib/ai/schemas.ts`
- **Then** `StrategyCoreSchema` is defined with:
  - positioning_statement (min 10 chars)
  - core_message (min 5 chars)
  - supporting_messages (array, min 3, max 5)
  - proof_points (array, min 2, max 3)
  - objections_reframes (optional array)
- **And** `StyleToneSchema` is defined with:
  - tone_profile{description, keywords (array, min 3, max 5)}
  - language_style (string)
  - communication_guidelines{do (array), dont (array)}
  - emotional_temperature (string)
- **And** `CTAFunnelSchema` is defined with:
  - funnel_stage (enum: awareness/consideration/conversion/mobilization)
  - cta_objectives (array)
  - cta_patterns (array, min 2, max 3)
  - friction_reducers (optional array)
- **And** `ExtraFieldsSchema` is defined with:
  - framing_type (optional string)
  - key_phrases (optional array)
  - risk_notes (optional string)
- **And** `MessageStrategySchema` combines all 4 categories (strategy_core, style_tone, cta_funnel, extra_fields?, preview_summary?)

**AC #4:** TypeScript types generated from database schema
- **Given** the migration is complete
- **When** I run `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
- **Then** `message_strategies` table types are generated
- **And** types are exported for use in components
- **And** types match the JSONB structure definitions

**AC #5:** Existing `messages` table remains unchanged
- **Given** Epic 2 `messages` table exists
- **When** I create the new `message_strategies` table
- **Then** the `messages` table structure remains unchanged
- **And** `messages` table data is preserved
- **And** `messages` table functionality remains for Content Calendar use (Epic 3.1)

**AC #6:** Migration tested and validated
- **Given** migration script is created
- **When** I run the migration on local Supabase instance
- **Then** table structure matches spec
- **And** UNIQUE constraint works (try inserting duplicate strategy fails)
- **And** CASCADE delete works (delete campaign, verify strategies deleted)
- **And** JSONB structure validation works with Zod schemas

---

## Implementation Details

### Tasks / Subtasks

- [x] Create migration file `supabase/migrations/YYYYMMDD_message_strategies.sql` (AC: #1)
  - Use actual date format: `20251122_message_strategies.sql` (or current date)
  - Create `message_strategies` table with all required fields
  - Add UNIQUE constraint on (campaign_id, segment_id, topic_id)
  - Create index: `CREATE INDEX idx_message_strategies_campaign ON message_strategies(campaign_id);`
  - Create trigger for updated_at: `CREATE TRIGGER update_message_strategies_updated_at BEFORE UPDATE ON message_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
  - Note: Ensure `update_updated_at_column()` function exists (from previous migrations)

- [x] Document JSONB structure for 4 main categories (AC: #2)
  - Strategy Core: positioning_statement, core_message, supporting_messages[], proof_points[], objections_reframes[]?
  - Style & Tone: tone_profile{description, keywords[]}, language_style, communication_guidelines{do[], dont[]}, emotional_temperature
  - CTA & Funnel: funnel_stage, cta_objectives[], cta_patterns[], friction_reducers[]?
  - Extra Fields: framing_type?, key_phrases[]?, risk_notes?
  - Add structure documentation as SQL comments in migration file

- [x] Create Zod schemas in `lib/ai/schemas.ts` (AC: #3)
  - Create `StrategyCoreSchema` with validation rules
  - Create `StyleToneSchema` with validation rules
  - Create `CTAFunnelSchema` with funnel_stage enum
  - Create `ExtraFieldsSchema` (all fields optional)
  - Create `MessageStrategySchema` combining all 4 categories
  - Export schemas for use in API endpoints and form validation
  - Add TypeScript type inference: `export type MessageStrategy = z.infer<typeof MessageStrategySchema>`

- [x] Generate TypeScript types from database (AC: #4)
  - Run `supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts`
  - Verify `message_strategies` table types are generated
  - Check types match JSONB structure (JSONB fields should be typed as `Json`)
  - Export types if needed for component use

- [x] Verify existing `messages` table unchanged (AC: #5)
  - Check `messages` table structure in Supabase
  - Verify no changes to `messages` table schema
  - Document that `messages` table remains for Content Calendar use (Epic 3.1)

- [x] Test migration on local Supabase instance (AC: #6)
  - Run migration script via Supabase CLI or Dashboard
  - Verify table structure matches spec
  - Test UNIQUE constraint: try inserting duplicate (campaign_id, segment_id, topic_id) combination
  - Test CASCADE delete: create test campaign with strategy, delete campaign, verify strategy deleted
  - Test JSONB validation: insert test data, verify Zod schema validation works
  - Test index: verify query performance with campaign_id filter

### Technical Summary

This story establishes the database foundation for Epic 3.0 Message Matrix refactor. We're creating a new `message_strategies` table to store communication strategies (how to communicate each topic to each segment) instead of concrete messages. The table uses JSONB for flexible structure with 4 main categories containing 16 sub-fields total. Zod schemas provide validation for type-safe operations. The UNIQUE constraint ensures one strategy per segment × topic combination.

**Key technical decisions:**
- JSONB structure for flexible, queryable strategy data
- 4 main categories: Strategy Core, Style & Tone, CTA & Funnel, Extra Fields
- UNIQUE constraint on (campaign_id, segment_id, topic_id) - one strategy per cell
- Zod schema validation for type safety and runtime validation
- Existing `messages` table preserved for Content Calendar use (Epic 3.1)
- CASCADE delete ensures data consistency when campaigns are deleted

**Critical path:** This story is the foundation for all Epic 3.0 stories. Stories 3.0.2, 3.0.3, and 3.0.4 depend on this database schema.

### Project Structure Notes

- **Files to create:**
  - `supabase/migrations/YYYYMMDD_message_strategies.sql` - Migration script
  - Update `lib/ai/schemas.ts` - Add strategy Zod schemas

- **Files to update:**
  - `lib/supabase/types.ts` - Regenerate types after migration (via `supabase gen types`)

- **Expected test locations:** Manual testing
  - Test migration script execution
  - Test UNIQUE constraint behavior
  - Test CASCADE delete behavior
  - Test JSONB structure with Zod validation
  - Verify index improves query performance

- **Estimated effort:** 5 story points (2-3 days)

- **Prerequisites:** Epic 2 complete (all stories done)

### Key Code References

**Existing code to reference:**
- `supabase/migrations/*.sql` - Previous migration patterns
- `lib/ai/schemas.ts` - Existing Zod schema patterns (Epic 2)
- `lib/supabase/types.ts` - Existing type generation patterns

**Reference documentation:**
- Supabase JSONB documentation: JSONB column types, querying JSONB
- PostgreSQL UNIQUE constraints: Multi-column unique constraints
- Zod documentation: schema validation, type inference
- Supabase type generation: `supabase gen types` command

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Epic 3.0: Message Matrix Refactor
- Database schema details
- JSONB structure specifications (4 categories, 16 sub-fields)
- Zod schema requirements
- Migration strategy

**Epic Definition:** [epics.md](../epics.md) - Epic 3.0: Message Matrix Refactor - Communication Strategies
- Story 3.0.1 acceptance criteria and technical notes
- Dependencies and prerequisites
- Success criteria

