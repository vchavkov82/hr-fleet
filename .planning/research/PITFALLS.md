# Pitfalls Research

**Domain:** AI-powered deduplication, entity resolution, and data quality for multi-source job platform
**Researched:** 2026-02-26
**Confidence:** HIGH (grounded in codebase analysis of existing scraper/AI pipeline + verified industry patterns)

## Critical Pitfalls

### Pitfall 1: Over-Merging Destroys Data Permanently (The Catastrophic False Positive)

**What goes wrong:**
Two distinct entities are incorrectly merged -- for example, "Telerik" (the component library company) and "Telerik Academy" (the education spinoff) are merged because their names are 85% similar. Or "Sofia Tech" (a startup) and "Sofia Technology Group" (an enterprise). Once merged, all jobs, applications, company_members, contacts, and scraper_configs from the victim record are reassigned to the surviving record. If the merge is wrong, reconstructing the original state requires manual investigation of every affected row. With the existing `ON DELETE CASCADE` foreign keys on companies, a naive delete-and-reassign approach could cascade-delete applications, invitations, and contacts before the reassignment happens.

**Why it happens:**
The existing `IsFuzzyMatch` in `dedup.go` uses Jaro-Winkler at 0.85 threshold, which works for catching typos but produces false positives for legitimately distinct entities with similar names. Bulgarian company names compound the problem: "Sirma Group" vs "Sirma Solutions" vs "Sirma AI" are all real, separate companies under a holding group. The `NormalizeCompanyName` function strips suffixes (OOD, EOOD, AD) but does not handle parent/subsidiary distinctions. AI-based matching can also over-merge when the LLM lacks context about the Bulgarian tech ecosystem. The codebase has no merge undo mechanism.

**How to avoid:**
1. **Never auto-merge companies below 0.95 confidence.** The cost of a false positive (data destruction) vastly exceeds the cost of a false negative (duplicate stays). Set auto-merge threshold at 0.95+ and route everything below to admin review queue.
2. **Build merge undo from day one.** Before executing a merge, create a `merge_events` record capturing: source_id, target_id, merge_type, confidence_score, merged_by, and a JSONB snapshot of all affected FK rows (jobs moved, applications moved, contacts moved, users reassigned). This enables one-click undo.
3. **Never use DELETE for merges.** Use UPDATE to reassign FK references, then soft-delete the victim record. The victim stays in the database (with `deleted_at` set and `merged_into_id` pointing to the survivor) so undo is always possible.
4. **Add a "merged_into_id" column to companies** that creates a redirect chain. When the old company slug is accessed, redirect to the surviving company. This preserves SEO value and prevents broken links.
5. **Require at least two matching signals for auto-merge:** Name similarity alone is never enough. Combine with: same website domain, same LinkedIn URL, same contact email domain, overlapping job titles. The existing `companies` table has `website`, `linkedin_url`, and `company_contacts` -- use them.

**Warning signs:**
- Auto-merge log shows companies with confidence 0.85-0.94 being merged
- Admin receives complaints that "my company's jobs are mixed with another company"
- Company profile pages show jobs from obviously unrelated companies
- `merge_events` table shows high undo rate (>5% of merges undone)

**Phase to address:**
Phase 1 (Company dedup) -- merge infrastructure and undo mechanism must be the first thing built, before any detection logic runs.

---

### Pitfall 2: Merge Cascade Breaks Foreign Key Integrity Across 8+ Tables

**What goes wrong:**
The `companies` table is referenced by foreign keys in at least 8 places: `users.company_id` (ON DELETE SET NULL), `jobs.company_id` (ON DELETE CASCADE), `company_locations` (CASCADE), `company_invites` (CASCADE), `company_claims` (CASCADE), `candidate_invitations.company_id` (CASCADE), `company_contacts` (CASCADE), and `jobs.claimed_by_company_id` (no cascade specified). A merge operation must update ALL of these references atomically. Missing even one table means orphaned records or constraint violations. The existing `ON DELETE CASCADE` on `jobs.company_id` means deleting the victim company would cascade-delete all its jobs -- the exact opposite of what merge should do.

**Why it happens:**
Developers implement merge as "update the obvious tables (jobs, users) and delete the old company." They miss junction tables, audit logs, or recently added tables. The FK relationship graph is not documented anywhere, and sqlc-generated code does not expose FK metadata. New migrations add new tables referencing companies (e.g., migration 014 added `company_contacts`, migration 010 added contact columns) without updating a merge checklist. The codebase has no "merge" concept -- it must be built from scratch touching every table that references `companies.id`.

