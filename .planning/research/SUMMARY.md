# Project Research Summary

**Project:** AI Data Quality & Duplicate Detection (v1.1 milestone)
**Domain:** Entity resolution, fuzzy matching, and AI-powered deduplication for multi-source job aggregation platform
**Researched:** 2026-02-26
**Confidence:** HIGH

## Executive Summary

This milestone adds AI-powered duplicate detection and entity resolution to an existing Go + PostgreSQL job platform that aggregates listings from multiple scrapers (dev.bg, jobs.bg). The core insight from research is that 90% of the required capability already exists in the codebase: `pg_trgm` is already enabled, `go-edlib` is already providing Jaro-Winkler matching, and the Anthropic SDK already supports the Batch API used for AI judgment. The work is entirely about wiring these existing pieces together with new SQL queries, a dedup worker, admin API endpoints, and admin UI — zero new Go dependencies are required.

The recommended architecture is a strict two-phase pipeline: cheap deterministic heuristics (pg_trgm trigram similarity, normalized name matching, website domain comparison) generate a small set of candidate duplicate pairs, and Claude Haiku 4.5 via the Batch API confirms ambiguous cases at negligible cost (~$0.003 for the full current dataset). Company deduplication must come before job deduplication because jobs are scoped to companies — merging "Telerik" and "Telerik AD" first makes subsequent job dedup both simpler and more accurate. Auto-merge is reserved for very high confidence (>= 0.95) with multiple confirming signals; everything below goes to an admin review queue.

The dominant risk is catastrophic false-positive merges: merging distinct companies destroys data across 8+ FK-linked tables and is extremely difficult to reverse without an explicit undo mechanism. The non-negotiable safety pattern is: (1) build merge undo from the start using a `merge_log` table with full JSONB snapshots of every affected record, (2) always soft-delete the absorbed entity rather than hard-deleting, (3) never auto-merge without at least two matching signals, and (4) require a mandatory dry-run/report phase before any batch execution against existing data. A second major risk is AI cost explosion from quadratic comparisons — the blocking strategy (compare only within normalized-name or website-domain buckets) must be designed before any comparison code is written.

## Key Findings

### Recommended Stack

The platform needs zero new Go dependencies. Every required capability exists in the current dependency tree. The only new database objects are: one migration adding three tables (`dedup_groups`, `dedup_pairs`, `merge_log`) plus a `normalized_name` column on `companies`, and one new GIN trigram index on `companies.normalized_name`. The Anthropic Batch API (already in `anthropic-sdk-go` v1.26.0 via `client.Messages.Batches.New()`) provides 50% cost reduction over standard API calls and handles up to 100,000 requests per batch. At current scale (~800 companies), total AI judgment cost for a full dedup pass is estimated at $0.003. At 10x scale: under $0.03.

**Core technologies:**
- `pg_trgm` (PostgreSQL built-in, already enabled): Company name candidate selection via `similarity()` self-join with GIN index — extend existing index to `companies.normalized_name`
- `go-edlib` v1.7.0 (already in go.mod): Jaro-Winkler secondary scoring at the Go application layer — reuse existing `IsFuzzyMatch()` pattern from `internal/scraper/dedup.go`
- `anthropic-sdk-go` v1.26.0 (already in go.mod): AI judgment via Batch API for medium-confidence pairs — Claude Haiku 4.5 at $0.50/MTok input (batch pricing)
- `gosimple/slug` v1.15.0 (already in go.mod): Unicode/Cyrillic transliteration for canonical name normalization — extend `NormalizeCompanyName()`
- `pgx/v5` v5.8.0 (already in go.mod): Single-transaction FK-cascading merges via `pool.Begin(ctx)` — unchanged usage pattern

**What NOT to add:** pgvector/vector embeddings (over-engineering for <1K companies), dedicated entity resolution frameworks (Python/JVM tools), real-time AI calls in the scraper hot path, Redis/Kafka for dedup queue (PostgreSQL table-as-queue works at this scale), Ollama for dedup judgment (local models lack world knowledge for entity resolution).

