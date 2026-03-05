# Codebase Concerns

**Analysis Date:** 2026-02-22

## Tech Debt

**Duplicate route structure in jobs pages:**
- Issue: `/jobs/jobs/` subdirectory creates awkward URL structure; routes at `/jobs/junior/`, `/jobs/management/`, etc. coexist with `/jobs/jobs/junior/`, `/jobs/jobs/management/`
- Files:
  - `app/jobs/apps/www/src/app/jobs/junior/page.jsx` (real page)
  - `app/jobs/apps/www/src/app/jobs/jobs/junior/page.jsx` (re-exports real page via `export { default } from '../../../jobs/junior/page'`)
  - `app/jobs/apps/www/src/app/jobs/management/page.jsx` (real page)
  - `app/jobs/apps/www/src/app/jobs/jobs/management/page.jsx` (similar re-export pattern)
  - `app/jobs/apps/www/src/app/jobs/[slug]/page.tsx` vs `app/jobs/apps/www/src/app/jobs/jobs/[slug]/page.tsx` (both 600+ lines)
- Impact: Confusing file structure, potential for accidental routing conflicts, SEO duplicate content risk, maintenance burden
- Fix approach: Delete entire `/jobs/jobs/` directory; consolidate all routes directly under `/jobs/`; update internal links

**File extension inconsistency (JSX vs TSX):**
- Issue: Codebase mixes `.jsx`, `.tsx`, `.js`, and `.ts` files without clear convention
- Files:
  - Server components: `app/(home-page)/page.tsx` (TypeScript)
  - Client components: `components/pages/home/hero/hero.jsx` (JSX)
  - Pages: `app/jobs/page.tsx`, `app/about/page.jsx`, `app/pricing/page.jsx`
  - Auth: `app/auth/login/page.tsx`, `app/auth/register/page.tsx` (TypeScript)
  - Management routes: `app/jobs/management/management-client.jsx` (JSX, contains hardcoded Bulgarian text)
- Impact: Developer friction, inconsistent tooling setup, TypeScript not fully leveraged for type safety
- Fix approach: Establish rule: all source files use `.tsx` (TypeScript with JSX), rename `.jsx` → `.tsx` in batches starting with `components/`, then `app/`

**Tailwind color config duplication:**
- Issue: Several colors defined twice with identical or slightly different values
- Files: `app/jobs/apps/www/tailwind.config.js` lines 158-201
  - `yellow` defined at line 158-160 AND again at line 194-201
  - `blue` defined at line 167-170 AND again at line 215-223
  - `pink` defined at line 184-192 AND used in secondary colors
  - `purple` and `orange` also have multiple definitions
- Impact: Maintenance confusion, unclear which definition is canonical, merge conflicts on color updates, CSS bundle bloat
- Fix approach: Single-pass audit of tailwind config; consolidate all color definitions, remove duplicates, verify no unused colors in components

**Unimplemented email invitation feature:**
- Issue: Company admin invitation flow exists in tRPC router but never sends emails
- Files: `app/jobs/apps/www/src/server/routers/company.ts:169` — `inviteUser` mutation returns `{ success: true }` without sending any email
- Impact: Invited company users have no way to receive invite links; feature appears working but does nothing
- Fix approach: Implement email service integration (SendGrid/Resend), send email with token, implement invitation claim flow

**Type Safety Issues with `as any` casts:**
- Issue: Multiple `as any` type assertions bypassing TypeScript safety checks
- Files:
  - `app/jobs/apps/www/src/lib/auth.ts:9` — PrismaAdapter cast
  - `app/jobs/apps/www/src/server/routers/company.ts:97` — company update data
  - `app/jobs/apps/www/src/lib/auth.ts:68,76` — token and session user casts
- Impact: Masks potential type errors at runtime, makes refactoring unsafe, reduces IDE autocomplete
- Fix approach: Create proper TypeScript interfaces for Prisma types, auth token shape, and session user shape

## Known Bugs

**Duplicate slug job imports from scraper (FIXED 2026-02-22):**
- ~~Symptoms: Same job title+company scraped multiple times from different category URLs creates duplicate entries~~
- ~~Files: `backend/platform/worker/scraping.go` processScrapedJob function~~
- Status: RESOLVED — duplicate deduplication now working (512 jobs found → 434 unique jobs imported); catches `pgconn.PgError` code `23505`

