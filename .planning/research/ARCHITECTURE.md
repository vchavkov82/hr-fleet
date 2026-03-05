# Architecture Research: AI Dedup & Entity Resolution

**Domain:** Duplicate detection, entity resolution, and data quality for a Go + PostgreSQL job platform
**Researched:** 2026-02-26
**Confidence:** HIGH

## System Overview

The dedup system integrates into the existing Go backend as new components layered across three existing architectural tiers: AI pipeline, worker layer, and admin API. No new services are introduced -- everything lives inside the existing Go binary.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                Admin Panel (Vite + React + MUI)                        │
│  ┌──────────────────────┐  ┌───────────────────────┐  ┌───────────────────────────┐   │
│  │ Duplicate Review     │  │ Merge Execution UI    │  │ Batch Operations Panel   │   │
│  │ Queue Dashboard      │  │ (approve/reject/edit) │  │ (scan, cleanup, stats)   │   │
│  └──────────┬───────────┘  └───────────┬───────────┘  └─────────────┬─────────────┘   │
│             │                          │                            │                  │
├─────────────┴──────────────────────────┴────────────────────────────┴──────────────────┤
│                         Go Backend API (:8080/api/v1/admin)                             │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           NEW: dedup_handler.go                                    │ │
│  │  /admin/dedup/scan              POST  — trigger batch duplicate scan               │ │
│  │  /admin/dedup/companies         GET   — list company duplicate groups              │ │
│  │  /admin/dedup/companies/{id}    GET   — get single duplicate group detail          │ │
│  │  /admin/dedup/companies/merge   POST  — execute company merge                     │ │
│  │  /admin/dedup/companies/dismiss POST  — dismiss false positive                    │ │
│  │  /admin/dedup/jobs              GET   — list job duplicate groups                  │ │
│  │  /admin/dedup/jobs/{id}         GET   — get single job duplicate group detail      │ │
│  │  /admin/dedup/jobs/merge        POST  — execute job merge                         │ │
│  │  /admin/dedup/jobs/dismiss      POST  — dismiss false positive                    │ │
│  │  /admin/dedup/stats             GET   — dedup dashboard stats                     │ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Worker Layer (goroutines)                              │ │
│  │  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────────────────┐ │ │
│  │  │ NEW: Dedup       │  │ MODIFIED: Scrape  │  │ EXISTING: Company Enrichment   │ │ │
│  │  │ Scanner Worker   │  │ Queue Processor   │  │ Worker (unchanged)             │ │ │
│  │  │ (periodic batch) │  │ (+ inline dedup)  │  │                                │ │ │
│  │  └────────┬─────────┘  └────────┬──────────┘  └────────────────────────────────┘ │ │
│  │           │                     │                                                 │ │
│  └───────────┴─────────────────────┴─────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           AI Pipeline (platform/ai/)                               │ │
│  │  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐                │ │
│  │  │ EXISTING:        │  │ NEW: Company       │  │ NEW: Job         │                │ │
│  │  │ JobEnricher      │  │ DedupMatcher       │  │ DedupMatcher     │                │ │
│  │  │ CompanyEnricher  │  │ (AI + heuristic)   │  │ (AI + heuristic) │                │ │
│  │  └──────────────────┘  └───────────────────┘  └──────────────────┘                │ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                Data Layer                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL   │  │ Meilisearch  │  │ NEW:         │  │ NEW:                     │  │
│  │ companies    │  │ jobs index   │  │ dedup_groups │  │ merge_log               │  │
│  │ jobs         │  │              │  │ dedup_pairs  │  │ (audit trail)           │  │
│  │ (+ new cols) │  │ (reindex     │  │              │  │                          │  │
│  │              │  │  after merge)│  │              │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### NEW Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `dedup_handler.go` | `platform/server/` | Admin API endpoints for dedup review, merge, dismiss, scan triggers |
| `dedup_scanner.go` | `platform/worker/` | Background worker: periodic batch scanning for duplicates |
| `company_dedup.go` | `platform/ai/` | AI + heuristic matching for company entities |
| `job_dedup.go` | `platform/ai/` | AI + heuristic matching for job entities |
| `merge.go` | `platform/worker/` | FK-cascading merge execution with audit logging |
| `dedup.sql` | `queries/` | sqlc queries for dedup tables |
| `000026_dedup_tables.up.sql` | `migrations/` | New tables: dedup_groups, dedup_pairs, merge_log |

