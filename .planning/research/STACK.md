# Stack Research: AI Data Quality & Duplicate Detection

**Domain:** Entity resolution, fuzzy matching, duplicate detection, batch data quality for a job platform
**Researched:** 2026-02-26
**Confidence:** HIGH

## Executive Summary

The existing stack already contains 90% of what is needed. The core insight: this is a **two-layer dedup problem** (fast candidate selection + AI verification) that maps perfectly onto PostgreSQL pg_trgm (already enabled) + the Anthropic Batch API (already available in the Go SDK). No new Go dependencies are required. The main work is wiring existing capabilities together with new SQL queries, a dedup worker, and admin review endpoints.

## What Already Exists (DO NOT add)

| Technology | Version | Already Used For | Reuse For Dedup |
|------------|---------|------------------|-----------------|
| `pg_trgm` extension | PostgreSQL built-in | Job title/description search indexes (migration 000004) | Company name similarity scoring, candidate pair selection |
| `github.com/hbollon/go-edlib` | v1.7.0 | `IsFuzzyMatch()` in `internal/scraper/dedup.go` -- Jaro-Winkler on titles/company names | Application-layer similarity scoring for company names and job titles |
| `github.com/anthropics/anthropic-sdk-go` | v1.26.0 | Job enrichment, company enrichment, contact extraction via tool use | AI-powered duplicate judgment (is this pair truly the same entity?) |
| `github.com/gosimple/slug` | v1.15.0 | URL slug generation | Company name normalization (slug-based canonical forms) |
| `dedup_hash` column on `jobs` table | -- | Hash-based exact dedup during scraping | Continue using for exact matches; fuzzy layer sits above |
| `NormalizeCompanyName()` | `internal/scraper/dedup.go` | Strips BG suffixes (OOD, EOOD, AD) and international suffixes (Ltd, LLC, Inc, GmbH) | Extend for broader normalization across all entity resolution |

## Recommended Stack Additions

### No New Go Dependencies

The project needs zero new Go libraries. Here is why:

**String similarity:** `go-edlib` v1.7.0 already provides Jaro-Winkler, Levenshtein, Cosine, Jaccard, Sorensen-Dice, and Damerau-Levenshtein. The existing `IsFuzzyMatch()` in `internal/scraper/dedup.go` already uses Jaro-Winkler with a 0.85 threshold. This same function (or a generalized version) handles all fuzzy matching needs.

**AI judgment:** `anthropic-sdk-go` v1.26.0 supports the Message Batches API via `client.Messages.Batches.New()`. The existing `ClaudeClient` and tool-use pattern in `platform/ai/enrich.go` provides the template for a new dedup judgment function that uses Claude's structured output to classify duplicate pairs.

**Company name normalization:** The existing `NormalizeCompanyName()` in `internal/scraper/dedup.go` already strips Bulgarian suffixes (OOD, EOOD, AD, EAD) and international ones (Ltd, LLC, Inc, GmbH). Extend this function rather than introducing a new library.

### PostgreSQL: Extend Existing Extensions

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `pg_trgm` (extend usage) | Built-in | Company name trigram similarity index | Already enabled (migration 000004). Add GIN index on `companies.name` for `%` operator candidate selection. Currently only indexed on `jobs.title` and `jobs.description`. |
| `fuzzystrmatch` extension | Built-in | `levenshtein()` for admin debugging queries | Optional secondary signal. Not required for the core pipeline but useful for admin SQL queries when investigating dedup results. LOW priority addition. |

**Critical: pg_trgm works with Cyrillic/Unicode.** The extension operates on "word characters" (alphanumerics) in a locale-aware manner. pg_trgm does not suffer from the same issues fuzzystrmatch does when dealing with Unicode characters. Bulgarian company names in Cyrillic generate valid trigrams for same-script comparisons. Cross-script matching (Cyrillic "Телерик" vs Latin "Telerik") requires application-layer transliteration that the existing `NormalizeCompanyName()` can be extended to handle via `gosimple/slug` (which already performs Unicode transliteration).

### Anthropic Batch API (Already in SDK v1.26.0)

| Feature | Details | Why Use It |
|---------|---------|-----------|
| Message Batches API | `client.Messages.Batches.New()` -- up to 100,000 requests or 256 MB per batch | Process hundreds of duplicate candidate pairs in one batch call at 50% cost reduction |
| Haiku 4.5 for classification | $0.50/MTok input, $2.50/MTok output (batch pricing) | Duplicate-or-not is a classification task. Haiku is 3x cheaper than Sonnet with comparable accuracy for binary classification |
| Tool use for structured output | Already used in `enrich.go` via `anthropic.ToolParam` | Force structured JSON response: `{is_duplicate: bool, confidence: float, reason: string, surviving_record: "a" or "b"}` |
| Prompt caching | `cache_control: ephemeral` on shared system prompt | All dedup requests share the same system prompt. 30-98% cache hit rates in batch mode. |
| Batch result streaming | `client.Messages.Batches.ResultsStreaming()` | Memory-efficient processing of batch results |

