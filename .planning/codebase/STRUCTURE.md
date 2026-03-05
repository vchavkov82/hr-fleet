# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
/home/vchavkov/src/jobs/
├── backend/                          # Go REST API (port 8080)
│   ├── cmd/
│   │   ├── api/main.go              # Server entry point
│   │   └── seed/                    # Database seeding scripts
│   ├── platform/                    # Core application code
│   │   ├── server/                  # HTTP handlers (*_handler.go)
│   │   ├── middleware/              # Auth, CORS, logging, RBAC
│   │   ├── auth/                    # JWT generation/validation
│   │   ├── config/                  # Environment config loading
│   │   ├── database/                # PostgreSQL connection pooling
│   │   ├── worker/                  # Background job processing
│   │   ├── search/                  # Search implementation
│   │   ├── email/                   # SMTP email sending
│   │   ├── ai/                      # Ollama AI client integration
│   │   └── response/                # JSON response wrappers
│   ├── internal/
│   │   ├── infra/search/            # Meilisearch client + PostgreSQL fallback
│   │   ├── scraper/                 # Web scraping (dev.bg, jobs.bg)
│   │   ├── api/                     # Internal API utilities
│   │   ├── domain/                  # Domain logic
│   │   └── app/                     # Application services
│   ├── db/                          # Generated sqlc queries (*.sql.go)
│   ├── queries/                     # SQL query definitions (*.sql)
│   ├── migrations/                  # Database migrations (Flyway)
│   └── docs/                        # Swagger API documentation
│
├── app/                             # Frontend applications
│   ├── jobs/                        # Job board (Next.js 14, port 3000)
│   │   ├── apps/www/src/
│   │   │   ├── app/                 # Next.js App Router pages
│   │   │   │   ├── (home-page)/     # Homepage groups
│   │   │   │   ├── api/             # Next.js API routes
│   │   │   │   ├── jobs/            # Job listing/detail pages
│   │   │   │   ├── employers/       # Company pages
│   │   │   │   ├── auth/            # Login/register pages
│   │   │   │   ├── dashboard/       # User dashboard (protected)
│   │   │   │   └── layout.tsx       # Root layout
│   │   │   ├── components/
│   │   │   │   ├── pages/           # Page-specific component sections
│   │   │   │   │   ├── jobs/        # Job board components
│   │   │   │   │   ├── employers/   # Employer profile components
│   │   │   │   │   └── home/        # Homepage sections
│   │   │   │   └── shared/          # Reusable UI components
│   │   │   │       ├── header/      # Navigation bar
│   │   │   │       ├── footer/      # Footer
│   │   │   │       ├── auth-modal/  # Login/signup modal
│   │   │   │       ├── button/      # Button component
│   │   │   │       ├── field/       # Form field component
│   │   │   │       └── ...
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts    # Typed Go backend API wrapper
│   │   │   │   ├── auth-client.ts   # Authentication client
│   │   │   │   ├── meilisearch.ts   # Search client
│   │   │   │   └── ...
│   │   │   ├── contexts/            # React contexts (auth, theme)
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── constants/           # SEO, links, forms, category data
│   │   │   ├── styles/              # Tailwind CSS, fonts
│   │   │   ├── types/               # TypeScript type definitions
│   │   │   ├── utils/               # Utility functions
│   │   │   └── scripts/             # Build scripts
│   │   ├── public/                  # Static assets
│   │   ├── tailwind.config.js       # Tailwind CSS configuration
│   │   ├── next.config.js           # Next.js configuration
│   │   └── package.json
│   │
│   └── hr/                          # HR SaaS marketing site (Next.js 14, port 3001)
│       ├── src/
│       │   ├── app/                 # Marketing pages (/, /features, /pricing, /blog, etc.)
│       │   ├── components/          # Page sections and reusable components
│       │   └── styles/              # Tailwind CSS
│       └── tailwind.config.js       # Dark navy + pink branding config
│
├── admin/                           # Admin panel workspace (pnpm, port 5173)
│   ├── packages/
│   │   ├── api-v4/                  # API SDK (tsup-compiled)
│   │   │   ├── src/                 # TypeScript source
│   │   │   ├── lib/                 # Compiled JavaScript output
│   │   │   └── package.json         # @linode/api-v4
│   │   └── manager/                 # Admin panel (Vite + React + MUI)
│   │       ├── src/
│   │       │   ├── App.tsx          # Root component
│   │       │   ├── index.tsx        # Entry point
│   │       │   ├── auth/            # Auth provider, login logic
│   │       │   ├── features/        # Feature modules (users, companies, jobs, etc.)
│   │       │   └── layout/          # Layout/navigation components
│   │       ├── vite.config.ts       # Vite configuration
│   │       └── package.json         # linode-manager
│   └── package.json                 # Workspace root
│
├── deploy/                          # Infrastructure as code
│   ├── podman-compose.yml           # Podman container orchestration
│   ├── Dockerfile                   # Image definitions
│   └── ...
│
├── Makefile                         # Build targets (dev-jobs, dev-hr, dev-admin, etc.)
├── go.mod / go.sum                  # Go module dependencies
└── ...
```

## Directory Purposes

**`backend/`** — Go REST API server
- Hosts all business logic and data mutations
- Single source of truth for application state
- Exposes `/api/v1/*` endpoints consumed by all frontends
- Runs on port 8080 (internal) or exposed to frontends

**`backend/platform/server/`** — HTTP request handlers
- Contains `*_handler.go` files (job_handler, company_handler, auth_handler, etc.)
- Each handler translates HTTP request → database query → JSON response
- Chi router groups handlers by resource and HTTP method

**`backend/platform/middleware/`** — Cross-cutting concerns
- Authentication (JWT validation)
- Authorization (role-based access, company access checks)
- CORS, logging, panic recovery, request ID tracking

**`backend/platform/worker/`** — Async job processing
- Queue-based scraper system (scraping.go, queue.go)
- AI extraction worker (ai_extraction.go)
- Job expiration, reconciliation, cleanup, staleness checks
- Started as goroutines during server startup

**`backend/db/` and `queries/`** — Data access layer
- `queries/*.sql` — SQL query definitions for sqlc compiler
- `db/*.sql.go` — Generated type-safe Go query functions
- Organized by domain: users.sql, jobs.sql, companies.sql, candidates.sql, etc.

**`backend/internal/infra/search/`** — Search abstraction
- Meilisearch client implementation
- PostgreSQL full-text search fallback
- Document formatting for both search backends
- Auto-selects based on availability

**`app/jobs/apps/www/src/app/`** — Next.js App Router pages (jobs board)
- Route files named `page.tsx` or `layout.tsx`
- Folder structure maps to URL paths: `/app/jobs/page.tsx` → `/jobs`
- Dynamic routes: `/app/jobs/[slug]/page.tsx` → `/jobs/{slug}`
- Grouped routes: `/(home-page)/page.tsx` → `/` (doesn't appear in URL)
- Protected routes via `auth-guard.tsx` wrapper (checks localStorage token)

**`app/jobs/apps/www/src/components/pages/`** — Page-specific sections
- Organized by page: `pages/jobs/`, `pages/employers/`, `pages/home/`
- Each section contains related components for that page
- Example: `pages/home/hero/`, `pages/home/platform-cards/`, etc.
- Server or client components depending on data fetching needs

**`app/jobs/apps/www/src/components/shared/`** — Reusable UI components
- Used across multiple pages
- Examples: Button, Field, Header, Footer, AuthModal
- Each component is a folder containing component file + styles

**`app/jobs/apps/www/src/lib/`** — Utility libraries and clients
- `api-client.ts` — Typed wrapper around `/api/v1` endpoints
- `auth-client.ts` — Auth-specific API calls (login, register, refresh)
- `meilisearch.ts` — Search client for full-text job search
- `trpc.ts` — tRPC client configuration (if used)
- `prisma.ts` — Prisma client initialization

**`app/jobs/apps/www/src/contexts/`** — React Context state
- `auth-modal-context.tsx` — Manages login/signup modal visibility
- Global state shared across component tree without prop drilling

**`app/jobs/apps/www/src/constants/`** — Static configuration
- `seo-data.ts` — Metadata for all pages
- `links.ts` — Navigation links and URL constants
- `forms.ts` — Form state constants (DEFAULT, LOADING, SUCCESS, ERROR)
- Category data for job filtering

**`app/hr/src/app/`** — HR SaaS marketing pages
- Static marketing pages: /, /features, /pricing, /blog, /hr-tools
- No backend API integration (standalone marketing site)
- Bulgarian-language content, dark navy + pink branding

**`admin/packages/api-v4/`** — API SDK (TypeScript/tsup)
- Compiles TypeScript source to JavaScript
- Exports typed API function wrappers
- Built separately before admin panel build

**`admin/packages/manager/`** — Admin dashboard application
- Vite-based React 19 + MUI 7 app
- Features organized by domain: `features/users/`, `features/companies/`, etc.
- Auth provider for JWT token storage and refresh
- API SDK used for all backend communication

## Key File Locations

**Entry Points:**
- `backend/cmd/api/main.go` — Start Go API server
- `app/jobs/apps/www/src/app/layout.tsx` — Root layout for jobs board
- `app/jobs/apps/www/src/app/(home-page)/page.tsx` — Homepage
- `app/hr/src/app/page.tsx` — HR app homepage
- `admin/packages/manager/src/App.tsx` — Admin panel root

**Configuration:**
- `backend/cmd/api/main.go` — Loads env vars via `config.Load()`
- `app/jobs/apps/www/next.config.js` — Next.js settings
- `admin/packages/manager/vite.config.ts` — Vite build settings
- `Makefile` — All build/dev commands

**Core Logic:**
- `backend/platform/server/` — All HTTP handlers
- `backend/platform/worker/` — Background job processing
- `backend/internal/infra/search/` — Search implementation
- `app/jobs/apps/www/src/lib/api-client.ts` — Frontend API communication

**Testing:**
- `backend/db/*_test.go` — Database query tests (if any)
- `app/jobs/apps/www/src/components/**/*.test.tsx` — Component tests (if any)
- `admin/packages/manager/cypress/` — E2E tests

## Naming Conventions

**Files:**

- Backend handlers: `{resource}_handler.go` (job_handler.go, company_handler.go)
- Backend workers: `{concern}.go` (scraping.go, ai_extraction.go, expiration.go)
- SQL queries: `{entity}.sql` (jobs.sql, users.sql, candidates.sql)
- React components: PascalCase, separate file per component (Button.tsx, Header.tsx)
- Pages: `page.tsx`, `layout.tsx` (Next.js convention)
- Styles: Tailwind utility classes in JSX, no separate CSS files
- Utils: camelCase function names (doNowOrAfterSomeTime, sendGtagEvent, getMetadata)

**Directories:**

- Backend services: kebab-case (auth-client, api-client, meilisearch-client)
- React features: kebab-case plural (components, features, hooks)
- Pages: kebab-case (home-page, for-employers, for-candidates)
- Query files: snake_case in SQL (user_id, company_slug)
- Database tables: snake_case (jobs, users, companies, job_applications)

**Functions:**

- Handler functions: `handle{Action}` (handleLogin, handleCreateJob, handleUploadResume)
- Query functions (sqlc-generated): `{Verb}{Entity}` (GetJob, ListJobs, CreateUser, UpdateCompanyProfile)
- Event handlers: `on{Event}` (onClick, onChange, onSuccess)
- Utility functions: camelCase (calculateSalaryRange, parseJobDescription)

## Where to Add New Code

**New Backend Endpoint:**

1. **Handler** → `backend/platform/server/{resource}_handler.go`
   - Add function: `func (s *Server) handle{Action}(w http.ResponseWriter, r *http.Request)`
   - Use `s.queries.{Method}()` for database access
   - Return JSON via `response.JSON()`

2. **SQL Query** → `backend/queries/{entity}.sql`
   - Write query with named parameters
   - sqlc will generate type-safe Go function in `db/{entity}.sql.go`
   - Re-run: `make generate` (or manual sqlc invocation)

3. **Route** → `backend/platform/server/server.go` `setupRoutes()` method
   - Add route: `r.Post("/api/v1/path", s.handleAction)`
   - Add middleware if needed (auth, role checks)

4. **Test** → `backend/platform/server/{resource}_handler_test.go`
   - Use table-driven tests
   - Mock database if needed

**New Frontend Page (Jobs App):**

1. **Page file** → `app/jobs/apps/www/src/app/{route}/page.tsx`
   - Server component by default (SSR for SEO)
   - If needs interactivity: export `'use client'` or create separate client component

2. **Components** → `app/jobs/apps/www/src/components/pages/{section}/`
   - Create folder for page section
   - Components inside folder (hero.tsx, filters.tsx, etc.)

3. **Styling** → Tailwind utility classes in JSX
   - Use `tailwind.config.js` colors and spacing
   - Use `clsx()` for conditional classes

4. **API calls** → `app/jobs/apps/www/src/lib/api-client.ts`
   - Add function to client if not exists
   - Use from component with React Query (`useQuery()`)

**New Component:**

1. **Location** → `/components/shared/` if reusable, `/components/pages/{section}/` if page-specific
2. **File** → `ComponentName.tsx` with export default
3. **Pattern:**
   - TypeScript interfaces for props
   - `'use client'` if uses hooks/state
   - Tailwind classes for styling
   - Export prop types as `export type ComponentProps = { ... }`

**New Admin Feature:**

1. **Feature module** → `admin/packages/manager/src/features/{featureName}/`
   - Create folder structure: `pages/`, `components/`, `types.ts`

2. **API calls** → Use `@linode/api-v4` SDK or extend it
   - Create typed wrappers if needed

3. **Test** → `admin/packages/manager/cypress/`
   - E2E tests in cypress/e2e or component tests in cypress/component

## Special Directories

**`backend/migrations/`:**
- Purpose: Database schema versioning (Flyway format)
- Generated: No (manually written)
- Committed: Yes
- Pattern: `{sequenceNumber}-{description}.sql` (e.g., `000001-create-users.sql`)
- How to add: New file with next sequence number, write UP/DOWN migrations

**`app/jobs/apps/www/.next/`:**
- Purpose: Build output directory
- Generated: Yes (during `next build`)
- Committed: No (in .gitignore)

**`admin/node_modules/` and `app/*/node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (pnpm install)
- Committed: No (in .gitignore)

**`backend/docs/`:**
- Purpose: Swagger/OpenAPI documentation (auto-generated from code comments)
- Generated: Yes (via swag CLI)
- Committed: Yes (for CI/CD)
- Pattern: Swag comments on handlers: `// @Summary`, `// @Router`, etc.

**`.env` files (not committed):**
- `.env.local` in jobs/admin workspace — Local overrides
- `.env.scraping` in backend — Scraper-specific config (Chrome URL, delays)
- Never committed; created manually for each environment

**`deploy/`:**
- Purpose: Docker/Podman configuration
- Generated: No
- Committed: Yes
- Contains: docker-compose.yml, Dockerfile, entrypoint scripts

---

## Development Workflow

**Starting development:**

```bash
# Terminal 1: Backend API
cd /home/vchavkov/src/jobs/backend
go run cmd/api/main.go

# Terminal 2: Jobs board
cd /home/vchavkov/src/jobs/app/jobs
pnpm dev

# Terminal 3: HR app
cd /home/vchavkov/src/jobs/app/hr
pnpm dev

# Terminal 4: Admin panel
cd /home/vchavkov/src/jobs/admin
pnpm dev
```

Or use Makefile shortcuts:
```bash
make dev-jobs      # Port 3000
make dev-hr        # Port 3001
make dev-admin     # Port 5173
```

**Building for production:**

```bash
# Build Go binary
cd backend && make build

# Build frontend apps
cd app/jobs && pnpm build
cd app/hr && pnpm build
cd admin && pnpm build
```

**Database changes:**

```bash
# Write new migration
echo "ALTER TABLE jobs ADD COLUMN new_field TEXT;" > backend/migrations/000006-add-field.sql

# Reset and run migrations (local dev)
make db-reset
```

**API SDK changes:**

```bash
# Modify SDK source
vim admin/packages/api-v4/src/types.ts

# Build SDK
cd admin/packages/api-v4 && pnpm build

# SDK automatically used by admin panel
```