### MODIFIED Components

| Component | Location | Change |
|-----------|----------|--------|
| `scraping.go` → `findOrCreateCompany()` | `platform/worker/` | Add real-time dedup check before creating new companies |
| `scraping.go` → `processScrapedJob()` | `platform/worker/` | Add cross-source fuzzy dedup after hash dedup fails |
| `dedup.go` | `internal/scraper/` | Extend `NormalizeCompanyName()` with additional rules |
| `main.go` | `cmd/api/` | Wire new dedup scanner worker |
| `server.go` | `platform/server/` | Register new admin dedup routes |
| `companies.sql` | `queries/` | Add trigram similarity queries |

### UNCHANGED Components

| Component | Notes |
|-----------|-------|
| `CompanyEnricher` / `JobEnricher` | Enrichment pipeline stays independent; runs after dedup |
| `ReconciliationWorker` | Already handles Meilisearch sync; will naturally pick up merged records |
| `StalenessWorker` | Unaffected -- operates on final job IDs |
| `ExpirationWorker` | Unaffected |

## Recommended Project Structure (new files)

```
backend/
├── platform/
│   ├── ai/
│   │   ├── company_dedup.go       # Company duplicate detection (heuristic + AI)
│   │   └── job_dedup.go           # Job duplicate detection (heuristic + AI)
│   ├── server/
│   │   └── dedup_handler.go       # Admin API: review queue, merge, dismiss, scan
│   └── worker/
│       ├── dedup_scanner.go       # Background batch scanner worker
│       └── merge.go               # Merge execution engine (FK cascading)
├── queries/
│   └── dedup.sql                  # sqlc queries for dedup tables
└── migrations/
    └── 000026_dedup_tables.up.sql # Schema: dedup_groups, dedup_pairs, merge_log
```

### Structure Rationale

- **`platform/ai/company_dedup.go`**: Follows existing pattern of `company_enrich.go` -- AI operations on companies live in `platform/ai/`.
- **`platform/worker/merge.go`**: Merge execution is a data operation with FK cascading, not an AI call. It belongs in the worker package alongside `reconciliation.go` and `scraping.go` because it touches the same DB tables and follows the same batch-processing pattern.
- **`platform/worker/dedup_scanner.go`**: Follows existing `StartXxxWorker` pattern (ticker + ctx.Done). Lives alongside `staleness.go` which has the same "scan DB, check conditions, update status" pattern.
- **`dedup_handler.go`** in server: One handler file for all dedup endpoints, matching the existing pattern of `admin_handler.go`, `scraping_handler.go`, etc.
- **`queries/dedup.sql`**: Separate query file, matching existing pattern (one `.sql` per domain: `companies.sql`, `scraped_jobs.sql`, etc.).

## Database Schema Design

### New Tables