**How to avoid:**
1. **Create a canonical merge function** in Go that lists ALL tables with company_id FKs. Do this by querying `information_schema.table_constraints` at startup or test time to discover all FK references to `companies.id`. Fail loudly if a new FK is found that the merge function does not handle.
2. **Execute merge in a single transaction.** All FK updates + victim soft-delete must be atomic. If any step fails, the entire merge rolls back. Use `BEGIN` / `COMMIT` with explicit error checking.
3. **Handle unique constraint conflicts during merge.** When reassigning jobs from victim to survivor, the `uq_jobs_company_slug` constraint (company_id, slug) may conflict if both companies have a job with the same slug. The merge function must detect and resolve slug collisions (append `-merged-{n}` suffix).
4. **Handle the `users.company_id` reassignment carefully.** If Company A is merged into Company B, users who were members of Company A should become members of Company B. But what if a user is already a member of Company B? The `users.company_id` column allows only one company per user. The merge function must handle this conflict (log a warning, skip reassignment for already-assigned users, notify admin).
5. **Write a merge dry-run mode** that reports what would change without executing. Show: "X jobs will be reassigned, Y users will be moved, Z contacts will be merged, W slug conflicts detected." Admin reviews the dry-run output before confirming.

**Warning signs:**
- Merge operation fails with "unique constraint violation" errors
- Orphaned records discovered in `company_contacts` or `company_locations` with company_ids that no longer exist
- Users losing their company association after a merge
- Jobs disappearing from search after a company merge (because CASCADE delete fired)

**Phase to address:**
Phase 1 (Company dedup) -- the merge SQL must be the most thoroughly tested code in the milestone. Write integration tests that verify every FK table before any detection logic.

---

### Pitfall 3: Dedup Hash Brittleness Causes Both False Positives and Missed Duplicates

**What goes wrong:**
The current `Hash(title, company, location)` in `dedup.go` computes a 12-char MD5 truncation of `normalize(title):normalize(company):normalize(location)`. This hash is the primary dedup mechanism during scraping. It has two failure modes:

*False negatives (missed duplicates):* The same job posted on dev.bg as "Senior React Developer" and on jobs.bg as "Senior React.js Developer" produces different hashes. Same job, different title variation, different hash. The existing `processScrapedJob` skips cross-source duplicates only when hashes match. Textkernel's research shows genuinely duplicate job ads can share only 37% textual overlap.

*False positives (wrong matches):* Two different "Junior Java Developer" roles at two different offices of the same company in Sofia produce the same hash if both list "Sofia" as location. Different jobs, same hash, one gets silently dropped.

*Hash collision risk:* The 12-char hex truncation (48 bits) has a collision probability of ~1% at 100K records (birthday paradox). With 6 scraper sources each importing thousands of jobs, this threshold is reachable.

**Why it happens:**
The hash was designed for exact-match dedup within a single source. It works well for that purpose (catching the same dev.bg job appearing in multiple category URLs). But v1.1 requires cross-source dedup where the same role appears with different wording on different boards. The `normalize()` function lowercases and collapses whitespace but does not handle synonyms ("React" vs "React.js" vs "ReactJS"), title reformulations, or location granularity differences ("Sofia" vs "Sofia, Bulgaria" vs "Sofia, Sofia City Province").

**How to avoid:**
1. **Keep the existing hash for same-source dedup** (it works well for catching re-scraped duplicates from the same board). Do not break what works.
2. **Add a separate AI-powered cross-source dedup step** that runs after import, not during. Compare newly imported jobs against existing jobs using semantic similarity (AI embeddings or LLM comparison), not just string hashing. This decouples the fast exact-dedup (hash) from the slow fuzzy-dedup (AI).
3. **Expand the hash to full MD5 (32 chars)** to eliminate collision risk at scale. The 12-char truncation was copied from a Python prototype but is unnecessarily restrictive.
4. **Add a `canonical_title` field** computed during AI enrichment. Normalize "Senior React Developer", "Senior React.js Developer", and "Senior ReactJS Dev" to a canonical form. Use this for cross-source comparison.
5. **Use blocking before comparison.** Do not compare every new job against every existing job (O(n^2)). Block by normalized company name + approximate location. Only compare jobs within the same block. This keeps the comparison set manageable even at scale.

**Warning signs:**
- Admin panel shows obvious duplicates across sources (same company, near-identical title, different source tags)
- `dedup_hash` collision: two visually different jobs have the same hash value
- Cross-source dedup catches < 20% of true duplicates in manual spot-checks
- Job count grows linearly with scraper sources despite significant overlap

**Phase to address:**
Phase 2 (Job dedup) -- the hash fix is a quick win; the AI cross-source dedup is the main work of this phase.

---

