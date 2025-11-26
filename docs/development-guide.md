# Development Guide

## Prerequisites

Ensure you have the following installed:

-   **Node.js**: Version 18+ (LTS recommended)
-   **npm**: Comes with Node.js
-   **Git**: For version control
-   **Supabase CLI** (optional but recommended for local DB management)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd campaign-os
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Environment Setup

1.  Copy the example environment file:
    ```bash
    cp .env.local.example .env.local
    ```

2.  Configure your `.env.local` with Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

## Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Testing

Run the test suite using Jest:

```bash
npm test
```

## Database Management

The project uses Supabase. Database schema changes are managed via migration files in `supabase/migrations/`.

To apply migrations locally (if using Supabase CLI):
```bash
supabase db reset
```

## Code Style

-   **Linting**: `npm run lint` (ESLint)
-   **Formatting**: Prettier (configured in project)