```sql
-- Migration 000026: Dedup tables for entity resolution

BEGIN;

-- ============================================================
-- dedup_groups: A cluster of entities believed to be the same
-- ============================================================
CREATE TABLE dedup_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     TEXT NOT NULL,  -- 'company' or 'job'
    status          TEXT NOT NULL DEFAULT 'pending',  -- pending|auto_merged|admin_merged|dismissed
    confidence      REAL NOT NULL DEFAULT 0.0,  -- 0.0-1.0 aggregate confidence
    match_method    TEXT NOT NULL,  -- 'exact_name'|'fuzzy_name'|'website'|'ai'|'mixed'
    survivor_id     UUID,  -- which entity was kept after merge (NULL until merged)
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    merged_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dedup_groups_type_status ON dedup_groups(entity_type, status);
CREATE INDEX idx_dedup_groups_confidence ON dedup_groups(confidence DESC) WHERE status = 'pending';

-- ============================================================
-- dedup_pairs: Individual entity pairs within a group
-- ============================================================
CREATE TABLE dedup_pairs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES dedup_groups(id) ON DELETE CASCADE,
    entity_a_id     UUID NOT NULL,  -- FK to companies or jobs (not enforced for polymorphism)
    entity_b_id     UUID NOT NULL,
    confidence      REAL NOT NULL DEFAULT 0.0,
    match_reasons   TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'exact_name', 'same_website', 'ai_match'}
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dedup_pairs_group ON dedup_pairs(group_id);
CREATE INDEX idx_dedup_pairs_entity_a ON dedup_pairs(entity_a_id);
CREATE INDEX idx_dedup_pairs_entity_b ON dedup_pairs(entity_b_id);
CREATE UNIQUE INDEX idx_dedup_pairs_unique ON dedup_pairs(entity_a_id, entity_b_id);

-- ============================================================
-- merge_log: Audit trail for every merge operation
-- ============================================================
CREATE TABLE merge_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID REFERENCES dedup_groups(id),
    entity_type     TEXT NOT NULL,
    survivor_id     UUID NOT NULL,      -- the record that was kept
    absorbed_id     UUID NOT NULL,      -- the record that was merged into survivor
    fk_updates      JSONB NOT NULL DEFAULT '{}',  -- {"jobs": 12, "applications": 3, ...}
    field_changes   JSONB NOT NULL DEFAULT '{}',  -- {"name": {"from": "...", "to": "..."}}
    merged_by       UUID REFERENCES users(id),    -- NULL = auto-merge
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merge_log_survivor ON merge_log(survivor_id);
CREATE INDEX idx_merge_log_absorbed ON merge_log(absorbed_id);

-- ============================================================
-- Companies: add normalized_name column for dedup indexing
-- ============================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS normalized_name TEXT;
CREATE INDEX idx_companies_normalized_name_trgm ON companies
    USING gin (normalized_name gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- Backfill normalized_name from existing names
-- (Worker will do this more thoroughly with suffix stripping)
UPDATE companies SET normalized_name = LOWER(TRIM(name))
WHERE normalized_name IS NULL AND deleted_at IS NULL;

COMMIT;
```

### Schema Rationale

- **`dedup_groups`** is entity-type-polymorphic (`entity_type = 'company'|'job'`) rather than separate tables. This simplifies the admin review queue which displays both types in a single feed sorted by confidence.
- **`dedup_pairs`** uses non-enforced FKs for `entity_a_id`/`entity_b_id` because they can reference either `companies.id` or `jobs.id`. The `entity_type` on the parent group disambiguates.
- **`merge_log`** stores `fk_updates` as JSONB for flexibility (the set of FK tables changes as the schema evolves). This follows the existing pattern used in `scrape_runs.errors` (JSONB) and `scrape_runs.details` (JSONB).
- **`normalized_name`** on companies is a materialized denormalization. It is populated by the dedup scanner worker using `NormalizeCompanyName()` from `internal/scraper/dedup.go`, and indexed with `gin_trgm_ops` for fast similarity queries.

## Architectural Patterns

### Pattern 1: Two-Phase Dedup (Heuristic Filter + AI Confirmation)

**What:** Fast heuristic pass generates candidate pairs; slow AI pass confirms and scores.
**When to use:** Every batch scan cycle. Keeps AI costs manageable by reducing candidates from O(n^2) to O(dozens).
**Trade-offs:** Heuristic pass may miss creative duplicates that only AI would catch; but running AI on all pairs is cost-prohibitive.

**Implementation:**