### Pitfall 4: AI Dedup Costs Explode Due to Quadratic Comparison Without Blocking

**What goes wrong:**
Naive AI-powered dedup compares every record pair: N companies require N*(N-1)/2 comparisons. With 2,000 companies, that is ~2 million pairs. Each comparison requires an LLM API call (Claude) or local inference (Ollama). At Claude Sonnet pricing (~$3/M input tokens, ~$15/M output tokens) and ~500 tokens per comparison, 2M comparisons cost ~$3,000 for a single dedup pass. For jobs (potentially 10K+), the cost is 50M+ comparisons -- completely infeasible. Even with Ollama locally, each comparison takes ~2 seconds, meaning 2M comparisons take ~46 days of continuous inference.

**Why it happens:**
Developers implement the "obvious" approach: for each new record, compare it against all existing records. This works in demo with 50 records but is catastrophically unscalable. The existing `IsFuzzyMatch` function compares individual pairs -- it has no concept of blocking or pre-filtering. The temptation to "just use AI for everything" ignores the fundamental algorithmic complexity.

**How to avoid:**
1. **Implement blocking (candidate selection) before AI comparison.** Use cheap, deterministic signals to create small comparison blocks:
   - Companies: Block by first 3 characters of normalized name, or by website domain, or by LinkedIn URL domain. Only compare within blocks.
   - Jobs: Block by company_id + location. Only compare jobs at the same company in the same city.
2. **Use a two-stage pipeline: cheap filter then expensive AI.**
   - Stage 1 (free): pg_trgm similarity, Jaro-Winkler on normalized names, website domain match. This eliminates 99% of non-matches.
   - Stage 2 (costly): AI comparison only for the ~1% that pass Stage 1. This reduces 2M comparisons to ~20K.
3. **Use Ollama (local) for Stage 2, not Claude API.** The existing Ollama infrastructure is already deployed. A local 7B model can do "are these the same company?" with acceptable accuracy at zero marginal cost. Reserve Claude for edge cases or quality-checking Ollama's decisions.
4. **Cache comparison results.** Store `(entity_a_id, entity_b_id, similarity_score, compared_at)` in a `dedup_comparisons` table. Do not re-compare pairs unless one of the entities has been updated since the last comparison.
5. **Process incrementally, not in batch.** When a new company is created by the scraper, compare it only against its block (companies with similar names), not against all companies. This makes dedup O(block_size) per new record, not O(N).

**Warning signs:**
- AI API costs spike unexpectedly after enabling dedup
- Dedup batch job takes > 1 hour to process
- Ollama server CPU pegged at 100% during dedup windows, blocking job enrichment
- Dedup worker processes < 100 comparisons per minute

**Phase to address:**
Phase 1 (Company dedup) -- blocking strategy must be designed before writing any comparison code. This is the architecture decision that determines whether dedup is feasible at all.

---

### Pitfall 5: Real-Time Prevention Creates a Bottleneck in the Scraper Pipeline

**What goes wrong:**
Adding real-time duplicate checking to `processScrapedJob` (the function that runs for every scraped job) creates a synchronous bottleneck. Currently, the function does: sanitize -> check dedup_hash -> check source_id -> findOrCreateCompany -> create job -> enrich (AI) -> publish -> index. Adding an AI dedup check means: for every new job, query existing jobs in the same block, run AI comparison, decide whether to merge or create. If AI comparison takes 2-5 seconds per job, and a scrape cycle imports 500 jobs, the scrape time increases from ~30 minutes to ~70 minutes. The AI enrichment already runs inline (`enricher.EnrichJob`) -- adding dedup comparison doubles the AI workload per job.

**Why it happens:**
The requirement says "real-time prevention for new scrapes." The natural implementation is to add the check inside `processScrapedJob`. But this function already does AI enrichment inline, and adding another AI step compounds the latency. The scraper has a 30-minute timeout per source. With dedup added, sources with 500+ jobs may consistently timeout.

**How to avoid:**
1. **Decouple real-time prevention from AI-powered dedup.** Use cheap, deterministic checks in the hot path (dedup_hash, source_id, normalized company name exact match) and defer AI-powered fuzzy matching to a separate post-import queue.
2. **Two-phase approach:**
   - **Phase A (inline, fast):** During `processScrapedJob`, check exact dedup_hash match and exact source_id match (already implemented). Add: check for exact normalized company name match against existing companies (already implemented via `FindCompanyByNameILike`). This catches 80%+ of duplicates at zero AI cost.
   - **Phase B (async, thorough):** After the scrape cycle completes, run a dedup worker that compares newly imported jobs/companies against fuzzy matches. Flag potential duplicates for merge or auto-merge above threshold.
