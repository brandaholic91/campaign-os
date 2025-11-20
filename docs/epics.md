# campaign-os - Epic Breakdown

**Date:** 2025-11-20
**Project Level:** quick-flow

---

## Epic 1: Campaign OS Sprint 1 MVP - Manual War Room

**Slug:** campaign-os-sprint1-mvp

### Goal

Build a functional, manual "War Room" tool for communication and social media campaign planning. Enable users to create campaigns, manage audience segments and topics, build message matrices, and track sprints and tasks - all without AI assistance. This MVP establishes the foundation for future AI-powered campaign orchestration.

### Scope

**In Scope:**
- Next.js 15 project initialization with App Router, TypeScript, Tailwind CSS
- Supabase PostgreSQL database schema with 8 core tables
- Campaign CRUD operations (list, create, edit, delete)
- Audience segments and topics management
- Manual message matrix UI (segment × topic combinations)
- Sprint and task board with Kanban-style status management
- Basic dashboard layout with sidebar navigation

**Out of Scope (Sprint 2-3):**
- LLM/AI integration (Campaign Orchestrator agent)
- Content calendar generation
- Risk module
- Export/PDF functionality
- Multi-user/auth system (v1 is single-user)
- Political-specific modules

### Success Criteria

1. ✅ Users can create campaigns with campaign_type, dates, and goal_type
2. ✅ Users can manage audience segments and topics for each campaign
3. ✅ Users can build message matrices by adding messages to segment × topic combinations
4. ✅ Users can create sprints and add tasks with status tracking
5. ✅ All CRUD operations work without errors
6. ✅ Database schema supports campaign-type-independent architecture
7. ✅ Responsive UI works on mobile, tablet, and desktop
8. ✅ No console errors in development mode

### Dependencies

**External:**
- Supabase account and project setup
- Node.js 20.x LTS
- Next.js 15.0.0, React 19.0.0, TypeScript 5.3.0
- Tailwind CSS 3.4.0
- Supabase JS 2.39.0

**Internal:**
- None (greenfield project)

---

## Story Map - Epic 1

```
Foundation Layer
├── Story 1: Project Setup + Database Schema
│   └── Next.js init, Supabase schema, TypeScript types
│
Core Functionality Layer
├── Story 2: Campaign CRUD + Segments/Topics Management
│   └── Campaign operations, audience and topic management
│
User Experience Layer
└── Story 3: Message Matrix + Sprint/Task Board
    └── Message matrix UI, sprint planning, Kanban board
```

---

## Stories - Epic 1

### Story 1.1: Project Setup and Database Schema

As a **developer**,
I want **a properly initialized Next.js project with Supabase database schema**,
So that **I have a solid foundation to build campaign management features on**.

**Acceptance Criteria:**

**Given** I have Node.js 20.x and a Supabase account
**When** I run the project setup commands
**Then** I have a Next.js 15 project with TypeScript, Tailwind CSS, and Supabase client configured

**And** the Supabase database has 8 tables (campaigns, goals, segments, topics, messages, channels, sprints, tasks) with proper foreign keys and constraints

**And** TypeScript types are generated from the database schema

**And** environment variables are properly configured

**Prerequisites:** None (first story)

**Technical Notes:** 
- Use `create-next-app@latest` with TypeScript and App Router
- Install Shadcn/ui for UI components
- Create Supabase migration file with all enum types and tables
- Generate TypeScript types using `supabase gen types`
- Set up path aliases in tsconfig.json

**Estimated Effort:** 3 points (2-3 days)

---

### Story 1.2: Campaign CRUD and Audience Management

As a **campaign manager**,
I want **to create and manage campaigns with audience segments and topics**,
So that **I can organize my campaign planning around specific audiences and messaging themes**.

**Acceptance Criteria:**

**Given** I am on the campaigns page
**When** I create a new campaign with name, campaign_type, dates, and goal_type
**Then** the campaign is saved to the database and appears in the campaign list

**And** I can edit campaign details and delete campaigns

**And** I can add/edit/delete audience segments with demographics and psychographics

**And** I can add/edit/delete topics for the campaign

**And** all CRUD operations work without errors

**Prerequisites:** Story 1.1 (database schema must exist)

**Technical Notes:**
- Implement `/app/campaigns` pages (list, new, [id])
- Create API routes: `/api/campaigns`, `/api/segments`, `/api/topics`
- Use Server Components for data fetching
- Implement form validation
- Use Shadcn/ui form components

**Estimated Effort:** 5 points (3-5 days)

---

### Story 1.3: Message Matrix and Sprint/Task Board

As a **campaign manager**,
I want **to build message matrices and manage sprints with tasks**,
So that **I can plan my campaign messaging and track execution tasks**.

**Acceptance Criteria:**

**Given** I have a campaign with segments and topics
**When** I view the message matrix page
**Then** I see a table with segments as rows and topics as columns

**And** I can add messages to any segment × topic combination

**And** I can create sprints with dates and focus goals

**And** I can add tasks to sprints and change their status (todo → in_progress → done)

**And** the sprint board displays tasks in Kanban columns

**And** all data persists correctly in the database

**Prerequisites:** Story 1.2 (campaigns, segments, topics must exist)

**Technical Notes:**
- Implement message matrix UI with table layout
- Create `/api/messages`, `/api/sprints`, `/api/tasks` endpoints
- Build Kanban board component (3 columns)
- Implement task status updates
- Add proper error handling and loading states

**Estimated Effort:** 5 points (3-5 days)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 13 points

**Estimated Timeline:** 8-13 days (approximately 2-3 weeks with buffer)

**Story Sequence:**
1. Story 1.1: Foundation (must complete first)
2. Story 1.2: Core functionality (depends on 1.1)
3. Story 1.3: User experience (depends on 1.2)

---

