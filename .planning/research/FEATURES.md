# Feature Research: AI-Powered Duplicate Detection & Data Quality

**Domain:** Entity resolution, deduplication, and data quality for multi-source job aggregation platform
**Researched:** 2026-02-26
**Confidence:** HIGH (features validated against existing codebase patterns, industry entity resolution practices, and existing dedup infrastructure)

## Existing State Assessment

Before mapping new features, here is what the platform already has for deduplication and data quality:

**Current dedup infrastructure (already built):**
- `dedup_hash` column on jobs table: MD5 hash of normalized(title:company:location), checked at scrape time
- `source_id` column: per-source unique identifier, checked at scrape time
- `FindCompanyByNameILike` query: exact case-insensitive company name matching during import
- `NormalizeCompanyName()` in `internal/scraper/dedup.go`: strips Bulgarian/international suffixes (OOD, EOOD, AD, Ltd, LLC, GmbH, etc.), lowercases, collapses whitespace
- `IsFuzzyMatch()`: Jaro-Winkler similarity on title + company (0.85 threshold), used for cross-source comparison
- `Hash()`: deterministic dedup hash from normalized title+company+location
- `pg_trgm` extension: already enabled (migration 000004), GIN indexes on jobs.title and jobs.description
- PostgreSQL unique constraint catch: `pgconn.PgError` code 23505 on title+company duplication
- Staleness worker: checks source URL availability every 12h, marks `is_stale=true/false`
- AI enrichment pipeline: Two-pass Ollama+Claude for job description enrichment, Claude+Ollama for company profiles
- Company enrichment workers: website discovery, logo extraction, social media extraction, AI profile enrichment

**Current gaps (why v1.1 is needed):**
- Company matching is exact (`LOWER(name) = LOWER($1)`) -- "Telerik" vs "Progress / Telerik" creates duplicate companies
- No batch scan to find existing duplicates already in the database
- Job dedup_hash is title:company:location -- same job with slightly different title from two sources is missed
- No admin UI for reviewing potential duplicates
- No merge operation for companies (transfer jobs, applications, users to survivor)
- No merge operation for jobs (select richest fields from multiple sources)
- No real-time fuzzy prevention at scrape import time (currently only exact hash + source_id)
- No company name normalization table/aliases for known variations

## Feature Landscape

### Table Stakes (Minimum Viable Data Quality for v1.1)

Features that must exist for this milestone to deliver value. Without these, duplicate data continues to degrade search results and company profiles.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Batch company duplicate detection** | Hundreds of scraped companies already have duplicates (different name spellings from different sources). Must scan existing data. | MEDIUM | Use `pg_trgm` similarity() on companies.name within PostgreSQL. Group candidates by similarity > 0.6 threshold. Existing GIN index infrastructure can be extended. Output: candidate pairs with similarity scores. |
| **AI-powered company duplicate verification** | pg_trgm catches "Telerik" vs "Telerik AD" but misses semantic duplicates like "Progress" vs "Progress / Telerik". Need LLM judgment on ambiguous pairs. | MEDIUM | Send candidate pairs to Claude/Ollama with company metadata (name, website, description, logo). Return confidence score 0.0-1.0. Reuse existing `ai.ClaudeClient` and `ai.Client` patterns. |
| **Company merge operation** | Once duplicates are confirmed, must combine records. Transfer all jobs, applications, users, contacts from victim to survivor. | HIGH | Database transaction: UPDATE jobs SET company_id = survivor WHERE company_id = victim; same for users, applications, company_locations, company_contacts, company_claims. Merge metadata (pick best description, logo, website). Soft-delete victim. Update Meilisearch index for affected jobs. |
| **Admin duplicate review dashboard** | Low-confidence matches (0.5-0.85) need human judgment. Admin must see both records side-by-side and approve/reject/merge. | MEDIUM | New admin panel page under Companies. List pending duplicate pairs with confidence scores. Side-by-side comparison showing name, website, logo, job count, description. Approve (merge), reject (mark as not-duplicate), or skip. |
| **Confidence-based auto-merge** | High-confidence duplicates (>0.90 + same website domain) should merge without admin review. Reduces toil for obvious cases like "Acme Ltd" vs "Acme Ltd." | LOW | Threshold-gated: auto-merge when confidence >= 0.90 AND (same website domain OR one is substring of other). Log auto-merges for audit. Admin can undo via merge history. |
| **Batch job duplicate detection** | Same job posted on dev.bg and jobs.bg with different titles/formatting. Must find cross-source duplicates among existing published jobs. | HIGH | Multi-signal scoring: normalize title similarity (Jaro-Winkler), same company, overlapping skills, salary range overlap, description similarity (TF-IDF or embedding cosine). Blocking strategy: group by company_id first (reduces N^2 to manageable). |
| **Company name normalization pipeline** | Standardize company names across sources at import time. "Telerik AD" from dev.bg and "Telerik" from jobs.bg should resolve to the same company. | MEDIUM | Extend existing `NormalizeCompanyName()` with: (1) suffix stripping (already done), (2) pg_trgm fuzzy lookup with threshold 0.8, (3) alias table for known mappings (e.g., "DXC Technology" = "DXC"). Replace exact `FindCompanyByNameILike` with fuzzy `FindCompanyByNameSimilar`. |
| **Stale/expired job cleanup automation** | Existing staleness worker marks `is_stale=true` but jobs remain published. Need automated archival after configurable grace period. | LOW | Add `stale_since` timestamp (set when is_stale first becomes true). Worker archives (status='expired') jobs stale for > N days (default: 14). Already have staleness worker pattern -- extend with archival step. |