### Expected Features

**Must have (table stakes — blocks all other dedup value):**
- `normalized_name` column with GIN trigram index on `companies` — foundational prerequisite for all fuzzy matching
- Company name normalization pipeline extending `NormalizeCompanyName()` — handles Cyrillic variants, Bulgarian suffixes, geographic qualifiers
- Batch company duplicate detection via pg_trgm self-join — scans existing data for accumulated duplicates
- AI company duplicate verification (Claude Haiku 4.5 Batch API) — resolves ambiguous pairs heuristics cannot handle
- Company merge operation in single transaction across all 8 FK-linked tables — required to act on detected duplicates
- Merge audit log (`merge_log` with JSONB victim snapshot) — mandatory safety mechanism enabling undo
- Admin duplicate review dashboard with side-by-side comparison — human judgment for medium-confidence pairs
- Confidence-based auto-merge (>= 0.95 with two matching signals) — eliminates toil for obvious cases

**Should have (v1.1 Phase 2 — job dedup and prevention):**
- Batch job duplicate detection with multi-signal scoring (title, description, salary, skills) — company dedup must complete first
- Job merge with richest-data-wins field selection — produces higher-quality golden records than either source alone
- Real-time fuzzy prevention in `findOrCreateCompany()` and `processScrapedJob()` — prevents new duplicates at ingest time via 5-step fallback chain (exact → normalized → website domain → trigram → create)
- Company alias table populated from confirmed merges — prevents re-creation of merged companies by scrapers
- Scheduled dedup scanner worker (6h ticker) — automates ongoing detection following existing worker patterns

**Defer to Phase 3 (polish and automation):**
- Stale job cleanup automation (extend existing staleness worker with archival step after 2+ consecutive failures)
- Duplicate detection dashboard metrics for threshold tuning
- Cross-source job enrichment on merge (union AI enrichment from multiple sources)
- Merge undo UI in admin panel (data exists in `merge_log`; UI exposes it)

**Anti-features (explicitly excluded):**
- Vector embedding similarity for all jobs (overkill at <5K jobs)
- Fully automated merge without review (5% false positive rate at 0.95 = 25 wrong merges per 500 companies)
- Real-time AI dedup blocking in scraper hot path (adds 1-5s latency per job; scraper processes 500+ jobs per cycle)
- Company hierarchy/subsidiary resolution (different entities with valid separate listings should remain separate)

### Architecture Approach

The dedup system is entirely additive to the existing Go binary — no new services, no new infrastructure. It introduces one new handler file (`dedup_handler.go`), two new AI components (`company_dedup.go`, `job_dedup.go`), two new worker files (`dedup_scanner.go`, `merge.go`), one query file (`dedup.sql`), and one migration. The design follows three validated patterns already in the codebase: the `StartXxxWorker(ctx, ..., interval)` ticker pattern for background scanning, the `ClaudeClient` + tool-use structured output pattern for AI judgment, and the `pool.Begin(ctx)` single-transaction pattern for data-integrity-critical operations. The dedup scanner worker runs every 6 hours using a strict two-phase approach: cheap SQL heuristics generate candidates (pg_trgm self-join, website domain match), AI confirms only ambiguous pairs (confidence 0.50–0.85), and high-confidence pairs (>= 0.95) auto-merge without admin involvement.

