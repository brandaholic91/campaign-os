# Project Overview

**Campaign OS** is a comprehensive communication and social media campaign planning tool designed to streamline the creation, management, and execution of marketing campaigns. It leverages AI to assist users in strategy generation, content planning, and drafting.

## Key Features

-   **Campaign Management**: Create and track campaigns with specific goals, timelines, and budgets.
-   **Strategic Planning**: Define goals, target segments, and key topics.
-   **Execution Planning**: Organize work into sprints and tasks.
-   **Content Management**: Plan content slots and generate AI-assisted drafts.
-   **AI Integration**: Built-in AI copilot for context-aware assistance.

## Technology Stack Summary

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16 (App Router), React, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **AI** | CopilotKit |
| **Language** | TypeScript |

## Repository Structure

The project is structured as a **Monolith** within a single repository.

-   **`app/`**: Contains both the frontend application and backend API routes.
-   **`components/`**: Reusable UI components and feature-specific logic.
-   **`supabase/`**: Database configuration and migrations.

## Quick Links

-   [Architecture Documentation](./architecture.md)
-   [Source Tree Analysis](./source-tree-analysis.md)
-   [Development Guide](./development-guide.md)
-   [API Contracts](./api-contracts.md) _(To be generated)_
-   [Data Models](./data-models.md) _(To be generated)_
