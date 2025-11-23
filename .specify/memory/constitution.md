<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
Modified principles: N/A (initial creation)
Added sections: Core Principles (6 principles), Technology Stack, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section references constitution
  ✅ .specify/templates/spec-template.md - Aligned with constitution principles
  ✅ .specify/templates/tasks-template.md - Task organization reflects constitution principles
Follow-up TODOs: None
-->

# Campaign OS Constitution

## Core Principles

### I. Type-Safety First (NON-NEGOTIABLE)

TypeScript strict mode MUST be enabled. All code MUST be fully typed with no `any` types except where explicitly justified and documented. Type definitions MUST be shared between frontend and backend via shared type files. Runtime validation MUST use Zod schemas for API boundaries and database interactions. Rationale: Prevents entire classes of runtime errors, enables better IDE support, and ensures contract compliance across system boundaries.

### II. Component-Based Architecture

All UI functionality MUST be implemented as reusable React components. Components MUST be self-contained with clear props interfaces. Shared components MUST live in `components/ui/`. Feature-specific components MUST be co-located with their features. Components MUST follow single responsibility principle. Rationale: Enables code reuse, simplifies testing, and maintains consistent UI patterns across the application.

### III. Test-First Development (NON-NEGOTIABLE)

TDD/ATDD mandatory for all features: Acceptance criteria defined → Tests written → Tests fail → Implementation → Tests pass → Refactor. Critical user journeys MUST have E2E tests (Playwright). Business logic MUST have unit tests (Jest/Vitest). Component behavior MUST have component tests (React Testing Library). Red-Green-Refactor cycle strictly enforced. Rationale: Ensures features work as specified, prevents regressions, and enables confident refactoring.

### IV. Database Schema Migrations

All database changes MUST be versioned migration files in `supabase/migrations/`. Migrations MUST be reversible (include down migration or document why not). Schema changes MUST be reviewed before application code changes. Foreign key constraints MUST be enforced. Rationale: Enables safe database evolution, team collaboration, and production rollback capability.

### V. API-First Design

All data operations MUST go through Next.js API Routes. API endpoints MUST validate input with Zod schemas. API responses MUST have consistent error handling. API routes MUST be documented with request/response examples. Database queries MUST be abstracted in service layers, not directly in API routes. Rationale: Enables frontend/backend separation, supports future mobile clients, and centralizes business logic.

### VI. Responsive Design

All UI components MUST be responsive and tested at mobile (375px), tablet (768px), and desktop (1920px) breakpoints. Tailwind CSS utility classes MUST be used for styling. Custom CSS MUST be justified and documented. Accessibility standards (WCAG AA) MUST be met. Rationale: Ensures application works across all devices and is usable by all users.

## Technology Stack

**Frontend:**
- Next.js 15+ (App Router)
- React 19+
- TypeScript 5.3+ (strict mode)
- Tailwind CSS 3.4+
- Shadcn/ui component library

**Backend:**
- Next.js API Routes
- Supabase PostgreSQL (managed)
- Supabase JS client 2.39+

**Testing:**
- Jest/Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

**Development:**
- Node.js 20.x LTS
- TypeScript strict mode enabled
- ESLint + Prettier for code quality

## Development Workflow

**Feature Development:**
1. Create feature specification with user stories and acceptance criteria
2. Write failing tests (TDD/ATDD)
3. Implement minimal code to pass tests
4. Refactor while maintaining green tests
5. Code review required before merge

**Database Changes:**
1. Create migration file in `supabase/migrations/`
2. Test migration locally
3. Review migration with team
4. Apply migration to staging before production

**Code Quality:**
- All code MUST pass linting (`npm run lint`)
- All tests MUST pass (`npm test`)
- TypeScript MUST compile without errors
- No `console.log` statements in production code (use proper logging)

## Governance

This constitution supersedes all other development practices. All pull requests and code reviews MUST verify compliance with these principles. Any violation of NON-NEGOTIABLE principles MUST be justified in the Complexity Tracking section of the implementation plan. Amendments to this constitution require:

1. Documentation of the proposed change
2. Rationale for the change
3. Impact analysis on existing code and templates
4. Update to version number following semantic versioning:
   - MAJOR: Backward incompatible principle removals or redefinitions
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements

All team members MUST be notified of constitution amendments. The `.specify/templates/` directory MUST be updated to reflect any changes to principles or workflows.

**Version**: 1.0.0 | **Ratified**: 2025-11-23 | **Last Amended**: 2025-11-23
