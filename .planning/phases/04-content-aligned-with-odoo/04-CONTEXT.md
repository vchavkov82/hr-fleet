# Phase 4: Content Aligned with Odoo - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Update all marketing content (features page, homepage, pricing, blog, help center) to accurately reflect what the platform delivers via Odoo backend. Strip aspirational AI claims and fake social proof. Add new content tied to real capabilities: employee management, HR calculators, Bulgarian compliance. No new features — this is content-only alignment.

</domain>

<decisions>
## Implementation Decisions

### Content Honesty Strategy
- Strip features page to what actually exists (employee management, calculators)
- Unbuilt modules (ATS, Leave, Payroll, Performance, Onboarding) move to a "Roadmap" section with brief descriptions and "Coming soon" badges
- Remove all fabricated statistics ("500+ companies", "97% less admin", "70% faster hiring")
- Remove all fake testimonials and company logo strips entirely — no social proof until real ones exist
- Replace hero/marketing claims with honest value-proposition copy about what the platform does today
- Homepage feature cards highlight: Employee Management (real), HR Calculators (real), Bulgarian Compliance (real value prop)

### Blog Content Direction
- Keep all 18 existing generic HR blog posts (SEO value)
- Add 4-6 new targeted blog posts across these topics:
  - Bulgarian labor law guides (contracts, probation, termination, sick leave, maternity)
  - Platform how-tos (employee directory, salary calculators, freelancer comparison walkthrough)
  - EOOD/freelancer deep dives (tax optimization, common mistakes, when to switch)
  - Bulgarian HR market insights (average salaries, hiring trends, social security 2026)
- Language: Bulgarian primary, English translation only for select high-traffic posts
- Blog posts live in both `blog/src/blog/` and `www/src/content/blog/` (Astro blog + Next.js content)

### Help Center & Documentation
- Document real features only: employee directory (CRUD, search/filter), salary calculator, freelancer comparison, dashboard navigation
- Remove placeholder articles for unbuilt features
- Format: step-by-step guides with screenshot placeholders (actual screenshots added during QA)
- Bilingual: both BG and EN for all help articles (uses existing next-intl infrastructure)
- Skip Starlight docs site entirely — this phase is user-facing content only

### Pricing Page Alignment
- Single plan: "HR Platform" with employee management included
- Unbuilt modules shown as future add-ons with "Coming soon" labels
- Keep "Get a quote" / "Start free trial" CTAs (no public prices — decided in Phase 1)
- Feature comparison table shows available features only — updated as modules ship
- 60-day free trial period stays as-is

### Claude's Discretion
- Exact copy/wording for updated marketing claims
- Blog post titles and SEO keyword targeting
- Help article structure and navigation organization
- Roadmap section visual design on features page
- Order and grouping of feature comparison table rows
- Which existing blog posts get English translations

</decisions>

<specifics>
## Specific Ideas

- "Ship what's real" — the core principle for this phase. Every claim on the site should be verifiable.
- Employee Management + HR Calculators + Bulgarian Compliance = the three pillars of current value proposition
- Features page should have deep content for employee management (the real, working module) and a compact roadmap preview for what's coming
- Blog posts should serve dual purpose: SEO traffic + demonstrate platform expertise in Bulgarian HR market
- Help center articles become the product's onboarding — step-by-step with screenshots makes the product feel polished

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `next-intl` i18n: All marketing pages already bilingual via `messages/en/*.json` and `messages/bg/*.json`
- Feature row component (`www/src/components/sections/feature-row.tsx`): Reuse for updated features page
- Features overview component (`www/src/components/sections/features.tsx`): Update FEATURE_KEYS from ['ats', 'employees', 'leave'] to real features
- Help center pages (`www/src/app/[locale]/help-center/`): Existing route structure with categories, articles, search
- Blog infrastructure: Astro blog at `blog/` proxied via Next.js rewrites, content in markdown

### Established Patterns
- Translation files per namespace: `messages/{locale}/{namespace}.json`
- Server/client component split for SEO content pages
- Section components in `www/src/components/sections/` (hero, cta, features, stats, testimonials)
- Blog posts as markdown files with frontmatter

### Integration Points
- `www/messages/en/features.json` and `bg/features.json`: Feature descriptions to rewrite
- `www/messages/en/hero.json` and `bg/hero.json`: Hero claims to update
- `www/messages/en/pages.json` features sections: Detailed feature bullets to strip/update
- `www/src/components/sections/testimonials.tsx`: Remove or replace
- `www/src/components/sections/trusted-companies.tsx`: Remove or replace
- `www/src/components/sections/stats-counters.tsx`: Remove fake stats or use real data
- `www/src/app/[locale]/pricing/page.tsx`: Restructure from module pricing to single plan
- `www/src/app/[locale]/help-center/`: Update articles with real feature docs
- `blog/src/blog/` and `www/src/content/blog/`: New blog post files

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-content-aligned-with-odoo*
*Context gathered: 2026-03-08*