3. **Do not add AI calls to the scraper hot path.** The existing AI enrichment in `processScrapedJob` is already the bottleneck. Dedup must be a separate, parallelizable step.
4. **Use the existing enrichment worker pattern** (`StartCompanyEnrichmentWorker` processes batches of 20 on a ticker) for dedup as well. Create a `StartDedupWorker` that processes recently imported records in batches.

**Warning signs:**
- Scrape cycle duration increases > 50% after dedup is enabled
- Scrape runs hitting the 30-minute timeout more frequently
- `scrape_runs.status = "failed"` with "context deadline exceeded" errors
- AI provider (Ollama) overwhelmed with simultaneous enrichment + dedup requests

**Phase to address:**
Phase 2 (Job dedup) and Phase 3 (Real-time prevention) -- the architecture must separate inline deterministic checks from async AI checks. Do NOT try to make the scraper "AI-aware" for dedup.

---

### Pitfall 6: Company Name Normalization Fails on Bulgarian-Specific Patterns

**What goes wrong:**
The existing `NormalizeCompanyName` strips Bulgarian suffixes (OOD, EOOD, AD, EAD) and international ones (Ltd, Inc, GmbH). But Bulgarian company names have additional normalization challenges the current code does not handle:

1. **Cyrillic vs Latin variants:** The same company may appear as "Телерик" on one board and "Telerik" on another. The `normalize()` function lowercases but does not transliterate.
2. **Bulgarian transliteration inconsistencies:** "Сирма" could be transliterated as "Sirma" or "Syrma" depending on the transliteration standard used (the 2009 Bulgarian law mandates one standard but older registrations use others).
3. **Quotation marks and punctuation:** Bulgarian companies often appear as '"Firm Name" OOD' (with quotation marks) on official documents but "Firm Name" (without) on job boards.
4. **Parent/subsidiary confusion:** "DXC Technology", "DXC Technology Bulgaria", and "DXC Bulgaria" are all the same employer for job seekers but different legal entities. The current 0.85 Jaro-Winkler threshold may or may not match these depending on string length.
5. **Abbreviations:** "SAP Labs Bulgaria" vs "SAP" -- same employer from a job seeker perspective, very different entities legally.

**Why it happens:**
The scraper sources use different naming conventions. dev.bg tends to use English names, zaplata.bg uses Bulgarian names, LinkedIn uses whatever the company chose for their profile. There is no canonical company name registry being used. The Bulgarian Commercial Register (Targovski Registar) has official names in Cyrillic, but scrapers extract display names from job board HTML, which may be abbreviated, translated, or branded differently.

**How to avoid:**
1. **Add Cyrillic-to-Latin transliteration** using the official 2009 Bulgarian standard (documented in the Romanization of Bulgarian Wikipedia article). Apply transliteration before normalization. This allows "Телерик" and "Telerik" to match.
2. **Strip quotation marks, dashes, and special characters** during normalization. The current `normalize()` only lowercases and collapses whitespace.
3. **Add a "country suffix" removal** for "Bulgaria", "Bulgarian", "BG" at the end of company names. "SAP Labs Bulgaria" normalizes to "SAP Labs" for matching purposes.
4. **Use the company website domain as a strong matching signal.** If two company records have websites resolving to the same domain (after stripping www and path), they are very likely the same company. The existing `companies.website` column is populated by scraper backfill and website discovery worker.
5. **Create a `company_aliases` table** that maps variant names to canonical company IDs. When the scraper encounters "DXC Bulgaria", check aliases first. Populate aliases both manually (admin) and automatically (from merge operations).

**Warning signs:**
- Same company appearing 3-4 times with Cyrillic, Latin, and abbreviated variants
- Company dedup AI reporting low confidence because it cannot read Cyrillic names
- Admin manually merging the same company pairs repeatedly (variants keep getting re-created by scrapers)
- `NormalizeCompanyName` output for the same real company produces 3+ distinct normalized forms

**Phase to address:**
Phase 1 (Company dedup) -- normalization improvements must be deployed before the dedup detection runs, because the normalization quality directly determines the quality of blocking (candidate selection) for comparison.

---

### Pitfall 7: Meilisearch Index Becomes Inconsistent After Merge Operations

**What goes wrong:**
When Company A is merged into Company B, all jobs are reassigned from A to B in PostgreSQL. But the Meilisearch `jobs` index still has documents with the old company_id, company_name, and company_slug for Company A's jobs. Searches for Company B's name return incomplete results (missing the reassigned jobs). Searches for Company A's name still return results (ghost company). The existing `reconciliation.go` worker runs every 15 minutes, but if admin performs multiple merges before reconciliation runs, the search index can be significantly stale. The job detail pages may show stale company info cached in Next.js ISR.