**Major components:**
1. `platform/ai/company_dedup.go` — heuristic + AI matching for company entity pairs; follows `company_enrich.go` dual-provider pattern (Claude primary, Ollama fallback)
2. `platform/worker/dedup_scanner.go` — background batch scanner; 6h ticker following `staleness.go` pattern; calls Phase 1 heuristics then AI for medium-confidence pairs
3. `platform/worker/merge.go` — FK-cascading merge engine; single PostgreSQL transaction covering all 8 dependent tables; writes `merge_log` entry with JSONB snapshot before committing
4. `platform/server/dedup_handler.go` — admin API endpoints for review queue, merge, dismiss, scan trigger, stats; follows existing admin endpoint patterns
5. Migration `000026_dedup_tables.up.sql` — `dedup_groups`, `dedup_pairs`, `merge_log`, `normalized_name` column on companies, GIN trigram index on `normalized_name`
6. Admin panel pages — duplicate review queue with side-by-side comparison, merge action, merge history

**Polymorphic schema decision:** `dedup_groups` uses `entity_type = 'company'|'job'` rather than separate tables. This gives one admin review queue, one set of API endpoints, one worker — not duplicated code per entity type.

**FK dependency map (all tables requiring UPDATE in company merge):**
`jobs.company_id`, `jobs.claimed_by_company_id`, `users.company_id`, `company_locations.company_id`, `company_claims.company_id`, `company_contacts.company_id`, `company_invites.company_id`, `candidate_invitations.company_id`

### Critical Pitfalls

1. **Over-merging destroys data permanently** — Build merge undo (`merge_log` with JSONB snapshots) and soft-delete absorbed entities before writing any detection logic. Set auto-merge threshold at >= 0.95 with a minimum of two confirming signals. Bulgarian holding group patterns (Sirma Group, Sirma Solutions, Sirma AI are distinct entities) fool name-only matchers at Jaro-Winkler 0.85 threshold.

2. **Merge cascade silently misses FK tables** — The `companies` table has FK references in 8+ tables. Missing any one creates orphaned records or silently drops data. Write integration tests verifying all FK tables before any merge runs against real data. Add startup-time discovery that alerts if a new FK is added to `companies.id` that the merge function does not handle. The existing `ON DELETE CASCADE` on `jobs.company_id` means deleting the absorbed company without reassigning jobs first would cascade-delete all those jobs.

3. **Quadratic comparison costs without blocking** — 2,000 companies = ~2M pairs = $3,000+ in Claude API calls if sent naively. Implement blocking first: only compare companies within normalized-name prefix buckets or website-domain buckets. This reduces the comparison set from 2M to ~20K. The blocking strategy must be designed before any comparison code is written.

4. **Meilisearch index goes stale after merge** — The reconciliation worker (15-minute cycle) checks document counts, not content. After reassigning jobs from absorbed to survivor company, Meilisearch still shows the old company name for those jobs. The merge function must immediately call a targeted reindex for all affected jobs and use Meilisearch filter-based deletion to remove the absorbed company's documents. Search consistency is not optional.

5. **Bulgarian name normalization edge cases** — Cyrillic vs Latin variants ("Телерик" vs "Telerik"), 2009 Bulgarian romanization standard inconsistencies, quotation marks in official names ('"Firm Name" OOD'), geographic qualifiers ("DXC Technology Bulgaria" vs "DXC Technology"), and holding group names (Sirma Group ≠ Sirma Solutions) are all unhandled by the current `NormalizeCompanyName()`. Normalization quality directly determines blocking quality — bad normalization means the same company falls into different buckets and never gets compared.

## Implications for Roadmap

The dependency chain is strict and drives a sequential build order within Phase 1 before Phase 2 becomes feasible: normalization enables blocking, blocking enables candidate selection, candidate selection enables AI verification, AI verification enables merge, merge requires undo infrastructure, merge + undo enables admin review, all of the above must function correctly before batch cleanup of existing data can run safely.

### Phase 1: Company Dedup Foundation

**Rationale:** Company dedup is the prerequisite for job dedup (jobs are scoped to companies). The merge infrastructure (audit log, soft-delete, FK cascade) is the prerequisite for all detection features — the safety net must exist before any detection logic runs. Normalization quality directly determines whether the blocking strategy works, so it comes first within Phase 1.