**Batch API cost estimate for this project:**
- ~800 companies in DB, worst case ~3,200 candidate pairs (after pg_trgm filtering)
- ~500 tokens per pair (system prompt cached + company data)
- ~50 output tokens per judgment
- Haiku batch: approximately $0.003 total for all companies
- Even at 10x scale: under $0.03 for the full batch run

**Batch API operational details:**
- Most batches complete within 1 hour (official Anthropic docs)
- Maximum 24-hour window before expiration
- Results available for 29 days after creation
- Each request processed independently (failure isolation)
- Tool use supported within batch requests

### New SQL Patterns (No New Libraries)

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| pg_trgm candidate selection | `SELECT a.id, b.id, similarity(a.name, b.name) FROM companies a, companies b WHERE a.id < b.id AND a.name % b.name` | Fast DB-level candidate pair generation. The `%` operator uses GIN index. Default threshold 0.3, tune to 0.4-0.5 for company names. |
| Multi-signal similarity scoring | `SELECT similarity(a.name, b.name) as name_sim, similarity(COALESCE(a.website,''), COALESCE(b.website,'')) as web_sim` | Combine name + website similarity at DB level before sending to AI |
| Batch status tracking table | `dedup_batches (id, type, status, anthropic_batch_id, request_count, ...)` | Track Anthropic batch API jobs, link results back to candidate pairs |
| Merge audit table | `merge_operations (id, surviving_id, merged_id, entity_type, merged_by, ...)` | Audit trail for all merge operations (required for undo capability) |

## Architecture: Where Dedup Fits

### Integration with Existing Scraping Pipeline

```
Existing flow:                     New additions:

scraper -> processScrapedJob()  -> dedup_check() [real-time, per-job]
              |                         |
              v                         v
          dedup_hash check         go-edlib Jaro-Winkler (existing func)
              |                     + pg_trgm similarity threshold
              v                         |
          DB insert                     v
                                   Block insert if exact match found
                                   OR flag for batch review if fuzzy match

Background worker (new):

dedup_worker (daily)           ->  pg_trgm candidate selection (batch SQL)
                                        |
                                        v
                                   go-edlib secondary scoring (Go layer)
                                        |
                                        v
                                   Filter: score > 0.9 = auto-merge
                                          score 0.5-0.9 = AI judgment
                                          score < 0.5 = discard
                                        |
                                        v
                                   Anthropic Batch API (Haiku 4.5)
                                        |
                                        v
                                   auto-merge (AI confidence > 0.9)
                                   or admin queue (AI confidence 0.5-0.9)
                                   or discard (AI says not duplicate)
```

### Extending the Existing AI Pipeline

The existing `platform/ai/` package pattern:
1. `ClaudeClient` wraps `anthropic.Client` with model selection
2. Tool use forces structured JSON output
3. `JobEnricher` / `CompanyEnricher` follow Claude-first, Ollama-fallback

New dedup judgment follows the same pattern but simpler:
1. Reuse existing `ClaudeClient` (no new client needed)
2. New tool definition: `judge_duplicate` with structured output schema
3. **No Ollama fallback for dedup** -- local models lack world knowledge for entity resolution ("Is 'Telerik Bulgaria EOOD' the same as 'Progress Software'?" requires knowledge Ollama models do not have)
4. Haiku 4.5 is primary (cheap); if unavailable, queue pairs for later

### Batch Processing Worker Pattern

Follows the existing `platform/worker/` ticker pattern:
```go
func StartDedupWorker(ctx context.Context, ..., interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    for {
        select {
        case <-ctx.Done(): return
        case <-ticker.C: RunDedupCycle(ctx, ...)
        }
    }
}
```

## Model Selection for Dedup Tasks