```go
// platform/ai/company_dedup.go

// CompanyDedupResult represents a detected duplicate pair.
type CompanyDedupResult struct {
    CompanyA     uuid.UUID
    CompanyB     uuid.UUID
    Confidence   float64    // 0.0-1.0
    MatchReasons []string   // ["exact_normalized_name", "same_website"]
    AIExplanation string    // From Claude when AI confirmation is used
}

// Phase 1: Heuristic candidate generation (fast, DB-only)
// Uses pg_trgm similarity + normalized_name matching
func FindCompanyDuplicateCandidates(ctx context.Context, queries *db.Queries) ([]DedupCandidate, error) {
    // 1. Exact normalized_name matches (confidence: 0.95)
    // 2. Trigram similarity > 0.7 on normalized_name (confidence: 0.5-0.9)
    // 3. Same website domain (confidence: 0.85)
    // 4. Same contact email domain (confidence: 0.6)
}

// Phase 2: AI confirmation (slow, only for medium-confidence candidates)
func ConfirmCompanyDuplicate(ctx context.Context, claude *ClaudeClient, a, b CompanyProfile) (float64, string, error) {
    // Send both company profiles to Claude for comparison
    // Returns confidence score + explanation
    // Only called for candidates with heuristic confidence 0.5-0.85
}
```

### Pattern 2: Confidence-Tiered Auto-Resolution

**What:** Three confidence tiers determine automatic vs manual handling.
**When to use:** Applied to every detected duplicate pair after scoring.
**Trade-offs:** Auto-merge threshold must be conservative to prevent data loss; too conservative means admin review queue grows large.

**Confidence tiers:**