**Delivers:** A working end-to-end pipeline for detecting, reviewing, and merging duplicate company records. Eliminates the current state where "Telerik AD" and "Telerik" are separate companies with split job counts, separate profiles, and separate search results.

**Build order within Phase 1:**
1. Migration `000026_dedup_tables.up.sql` (schema foundation)
2. Extend `NormalizeCompanyName()` with Cyrillic transliteration, geographic suffix removal, quotation mark stripping
3. Backfill `normalized_name` on all existing companies
4. `merge.go` — FK-cascading merge engine with `merge_log` audit trail (build undo before detection)
5. Admin API merge/dismiss endpoints (`dedup_handler.go`)
6. Company dedup scanner — heuristic phase (pg_trgm self-join, website domain matching)
7. AI verification layer — Claude Haiku 4.5 Batch API for medium-confidence pairs (0.50–0.85)
8. Confidence-based auto-merge routing
9. Admin review queue UI (side-by-side comparison, approve/reject actions)
10. Dry-run/report mode for batch cleanup of existing data (mandatory before first execution)

**Addresses (FEATURES.md P0+P1):**
- pg_trgm GIN index on `companies.normalized_name`
- Company name normalization pipeline
- Batch company duplicate detection
- AI company duplicate verification
- Company merge operation
- Merge audit log with undo
- Admin duplicate review dashboard
- Confidence-based auto-merge

**Avoids:**
- Over-merging (merge undo built before any merges execute)
- FK cascade integrity failures (integration tests before launch)
- Meilisearch staleness (immediate reindex in merge transaction)
- Batch cleanup damage (mandatory dry-run before any execution)

### Phase 2: Job Dedup and Real-Time Prevention

**Rationale:** Job dedup is only meaningful after company dedup completes — otherwise "Senior React Developer" at "Telerik" and at "Telerik AD" appear as different jobs at different companies. Real-time prevention belongs here because Phase 1 batch cleanup handles existing data and Phase 2 prevents new duplicates from entering. The company alias table (populated by Phase 1 merges) is the prerequisite for preventing scraper re-creation of merged companies.

**Delivers:** Cross-source job dedup within unified company records, prevention of future duplicates at scraper ingest time, and a company alias table that blocks scrapers from re-creating merged companies.

**Uses:**
- `go-edlib` Jaro-Winkler for fast title comparison in the scraper hot path (no AI in hot path)
- `pg_trgm` title similarity for batch job candidate selection
- Claude Haiku 4.5 Batch API for ambiguous job pair judgment
- `company_aliases` table populated from Phase 1 confirmed merges
- Existing `dedup_scanner.go` extended to include job scanning

**Implements:**
- `platform/ai/job_dedup.go` — multi-signal job matching (title, description, salary, skills, source URL, date proximity)
- Modified `findOrCreateCompany()` with 5-step fallback chain (exact ILIKE → normalized exact → website domain → trigram 0.85 → create new)
- Modified `processScrapedJob()` with cross-source fuzzy dedup after hash check (async flag, not inline AI)
- Richest-data-wins job merge: union of skills/locations/categories; longest description; narrowest non-null salary range; AI-enriched title preferred

**Addresses Pitfalls:**
- Dedup hash brittleness: cross-source job dedup decoupled from hash, runs async not inline
- Scraper pipeline bottleneck: only deterministic checks inline (hash, source_id, normalized name); all AI dedup is async post-import

### Phase 3: Automation and Polish

**Rationale:** Once dedup is working and thresholds are validated against real data (from Phase 1 dry-run results and Phase 2 operation), automation reduces ongoing admin toil. Stale job cleanup was explicitly identified in FEATURES.md as independent of dedup features and can ship here.

**Delivers:** Fully automated ongoing dedup with minimal admin intervention, stale listing archival, operational visibility metrics, and undo UI.