**Why it happens:**
The codebase treats search indexing as a fire-and-forget side effect. `UpsertJob` and `DeleteJob` are called individually. There is no "reindex all jobs for company X" operation. The `reconciliation.go` worker compares Meilisearch document count against PostgreSQL count but does not check content correctness (it would need to compare every field). After a merge, the total count stays the same (no jobs were added or removed), so the reconciliation worker sees no discrepancy.

**How to avoid:**
1. **Add a `reindexCompanyJobs(companyID)` function** that fetches all jobs for a company and batch-upserts them to Meilisearch. Call this after every merge operation on the surviving company.
2. **Delete the victim company's documents from Meilisearch** as part of the merge transaction. Use `DeleteDocumentsByFilter` with `company_id = victim_id` (Meilisearch supports filter-based deletion).
3. **Add `company_name` and `company_slug` to the Meilisearch job document** (verify current document schema). When a company is renamed or merged, all its job documents must be updated.
4. **Invalidate Next.js ISR cache** for affected company pages and job pages after merge. Use Next.js revalidation API (`/api/revalidate?path=/companies/{slug}`) or tag-based revalidation.
5. **Add a merge-specific reconciliation step** that runs immediately after merge, not on the 15-minute interval.

**Warning signs:**
- Search results showing the old company name for reassigned jobs
- Company page for merged (victim) company still appearing in search results
- Job count discrepancy between company profile page (PostgreSQL) and search results (Meilisearch)
- Next.js pages showing stale company info after merge

**Phase to address:**
Phase 1 (Company dedup) -- search re-indexing must be part of the merge operation, not an afterthought. The reconciliation worker is a safety net, not the primary sync mechanism.

---

### Pitfall 8: Batch Cleanup of Existing Data Without Dry-Run Causes Irreversible Damage

**What goes wrong:**
The v1.1 milestone requires batch cleanup of existing duplicate data (companies and jobs accumulated over months of scraping). Running the dedup algorithm against the entire existing dataset in one operation risks mass incorrect merges. If the confidence threshold is slightly too aggressive, hundreds of distinct companies could be merged in minutes. Unlike real-time prevention (which processes one record at a time), batch operations affect thousands of records simultaneously, amplifying any systematic error in the matching logic.

**Why it happens:**
There is pressure to "clean up the mess" quickly. The batch approach feels efficient: find all duplicates, merge them all, done. But entity resolution algorithms have systematic biases. If the Bulgarian transliteration is wrong, every company with a Cyrillic name gets mis-matched. If the blocking strategy is too broad, unrelated companies in the same block get compared and some get merged. Batch amplifies individual errors into systemic damage.

**How to avoid:**
1. **Start with detection only.** The first batch run should produce a report (a table of suspected duplicates with confidence scores) -- NOT execute any merges. Admin reviews the report, adjusts thresholds, and iterates.
2. **Process in small batches with checkpoints.** Merge 50 companies, verify results, then merge the next 50. Never merge more than 100 records in a single unverified batch.
3. **Separate auto-merge and review queues by confidence band:**
   - 0.95+ confidence with 2+ matching signals: auto-merge
   - 0.80-0.95 confidence: admin review queue
   - Below 0.80: discard (not a duplicate)
4. **Create a database backup before each batch run.** Use `pg_dump` with timestamp. This is the nuclear undo option if systematic errors are discovered.
5. **Implement a "merge freeze" period** after batch cleanup. For 48 hours after a batch, no auto-merges happen. Admin monitors for complaints and can undo individual merges. After the freeze, re-enable auto-merge for real-time prevention.

**Warning signs:**
- Batch merge report shows > 30% of all companies flagged as duplicates (likely threshold too low)
- Multiple companies with very different names merged in the same batch (systematic matching error)
- Post-batch: admin receives multiple "my company is wrong" complaints within 24 hours
- Undo rate > 10% in the first 48 hours after a batch