### Differentiators (Competitive Advantage -- Beyond Basic Dedup)

Features that set the dedup system apart from naive exact-match approaches. Valuable but not blocking for v1.1 launch.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Richest-data-wins job merging** | When two sources have the same job, AI selects the best version of each field (title from source A, description from source B, salary from source C). Produces a "golden record" superior to any single source. | HIGH | Per-field survivorship rules: longest non-empty description wins, most specific salary range wins, union of skills from all sources, most recent source_scraped_at for freshness. Use AI to judge which description is better when both are non-empty. Store merged_from_ids for audit trail. |
| **Real-time duplicate prevention in scraping pipeline** | Before creating a new job/company during scrape import, check for fuzzy duplicates. Prevent duplicates from entering the database rather than cleaning up after. | MEDIUM | Extend `processScrapedJob()` and `findOrCreateCompany()`: after exact hash/sourceID checks fail, run fuzzy match against recent imports (last 30 days, same company). If match found, update existing rather than create new. Use existing `IsFuzzyMatch()` function with pg_trgm fallback. |
| **Company alias/synonym table** | Known name variations stored in a lookup table. "Progress Software" = "Telerik" = "Progress / Telerik". Eliminates repeated AI calls for known mappings. | LOW | New `company_aliases` table: (id, company_id, alias_name, source, created_at). Checked before fuzzy matching. Populated from confirmed merges. Admin can manually add aliases. |
| **Merge audit log with undo** | Every merge operation logged with before/after state. Admin can undo a merge within 30 days by restoring the victim company and reassigning records. | MEDIUM | New `merge_log` table: (id, survivor_id, victim_id, merged_by, merged_at, merge_type, victim_snapshot JSONB, undone_at). Undo: restore victim from snapshot, reassign records back. |
| **Duplicate detection dashboard metrics** | Admin sees: total duplicate clusters found, auto-merged count, pending review count, merge rate, false positive rate. Informs threshold tuning. | LOW | Aggregate queries on merge_log and duplicate_candidates tables. Add to existing admin dashboard stats endpoint. |
| **Cross-source job enrichment on merge** | When merging job duplicates, combine AI enrichment from both sources. If source A has salary data and source B has better skills extraction, merged job gets both. | MEDIUM | During job merge: union of job_skills, best salary (non-null with narrower range), best description (AI-enriched preferred over raw), union of job_locations, union of job_categories. |
| **Scheduled batch dedup runs** | Periodic background worker that scans for new duplicates, similar to existing enrichment and staleness workers. | LOW | New worker following existing ticker+ctx.Done() pattern. Runs every 24h. Scans companies first (fewer records), then jobs within same company. Creates duplicate candidates for review. |

### Anti-Features (Do NOT Build)