| Task | Model | Batch? | Rationale |
|------|-------|--------|-----------|
| Company duplicate classification | Haiku 4.5 | YES (batch API) | Binary classification. Haiku batch = $0.50/MTok input. 3x cheaper than Sonnet with comparable accuracy for yes/no tasks. |
| Job duplicate classification | Haiku 4.5 | YES (batch API) | Same reasoning. Job dedup is classification, not generation. |
| Merge field selection ("richest data wins") | Sonnet 4.6 | NO (real-time) | Selecting best fields from two records requires reasoning about data quality. Worth the cost -- one call per merge, not per pair. |
| Real-time scraper dedup check | go-edlib only | N/A | Must be fast (<100ms). Jaro-Winkler + hash check is sufficient for blocking. AI only for batch review. |
| Company name normalization | None (rule-based) | N/A | `NormalizeCompanyName()` + `slug.Make()` handles this deterministically. No AI needed. |

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| pg_trgm for candidate selection | Dedicated entity resolution library (Dedupe, Zingg, Splink) | These are Python/Scala/Spark tools. No Go equivalents exist. pg_trgm + go-edlib achieves the same result with zero new deps. |
| Anthropic Batch API | OpenAI batch API | Already using Anthropic SDK everywhere. No reason to add a second LLM provider. |
| Haiku 4.5 for classification | Sonnet 4.6 for classification | 3x more expensive with negligible quality improvement for binary classification. Reserve Sonnet for merge field selection only. |
| PostgreSQL-native similarity | Elasticsearch / dedicated matching engine | Would require a new infrastructure component. pg_trgm handles ~800 companies easily. Not needed until 10K+ scale. |
| go-edlib Jaro-Winkler | Vector embeddings (pgvector) | Massive over-engineering for <1000 companies. Vector similarity makes sense at 100K+ entities. At this scale, string distance + AI judgment is simpler and more debuggable. |
| Extend existing NormalizeCompanyName() | Dedicated name normalization library | No good Go library exists for Bulgarian company name normalization. The existing function with Bulgarian suffixes already covers the specific domain. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| pgvector / vector embeddings | Over-engineering for <1000 companies and <5000 jobs. Adds infra complexity (embedding model, vector index) for no benefit at this scale. | pg_trgm + go-edlib + Haiku AI judgment |
| Dedicated entity resolution frameworks | Python/JVM tools (Dedupe, Zingg, Splink) require a separate microservice and runtime. | Native Go pipeline: pg_trgm -> go-edlib -> Anthropic batch |
| Ollama for dedup judgment | Local models lack world knowledge for entity resolution. Cannot reason about "Is company A a subsidiary/rebrand of company B?" | Claude Haiku 4.5 -- cheap enough ($0.001/pair) that local inference provides no cost savings |
| Real-time AI calls during scraping | Would add 1-5s latency per job. Scraper processes 500+ jobs per cycle. | go-edlib for real-time blocking; batch AI review post-scrape |
| External matching services (Clearbit, ZoomInfo) | Paid SaaS, Bulgarian companies poorly covered, external dependency. | AI + existing web crawling (CompanyEnricher) |
| Redis/Kafka for dedup queue | Over-engineering. PostgreSQL table-as-queue works at this scale (hundreds of pairs, not millions). | `dedup_candidates` table with status column |
| Graph database for entity resolution | Network analysis adds complexity without proportional benefit at <5000 entities. | Simple pairwise comparison with transitive closure in Go |

## Stack Patterns by Scale

**Current scale (under 5,000 companies):**
- pg_trgm self-join is fast enough (< 1s for all pairs)
- Single-threaded dedup worker, no parallelism needed
- Single Anthropic batch per cycle

**If company count exceeds 10,000:**
- Add blocking/bucketing: group by website domain or first-letter before comparing
- Parallel go-edlib scoring with worker pool (Go channels)
- Split into multiple Anthropic batches

**If job count exceeds 50,000:**
- Add date-range windowing: only compare jobs within 30-day overlap
- Source-pair bucketing: only compare cross-source pairs (devbg-vs-jobsbg), not same-source
- Add `pg_trgm` GIN index on `jobs.title` with `%` operator support (current index only supports LIKE/ILIKE)

## New Database Objects Required

### New Tables

```sql
-- Dedup candidate pairs with AI judgment
CREATE TABLE dedup_candidates (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type      TEXT NOT NULL,  -- 'company' or 'job'
    entity_a_id      UUID NOT NULL,
    entity_b_id      UUID NOT NULL,
    similarity_score REAL NOT NULL,  -- composite score from pg_trgm + go-edlib
    ai_is_duplicate  BOOLEAN,        -- NULL = pending, true/false = judged
    ai_confidence    REAL,           -- 0.0-1.0
    ai_reason        TEXT,           -- explanation from Claude
    ai_provider      TEXT,           -- 'haiku-batch' / 'sonnet' / 'auto'
    batch_id         TEXT,           -- Anthropic batch ID reference
    status           TEXT NOT NULL DEFAULT 'pending',
    reviewed_by      UUID REFERENCES users(id),
    reviewed_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_a_id, entity_b_id)
);
-- Status values: pending, ai_reviewing, confirmed, rejected, merged, auto_merged

-- Merge audit trail (supports undo)
CREATE TABLE merge_operations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     TEXT NOT NULL,   -- 'company' or 'job'
    surviving_id    UUID NOT NULL,   -- the record that lives
    merged_id       UUID NOT NULL,   -- the record absorbed
    merged_by       UUID REFERENCES users(id),  -- NULL for auto-merge
    merge_reason    TEXT,            -- 'auto:confidence_0.95' or 'admin:manual'
    rollback_data   JSONB NOT NULL,  -- full snapshot of merged record
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company name aliases for normalization
CREATE TABLE company_aliases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alias_name      TEXT NOT NULL,        -- the variant name
    source          TEXT NOT NULL,        -- 'scraper:devbg', 'scraper:jobsbg', 'admin:manual'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, alias_name)
);
```