**Job application forms previously non-functional (FIXED 2026-02-11):**
- ~~Symptoms: Job application form appeared to work but never submitted to backend~~
- ~~Trigger: Form only sent analytics, never called backend apply API~~
- Status: RESOLVED — `uploadResume()` and `applyToJob()` added to `lib/api-client.ts`; form now submits to backend

**Server component violations in some auth routes:**
- Issue: Auth layout and some pages may have `'use client'` boundary violations
- Files: `app/jobs/apps/www/src/components/shared/layout/layout.jsx` is sync-only (safe), but older pages may import async components
- Current status: Most violations fixed; Layout pattern now safe to import in both server and client components
- Remaining risk: Legacy pages at `app/about/`, `app/pricing/`, `app/contact/`, `app/for-candidates/`, `app/for-employers/` still use old JSX patterns; risk if async dependencies added

## Security Considerations

**INTERNAL_API_URL environment variable:**
- Risk: If `INTERNAL_API_URL` is misconfigured, could expose internal Docker network IPs in frontend logs or error messages
- Files: `app/jobs/apps/www/src/lib/api-client.ts:6-18`
- Current mitigation: Falls back to `NEXT_PUBLIC_API_URL` or localhost; assumes Docker network isolation
- Recommendations:
  - Never log or expose `INTERNAL_API_URL` values in client bundles
  - Validate that `INTERNAL_API_URL` is only used server-side (already correct in this file)
  - Document that `INTERNAL_API_URL` must be internal-network-only (e.g., `http://backend:8080`)

**NextAuth credentials provider with passwordHash:**
- Risk: Credentials provider relies on bcrypt comparison; if password_hash is missing, silently returns null instead of error
- Files: `app/jobs/apps/www/src/lib/auth.ts:26-62`
- Current mitigation: bcrypt.compare() handles timing-safe comparison; no plaintext password logging observed
- Recommendations:
  - Add rate limiting on login attempts (not currently implemented)
  - Ensure password reset flow clears old sessions/tokens (verify in auth handler)
  - Session strategy is JWT — verify token expiration and refresh rotation elsewhere

**Role handling with single `roleAssignments[0]`:**
- Risk: If user has multiple roles, only first is used; admin/platform_admin roles could be silently dropped
- Files: `app/jobs/apps/www/src/lib/auth.ts:53`
- Current mitigation: RBAC is per-company; each user typically has one primary company
- Recommendations: Document that multi-role scenarios not supported; update if platform admin accounts need both platform + company roles

**Token exposure in API calls:**
- Risk: Resume upload and job application pass `token` as optional parameter; could be logged in network inspection
- Files: `app/jobs/apps/www/src/lib/api-client.ts:244-308`
- Current mitigation: Only called from client components; token sourced from session; no hardcoded values
- Recommendations: Consider using automatic auth header injection via fetch wrapper instead of manual token parameter

## Performance Bottlenecks

**Database queries on every homepage render:**
- Problem: Homepage fetches job/company counts from Prisma every 5 minutes (revalidate=300)
- Files: `app/jobs/apps/www/src/app/(home-page)/page.tsx:29-31`
- Cause: Direct Prisma queries during SSR don't benefit from HTTP cache; counts change infrequently but queried every 5min
- Improvement path:
  - Pre-compute job/company counts in separate worker, store in cache layer (Redis)
  - Use `unstable_cache()` for Prisma results
  - Consider moving count queries to Go backend endpoint instead of direct Prisma

**Duplicate search API calls in JobsClient:**
- Problem: `JobsClient` initializes with SSR results but may refetch on mount if URL params change
- Files: `app/jobs/apps/www/src/components/pages/jobs/jobs-client.tsx`
- Cause: No automatic sync between URL params and client state on hydration
- Improvement path: Ensure `initialResults` passed correctly; use `useTransition()` to batch param updates

**Tailwind config size:**
- Problem: Extended config with 435 lines; many custom colors, keyframes, utilities may increase CSS bundle
- Files: `app/jobs/apps/www/tailwind.config.js` (435 lines)
- Impact: CSS bundle includes unused color variants (e.g., `gray-new.*`, duplicated colors)
- Improvement path: Audit used colors in components via build analysis; remove unused definitions; verify PurgeCSS is working

**Component re-renders on every search param change:**
- Problem: JobsClient and related components may re-render unnecessarily on search param updates
- Files: `app/jobs/apps/www/src/components/pages/jobs/` (multiple client components)
- Cause: No memoization of props or state; search params coupled tightly to component state
- Improvement path: Use `useMemo()` and `useCallback()` to prevent unnecessary re-renders; consider URL-as-source-of-truth pattern