Features that seem attractive but create more problems than they solve for a platform at this scale.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Vector embedding similarity for all jobs** | Modern approach using sentence embeddings for semantic job matching. | Requires embedding infrastructure (vector DB or pgvector extension), embedding model hosting, and maintaining embeddings for every job. Overkill for ~2000-5000 scraped jobs. pg_trgm + Jaro-Winkler + AI verification handles this scale fine. | Use pg_trgm for blocking + Jaro-Winkler for scoring + AI for verification. Consider embeddings at 50K+ jobs. |
| **Fully automated merge without review** | Auto-merge everything above some threshold to eliminate admin work entirely. | False positives in merges are catastrophic -- jobs move to wrong company, applications lost. Even at 0.95 confidence, 5% error rate on 500 companies = 25 wrong merges. | Hybrid: auto-merge only at 0.95+ with same-domain confirmation. Everything else goes to review queue. |
| **Real-time dedup blocking in the API** | Block job creation if potential duplicate detected, forcing user to confirm. | Adds latency to scraping pipeline. Scraper processes hundreds of jobs per cycle -- cannot afford LLM calls per job at import time. Also blocks company self-service job posting. | Async detection: import first, detect duplicates in background worker, flag for review. Real-time prevention uses fast heuristics only (hash + source_id + normalized name). |
| **ML model training for custom dedup** | Train a custom classifier on confirmed merge/not-merge decisions. | Insufficient training data (hundreds, not thousands of labeled pairs). Cold start problem. Maintenance burden of model retraining. LLM zero-shot performs comparably for this data volume. | Use LLM-based verification with tuned prompts. Revisit ML when labeled dataset exceeds 5000 pairs. |
| **Company hierarchy/subsidiary resolution** | Resolve parent-child relationships (e.g., "Google" owns "YouTube" but they are separate employers). | Extremely complex: requires business registry lookups, subsidiary databases, or manual curation. Different entities with valid separate listings should remain separate. | Only merge true duplicates (same entity, different names). Do not merge related-but-distinct entities. Add parent_company_id field later if needed for display grouping. |
| **User-facing duplicate reporting** | Let job seekers flag duplicate listings. | Creates moderation burden. Users may flag similar-but-different jobs. Quality of reports varies wildly. | Admin-only detection. Users can report individual listings via existing report system. |

## Feature Dependencies

```
[pg_trgm Company Name Index]
    (prerequisite for all company dedup)

[Company Name Normalization Pipeline]
    requires --> [pg_trgm Company Name Index]
    enhances --> [Scraping Pipeline] (better matching at import)

[Batch Company Duplicate Detection]
    requires --> [pg_trgm Company Name Index]
    requires --> [Company Name Normalization Pipeline]

[AI Company Duplicate Verification]
    requires --> [Batch Company Duplicate Detection] (provides candidate pairs)
    requires --> [Existing AI Pipeline] (Claude + Ollama clients)

[Confidence-Based Auto-Merge]
    requires --> [AI Company Duplicate Verification] (needs confidence scores)
    requires --> [Company Merge Operation] (needs merge implementation)

[Admin Duplicate Review Dashboard]
    requires --> [AI Company Duplicate Verification] (shows scored pairs)
    requires --> [Company Merge Operation] (approve triggers merge)

[Company Merge Operation]
    requires --> [Batch Company Duplicate Detection] (needs identified duplicates)
    independent of --> [AI Verification] (can merge manually from admin)

[Company Alias Table]
    enhances --> [Company Name Normalization Pipeline]
    populated by --> [Company Merge Operation] (confirmed merges create aliases)

[Merge Audit Log]
    requires --> [Company Merge Operation] (logs each merge)
    enhances --> [Admin Duplicate Review Dashboard] (shows history)

[Batch Job Duplicate Detection]
    requires --> [Company Merge Operation] (companies must be deduped first)
    requires --> [Batch Company Duplicate Detection]

[Richest-Data-Wins Job Merging]
    requires --> [Batch Job Duplicate Detection] (needs identified job dupes)

[Real-Time Duplicate Prevention]
    requires --> [Company Name Normalization Pipeline]
    requires --> [Company Alias Table]
    enhances --> [Scraping Pipeline] (inline fuzzy check)

[Stale Job Cleanup Automation]
    requires --> [Existing Staleness Worker] (already built)
    independent of --> [Dedup features]

[Scheduled Batch Dedup Worker]
    requires --> [Batch Company Duplicate Detection]
    requires --> [Batch Job Duplicate Detection]
    enhances --> [Real-Time Duplicate Prevention] (catches what real-time misses)
```

### Dependency Notes

