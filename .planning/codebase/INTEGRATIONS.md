# External Integrations

**Analysis Date:** 2025-02-22

## APIs & External Services

### Search & Indexing

**Meilisearch:**
- Service: Full-text search engine
- What it's used for: Job and candidate profile indexing with faceted search
- Configuration:
  - Host: `meilisearch:7700` (internal Docker) or `MEILI_URL` env var
  - Master Key: `MEILI_MASTER_KEY` env var
  - Client: `meilisearch-go` (v0.36.0) in backend, `meilisearch` (v0.41.0) in jobs app
- Indices: `jobs`, `candidates`
- Sync trigger: Background workers sync data on schedule or via admin API

### Web Scraping Services

**Browser Automation:**
- Service: Browserless Chrome (headless browser container)
- What it's used for: Web scraping job listings from dev.bg, jobs.bg
- Connection: WebSocket at `ws://chrome:3000` (mapped from port 9222 in compose)
- Client: `chromedp` (v0.14.2) in Go backend
- Configuration:
  - Enable via: `SCRAPER_ENABLED=true`
  - WebSocket: `CHROME_WS_URL` env var (default `ws://chrome:3000`)
- Scraping targets:
  - **dev.bg**: Tech jobs scraper (selector: `div.job-list-item` cards)
  - **jobs.bg**: General jobs scraper (parallel scraper support)

**HTML Parsing:**
- Service: Public websites (dev.bg, jobs.bg)
- What it's used for: Parse job listings, descriptions, company info
- Client: `goquery` (v1.11.0)

---

## Data Storage

### Primary Database

**PostgreSQL:**
- Type: Relational database
- Provider: Self-hosted via Podman/Docker
- Image: postgres:16-alpine
- Connection: `DATABASE_URL=postgres://jobs:jobs_dev@postgres:5432/jobs?sslmode=disable`
- Client: pgx (v5.8.0) in backend, Prisma in Node apps
- Persistence: `postgres_data` volume

**Database Models:**
- Users (candidate, company_member, company_admin, platform_admin)
- Companies (with subscription tiers: free, standard, premium)
- Jobs (pending_review, published, paused, closed states)
- Job Applications (applied, interview, offer, rejected, withdrawn)
- Candidates (resumes, experience, education, skills)
- Scraped Jobs (with source tracking: dev.bg, jobs.bg)
- Scraper Configurations (per-source, per-category)

**Migrations:** `backend/migrations/000001-000013` (SQL up/down)

### File Storage

**Local Filesystem:**
- Path: `/data/uploads` (mounted volume in Docker)
- Used for: Resume uploads, company logos
- Volume mount: `uploads_data` in compose

### Search/Caching

**Meilisearch:**
- Purpose: Full-text search with facets (skills, locations, experience levels)
- Persistence: `meilisearch_data` volume
- Not used for caching, only for search indexing

---

## Authentication & Identity

### Local Authentication (Jobs App)

**NextAuth.js:**
- Framework: next-auth 5.0.0-beta.30 with Prisma adapter
- Strategy: JWT sessions stored in httpOnly cookies
- Login page: `/auth/login`
- Credentials flow:
  - Email + password login
  - Password hashed with bcryptjs (bcryptjs v3.0.3)
  - User lookup in Prisma: `prisma.user.findUnique(email)`
  - Session creation with JWT
- Social OAuth:
  - Google OAuth via `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` env vars
  - Provider: Google (optional, credentials-only for MVP)

**Configuration:**
- Session secret: Stored in `NEXTAUTH_SECRET` env var
- Callback URL: `/api/auth/callback/...`
- Sign-in page: `/auth/login`
- Database adapter: Prisma + PostgreSQL

### Admin Panel Authentication

**JWT-based:**
- Endpoint: `/auth/login` (backend API)
- Token location: localStorage (`jobs_access_token`, `jobs_refresh_token`)
- Backend verifies: `JWT_SECRET` env var (min 32 chars)
- Client: Axios interceptors in `@jobs/api-client` SDK
- Admin endpoints protected by role check: `platform_admin` role required

**Credentials:**
- Admin: `admin@jobs.dev` / `Admin123!` (development only)

---

## Email & Notifications

### Transactional Email

**SMTP Provider:**
- Type: SMTP server (configurable)
- Configuration:
  - Host: `SMTP_HOST` env var
  - Port: `SMTP_PORT` env var (default 587)
  - Username: `SMTP_USER` env var
  - Password: `SMTP_PASSWORD` env var
  - From address: `SMTP_FROM` env var
- Client: Go standard library `net/smtp`
- Implementation: `platform/email/sender.go` (SMTPSender)

**Fallback:**
- Development mode: ConsoleSender (logs to stdout instead of sending)
- No SMTP configured: Uses console sender

**Email Templates:**
- Location: `platform/email/templates.go`
- Events: Invite confirmations, application status updates

### Environment Variables

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (587 for TLS)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password (credentials stored in .env, never committed)
- `SMTP_FROM` - Sender email address

---

## AI & LLM Services

### Ollama (Optional)

**Purpose:** AI skill extraction, resume parsing, job description analysis
- Service: Ollama container (optional profile: `--profile ai`)
- Model: llama3.2:3b (default, configurable)
- Connection: `OLLAMA_URL` env var (default `http://ollama:11434`)
- Client: Direct HTTP requests from Go backend
- Workers: `AI_WORKER_COUNT` env var (default 2)
- Enable via: docker-compose with `--profile ai` flag

**Use Cases:**
- Extract skills from resumes (NLP)
- Match candidate profiles to jobs
- Auto-categorize job descriptions

---

## CI/CD & Deployment

### Hosting

