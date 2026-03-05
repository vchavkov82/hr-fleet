# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Distributed microservices with clear separation between backend API (Go), multiple frontend applications (Next.js), and admin panel (React/Vite). Each service is independently deployable with shared contracts via API interfaces.

**Key Characteristics:**
- **Backend-driven API model** — All business logic and data mutations go through Go REST API (`http://localhost:8080/api/v1`)
- **Multiple frontend applications** — Three independent Next.js/React apps consuming the same backend API
- **Server Component-first (Next.js 14 App Router)** — Pages are Server Components by default; `'use client'` boundary applied only to interactive subtrees
- **Server/Client split pattern** — Page files (`.tsx/.jsx`) are async Server Components that fetch data and pass props to Client Components (`*-client.jsx`)
- **Async worker system** — Queue-based job processing for scraping, AI extraction, and background tasks
- **Search with fallback** — Meilisearch for fast full-text search with PostgreSQL fallback
- **Graceful degradation** — Optional services (Meilisearch, Ollama AI, scraper) fail gracefully without breaking core functionality

## Server/Client Component Architecture

**Pattern: Page (Server) + Client Component Split**

The jobs app (`/home/vchavkov/src/jobs/app/jobs/apps/www/src/app/`) uses a consistent split pattern:

**Server Component (Page File):**
- Files: `page.tsx`, `page.jsx` (no `'use client'`)
- Responsibilities:
  - Fetch data server-side using Prisma or Go API client
  - Pass ISR/revalidation directives (`export const revalidate = 300`)
  - Compose layout + Server Component subtree + Client Component
  - Handle metadata/SEO (via `export const metadata`)
- Example: `/app/(home-page)/page.tsx` — fetches job/company counts from Prisma, passes to `<Hero/>` (Server Component)
- Example: `/app/jobs/page.tsx` — fetches initial search results via `searchJobs()` from API, passes to `<JobsClient/>`

**Client Component (Interactive Subtree):**
- Files: `*-client.jsx`, `*-client.tsx` (starts with `'use client'`)
- Responsibilities:
  - Handle all state mutations (`useState`, `useCallback`)
  - Bind to user interactions (click, input, form submit)
  - Call API endpoints with user auth token
  - Manage filters, sorting, pagination
- Example: `/app/employers/employers-client.jsx` — filters companies, manages search state, renders results
- Example: `/app/jobs/junior/junior-client.jsx` — location filtering, rendering filtered job list
- Example: `/app/dashboard/layout.tsx` — sidebar navigation, logout button (client state)

**Critical Rule: Topbar is Async Server Component**
- Location: `src/components/shared/topbar/` (if used directly in server layouts)
- Cannot be placed in `'use client'` subtrees
- If topbar with dynamic data needed in client component, fetch server-side and pass as prop

**Async Server Components Everywhere:**
- `<Hero/>` receives `jobCount`, `companyCount` props from server-side fetch
- `<Layout/>` is a Server Component wrapping page content
- `<ClickableHeader/>` in `/jobs` page is Server Component composing both static and dynamic elements

## Layers

**Backend (Go) - API Layer:**
- Purpose: Serve as authoritative data source and business logic engine
- Location: `/home/vchavkov/src/jobs/backend/`
- Contains: HTTP handlers, middleware, database queries (sqlc-generated), authentication, authorization, worker orchestration
- Depends on: PostgreSQL (`pgx/v5`), Meilisearch (optional), Ollama (optional), SMTP server
- Used by: All three frontend apps via `/api/v1` endpoints

**Backend - Data Access Layer:**
- Purpose: Type-safe database operations via sqlc-generated queries
- Location: `/home/vchavkov/src/jobs/backend/db/` (generated from `queries/`)
- Contains: `queries.sql` → compiled to `*.sql.go` (users, jobs, companies, candidates, resumes, applications, etc.)
- Depends on: PostgreSQL connection pool (`pgxpool`)
- Used by: Server handlers and worker processes

**Backend - Worker/Job Queue Layer:**
- Purpose: Async processing: scraping queue, AI extraction, job expiration, reconciliation
- Location: `/home/vchavkov/src/jobs/backend/platform/worker/`
- Contains: Queue processor, scraper orchestrator, AI extraction worker, expiration/staleness checks
- Depends on: Database (queries), Search client (Meilisearch), Scraper registry, AI client (Ollama)
- Used by: Started as goroutines in `main()`