**Phase to address:**
Phase 1 (Company dedup) and Phase 2 (Job dedup) -- batch cleanup must ALWAYS have a dry-run/report phase before execution. Build the reporting UI before the execution logic.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Truncated MD5 hash (12 chars) for dedup_hash | Compact, human-readable in logs | Birthday collision at ~100K records; limits cross-source matching to exact string match only | Never at production scale -- expand to full MD5 or SHA-256 |
| AI dedup using Claude API for all comparisons | Highest accuracy, no local infra needed | $3K+ per full company dedup pass; API latency blocks real-time prevention | Never for batch -- only for edge cases or quality-checking Ollama |
| Inline AI dedup in scraper hot path | Simplest implementation, prevents duplicates at ingest | Doubles scrape time; blocks enrichment; single point of failure | Never -- use async worker pattern |
| Merge without undo mechanism | Simpler merge code, fewer tables to manage | Irreversible data loss on false positive; admin trust erodes | Never -- undo is non-negotiable for merge operations |
| Single-pass batch dedup (no dry-run) | Faster cleanup of existing data | Systematic errors amplified; mass data damage; recovery requires backup restore | Never -- always dry-run first |
| Hardcoded confidence thresholds | Simple to implement and understand | Optimal thresholds vary by entity type (companies vs jobs) and data quality | MVP only -- make thresholds configurable per entity type within 1 iteration |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Existing AI enrichment pipeline + dedup | Running dedup and enrichment simultaneously on same Ollama instance, causing OOM or queue starvation | Separate dedup and enrichment into different worker pools with priority (enrichment > dedup); or use time-based scheduling (enrichment at night, dedup in morning) |
| pg_trgm similarity for blocking | Using `%` operator (GIN index) for similarity scoring instead of blocking; or computing similarity on un-normalized strings | Use `similarity()` function on normalized names for blocking; set GIN index on `name_normalized` column; combine with `word_similarity()` for substring matching ("SAP" in "SAP Labs Bulgaria") |
| `FindCompanyByNameILike` during scraping + new dedup | Scraper creates company via exact name match; dedup finds it as a duplicate of existing company; merge fires; next scrape cycle re-creates the merged company because `FindCompanyByNameILike` uses the original (pre-normalization) name | After merge, add an entry to `company_aliases` table mapping the old name to the surviving company. Update `findOrCreateCompany` to check aliases before creating a new record |
| Meilisearch filter-based deletion after merge | Assuming `deleteDocumentsByFilter` is synchronous; reading stale results immediately after | Meilisearch operations are async (return task IDs). After merge, enqueue reindex and verify completion before returning success to admin UI |
| Scraper `ON CONFLICT DO NOTHING` on slug + dedup | Company merge changes company_id on jobs, but `uq_jobs_company_slug` unique constraint on `(company_id, slug)` means two jobs with the same slug from different source companies fail when merged | Merge function must detect and resolve slug collisions; append source prefix (e.g., `devbg-senior-react-developer`) to conflicting slugs |
| Next.js ISR cache + company merge | Company pages cached with ISR (Incremental Static Regeneration) show stale data after merge; victim company page still accessible at old slug | Trigger on-demand ISR revalidation for both old and new company slugs after merge; add redirect from old slug to new slug |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Quadratic company comparison (no blocking) | Dedup batch takes hours; Ollama CPU 100% for days | Implement blocking by normalized name prefix + website domain; reduces O(n^2) to O(n * avg_block_size) | > 500 companies without blocking |
| Full-table scan for duplicate candidates | `SELECT * FROM companies WHERE similarity(name, $1) > 0.5` scans all rows | Create `name_normalized` column with GIN trigram index; use index-supported `%` operator for candidate selection | > 2,000 companies without trigram index |
| Meilisearch bulk reindex after batch merge | Reindexing 5,000+ jobs after merging 200 companies; Meilisearch becomes unresponsive | Batch Meilisearch updates (100 documents per batch); use task queue to throttle; verify Meilisearch memory limits | > 3,000 affected jobs in single merge batch |
| Merge event logging with JSONB snapshots | Storing full row snapshots for every affected row in merge_events JSONB; large merges (company with 500 jobs) create multi-MB JSON columns | Store only IDs and essential fields in snapshot; full data available via database query using stored IDs | > 100 affected rows per merge |
| AI dedup running during peak scraper hours | Both dedup and enrichment compete for Ollama inference; both slow down; scrape timeouts increase | Schedule dedup worker to run during off-peak hours (e.g., 2-6 AM); or dedicate separate Ollama instance for dedup | > 200 dedup comparisons coinciding with > 100 job enrichments |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Admin merge endpoint without CSRF protection | Attacker tricks admin into merging wrong companies via forged request | Require explicit confirmation token for merge operations; use POST with CSRF token (admin panel already uses JWT, but verify merge endpoint is not GET) |
| Merge audit log accessible to non-admin users | Leak of company relationship data (which companies are considered duplicates) | Restrict `merge_events` read access to `platform_admin` role only; do not expose merge history in company-facing API |
| AI dedup confidence scores exposed in public API | Competitors could learn which companies the platform considers similar | Keep confidence scores in admin-only endpoints; never expose dedup metadata in public company or job APIs |
| Merge of company with active `company_admin` users | Users of merged company silently lose admin access if company_id changes and they are not reassigned | Merge function must explicitly handle user reassignment; send email notification to affected users; require admin confirmation when merging companies with active users |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Auto-merge without admin notification | Admin unaware of changes to company data; discovers problems only when users complain | Send admin notification for every auto-merge (even high-confidence); include undo link; batch notifications if > 10 merges in one cycle |
| Merge review queue with no context | Admin sees "Company A (0.87) might be duplicate of Company B" but has to investigate manually | Show side-by-side comparison: names, websites, job counts, logos, locations, creation dates, source breakdown. Make the decision obvious at a glance |
| Job dedup showing wrong "canonical" version | After cross-source dedup, the surviving job listing is from the lower-quality source (sparse description, no salary) | "Richest-data-wins" merge: select the description with more content, the salary that is non-null, the metadata that is most complete. Build a field-by-field merge UI, not just "keep A or keep B" |
| Stale job cleanup deleting jobs that are still active | Platform marks job as expired because scraper failed to re-confirm (selector drift), not because the job was actually removed from source | Require 2+ consecutive failed re-confirmations before marking stale; distinguish "source confirmed removed" from "source unreachable"; show stale reason in admin UI |
| Batch cleanup results invisible to admin | Admin triggers batch dedup, sees "processing...", waits, has no idea what happened | Show real-time progress: "Compared 150/2,000 companies, found 23 potential duplicates, auto-merged 8, queued 15 for review." Use SSE or polling for progress updates |