## Fragile Areas

**Jobs detail page routes (duplicate structure):**
- Files:
  - `app/jobs/apps/www/src/app/jobs/[slug]/page.tsx` (600 lines)
  - `app/jobs/apps/www/src/app/jobs/jobs/[slug]/page.tsx` (also 600 lines)
- Why fragile: Two identical routes at different levels; changes to one won't sync to other; both fetch job data from backend
- Safe modification: Delete entire `/jobs/jobs/` directory; keep only `/jobs/[slug]/page.tsx`; test both `/jobs/tech-job` and old routes redirect correctly
- Test coverage: Ensure slug pages work for all categories, skills, and location filters

**Layout component usage across server/client boundary:**
- Files: `app/jobs/apps/www/src/components/shared/layout/layout.jsx` (sync, 70 lines)
- Why fragile: Layout is sync component used in server pages AND `'use client'` pages; any addition of async children could break routing
- Safe modification: Keep Layout always sync; any async data fetching must happen in pages, not Layout; document this pattern
- Test coverage: Verify Layout renders in both server pages (homepage, jobs page) and client boundaries (auth pages)

**Old JSX pages with hardcoded Bulgarian content:**
- Files:
  - `app/jobs/apps/www/src/app/about/page.jsx` — hardcoded Bulgarian "За нас"
  - `app/jobs/apps/www/src/app/pricing/page.jsx` — hardcoded "Ценообразуване"
  - `app/jobs/apps/www/src/app/contact/page.jsx` — hardcoded "Контакт"
  - `app/jobs/apps/www/src/app/jobs/management/management-client.jsx` (lines 30-35, 54, etc.) — "Начало", "IT Обяви", "Води екипи"
- Why fragile: Legacy code mixed with new TypeScript patterns; uses old import paths (e.g., `components/shared/layout` instead of `@/components`); hardcoded text blocks make i18n impossible
- Safe modification: Migrate to TypeScript + path aliases one page at a time; add i18n support or extract strings; test routing after each migration
- Test coverage: Screenshot tests recommended for visual-heavy pages

**Homepage Prisma count fallback:**
- Files: `app/jobs/apps/www/src/app/(home-page)/page.tsx:28-35` — try/catch around Prisma queries
- Why fragile: If Prisma fails, page renders with fallback counts (both 0); no user feedback about data freshness; assumes counts display correctly when unavailable
- Safe modification: Test with DB unavailable; verify error logging works; ensure fallback UI is clear (e.g., "Loading job count...")
- Test coverage: Test homepage with simulated DB connection failure

**Route parameter handling in jobs pages:**
- Files:
  - `app/jobs/apps/www/src/app/jobs/page.tsx:17-57` — searchParams parsing
  - `app/jobs/apps/www/src/app/jobs/jobs/page.tsx` — identical parsing in wrong location
- Why fragile: searchParams validation is manual (parseInt, type checking); no schema validation; easy to introduce bugs when adding new filters
- Safe modification: Create shared validation schema (Zod) for searchParams; share between both route locations
- Test coverage: Test invalid/missing searchParams; test boundary conditions (salary_min > salary_max)

## Scaling Limits

**Scraper queue processing:**
- Current capacity: 512 jobs scraped from dev.bg (434 unique after dedup); no limit enforced in Go backend
- Limit: Queue can grow unbounded if Chrome instances crash or requests timeout; no circuit breaker
- Cause: No error recovery strategy, retry limit, or dead-letter queue for failed scrapes
- Scaling path:
  - Add scrape job timeout (30s per page)
  - Implement exponential backoff with max 3 retries
  - Add dead-letter queue for failed URLs
  - Monitor queue depth; alert if > 1000 jobs pending

**Prisma connection pool (frontend):**
- Current: Frontend Prisma client uses default pool size (10 connections)
- Limit: Under high load, DB queries may queue if > 10 concurrent requests
- Cause: Not tuned for concurrent SSR + tRPC requests during traffic spikes
- Scaling path:
  - Benchmark connection usage under load
  - Increase pool size if bottleneck confirmed (`connection_limit` in Prisma)
  - Consider separate Prisma instance for SSR vs tRPC

**Job search index size (Meilisearch):**
- Current: Single `jobs` index with ~434 jobs indexed
- Limit: No documented index size limits; facet queries may slow if index grows to 100k+ jobs
- Cause: Unknown indexing strategy; no retention policy for stale jobs
- Scaling path:
  - Set up Meilisearch index reset on nightly job expiration
  - Monitor index size and query latency as job count grows
  - Plan for index sharding if facet queries exceed 500ms