**Backend - Search Layer:**
- Purpose: Fast full-text search with fallback to PostgreSQL
- Location: `/home/vchavkov/src/jobs/backend/internal/infra/search/`
- Contains: Meilisearch client wrapper, PostgreSQL fallback search, document formatting
- Depends on: Meilisearch HTTP API (optional), PostgreSQL for fallback
- Used by: Job search handlers, candidate search handlers

**Frontend - Jobs App (Next.js 14):**
- Purpose: Job board application for candidates and employers
- Location: `/home/vchavkov/src/jobs/app/jobs/apps/www/src/`
- Contains: Pages (App Router with Server Components), React Client Components, API client, auth state, form handlers
- Depends on: Backend API, Meilisearch client (JS), Next.js auth providers, Prisma (SSR queries)
- Used by: End users via `http://localhost:3000`

**Frontend - HR App (Next.js 14):**
- Purpose: Bulgarian-language HR SaaS marketing site
- Location: `/home/vchavkov/src/jobs/app/hr/src/`
- Contains: Static/marketing pages, branding components, landing sections
- Depends on: Tailwind CSS, framer-motion, no backend API calls
- Used by: End users via `http://localhost:3001`

**Admin Panel (React/Vite):**
- Purpose: Admin dashboard for managing jobs, users, companies, scraper configs
- Location: `/home/vchavkov/src/jobs/admin/packages/manager/src/`
- Contains: Feature modules (users, companies, jobs, scraping), API SDK client, auth
- Depends on: API v4 SDK (`@linode/api-v4`), Axios, MUI 7, context-based auth
- Used by: Platform admins via `http://localhost:5173`

**API SDK (TypeScript/tsup):**
- Purpose: Shared typed client for communicating with Go backend
- Location: `/home/vchavkov/src/jobs/admin/packages/api-v4/src/`
- Contains: Axios HTTP client, typed API definitions, request/response mappers
- Depends on: Axios, TypeScript
- Used by: Admin panel, jobs app (via `api-client.ts` wrapper)

## Data Flow

**Homepage Render Flow (Server → Client):**

1. User visits `/`
2. `app/(home-page)/page.tsx` (Server Component) executes:
   - Fetches job count: `prisma.job.count({ where: { status: 'published' } })`
   - Fetches company count: `prisma.company.count({ where: { active: true } })`
   - Sets ISR revalidation: `export const revalidate = 300` (5 minutes)
3. Page renders Server Components in sequence:
   - `<Layout isHeaderSticky>` — server layout wrapper
   - `<Hero jobCount={n} companyCount={m} />` — server component receives data as props
   - `<TrustedCompanies/>`, `<PlatformCards/>`, `<CoreFeatures/>` — all Server Components
   - `<DualCta/>`, `<Footer/>` — static server components
4. HTML sent to client with precomputed counts
5. On next request (after 5 min), ISR regenerates page with fresh counts

**Jobs Search Flow (Page Server → API → Client):**

1. User visits `/jobs?q=react&experience_level=junior`
2. `app/jobs/page.tsx` (Server Component) executes:
   - Parses URL search params: `await searchParams` → extracts `q`, `experience_level`, etc.
   - Calls API: `searchJobs({ q: 'react', experience_level: 'junior', limit: 20 })`
   - Returns initial results as JSON: `{hits: [...], total: 42, facets: {...}}`
3. Page renders:
   - `<Layout>` wrapper (Server Component)
   - `<ClickableHeader/>` (Server Component with static header)
   - `<Suspense>` boundary with fallback text
   - `<JobsClient initialResults={initialResults} />` — Client Component receives initial data
4. Client Component mounts:
   - Binds state: `useState({ query, filters, results })`
   - If user refines filters → calls `searchJobs()` client-side
   - Updates URL via `useRouter().push(newUrl)`
   - Results re-fetch server-side or from API

**Job Application Flow (Client → API):**

1. User clicks "Apply" button in `apply-form.jsx` (Client Component)
2. Form collects: resume file + candidate info
3. On submit:
   - POST `/api/v1/candidates/me/resumes` (upload resume file) → returns `resumeID`
   - POST `/api/v1/jobs/{jobID}/apply` (apply with `resumeID`) → creates application record
4. Backend stores resume file to disk, creates application record
5. Success callback:
   - Closes modal
   - Shows confirmation toast
   - Redirects to `/dashboard/applications`

**Admin Login Flow (Client → API):**