**Addresses:**
- Stale job cleanup automation: extend existing staleness worker to archive jobs stale for > N days (default 14) after 2+ consecutive failures; distinguish "source confirmed removed" from "source unreachable"
- Duplicate detection dashboard metrics: aggregate queries on `merge_log` and `dedup_groups` for threshold tuning
- Cross-source job enrichment on merge: union AI enrichment from multiple sources during job merge
- Merge undo UI in admin panel: surface `merge_log` JSONB snapshots through admin interface
- Scheduled dedup scanner worker if not already operating from Phase 2

### Phase Ordering Rationale

- **Company before job:** Jobs have `company_id` FK. Two identical jobs under two duplicate companies appear as different jobs. Correct the company layer first, then job dedup operates on clean data.
- **Merge infrastructure before detection:** Building detection without undo is a liability. If the first detection run produces false positives and there is no undo mechanism, the damage is permanent. The audit log, soft-delete, and FK-cascade merge must exist on day one of Phase 1 before any scan runs.
- **Normalization before blocking:** Blocking groups companies by normalized name prefix or website domain. If normalization produces inconsistent output for Cyrillic names, blocking fails silently and recall drops. Normalize correctly before building the comparison pipeline.
- **Batch cleanup before real-time prevention:** Existing data has accumulated hundreds of duplicates. Fixing the ingest pipeline (real-time prevention) without fixing existing data leaves visible product problems. Clean the database first, then prevent future accumulation.
- **Dry-run before execution:** Every batch operation must have a report mode. Thresholds that look correct on paper often produce unexpected results on real Bulgarian company names. Inspect the report, tune the threshold, then execute.
- **Heuristic before AI:** High-confidence pairs (exact name + same website domain) do not need AI confirmation. Running AI on all pairs is prohibitively expensive. Only send ambiguous pairs (0.50–0.85 heuristic confidence) to the Batch API.

### Research Flags

Phases needing deeper research during planning:

- **Phase 1 (merge transaction — FK table enumeration):** Research identified 8 tables with `company_id` FK, but migrations 000020–000025 were not individually analyzed. Before finalizing the merge function, query `information_schema.table_constraints` against the actual database to produce the canonical FK list. One missed table = data integrity failure.
- **Phase 1 (Bulgarian transliteration prevalence):** The 2009 Bulgarian romanization standard is documented, but it is unknown what percentage of scraped companies have Cyrillic names. Query `SELECT COUNT(*) FROM companies WHERE name ~ '[А-Яа-я]'` early in Phase 1 to scope this effort before investing in transliteration code.
- **Phase 2 (job survivorship rules):** "Richest-data-wins" field selection for jobs (title, description, salary, skills) needs domain validation against actual cross-source duplicates in the live database. The rules recommended in research (longest description, narrowest salary range, union of skills) should be spot-checked against 10-20 real cross-source pairs before being hardcoded.

Phases with well-documented patterns (skip research-phase):

- **Phase 1 (worker pattern):** The `StartXxxWorker` ticker pattern is identical across 7 existing workers. No new patterns needed.
- **Phase 1 (Anthropic Batch API):** Fully documented, SDK verified at v1.26.0, cost estimates are solid based on current pricing.
- **Phase 1 (merge transaction pattern):** `pool.Begin(ctx)` with explicit rollback-on-error is established in the codebase. The pattern is clear.
- **Phase 3 (stale job cleanup):** Direct extension of the existing staleness worker. Well-understood pattern from prior research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommended technologies verified against existing go.mod and codebase. Zero new dependencies confirmed. Anthropic SDK batch API verified at v1.26.0. pg_trgm usage verified in migration 000004. Cost estimates grounded in verified pricing. |
| Features | HIGH | Feature set grounded in direct codebase analysis of existing dedup infrastructure gaps. Feature dependencies validated against actual FK schema. Anti-features explicitly researched and excluded with clear rationale. Confidence thresholds supported by industry research. |
| Architecture | HIGH | Component structure follows existing codebase patterns exactly. FK dependency map verified against actual migration files (000001, 000003, 000005, 000006, 000009, 000014). Data flows match existing worker, AI, and handler patterns. |
| Pitfalls | HIGH | Pitfalls grounded in codebase analysis (actual migration schema, actual `scraping.go` code) and high-confidence external sources (Textkernel dedup research, Bulgarian company law). Over-merging, FK cascade, and Meilisearch staleness are all verifiable risks in the current system. |