## Dependencies at Risk

**NextAuth.js 5.0 beta:**
- Risk: Frontend uses `next-auth@5.0-beta.x`; beta versions can have breaking changes
- Files: `app/jobs/apps/www/src/lib/auth.ts`, package.json
- Impact: Auth flow could break on minor updates; no LTS guarantees
- Migration plan: Lock to specific beta version; plan upgrade path to 5.0 stable when released; test full auth flow on upgrade

**Prisma 6.x adapter compatibility:**
- Risk: `@auth/prisma-adapter` may not be fully compatible with Prisma 6.19; `as any` cast suggests type mismatch
- Files: `app/jobs/apps/www/src/lib/auth.ts:2,9`
- Current mitigation: Adapter cast to `any` masks type incompatibility
- Migration plan: Once NextAuth 5.0 stable releases, upgrade both together; implement custom adapter with proper typing if needed

**Meilisearch 0.41 client stability:**
- Risk: Meilisearch JS client v0.41 may have bugs or memory leaks with newer Node versions
- Files: Dependencies in package.json
- Impact: Search latency, index corruption, or client crashes possible if library has unpatched bugs
- Migration plan: Check Meilisearch client changelog; consider upgrade to 0.45+ if available

## Missing Critical Features

**Email notifications not implemented:**
- What's missing: Company admin invitations, password reset emails, application confirmation emails
- Blocks: User invitation feature is complete in UI but non-functional; password reset flow incomplete
- Current state: Hardcoded `TODO: Send invitation email` at `company.ts:169`
- Fix approach: Integrate SMTP email service (SendGrid/Resend); send invitation tokens; implement claim flow

**Rate limiting on job applications:**
- What's missing: No limit on how many jobs a user can apply to in a time window
- Blocks: Prevents abuse (bot applications, spam)
- Current state: Go backend accepts any application without rate limit check
- Fix approach: Add rate limit middleware in Go backend (e.g., max 10 applications per day)

**Resume storage backend:**
- What's missing: No file storage configured (AWS S3, Supabase Storage, local filesystem)
- Blocks: Resume upload API exists but no storage implementation visible
- Current state: `uploadResume()` in api-client.ts posts to Go backend; backend storage not verified
- Fix approach: Verify Go backend has storage configured; implement S3/blob storage for production

**Email verification for user registration:**
- What's missing: User signup may not require email verification
- Blocks: Cannot trust email addresses; account takeover risk; prevents account recovery
- Fix approach: Add email verification token on signup; verify before allowing login

## Test Coverage Gaps

**Homepage component integration:**
- What's not tested: Homepage layout with Prisma fallbacks; hero section responsive behavior; all child components
- Files: `app/jobs/apps/www/src/app/(home-page)/page.tsx`, Hero, PlatformCards, CoreFeatures, PopularCategories, DualCta
- Risk: Homepage crash due to missing data props could go unnoticed until production
- Priority: High

**Server/client component boundary violations:**
- What's not tested: Ensuring Layout is never mistakenly marked `'use client'`; testing async imports in sync components
- Files: Throughout `src/app/` and `src/components/`
- Risk: Silent hydration mismatch errors in production; blank page renders
- Priority: Medium

**Job detail page with missing job:**
- What's not tested: 404 handling when job slug doesn't exist
- Files: `app/jobs/apps/www/src/app/jobs/[slug]/page.tsx` (600 lines)
- Risk: Users see unhandled errors instead of proper 404 page
- Priority: Medium

**Authentication flow with multi-role users:**
- What's not tested: Edge case where user has multiple roles; only first role is used
- Files: `app/jobs/apps/www/src/lib/auth.ts:53`
- Risk: Platform admin accounts with company role may lose admin privileges after login
- Priority: Low (multi-role not currently used)

**Search parameter validation:**
- What's not tested: Invalid searchParams (e.g., salary_min > salary_max, negative limit, cursor out of bounds)
- Files: `app/jobs/apps/www/src/app/jobs/page.tsx:17-57`
- Risk: Invalid params could cause backend errors or unexpected results
- Priority: Medium

**Duplicate route consolidation:**
- What's not tested: Both `/jobs/[slug]` and `/jobs/jobs/[slug]` routes after consolidation
- Files: Both job detail routes
- Risk: Consolidation could break old URLs; redirects must work
- Priority: Medium (after consolidation implemented)

---

*Concerns audit: 2026-02-22*