1. User navigates to `/auth/login`
2. `page.tsx` is `'use client'` (interactive form required)
3. Renders login form with email/password inputs
4. On submit → calls `login(email, password)` from `lib/auth-client.ts`
5. API endpoint `POST /api/v1/auth/login` validates, returns JWT token
6. Frontend stores JWT in localStorage via NextAuth or custom AuthProvider
7. Subsequent API calls include `Authorization: Bearer {token}` header
8. Router redirects based on role: `/dashboard` for candidates, `/employers/dashboard` for company admins

**Authentication Flow:**

1. User submits login → `POST /api/v1/auth/login` → backend validates, returns JWT
2. Frontend stores JWT in localStorage (via NextAuth or custom auth provider)
3. Subsequent requests include `Authorization: Bearer {jwt}` header
4. Middleware validates JWT signature using `config.JWTSecret`
5. If valid: attach user context to request; if invalid: 401 response
6. Token refresh: `POST /api/v1/auth/refresh` (frontend auto-calls when token expires)

**State Management:**

- **Backend:** Authoritative source of truth — all state lives in PostgreSQL
- **Frontend (Jobs app):** Server-side data via Prisma/API, React Query for client state, Context API for auth modal + theme
- **Frontend (Admin panel):** AuthProvider context for JWT, React Query for data fetching
- **Frontend (HR app):** No backend state — static/marketing-only with framer-motion animations

## Key Abstractions

**Server (chi Router):**
- Purpose: Central HTTP router with middleware stack
- Examples: `/home/vchavkov/src/jobs/backend/platform/server/server.go`
- Pattern: `setupMiddleware()` → `setupRoutes()` → handlers grouped by resource (auth, jobs, companies, etc.)

**Handler Functions:**
- Purpose: Translate HTTP requests to database queries and API responses
- Examples: `job_handler.go`, `company_handler.go`, `candidate_handler.go`
- Pattern: `func (s *Server) handleGetJob(w http.ResponseWriter, r *http.Request)` → extract params, call `s.queries.GetJob()`, return JSON

**Middleware Chain:**
- Purpose: Cross-cutting concerns (CORS, auth, logging, recovery)
- Examples: `/home/vchavkov/src/jobs/backend/platform/middleware/`
- Pattern: `Recovery()` → `Logger()` → `CORS()` → optionally `Authenticate()` → `RequireRole()` → handler

**Search Client (Dual Architecture):**
- Purpose: Abstract away Meilisearch vs. PostgreSQL fallback
- Examples: `/home/vchavkov/src/jobs/backend/internal/infra/search/client.go`
- Pattern: `Search()` tries Meilisearch first; if unavailable or error, automatically falls back to PostgreSQL full-text search

**Worker Queue:**
- Purpose: Decouple scraping from HTTP requests
- Examples: `/home/vchavkov/src/jobs/backend/platform/worker/queue.go`
- Pattern: Config stored in DB → scheduled worker inserts jobs into `scrape_queue` → queue processor picks up jobs and executes

**API Client (TypeScript):**
- Purpose: Type-safe wrapper around Go backend endpoints
- Location: `/home/vchavkov/src/jobs/app/jobs/apps/www/src/lib/api-client.ts`
- Pattern: Exported functions (`applyToJob()`, `uploadResume()`, `searchJobs()`) handle base URL detection, error handling, retry logic
- Server-side: Use internal Docker URL (`INTERNAL_API_URL` or `http://backend:8080`)
- Client-side: Use public URL (`NEXT_PUBLIC_API_URL` or `http://localhost:8080`)

**Auth Client (TypeScript):**
- Purpose: Client-side authentication wrapper
- Location: `/home/vchavkov/src/jobs/app/jobs/apps/www/src/lib/auth-client.ts`
- Pattern: Exported functions (`login()`, `logout()`, `register()`) call backend auth endpoints, manage JWT in localStorage
- Used by: Client Components (`page.tsx` login page, `dashboard/layout.tsx` logout)

**AuthGuard (React Component):**
- Purpose: Protect routes by checking authentication and role
- Examples: `src/components/shared/auth-guard.tsx`
- Pattern: Wraps protected pages; redirects to login if not authenticated; checks `requiredRole` prop
- Used by: `/dashboard` layouts wrap children with `<AuthGuard requiredRole="candidate">`

