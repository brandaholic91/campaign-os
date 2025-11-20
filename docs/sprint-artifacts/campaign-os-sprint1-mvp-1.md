# Story 1.1: Project Setup and Database Schema

**Status:** ready-for-dev

---

## User Story

As a **developer**,
I want **a properly initialized Next.js project with Supabase database schema**,
So that **I have a solid foundation to build campaign management features on**.

---

## Acceptance Criteria

**AC #1:** Next.js 15 project initialized with TypeScript and App Router
- **Given** I have Node.js 20.x installed
- **When** I run `npx create-next-app@latest campaign-os --typescript --tailwind --app`
- **Then** the project is created with proper folder structure
- **And** TypeScript is configured with strict mode
- **And** Tailwind CSS is configured and working

**AC #2:** Supabase client and dependencies installed
- **Given** the Next.js project exists
- **When** I install `@supabase/supabase-js@2.39.0` and `@supabase/ssr@0.1.0`
- **Then** Supabase client can be imported and initialized
- **And** environment variables are configured in `.env.local`

**AC #3:** Database schema created with all 8 tables
- **Given** I have a Supabase project
- **When** I run the migration SQL
- **Then** 8 tables exist: campaigns, goals, segments, topics, messages, channels, sprints, tasks
- **And** all enum types are created (campaign_type, goal_type, etc.)
- **And** foreign key constraints are properly set up
- **And** indexes are created for performance

**AC #4:** TypeScript types generated from database
- **Given** the database schema exists
- **When** I run `npx supabase gen types typescript`
- **Then** TypeScript interfaces are generated for all tables
- **And** types are saved to `lib/supabase/types.ts`
- **And** types can be imported in components

**AC #5:** Basic project structure and configuration
- **Given** the project is initialized
- **When** I check the project structure
- **Then** `app/`, `components/`, `lib/` directories exist
- **And** `tsconfig.json` has path aliases configured
- **And** `tailwind.config.ts` is properly configured
- **And** Shadcn/ui is initialized with basic components

---

## Implementation Details

### Tasks / Subtasks

- [ ] Initialize Next.js 15 project with TypeScript and App Router (AC: #1)
- [ ] Install and configure Tailwind CSS 3.4.0 (AC: #1)
- [ ] Install Supabase dependencies: @supabase/supabase-js, @supabase/ssr (AC: #2)
- [ ] Set up environment variables (.env.local) (AC: #2)
- [ ] Create Supabase client in lib/supabase/client.ts (AC: #2)
- [ ] Create database migration file with enum types (AC: #3)
  - campaign_type, goal_type, campaign_status, message_type, message_status
  - sprint_status, task_category, task_status, channel_type
- [ ] Create 8 database tables with proper columns (AC: #3)
  - campaigns, goals, segments, topics, messages, channels, sprints, tasks
- [ ] Set up foreign key constraints and cascade deletes (AC: #3)
- [ ] Create indexes for performance (campaign_id, sprint_id, etc.) (AC: #3)
- [ ] Add updated_at triggers for all tables (AC: #3)
- [ ] Generate TypeScript types from Supabase schema (AC: #4)
- [ ] Configure path aliases in tsconfig.json (@/components, @/lib) (AC: #5)
- [ ] Initialize Shadcn/ui with basic components (Button, Input, Card, Table) (AC: #5)
- [ ] Create lib/utils.ts with cn() helper function (AC: #5)
- [ ] Test Supabase connection and verify schema (AC: #3, #4)

### Technical Summary

This story establishes the foundation for the Campaign OS application. We're creating a greenfield Next.js 15 project with TypeScript strict mode, Tailwind CSS for styling, and Supabase as the database backend. The database schema includes 8 core tables with proper relationships, enum types for data integrity, and indexes for performance. TypeScript types are generated from the database schema to ensure type safety throughout the application.

**Key technical decisions:**
- Next.js 15 App Router for modern React patterns
- Server Components by default for better performance
- Supabase managed PostgreSQL for database
- Shadcn/ui for consistent UI components
- TypeScript strict mode for type safety

### Project Structure Notes

- **Files to create:**
  - `package.json` - Dependencies and scripts
  - `tsconfig.json` - TypeScript configuration
  - `tailwind.config.ts` - Tailwind configuration
  - `next.config.js` - Next.js configuration
  - `.env.local` - Environment variables
  - `lib/supabase/client.ts` - Supabase client
  - `lib/supabase/types.ts` - Generated types
  - `lib/utils.ts` - Utility functions
  - `supabase/migrations/20251120_initial_schema.sql` - Database migration
  - `components/ui/` - Shadcn/ui components

- **Expected test locations:** Manual testing (no automated tests in Sprint 1)

- **Estimated effort:** 3 story points (2-3 days)

- **Prerequisites:** None (first story)

### Key Code References

**Greenfield project** - no existing code to reference.

**Reference documentation:**
- Next.js 15 App Router docs: Server Components, Server Actions
- Supabase docs: PostgreSQL schemas, TypeScript type generation
- Shadcn/ui component library
- Tailwind CSS utility-first patterns

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- Complete project stack with exact versions
- Database schema details for all 8 tables
- Implementation approach and patterns
- Development setup instructions
- Complete file structure reference

**Architecture:** Greenfield project - new architecture from scratch

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

