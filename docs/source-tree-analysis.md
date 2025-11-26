# Source Tree Analysis

## Directory Structure

```
campaign-os/
├── app/                     # Next.js App Router root
│   ├── api/                 # API Route Handlers (Backend)
│   │   ├── campaigns/       # Campaign management endpoints
│   │   ├── content-slots/   # Content slot endpoints
│   │   ├── messages/        # Message management endpoints
│   │   └── ...              # Other feature endpoints
│   ├── campaigns/           # Campaign feature pages
│   ├── layout.tsx           # Root layout (Providers, Navbar)
│   └── page.tsx             # Home page
├── components/              # React Components
│   ├── ui/                  # Reusable UI primitives (Shadcn/Radix)
│   ├── campaigns/           # Campaign-specific components
│   ├── messages/            # Message-specific components
│   ├── providers/           # Context providers (CopilotKit)
│   └── ...                  # Other feature components
├── lib/                     # Utilities and Libraries
│   ├── supabase/            # Supabase client configuration
│   └── utils.ts             # CN/Tailwind merge utilities
├── public/                  # Static assets
├── supabase/                # Database Configuration
│   └── migrations/          # SQL migration files (Schema source of truth)
├── types/                   # TypeScript type definitions
├── .env.local               # Environment variables (Supabase keys)
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
└── tailwind.config.ts       # Tailwind CSS configuration
```

## Critical Directories

### `app/`
The core of the application, containing both the frontend pages and the backend API routes.
-   **`app/api/`**: Acts as the backend server. Each folder represents a resource (e.g., `campaigns`) and contains a `route.ts` file defining HTTP methods (`GET`, `POST`, etc.).
-   **`app/[feature]/`**: Frontend pages for specific features (e.g., `app/campaigns/page.tsx`).

### `components/`
Contains all UI logic.
-   **`components/ui/`**: Low-level, reusable components (Buttons, Inputs, Dialogs) built with Radix UI and Tailwind. These are "dumb" components.
-   **`components/[feature]/`**: "Smart" components that may contain business logic or specific UI compositions for a feature.

### `supabase/migrations/`
Contains the database schema history.
-   This is the **source of truth** for the data model.
-   Files are timestamped (e.g., `20251120_initial_schema.sql`).
-   Includes table definitions, enums, indexes, and RLS policies.

### `lib/`
Shared utilities.
-   **`lib/supabase/`**: Contains `server.ts` and `client.ts` for initializing Supabase clients in different contexts (RSC vs Client).

## Entry Points

-   **Frontend**: `app/page.tsx` (Home) and `app/layout.tsx` (Root Layout).
-   **Backend**: `app/api/*/route.ts` files are the entry points for API requests.
-   **Database**: `supabase/migrations/` defines the initial state and evolution of the DB.