**AuthModalContext (React Context):**
- Purpose: Global modal state for login/signup without page navigation
- Location: `src/contexts/auth-modal-context.jsx`
- Pattern: Provides `isOpen`, `modalType`, `openLogin()`, `openSignup()`, `closeModal()` methods
- Used by: Root layout provides context; nav components call `useAuthModal().openLogin()` on CTA clicks
- Note: Modal renders in root layout, not in page-specific boundaries

## Entry Points

**Backend API Server:**
- Location: `/home/vchavkov/src/jobs/backend/cmd/api/main.go`
- Triggers: `go run cmd/api/main.go` or Docker container start
- Responsibilities: Load config, connect to PostgreSQL, initialize search client and AI client, start HTTP server on port 8080, start background workers

**Jobs Frontend:**
- Location: `/home/vchavkov/src/jobs/app/jobs/apps/www/src/app/layout.tsx`
- Triggers: `pnpm dev` in `app/jobs` directory, runs Next.js dev server on port 3000
- Responsibilities: Render root layout, inject auth modal context + auth provider, set up theme provider, manage global client state

**Admin Panel:**
- Location: `/home/vchavkov/src/jobs/admin/packages/manager/src/App.tsx`
- Triggers: `pnpm dev` in `admin/` workspace, runs Vite on port 5173
- Responsibilities: Render app shell with navigation, initialize auth provider, load API SDK

**HR App:**
- Location: `/home/vchavkov/src/jobs/app/hr/src/app/page.tsx`
- Triggers: `pnpm dev` in `app/hr` directory, runs Next.js dev server on port 3001
- Responsibilities: Render marketing landing page (no backend integration)

## Error Handling

**Strategy:** Layered error handling with graceful degradation — critical errors propagate up; optional service failures (Meilisearch, Ollama) logged as warnings and fallback mechanisms activated.

**Patterns:**

- **Database errors** (`/home/vchavkov/src/jobs/backend/platform/response/`): Wrapped in standard JSON response format with error code and message
- **Missing optional services**: If Meilisearch unavailable → use PostgreSQL; if Ollama unavailable → skip AI extraction; if SMTP unavailable → log error and continue
- **Validation errors**: Request body validation via handler functions, return 400 with error details
- **Authentication errors**: Invalid/missing JWT → 401 Unauthorized
- **Authorization errors**: User lacks role/permissions → 403 Forbidden
- **Frontend error boundaries**: React error boundaries in critical sections (apply form, dashboard) to catch and display user-friendly messages
- **Client Component field validation**: React Hook Form validates client-side before submit (e.g., `/auth/login/page.tsx` validates email, password before POST)
- **Worker panics**: Recovery wrapper in queue processor catches panics, logs error, continues processing

## Cross-Cutting Concerns

**Logging:** Structured logging via `log/slog` (Go) and `console` / React Query logging (frontend)
- Backend: `slog.Info()`, `slog.Error()` with fields for context (user ID, job ID, error type)
- Frontend: Logged via browser console and optional analytics (Google Analytics via `utils/send-gtag-event`)

**Validation:**
- Backend: Middleware validates JWT; handlers validate request body via Go struct tags and explicit checks
- Frontend: React Hook Form + Yup/Zod schemas (e.g., `/auth/login/page.tsx` validates email, password before POST)
- Server Component: Prisma validates data shape on fetch

**Authentication:**
- JWT-based using HS256 secret (`config.JWTSecret`)
- Stored in browser localStorage (frontend) or cookie (NextAuth)
- Middleware extracts token from `Authorization: Bearer` header
- Roles: `candidate`, `company_member`, `company_admin`, `platform_admin`

**Authorization:**
- Middleware `RequireRole()` enforces role-based access control
- Frontend `<AuthGuard>` enforces role at component level (e.g., dashboard requires `candidate` role)
- Company context: `middleware.CompanyAccess()` checks user belongs to company
- Admin-only endpoints require `platform_admin` role

**CORS:** Configured via `middleware.CORS()` to allow frontend URLs from env vars

**File Uploads:**
- Resume files: Stored in local filesystem via `s.cfg.UploadsPath`
- Company assets (logo, cover, office photos): Stored in uploads directory
- Served via static file handler: `GET /uploads/{filename}`

**Server vs. Client Boundary:**
- Prisma queries only in Server Components — never import Prisma in `'use client'` files
- API client functions (`api-client.ts`) safe in both Server and Client Components
- Auth tokens: Client Components access via `useAuth()` hook; Server Components access via session middleware
- Avoid passing unserialized objects (functions, Date, Map) as props from Server → Client Components