## "Looks Done But Isn't" Checklist

- [ ] **Company merge:** Often missing -- reassignment of `company_contacts` records. Verify: after merge, all contacts from victim company appear under surviving company, with deduplication of same-email contacts.
- [ ] **Company merge:** Often missing -- slug redirect from victim to survivor. Verify: navigating to `/companies/{old-slug}` redirects to `/companies/{new-slug}`, not 404.
- [ ] **Company merge:** Often missing -- Meilisearch reindex. Verify: searching for the surviving company name returns ALL jobs (including reassigned ones) within 30 seconds of merge.
- [ ] **Company merge:** Often missing -- `scraper_configs` update. Verify: if the victim company had a scraper config mapping, the scraper now associates new jobs with the surviving company.
- [ ] **Job dedup:** Often missing -- handling of applications on the duplicate job. Verify: if both duplicate jobs have applications, all applications are preserved on the surviving job with no duplicate `(candidate_id, job_id)` constraint violations.
- [ ] **Job dedup:** Often missing -- search index cleanup for merged job. Verify: the duplicate job ID is removed from Meilisearch; searching for the job title returns one result, not two.
- [ ] **Batch cleanup:** Often missing -- pre-merge database backup. Verify: `pg_dump` ran successfully before batch execution and backup is restorable.
- [ ] **Real-time prevention:** Often missing -- company alias check in `findOrCreateCompany`. Verify: after merging "Telerik" and "Telerik AD", a scraper importing a job for "Telerik AD" maps to the surviving company, not a new duplicate.
- [ ] **Admin UI:** Often missing -- undo button on merge review page. Verify: clicking undo on a 24-hour-old merge successfully restores both companies with all their original data.
- [ ] **Confidence scoring:** Often missing -- explanation of why two entities matched. Verify: merge review shows "Matched on: name similarity 0.92, same website domain, 3 overlapping job titles" not just "confidence: 0.92".

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Over-merge (false positive company merge) | MEDIUM if undo exists, HIGH if not | If merge_events table has snapshot: execute undo function (restore victim, reassign FKs back, reindex). If no snapshot: restore from pg_dump backup, identify affected records manually, re-merge correct pairs |
| FK integrity broken after merge | HIGH | Query all FK tables for orphaned records (`WHERE company_id NOT IN (SELECT id FROM companies WHERE deleted_at IS NULL)`); reassign or delete orphans; add missing FK updates to merge function; write regression test |
| Meilisearch out of sync after merge | LOW | Run full reconciliation worker (`reconciliation.go`); or trigger targeted reindex for affected companies; verify search results manually |
| Batch cleanup went wrong (threshold too aggressive) | HIGH | Restore from pre-batch pg_dump backup; re-run with higher threshold; review all merges in merge_events table; undo individual incorrect merges |
| Scraper re-creating merged companies | LOW | Add merged company names to `company_aliases` table; update `findOrCreateCompany` to check aliases; re-run dedup on newly re-created duplicates |
| AI dedup costs exceeded budget | LOW | Switch all comparisons to Ollama (local); reduce batch size; increase blocking specificity to reduce comparison count; disable AI dedup temporarily and rely on deterministic matching only |
| Dedup worker starving enrichment worker (Ollama contention) | MEDIUM | Pause dedup worker; let enrichment catch up; implement priority scheduling; consider second Ollama instance or time-based separation |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Over-merging (false positive) | Phase 1: Company dedup (merge infra) | Auto-merge threshold >= 0.95; undo mechanism works; merge_events table populated; undo rate < 5% |
| FK cascade integrity | Phase 1: Company dedup (merge SQL) | Integration test verifies all 8+ FK tables updated correctly; no orphaned records after merge |
| Dedup hash brittleness | Phase 2: Job dedup (detection) | Full MD5 hash; cross-source dedup catches > 60% of true duplicates in spot-check |
| Quadratic comparison costs | Phase 1: Company dedup (blocking strategy) | Dedup batch for 2,000 companies completes in < 30 minutes; AI cost < $10 per batch |
| Scraper pipeline bottleneck | Phase 3: Real-time prevention | Scrape cycle duration increases < 10% with dedup enabled; no new timeout failures |
| Bulgarian name normalization | Phase 1: Company dedup (normalization) | Cyrillic-Latin transliteration works; "Telerik" and "Телерик" produce same normalized form |
| Meilisearch inconsistency | Phase 1: Company dedup (merge operation) | Search results updated within 60 seconds of merge; no ghost companies in search |
| Batch cleanup damage | Phase 1: Company dedup (batch process) | Dry-run mode exists and is mandatory before execution; pg_dump backup verified before batch |
| Stale job false expiration | Phase 4: Stale job cleanup | Requires 2+ consecutive failures before marking stale; selector drift distinguished from real removal |
| Merge review UX | Phase 1: Company dedup (admin UI) | Side-by-side comparison view exists; undo button works; progress indicator for batch operations |