- **Company dedup MUST come before job dedup**: Jobs belong to companies. If "Telerik" and "Telerik AD" are separate companies, their jobs look unique. Merge companies first, then scan for job duplicates within the now-unified company.
- **pg_trgm index is the foundation**: Already enabled (migration 000004), but only indexed on jobs.title and jobs.description. Need a new GIN trigram index on companies.name for fuzzy company matching.
- **AI verification depends on existing AI pipeline**: Reuse `ai.ClaudeClient` and `ai.Client` with new prompts. No new AI infrastructure needed.
- **Merge audit log should ship with the merge operation**: Never build a destructive operation without an undo mechanism. Ship together.
- **Real-time prevention is an enhancement, not a prerequisite**: Batch cleanup handles existing data. Real-time prevention is a second-pass optimization.
- **Stale job cleanup is independent**: Can be built in parallel with dedup features since it only extends the existing staleness worker.

## MVP Definition

### Launch With (v1.1 Phase 1 -- Company Dedup Foundation)

Minimum viable data quality -- detect and resolve company duplicates:

- [ ] pg_trgm GIN index on companies.name -- enables fuzzy company matching in SQL
- [ ] Company name normalization pipeline -- extend existing `NormalizeCompanyName()` with fuzzy lookup
- [ ] Batch company duplicate detection -- SQL query using similarity() to find candidate pairs
- [ ] AI company duplicate verification -- LLM scoring of candidate pairs using existing Claude/Ollama
- [ ] Company merge operation -- database transaction to combine two company records
- [ ] Merge audit log -- record every merge with victim snapshot for undo capability
- [ ] Admin duplicate review dashboard -- list pending pairs, side-by-side view, approve/reject
- [ ] Confidence-based auto-merge -- auto-merge at >= 0.95 confidence with same domain

### Add After Company Dedup Works (v1.1 Phase 2 -- Job Dedup + Prevention)

Once company duplicates are resolved, tackle job duplicates:

- [ ] Batch job duplicate detection -- multi-signal scoring within same company
- [ ] Job merge operation with richest-data-wins -- field-level survivorship
- [ ] Real-time fuzzy prevention in scraping pipeline -- extend processScrapedJob() and findOrCreateCompany()
- [ ] Company alias table -- populated from confirmed merges, used by real-time prevention
- [ ] Scheduled batch dedup worker -- periodic background scan following existing worker patterns

### Add After Validation (v1.1 Phase 3 -- Automation + Polish)

Once dedup is working and thresholds are tuned:

- [ ] Stale job cleanup automation -- auto-archive after N days stale
- [ ] Duplicate detection dashboard metrics -- track merge rates, false positives
- [ ] Cross-source job enrichment on merge -- combine AI enrichment from multiple sources
- [ ] Merge undo UI in admin panel -- restore from audit log

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Depends On |
|---------|------------|---------------------|----------|------------|
| pg_trgm company name index | HIGH (enables all) | LOW | P0 | Nothing |
| Company name normalization | HIGH | MEDIUM | P1 | pg_trgm index |
| Batch company duplicate detection | HIGH | MEDIUM | P1 | pg_trgm index |
| AI company duplicate verification | HIGH | MEDIUM | P1 | Batch detection |
| Company merge operation | HIGH | HIGH | P1 | Detection |
| Merge audit log | HIGH (safety) | LOW | P1 | Merge operation |
| Admin duplicate review dashboard | HIGH | MEDIUM | P1 | AI verification |
| Confidence-based auto-merge | MEDIUM | LOW | P1 | AI verification + merge |
| Batch job duplicate detection | HIGH | HIGH | P2 | Company dedup done |
| Job merge (richest-data-wins) | HIGH | HIGH | P2 | Job detection |
| Real-time scraper prevention | HIGH | MEDIUM | P2 | Normalization + aliases |
| Company alias table | MEDIUM | LOW | P2 | Merge operation |
| Scheduled dedup worker | MEDIUM | LOW | P2 | Detection + merge |
| Stale job cleanup automation | MEDIUM | LOW | P2 | Existing staleness worker |
| Duplicate detection metrics | LOW | LOW | P3 | All detection features |
| Cross-source job enrichment | MEDIUM | MEDIUM | P3 | Job merge |
| Merge undo UI | LOW | MEDIUM | P3 | Merge audit log |

**Priority key:**
- P0: Infrastructure prerequisite -- blocks everything else
- P1: Must have for v1.1 launch -- company dedup is the core deliverable
- P2: Should have -- job dedup and prevention, natural extension of P1
- P3: Nice to have -- polish and optimization, build when P1+P2 are stable

## Confidence Thresholds (Recommended)

Based on industry entity resolution patterns and the specific challenges of Bulgarian company names:

| Confidence Range | Action | Rationale |
|-----------------|--------|-----------|
| >= 0.95 | Auto-merge (with same website domain or one name is substring of other) | Near-certain duplicates: "Telerik" vs "Telerik AD", "SAP Labs Bulgaria" vs "SAP Labs Bulgaria EOOD". Same domain confirmation eliminates false positives. |
| 0.80 - 0.94 | Auto-merge (with website domain match only) | High confidence but name difference is larger. Website domain match provides secondary confirmation. Without domain match, send to review. |
| 0.60 - 0.79 | Admin review required | Ambiguous cases: "Progress" vs "Progress / Telerik", "DXC" vs "DXC Technology Bulgaria". Need human judgment. |
| < 0.60 | Not flagged | Below threshold for reasonable match. Too many false positives at this range. |

These thresholds should be tunable via config (not hardcoded) and adjusted based on observed false positive/negative rates in the admin review queue.

## Matching Strategy (Multi-Signal)

### Company Matching Signals

| Signal | Weight | Method | Notes |
|--------|--------|--------|-------|
| Name similarity | 0.35 | pg_trgm similarity() on normalized names | Primary signal. Handles typos, suffix variations. |
| Website domain match | 0.30 | Extract and compare domains (strip www, compare hosts) | Strongest confirmation signal. Same domain = almost certainly same company. |
| Description similarity | 0.15 | pg_trgm similarity() on descriptions (if both non-empty) | Secondary signal. Same description = same company. |
| Logo URL match | 0.10 | Exact URL comparison or image hash | If both have logos from same URL or same visual hash. |
| AI judgment | 0.10 | LLM binary yes/no with confidence | Catches semantic matches that string similarity misses. |

### Job Matching Signals (within same company)

| Signal | Weight | Method | Notes |
|--------|--------|--------|-------|
| Title similarity | 0.30 | Jaro-Winkler on normalized titles | Primary signal. Handles minor title variations. |
| Description similarity | 0.25 | pg_trgm similarity() on raw descriptions | Same description = same job. |
| Salary range overlap | 0.15 | Range intersection check | Same salary range = likely same job. |
| Skills overlap | 0.15 | Jaccard similarity on skill sets | Same skills = likely same job. |
| Source URL domain | 0.10 | Different source = cross-source candidate | Same source duplicates handled by source_id. |
| Posted date proximity | 0.05 | Within 30 days of each other | Distant dates = might be different openings of same role. |

## Survivorship Rules (Field-Level Merge Strategy)

When merging two records, these rules determine which field value survives:

### Company Merge Survivorship

| Field | Rule | Rationale |
|-------|------|-----------|
| name | Admin choice (default: shorter, cleaner variant) | Admin knows the canonical name. Shorter names without suffixes are usually cleaner. |
| slug | Survivor's slug (redirect victim's slug) | SEO continuity. Add redirect from victim slug. |
| description | Longer non-empty value (AI-enriched preferred) | More content = more useful. AI-enriched > raw. |
| logo | First non-null (prefer non-favicon) | Any logo is better than none. og:image > favicon. |
| website | First non-null | Either company's website is correct. |
| size | Non-null value (AI-enriched preferred) | Prefer concrete data over empty. |
| industry_id | Non-null value | First available industry classification. |
| verified | true if either is true | If either was verified, the merged entity inherits verification. |
| ai_enriched_at | Most recent non-null | Latest enrichment is most accurate. |
| created_at | Earliest | Preserve historical record creation. |

### Job Merge Survivorship (Richest-Data-Wins)

| Field | Rule | Rationale |
|-------|------|-----------|
| title | AI choice (clearest, most professional) | LLM picks the better title from the candidates. |
| description | AI-enriched version preferred; longest if both enriched | Enriched descriptions are higher quality. |
| salary_min/max | Non-null with narrower range | More specific salary info is more valuable to job seekers. |
| salary_currency | Non-null value | Any currency data is better than none. |
| experience_level | Non-null value | Prefer extracted/specified over empty. |
| remote_type | Non-null value | Prefer extracted/specified over empty. |
| skills | Union of all skills | Combine all extracted skills for most complete picture. |
| locations | Union of all locations | Combine all location associations. |
| categories | Union of all categories | Combine all category associations. |
| source_url | Keep all as array or primary + alternates | Preserve provenance. User can verify on original source. |

## Admin Review Workflow

### Duplicate Review Queue Flow