**Overall confidence:** HIGH

### Gaps to Address

- **Full FK table enumeration:** Research identified 8+ tables with `company_id` FK, but the exact canonical list requires a database-level query (`information_schema.table_constraints`) before implementing the merge function. New migrations (000020–000025) were not individually inspected.
- **Cyrillic company name prevalence:** Unknown what percentage of scraped companies have Cyrillic names vs Latin. If < 5%, transliteration work is low priority. Run a simple query against the live database at the start of Phase 1 to size this effort before investing.
- **Confidence threshold validation:** The recommended thresholds (0.95 auto-merge, 0.70 review queue, discard below 0.70) are grounded in industry patterns for English-language data. Bulgarian company name patterns may require different tuning. The mandatory dry-run report from the first batch scan will reveal the actual similarity score distribution and allow threshold adjustment before any merges execute.
- **Existing duplicate baseline count:** Research does not know how many actual duplicates currently exist in the ~800-company database. Running the pg_trgm self-join SQL as a read-only query before Phase 1 implementation begins will size the cleanup effort and validate whether the heuristic thresholds are appropriate for this dataset.

## Sources

### Primary (HIGH confidence)
- PostgreSQL pg_trgm official docs — trigram similarity functions, GIN indexing, Unicode/Cyrillic support
- Anthropic Batch Processing docs — 50% cost discount, 100K request limit, 256MB size limit, 24h window, Go SDK examples
- anthropic-sdk-go v1.26.0 pkg.go.dev — `BatchCreateParams`, `BetaMessageBatchService`, `ResultsStreaming()`
- Existing codebase: `internal/scraper/dedup.go`, `platform/ai/enrich.go`, `platform/ai/company_enrich.go`, `platform/worker/scraping.go`, `platform/worker/company_enrichment.go`, `platform/worker/staleness.go`, migrations 000001–000025
- Textkernel research on non-exact duplicate job postings — 37% textual overlap in true duplicates
- Romanization of Bulgarian (Wikipedia) — official 2009 transliteration standard
- Bulgarian Company Types (LawFirm.bg) — EOOD, OOD, AD, EAD entity type variations

### Secondary (MEDIUM confidence)
- Entity resolution industry guides (puppygraph.com, peopledatalabs.com) — blocking strategies, scoring approaches
- LLM-based dedup research (futuresearch.ai, medium.com) — LLM confidence scoring patterns, F1=0.976 on company names
- Data survivorship / golden record patterns (dataladder.com) — field-level merge survivorship rules
- Company name normalization techniques (medium.com/tilo-tech, addaptive.com) — suffix handling, abbreviation normalization
- System design for entity resolution (sheshbabu.com) — blocking strategies, scaling considerations
- How Lightcast handles duplicate postings — two-step dedup, 80% dedup rate, 60-day window
- Can LLMs be used for entity resolution (tilores.io) — LLMs are slow and expensive for ER; best used for edge cases only
- Fuzzy matching guide (winpure.com) — threshold tuning, false positive risk calibration

### Tertiary (LOW confidence)
- Claude Sonnet vs Haiku 2026 comparison (serenitiesai.com) — Haiku cost-effectiveness for classification tasks; pricing details should be verified against the current Anthropic pricing page before finalizing cost estimates
- Anthropic API pricing breakdown (metacto.com) — Haiku 4.5 batch pricing quoted; verify against official Anthropic docs before committing

---
*Research completed: 2026-02-26*
*Ready for roadmap: yes*