## Sources

- Project codebase analysis: `backend/internal/scraper/dedup.go` (Hash, IsFuzzyMatch, NormalizeCompanyName), `backend/platform/worker/scraping.go` (processScrapedJob, findOrCreateCompany), `backend/platform/ai/enrich.go` (JobEnricher), `backend/platform/ai/company_enrich.go` (CompanyEnricher), `backend/platform/worker/company_enrichment.go`
- Database schema analysis: migrations 000001 (companies, jobs, users FK), 000003 (uq_jobs_company_slug), 000005 (applications, candidate_invitations), 000006 (source tracking, dedup_hash, company_claims), 000009 (scraper_configs), 000014 (company_contacts), 000015-016 (AI enrichment)
- [Entity Resolution Challenges - Sheshbabu](https://www.sheshbabu.com/posts/entity-resolution-challenges/) -- MEDIUM confidence
- [System Design for Entity Resolution - Sheshbabu](https://www.sheshbabu.com/posts/system-design-for-entity-resolution/) -- MEDIUM confidence
- [Can LLMs be used for Entity Resolution? - Tilores](https://tilores.io/content/Can-LLMs-be-used-for-Entity-Resolution) -- HIGH confidence (key finding: LLMs are slow, expensive, inconsistent for ER; use for edge cases only)
- [Detecting Non-Exact Duplicate Job Postings - Textkernel](https://www.textkernel.com/learn-support/blog/online-job-postings-have-many-duplicates-but-how-can-you-detect-them-if-they-are-not-exact-copies-of-each-other/) -- HIGH confidence (37% textual overlap in true duplicates; shingling + ML classifier approach)
- [How Lightcast Handles Duplicate Postings](https://kb.lightcast.io/en/articles/6957661-how-does-lightcast-handle-duplicate-postings) -- MEDIUM confidence (two-step dedup, 80% dedup rate, 60-day window)
- [Romanization of Bulgarian - Wikipedia](https://en.wikipedia.org/wiki/Romanization_of_Bulgarian) -- HIGH confidence (official 2009 transliteration standard)
- [Bulgarian Company Types - LawFirm.bg](https://lawfirm.bg/en/publications/difference-between-eood-and-ood) -- HIGH confidence (EOOD, OOD, AD entity type variations)
- [Data Merging Best Practices - Data Ladder](https://dataladder.com/merging-data-from-multiple-sources/) -- MEDIUM confidence (audit trail, survivorship rules)
- [Fuzzy Matching Guide - WinPure](https://winpure.com/fuzzy-matching-guide/) -- MEDIUM confidence (threshold tuning, false positive risks)
- [Using LLMs for Data Cleaning at Scale - FutureSearch](https://futuresearch.ai/dedupe-at-scale/) -- MEDIUM confidence

---
*Pitfalls research for: AI-powered deduplication and entity resolution for multi-source Bulgarian job platform*
*Researched: 2026-02-26*