```
1. Batch detection worker finds candidate pairs
   |
2. AI verification scores each pair (0.0-1.0)
   |
3. Route by confidence:
   |-- >= 0.95 + same domain --> Auto-merge (logged)
   |-- >= 0.80 + same domain --> Auto-merge (logged)
   |-- 0.60-0.94 without domain match --> Admin review queue
   |-- < 0.60 --> Discard (not a duplicate)
   |
4. Admin review queue shows:
   |-- Side-by-side comparison (name, logo, website, description, job count)
   |-- AI confidence score + explanation
   |-- Suggested survivor (more jobs, more complete profile)
   |-- Actions: Approve Merge | Reject | Skip | Swap Survivor
   |
5. Approved merge executes:
   |-- Transfer all related records to survivor
   |-- Create alias entry from victim name
   |-- Soft-delete victim
   |-- Log merge with full victim snapshot
   |-- Update Meilisearch for affected jobs
   |
6. Merge history shows:
   |-- All past merges (auto + manual)
   |-- Undo button (within 30 days)
   |-- Audit trail (who merged, when, confidence)
```

### Admin UI Components Needed

| Component | Location | Description |
|-----------|----------|-------------|
| Duplicate Review Queue | `/admin/companies/duplicates` | Paginated list of pending duplicate pairs with confidence scores |
| Side-by-Side Comparison | Modal or expanded row | Two-column view showing both company profiles |
| Merge Confirmation Dialog | Modal | Shows what will be transferred (N jobs, M users, etc.) |
| Merge History | `/admin/companies/merge-history` | Table of past merges with undo buttons |
| Job Duplicate Queue | `/admin/jobs/duplicates` | Similar to company queue but for job pairs |
| Dedup Dashboard Stats | `/admin/dashboard` extension | Add duplicate counts to existing dashboard |

## Sources

- [PostgreSQL pg_trgm extension documentation](https://www.postgresql.org/docs/current/pgtrgm.html) -- Trigram similarity functions and index types (HIGH confidence, official documentation)
- [PostgreSQL fuzzystrmatch extension](https://www.postgresql.org/docs/current/fuzzystrmatch.html) -- Soundex, metaphone, Levenshtein functions (HIGH confidence, official documentation)
- [Entity Resolution: Techniques, Tools and Use Cases](https://www.puppygraph.com/blog/entity-resolution) -- Overview of entity resolution patterns (MEDIUM confidence)
- [The Data Engineer's Guide to Entity Resolution](https://www.peopledatalabs.com/data-lab/datafication/entity-resolution-guide) -- Blocking strategies and scoring approaches (MEDIUM confidence)
- [Using LLMs for Data Cleaning at Scale](https://futuresearch.ai/dedupe-at-scale/) -- LLM-based dedup at scale with confidence scoring, tested on company names (F1=0.976) (MEDIUM confidence)
- [Enhancing Entity Resolution Using Generative AI](https://medium.com/@reveriano.francisco/enhancing-entity-resolution-using-generative-ai-part-1-5c6fed1d037a) -- GenAI + vector embedding architecture for entity resolution (MEDIUM confidence)
- [Duplicate Detection with GenAI](https://medium.com/data-science/duplicate-detection-with-genai-ba2b4f7845e7) -- LLM-based duplicate detection patterns (MEDIUM confidence)
- [Data Survivorship: How to Build the Golden Record](https://dataladder.com/guide-to-data-survivorship-how-to-build-the-golden-record/) -- Survivorship rules and golden record construction (MEDIUM confidence)
- [Company Name Normalization for Deduplication](https://medium.com/tilo-tech/how-to-normalize-company-names-for-deduplication-and-matching-21e9720b30ba) -- Specific company name normalization techniques (MEDIUM confidence)
- [Using Algorithms to Normalize Company Names](https://www.addaptive.com/blog/using-algorithms-normalize-company-names/) -- Company suffix handling, abbreviation normalization (MEDIUM confidence)
- [Best Practices for Expired Jobs on Job Boards](https://www.recsitedesign.com/blog/articles/best-practices-when-dealing-with-expired-jobs-on-your-job-board/) -- Stale listing management patterns (MEDIUM confidence)
- Existing codebase analysis: `internal/scraper/dedup.go`, `worker/scraping.go`, `worker/staleness.go`, `worker/company_enrichment.go`, `ai/enrich.go`, `ai/company_enrich.go`, migrations 000001-000025 (HIGH confidence, direct inspection)

---
*Feature research for: AI-powered duplicate detection and data quality in multi-source job aggregation platform*
*Researched: 2026-02-26*