### New Indexes

```sql
-- Company name trigram index for similarity search (the key new index)
CREATE INDEX idx_companies_name_trgm
    ON companies USING gin (name gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- Dedup candidates lookup by status
CREATE INDEX idx_dedup_candidates_status
    ON dedup_candidates (status)
    WHERE status IN ('pending', 'confirmed', 'ai_reviewing');

-- Dedup candidates by entity for fast lookup
CREATE INDEX idx_dedup_candidates_entity
    ON dedup_candidates (entity_type, entity_a_id);

-- Company aliases for reverse lookup
CREATE INDEX idx_company_aliases_name
    ON company_aliases USING gin (alias_name gin_trgm_ops);

-- Merge operations for audit/undo
CREATE INDEX idx_merge_operations_merged
    ON merge_operations (entity_type, merged_id);
```

### New Columns on Existing Tables

```sql
-- Companies: track normalization
ALTER TABLE companies ADD COLUMN normalized_name TEXT;
ALTER TABLE companies ADD COLUMN canonical_company_id UUID REFERENCES companies(id);

-- Jobs: track cross-source dedup
ALTER TABLE jobs ADD COLUMN canonical_job_id UUID REFERENCES jobs(id);
ALTER TABLE jobs ADD COLUMN dedup_reviewed_at TIMESTAMPTZ;
```

## Installation

No new Go dependencies to install. All changes are SQL migrations + Go code using existing packages.

```bash
# Verify existing deps are sufficient (should produce no changes)
cd /home/vchavkov/src/jobs/backend && go mod tidy

# New migration for dedup tables and indexes
# Created during implementation phase, not during research
```

## Version Compatibility

| Package | Current Version | Compatible With | Notes |
|---------|-----------------|-----------------|-------|
| `anthropic-sdk-go` | v1.26.0 | Batch API (GA, not beta) | Uses `client.Messages.Batches.New()`. Batch types: `BatchCreateParams`, `BatchCreateParamsRequest`. |
| `go-edlib` | v1.7.0 | Go 1.25 | Stable. Jaro-Winkler, Levenshtein, Cosine, Jaccard all available. |
| `pg_trgm` | PostgreSQL built-in | PostgreSQL 14+ | Already enabled via migration 000004. Just need new GIN index on `companies.name`. |
| `pgx/v5` | v5.8.0 | All new queries | sqlc generates compatible code. No version concerns. |
| `gosimple/slug` | v1.15.0 | Go 1.25 | Unicode transliteration for Cyrillic-to-Latin normalization. |

## Sources

- [PostgreSQL pg_trgm official docs](https://www.postgresql.org/docs/current/pgtrgm.html) -- function signatures (`similarity()`, `word_similarity()`), operators (`%`, `<->`), GIN index support (HIGH confidence)
- [PostgreSQL fuzzystrmatch docs](https://www.postgresql.org/docs/current/fuzzystrmatch.html) -- `levenshtein()`, `metaphone()`, `soundex()` functions (HIGH confidence)
- [Anthropic Batch Processing docs](https://platform.claude.com/docs/en/build-with-claude/batch-processing) -- 50% cost discount, 100K request limit, 256MB size limit, 24h processing window, Go SDK examples (HIGH confidence)
- [anthropic-sdk-go v1.26.0 on pkg.go.dev](https://pkg.go.dev/github.com/anthropics/anthropic-sdk-go) -- `BatchCreateParams`, `BetaMessageBatchService`, `ResultsStreaming()` (HIGH confidence)
- [go-edlib on GitHub](https://github.com/hbollon/go-edlib) -- Jaro-Winkler, Levenshtein, Cosine, Jaccard, Sorensen-Dice, Damerau-Levenshtein (HIGH confidence)
- [Claude Sonnet vs Haiku 2026 comparison](https://serenitiesai.com/articles/claude-sonnet-vs-haiku-2026) -- Haiku cost-effectiveness for classification tasks (MEDIUM confidence)
- [Anthropic API pricing](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration) -- Haiku 4.5 batch: $0.50/MTok input, $2.50/MTok output (MEDIUM confidence)
- Existing codebase: `internal/scraper/dedup.go`, `platform/ai/enrich.go`, `platform/ai/company_enrich.go`, `platform/worker/scraping.go`, `migrations/000004_search_trgm_indexes.up.sql` -- verified integration patterns (HIGH confidence)

---
*Stack research for: AI Data Quality & Duplicate Detection (v1.1 milestone)*
*Researched: 2026-02-26*