**Current:**
- Self-hosted via Podman/Docker on physical servers
- Target domain: Configurable via `DOMAIN` env var
- TLS: Caddy reverse proxy (automatic certificate provisioning)

**Deployment:**
- Manual deployment via podman-compose
- Environment files: `.env.production`
- Optional scrapers and AI via compose profiles

### Container Orchestration

**Compose Files:**
- `compose.yml` - Development (all services)
- `compose.production.yml` - Production hardened (Caddy TLS, security settings)
- Service dependencies: postgres healthcheck → backend startup

### GitHub Actions (CI)

**Workflows:** `.github/workflows/*`
- Build & test on push
- Deploy to production (manual trigger)

---

## Webhooks & Callbacks

### Incoming Webhooks

**Scraper Queue Callbacks:**
- Endpoint: `/admin/scraping/queue` (backend)
- Purpose: Query scraper job status
- No external webhooks consumed

**Application Webhooks:**
- Not currently implemented
- Infrastructure ready for future integrations

### Outgoing Webhooks

**None currently implemented**

---

## Admin API Integration

### Backend Admin Endpoints

**User Management:**
- `POST /admin/users` - Create user
- `GET /admin/users?limit=X&offset=Y` - List users with pagination
- `GET /admin/users/:id` - User details
- `PUT /admin/users/:id` - Update user
- `PUT /admin/users/:id/suspend` - Suspend user

**Company Management:**
- `GET /admin/companies` - List with pagination
- `POST /admin/companies` - Create company
- `GET /admin/companies/:id` - Company details
- `PUT /admin/companies/:id` - Update company

**Job Moderation:**
- `GET /admin/jobs/pending` - Pending jobs queue
- `GET /admin/jobs/:id/review` - Job review
- `POST /admin/jobs/:id/approve` - Approve job
- `POST /admin/jobs/:id/reject` - Reject job

**Scraper Management:**
- `GET /admin/scraping/config` - List scraper configs
- `POST /admin/scraping/config` - Create new scraper config
- `GET /admin/scraping/queue` - Queue status
- `GET /admin/scraping/stats` - Scraping statistics

**Taxonomy Management:**
- `GET /admin/taxonomy/job-functions` - Hierarchical job categories

---

## Integration Environment Configuration

### Development Environment (.env)

```
# Meilisearch
MEILI_MASTER_KEY=jobs_meili_dev_key
MEILI_URL=http://meilisearch:7700

# Scraping (Browserless Chrome)
CHROME_WS_URL=ws://chrome:3000
SCRAPER_ENABLED=false

# Email (optional in dev)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@jobs.dev

# AI (optional)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
AI_WORKER_COUNT=2
```

### Production Environment (.env.production)

**Required:**
- `DOMAIN` - Main domain for TLS
- `JWT_SECRET` - Random 32+ char string
- `NEXTAUTH_SECRET` - Random 32+ char string
- `POSTGRES_PASSWORD` - Strong database password
- `MEILI_MASTER_KEY` - Strong Meilisearch key
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` - Transactional email

**Optional:**
- `SCRAPER_ENABLED=true` + `CHROME_WS_URL` - Web scraping
- `OLLAMA_URL` + `AI_WORKER_COUNT` - AI features

---

## Security & Secrets

### Credential Storage

- **Never committed:** `.env` files, `.env.*.local` files
- **Gitignore patterns:** `.env*`, `**/node_modules`, `.next`, `.vite`
- **Secrets locations:**
  - Development: Local `.env` files
  - Production: Container environment or secret manager (setup at deployment)

### API Keys in Use

- `JWT_SECRET` - JWT signing key (minimum 32 characters)
- `NEXTAUTH_SECRET` - Session encryption (32+ chars)
- `MEILI_MASTER_KEY` - Search engine admin access
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` - Google OAuth (if enabled)
- `SMTP_USER`, `SMTP_PASSWORD` - Email service credentials

---

## Third-Party Dependencies Management

### Go Dependencies

**Direct imports** tracked in `backend/go.mod`:
- Web scraping: chromedp, goquery, robotstxt
- Database: pgx/v5
- Search: meilisearch-go
- API: chi/v5, cors
- Auth: golang-jwt/jwt
- Utilities: uuid, slug, edlib

**Updates:** Manual `go get` with testing

### Node.js Dependencies

**Workspace pattern:**
- Root workspace (Jobs App, Admin) uses Bun & pnpm
- Each app has own package-lock/pnpm-lock
- Pinned versions in package.json for critical packages

**Dependency scanning:**
- Regular audits via `npm audit`, `bun outdated`
- Security patches applied promptly

---

## Rate Limiting & API Quotas

**Not currently implemented** but infrastructure ready:
- Meilisearch: API key-based rate limiting available
- Admin API: Protected by JWT auth + role checks (no public rate limits)

---

## Integration Patterns

### Server-to-Server (Backend → External)

1. **Backend → Meilisearch**: HTTP REST API, native client
2. **Backend → Browserless Chrome**: WebSocket (chromedp)
3. **Backend → PostgreSQL**: Direct pgx connection
4. **Backend → SMTP Server**: SMTP protocol
5. **Backend → Ollama**: HTTP REST requests

### Client-to-Server (Frontend → Backend)

1. **Jobs App → Go API**: Fetch HTTP + tRPC + Query state
2. **Admin Panel → Go API**: Axios SDK (@jobs/api-client)
3. **HR App → Static (no backend calls)**

### Search & Discovery

1. **Jobs App → Meilisearch**: Direct JS client for instant search
2. **Jobs App → Go API**: Fallback for complex filters
3. **Admin Panel → Go API → Meilisearch**: Indirect via backend

---

*Integration audit: 2025-02-22*