| Confidence | Action | Rationale |
|------------|--------|-----------|
| >= 0.95 | Auto-merge (no admin review) | Exact name + same website -- false positive rate ~0% |
| 0.70 - 0.94 | Queue for admin review | Fuzzy match, needs human judgment |
| < 0.70 | Discard (don't create dedup_group) | Too uncertain, likely false positive |

```go
const (
    AutoMergeThreshold  = 0.95
    ReviewThreshold     = 0.70
    DiscardThreshold    = 0.70  // Below this, don't even store
)
```

### Pattern 3: Survivor Selection (Richest Data Wins)

**What:** When merging, algorithmically select which entity survives based on data completeness.
**When to use:** Every merge operation, both auto and manual.
**Trade-offs:** Algorithmic selection works for most cases but the admin can override in manual review.

**Scoring for company survivor selection:**

```go
func scoreCompany(c Company) int {
    score := 0
    if c.Website != ""        { score += 20 }
    if c.Description != ""     { score += 15 }
    if c.Logo != ""            { score += 10 }
    if c.AIEnrichedAt != nil   { score += 15 }
    if c.ContactEmail != ""    { score += 10 }
    if c.Size != nil           { score += 5  }
    if c.Source == "platform"  { score += 30 } // Native companies always preferred
    score += countJobs(c) * 2                   // More jobs = more established
    return score
}
```

### Pattern 4: FK-Cascading Merge in a Single Transaction

**What:** All FK reassignment + entity deletion happens in one PostgreSQL transaction.
**When to use:** Every merge execution.
**Trade-offs:** Long transaction for companies with many jobs, but data consistency is paramount. The transaction holds row-level locks, not table locks, so concurrent reads are unaffected.

```go
// platform/worker/merge.go

func MergeCompanies(ctx context.Context, pool *pgxpool.Pool, survivorID, absorbedID uuid.UUID, mergedBy *uuid.UUID) error {
    tx, err := pool.Begin(ctx)
    if err != nil {
        return err
    }
    defer tx.Rollback(ctx)

    queries := db.New(tx)

    // 1. Reassign all jobs
    jobCount, err := queries.ReassignCompanyJobs(ctx, db.ReassignCompanyJobsParams{
        FromCompanyID: absorbedID,
        ToCompanyID:   survivorID,
    })

    // 2. Reassign all users (company_member, company_admin)
    userCount, err := queries.ReassignCompanyUsers(ctx, ...)

    // 3. Reassign company_locations
    locCount, err := queries.ReassignCompanyLocations(ctx, ...)

    // 4. Reassign company_claims
    claimCount, err := queries.ReassignCompanyClaims(ctx, ...)

    // 5. Reassign company_contacts
    contactCount, err := queries.ReassignCompanyContacts(ctx, ...)

    // 6. Merge field values (fill survivor's empty fields from absorbed)
    err = queries.MergeCompanyFields(ctx, db.MergeCompanyFieldsParams{
        SurvivorID: survivorID,
        AbsorbedID: absorbedID,
    })

    // 7. Soft-delete the absorbed company
    err = queries.SoftDeleteCompany(ctx, absorbedID)

    // 8. Write merge_log entry
    err = queries.CreateMergeLog(ctx, db.CreateMergeLogParams{
        EntityType:  "company",
        SurvivorID:  survivorID,
        AbsorbedID:  absorbedID,
        FKUpdates:   json.Marshal(map[string]int{"jobs": jobCount, "users": userCount, ...}),
        MergedBy:    mergedBy, // nil for auto-merge
    })

    return tx.Commit(ctx)
}
```

## Data Flow

### Flow 1: Batch Duplicate Scan (Background Worker)

```
DedupScannerWorker (ticker: 6h)
    │
    ├──1. Backfill normalized_name on companies missing it
    │
    ├──2. Company dedup scan
    │     ├── SQL: self-join companies ON similarity(normalized_name) > 0.7
    │     ├── SQL: match companies with same website domain
    │     ├── Filter: skip pairs already in dedup_pairs (any status)
    │     ├── For confidence 0.5-0.85: call AI ConfirmCompanyDuplicate()
    │     ├── Create dedup_group + dedup_pairs for confirmed matches
    │     └── Auto-merge groups with confidence >= 0.95
    │
    ├──3. Job dedup scan
    │     ├── SQL: match jobs with same dedup_hash across companies
    │     ├── SQL: trigram similarity on title WHERE same normalized company
    │     ├── Filter: skip pairs already in dedup_pairs
    │     ├── Create dedup_group + dedup_pairs
    │     └── Auto-merge groups with confidence >= 0.95
    │
    └──4. Log scan stats
```

### Flow 2: Real-Time Dedup in Scraper Pipeline (Modified)

```
processScrapedJob(job)
    │
    ├── EXISTING: Check dedup_hash (exact match)
    ├── EXISTING: Check source_id (same source)
    │
    ├── NEW in findOrCreateCompany():
    │     ├── Step 1: Exact ILIKE match (existing)
    │     ├── Step 2: Normalized name match (NEW)
    │     │     └── NormalizeCompanyName() + exact match on normalized_name
    │     ├── Step 3: Website domain match (NEW)
    │     │     └── If scraped company has website, check domain match
    │     ├── Step 4: Trigram similarity > 0.85 on normalized_name (NEW)
    │     │     └── Only if steps 1-3 fail; prevents creating "Acme Ltd" + "Acme"
    │     └── Step 5: Create new company (existing, now rare)
    │
    ├── EXISTING: Create job record
    ├── EXISTING: AI enrichment pipeline
    └── EXISTING: Meilisearch sync
```

### Flow 3: Admin Merge Review

```
Admin Panel
    │
    ├── GET /admin/dedup/companies?status=pending
    │     └── Returns dedup_groups sorted by confidence DESC
    │
    ├── GET /admin/dedup/companies/{groupID}
    │     └── Returns group detail: both entities with all fields side-by-side
    │
    ├── POST /admin/dedup/companies/merge
    │     ├── Body: { group_id, survivor_id }
    │     ├── Server: MergeCompanies() in single TX
    │     ├── Server: Update dedup_group status = 'admin_merged'
    │     ├── Server: Trigger Meilisearch reindex for affected jobs
    │     └── Response: merge_log entry with FK update counts
    │
    └── POST /admin/dedup/companies/dismiss
          ├── Body: { group_id }
          └── Server: Update dedup_group status = 'dismissed'
```

### Flow 4: Post-Merge Cascade Effects

```
After merge completes:
    │
    ├── Meilisearch: Jobs previously under absorbed company
    │     need reindexing (company_name changed in search doc)
    │     → Handled by existing ReconciliationWorker (15-min cycle)
    │     → Or triggered immediately via searchClient.UpsertJob() in merge TX
    │
    ├── Job slugs: Unchanged (slug is per-job, not per-company)
    │
    ├── Applications: Unchanged (FK is on job_id, not company_id)
    │
    └── Company page: Old slug → 404 (soft-deleted)
          → Consider: Add slug redirect table or just let it 404
```

## Integration Points with Existing Components

### Scraper Pipeline Integration

The key integration point is `findOrCreateCompany()` in `platform/worker/scraping.go` (line 455). Currently it does a simple `FindCompanyByNameILike` (case-insensitive exact match). The modification adds fallback steps for normalized name match and trigram similarity before creating a new company.

**Critical constraint:** This function is called synchronously during scrape processing. Additional queries must be fast (indexed). The trigram GIN index on `normalized_name` ensures sub-millisecond similarity lookups.

### AI Pipeline Integration

The new `CompanyDedupMatcher` follows the same dual-provider pattern as `CompanyEnricher`:
- Claude (primary) for high-quality comparison
- Ollama (fallback) for when Claude is unavailable
- Skip if both unavailable (degrade to heuristic-only)

It uses the same `ClaudeClient` and `Client` (Ollama) instances already wired through `main.go`. The dedup scanner worker receives these via the same dependency injection pattern as `StartCompanyEnrichmentWorker`.

### Worker Infrastructure Integration

```go
// cmd/api/main.go — new worker startup (follows existing pattern exactly)

go worker.StartDedupScannerWorker(ctx, pool, workerQueries, serverClaudeClient, aiClient, 6*time.Hour)
```

The scanner worker follows the identical `StartXxxWorker(ctx, ..., interval)` pattern used by all 7 existing workers. It uses the `pool` (pgxpool) directly for merge transactions (needs `pool.Begin(ctx)` not `queries` which wraps a single conn).

### Admin API Integration

New routes are added to the existing admin route group in `server.go`:

```go
// In setupRoutes(), inside the r.Route("/api/v1/admin", ...) block:
r.Get("/dedup/stats", s.handleAdminDedupStats)
r.Post("/dedup/scan", s.handleAdminTriggerDedupScan)
r.Get("/dedup/companies", s.handleAdminListCompanyDuplicates)
r.Get("/dedup/companies/{groupID}", s.handleAdminGetCompanyDuplicateGroup)
r.Post("/dedup/companies/merge", s.handleAdminMergeCompanies)
r.Post("/dedup/companies/dismiss", s.handleAdminDismissCompanyDuplicate)
r.Get("/dedup/jobs", s.handleAdminListJobDuplicates)
r.Get("/dedup/jobs/{groupID}", s.handleAdminGetJobDuplicateGroup)
r.Post("/dedup/jobs/merge", s.handleAdminMergeJobs)
r.Post("/dedup/jobs/dismiss", s.handleAdminDismissJobDuplicate)
```

These follow the exact same pattern as existing admin endpoints (auth middleware already applied to the route group).

## FK Dependency Map for Merge Operations

### Company Merge: Tables with company_id FK

| Table | FK Column | ON DELETE | Merge Action |
|-------|-----------|-----------|--------------|
| `jobs` | `company_id` | CASCADE | UPDATE SET company_id = survivor |
| `jobs` | `claimed_by_company_id` | SET NULL | UPDATE SET claimed_by_company_id = survivor |
| `users` | `company_id` | SET NULL | UPDATE SET company_id = survivor |
| `company_locations` | `company_id` | CASCADE | UPDATE SET company_id = survivor |
| `company_claims` | `company_id` | CASCADE | UPDATE SET company_id = survivor |
| `company_contacts` | `company_id` | CASCADE | UPDATE SET company_id = survivor |
| `company_invites` | `company_id` | CASCADE | UPDATE SET company_id = survivor |

### Job Merge: Tables with job_id FK

| Table | FK Column | ON DELETE | Merge Action |
|-------|-----------|-----------|--------------|
| `applications` | `job_id` | CASCADE | UPDATE SET job_id = survivor |
| `job_locations` | `job_id` | CASCADE | Merge unique entries, skip duplicates |
| `job_categories` | `job_id` | CASCADE | Merge unique entries, skip duplicates |
| `job_skills` | `job_id` | CASCADE | Merge unique entries, skip duplicates |
| `job_benefits` | `job_id` | CASCADE | Merge unique entries, skip duplicates |
| `salary_audits` | `job_id` | CASCADE | UPDATE SET job_id = survivor |
| `saved_jobs` | `job_id` | CASCADE | UPDATE SET job_id = survivor (ignore dups) |
| `job_invitations` | `job_id` | CASCADE | UPDATE SET job_id = survivor |

**Junction table handling:** For many-to-many junction tables (`job_skills`, etc.), the merge must handle potential unique constraint violations. The pattern is: INSERT INTO ... ON CONFLICT DO NOTHING for each row from absorbed, then DELETE the absorbed rows.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (~2K companies, ~5K jobs) | Single-pass full scan every 6h. No partitioning needed. |
| 10K companies, 50K jobs | Incremental scanning: only scan companies/jobs modified since last scan. Add `dedup_scanned_at` column. |
| 100K+ companies | Switch self-join to blocking/windowing: group by first 3 chars of normalized_name, only compare within blocks. Reduces O(n^2) to O(n * block_size). |

### First Bottleneck: AI API Costs

The batch scan could generate hundreds of candidate pairs needing AI confirmation. At ~$0.01 per Claude API call, 500 pairs = $5/scan. Mitigations:
1. Heuristic filter aggressively (only send genuinely ambiguous pairs to AI)
2. Cache AI decisions in `dedup_pairs` (never re-evaluate dismissed pairs)
3. Use Ollama for initial pass, Claude only for confirmation of borderline cases

### Second Bottleneck: Merge Transaction Duration

A company with 500+ jobs creates a long transaction during merge. Mitigations:
1. Batch UPDATE in chunks of 100 within the transaction
2. Use SKIP LOCKED for concurrent merge operations
3. Monitor transaction duration; alert if > 10s

## Anti-Patterns

### Anti-Pattern 1: Running AI on Every Pair

**What people do:** Send every company pair through Claude for comparison.
**Why it's wrong:** O(n^2) pairs = thousands of API calls. Slow, expensive, rate-limited.
**Do this instead:** Heuristic filter first (normalized name, website, trigram). Only send ambiguous candidates (confidence 0.5-0.85) to AI. High-confidence matches (exact name) don't need AI.

### Anti-Pattern 2: Deleting Instead of Soft-Deleting Absorbed Entities

**What people do:** Hard-delete the absorbed company/job after merge.
**Why it's wrong:** Breaks referential integrity with any system that cached the old ID (search index, browser bookmarks, API caches). Also prevents undo.
**Do this instead:** Soft-delete the absorbed entity (set `deleted_at`). The merge_log provides undo capability. Old URLs can be redirected or return a helpful "merged into X" message.

### Anti-Pattern 3: Eager Merge Without Review Queue

**What people do:** Auto-merge everything above a low threshold.
**Why it's wrong:** False positive merges are destructive and hard to undo. "Amdocs" and "Amdata" have high trigram similarity but are different companies.
**Do this instead:** Conservative auto-merge threshold (0.95) for near-certain matches only. Everything else goes to admin review queue. Better to have a larger queue than merge the wrong companies.

### Anti-Pattern 4: Separate Dedup Tables Per Entity Type

**What people do:** Create `company_dedup_groups`, `job_dedup_groups`, etc.
**Why it's wrong:** Duplicates admin UI code, query patterns, and worker logic. The dedup review workflow is identical regardless of entity type.
**Do this instead:** Polymorphic `dedup_groups` with `entity_type` column. One admin review queue, one set of API endpoints, one worker.

### Anti-Pattern 5: Normalizing Company Names in Application Code Only

**What people do:** Run normalization at comparison time, never persisting the result.
**Why it's wrong:** Can't index it, can't query it efficiently, normalization runs repeatedly.
**Do this instead:** Materialize `normalized_name` as a database column with a GIN trigram index. Update it during scraper ingest and via batch backfill. This enables fast SQL self-joins for candidate generation.

## Suggested Build Order

The build order is designed to deliver value incrementally while respecting dependencies.

### Phase 1: Foundation (Migration + Normalization)
1. Migration `000026_dedup_tables.up.sql` (schema)
2. Extend `NormalizeCompanyName()` in `internal/scraper/dedup.go`
3. Backfill `normalized_name` on all existing companies (one-time migration + worker)
4. Add `normalized_name` population to `findOrCreateCompany()` for new companies
5. sqlc queries for dedup tables (`queries/dedup.sql`)

**Rationale:** Schema and normalization are prerequisites for everything else. No AI needed yet.

### Phase 2: Heuristic Duplicate Detection
1. Company dedup scanner: exact normalized name match + website domain match
2. Job dedup scanner: cross-company title similarity for same-source jobs
3. `DedupScannerWorker` background worker (ticker pattern)
4. Admin API: list duplicate groups, get group detail, stats endpoint

**Rationale:** Heuristic matching catches the majority of duplicates (exact name variants, same website). Provides immediate value before AI is integrated.

### Phase 3: Merge Execution Engine
1. `merge.go`: Company merge with FK cascading (single TX)
2. `merge.go`: Job merge with FK cascading
3. Admin API: merge and dismiss endpoints
4. Meilisearch reindex trigger after merge
5. `merge_log` audit trail

**Rationale:** Can't deliver value from detection without the ability to act on it. Merge is the critical path.

### Phase 4: Real-Time Dedup in Scraper
1. Modify `findOrCreateCompany()` to use enhanced matching (normalized name + trigram)
2. Add cross-source job fuzzy matching in `processScrapedJob()` after hash dedup
3. Test with actual scraper runs

**Rationale:** Once batch cleanup is working, prevent new duplicates from entering the system.

### Phase 5: AI Confirmation Layer
1. `company_dedup.go`: Claude/Ollama comparison for medium-confidence pairs
2. `job_dedup.go`: AI comparison for ambiguous job pairs
3. Integration into dedup scanner (Phase 2 AI confirmation step)
4. Confidence threshold tuning based on real data

**Rationale:** AI adds value for borderline cases but is not needed for the majority of clear duplicates. Defer to keep initial complexity low.

### Phase 6: Admin UI
1. Dedup dashboard with stats (pending groups, auto-merged count, dismissed count)
2. Company duplicate review queue (side-by-side comparison)
3. Job duplicate review queue
4. Merge action with survivor selection
5. Dismiss action with optional reason

**Rationale:** Admin UI development can progress in parallel with backend phases 2-5 using mock data, but full integration requires backend completion.

## Sources

- [PostgreSQL pg_trgm documentation](https://www.postgresql.org/docs/current/pgtrgm.html) -- trigram similarity functions, GIN indexing
- [System Design for Entity Resolution](https://www.sheshbabu.com/posts/system-design-for-entity-resolution/) -- blocking strategies, scaling considerations
- [Entity Resolution at Scale: Dedup Strategies](https://medium.com/@shereshevsky/entity-resolution-at-scale-deduplication-strategies-for-knowledge-graph-construction-7499a60a97c3) -- confidence scoring patterns
- Existing codebase: `internal/scraper/dedup.go` (NormalizeCompanyName, Hash, IsFuzzyMatch)
- Existing codebase: `platform/worker/scraping.go` (findOrCreateCompany, processScrapedJob)
- Existing codebase: `platform/ai/enrich.go` (dual-provider pattern)
- Existing codebase: `platform/worker/company_enrichment.go` (batch worker pattern)

---
*Architecture research for: AI Dedup & Entity Resolution integration into Jobs Platform v1.1*
*Researched: 2026-02-26*
