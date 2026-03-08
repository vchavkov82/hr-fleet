# Phase 4: Content Aligned with Odoo - Research

**Researched:** 2026-03-08
**Domain:** Marketing content alignment, i18n content updates, blog authoring, help center documentation
**Confidence:** HIGH

## Summary

Phase 4 is a content-only phase: no new features, no new components, no backend changes. The work is rewriting translation JSON files, updating React component configurations (arrays and constants), removing fake social proof sections, restructuring the pricing page model, writing new blog posts, and updating help center articles. All infrastructure already exists -- this phase uses established patterns (next-intl namespaces, Astro markdown posts, section components).

The primary risk is scope creep: the temptation to refactor components while updating content. The phase boundary is clear -- edit translation strings, update component config arrays, write markdown files. Component structure changes should be minimal (removing sections from homepage, adding a "Coming soon" badge CSS class, restructuring pricing page constants).

**Primary recommendation:** Organize work by content surface (homepage, features page, pricing page, help center, blog) and process each surface through a content audit + rewrite + bilingual translation cycle.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Strip features page to what actually exists (employee management, calculators)
- Unbuilt modules (ATS, Leave, Payroll, Performance, Onboarding) move to a "Roadmap" section with brief descriptions and "Coming soon" badges
- Remove all fabricated statistics ("500+ companies", "97% less admin", "70% faster hiring")
- Remove all fake testimonials and company logo strips entirely -- no social proof until real ones exist
- Replace hero/marketing claims with honest value-proposition copy about what the platform does today
- Homepage feature cards highlight: Employee Management (real), HR Calculators (real), Bulgarian Compliance (real value prop)
- Keep all 18 existing generic HR blog posts (SEO value)
- Add 4-6 new targeted blog posts (Bulgarian labor law, platform how-tos, EOOD/freelancer, BG HR market)
- Language: Bulgarian primary, English translation only for select high-traffic posts
- Blog posts live in both `blog/src/blog/` and `www/src/content/blog/`
- Document real features only in help center
- Remove placeholder articles for unbuilt features
- Format: step-by-step guides with screenshot placeholders
- Bilingual help articles (BG and EN via next-intl)
- Skip Starlight docs site entirely
- Single plan: "HR Platform" with employee management included
- Unbuilt modules shown as future add-ons with "Coming soon" labels
- Keep "Get a quote" / "Start free trial" CTAs
- Feature comparison table shows available features only
- 60-day free trial period stays

### Claude's Discretion
- Exact copy/wording for updated marketing claims
- Blog post titles and SEO keyword targeting
- Help article structure and navigation organization
- Roadmap section visual design on features page
- Order and grouping of feature comparison table rows
- Which existing blog posts get English translations

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (already in place -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | existing | All bilingual content via JSON namespaces | Already powers BG/EN across entire site |
| Astro 5 | existing | Blog posts as markdown with frontmatter | AstroPaper template already configured |
| Tailwind CSS | existing | Styling for any new UI elements (badges) | Design system already established |
| Framer Motion | existing | SectionReveal animations on homepage | Already wrapping all homepage sections |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | - | No new libraries needed | This is a content-only phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| N/A | N/A | No technology decisions needed -- all infrastructure exists |

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Content File Map (what changes where)

```
www/messages/en/                    # English translations (PRIMARY edits)
  hero.json                         # Hero claims, badge text, trust text
  features.json                     # Feature card titles/descriptions
  featuresOverview.json             # Homepage feature overview cards
  stats.json                        # REMOVE fake stats or replace section
  testimonials.json                 # REMOVE fake testimonials
  trustedCompanies.json             # REMOVE fake company logos
  cta.json                          # CTA copy (remove fake claims)
  howItWorks.json                   # "How it works" steps
  pricingPreview.json               # Homepage pricing preview
  helpCenter.json                   # Help center articles/categories
  pages.json                        # Features page sections, pricing page content

www/messages/bg/                    # Bulgarian translations (MIRROR all EN changes)
  [same files as above]

www/src/app/[locale]/page.tsx       # Homepage: remove TrustedCompanies, Stats, Testimonials sections
www/src/app/[locale]/features/page.tsx  # Features: restructure FEATURE_SECTIONS array
www/src/app/[locale]/pricing/page.tsx   # Pricing: restructure MODULE_KEYS, FEATURE_MATRIX
www/src/components/sections/features.tsx # Update FEATURE_KEYS from ['ats','employees','leave']

blog/src/blog/                      # New blog posts (4-6 markdown files)
www/src/content/blog/               # Duplicate blog posts for Next.js content
```

### Pattern 1: Translation JSON Update
**What:** Edit translation namespace JSON files to update marketing copy
**When to use:** Every text change on the marketing site
**Example:**
```json
// www/messages/en/hero.json -- BEFORE
{
  "badge": "AI-powered HR for modern teams",
  "trustedBy": "Trusted by 500+ Bulgarian companies"
}

// www/messages/en/hero.json -- AFTER
{
  "badge": "HR platform for Bulgarian businesses",
  "trustedBy": null  // or remove key entirely
}
```

### Pattern 2: Component Section Removal from Homepage
**What:** Remove sections from homepage by removing the component import and JSX
**When to use:** Removing TrustedCompanies, Stats, Testimonials from homepage
**Example:**
```tsx
// www/src/app/[locale]/page.tsx
// REMOVE these imports and their <SectionReveal> wrappers:
// - TrustedCompanies
// - StatsCounters section
// - Testimonials
// KEEP: Hero, Features, HowItWorks, BlogPosts, CTA
```

### Pattern 3: Feature Array Restructuring
**What:** Change the constant arrays that drive feature listings
**When to use:** Features page, pricing page, homepage features
**Example:**
```tsx
// www/src/app/[locale]/features/page.tsx -- BEFORE
const FEATURE_SECTIONS = [
  { id: 'ats', key: 'ats', reversed: false },
  { id: 'employees', key: 'employees', reversed: true },
  { id: 'leave', key: 'leave', reversed: false },
  { id: 'payroll', key: 'payroll', reversed: true },
  { id: 'performance', key: 'performance', reversed: false },
  { id: 'onboarding', key: 'onboarding', reversed: true },
]

// AFTER -- real features first, then roadmap section
const ACTIVE_FEATURES = [
  { id: 'employees', key: 'employees', reversed: false },
  { id: 'calculators', key: 'calculators', reversed: true },
  { id: 'compliance', key: 'compliance', reversed: false },
]

const ROADMAP_FEATURES = [
  { id: 'ats', key: 'ats' },
  { id: 'leave', key: 'leave' },
  { id: 'payroll', key: 'payroll' },
  { id: 'performance', key: 'performance' },
  { id: 'onboarding', key: 'onboarding' },
]
```

### Pattern 4: Blog Post Frontmatter (Astro AstroPaper)
**What:** Markdown files with required YAML frontmatter
**When to use:** Every new blog post
**Example:**
```yaml
---
author: "HR Team"
pubDatetime: 2026-03-10T09:00:00.000Z
title: "Title here"
featured: false
draft: false
tags: ["bulgarian-labor-law", "compliance"]
description: "150-160 char meta description"
---
```

### Pattern 5: "Coming Soon" Badge for Roadmap Items
**What:** Visual indicator that a feature is planned but not yet available
**When to use:** Features page roadmap section, pricing page future modules
**Example:**
```tsx
<span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
  Coming soon
</span>
```

### Anti-Patterns to Avoid
- **Refactoring components during content updates:** This phase is content-only. Do not restructure component architecture unless absolutely necessary for the content change.
- **Creating new page routes:** All pages already exist. Update existing routes, don't create new ones.
- **Adding new npm dependencies:** No new libraries needed for content changes.
- **Writing copy that claims unbuilt features exist:** Every claim must map to a real, working feature.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bilingual content | Custom i18n solution | next-intl JSON namespaces | Already configured and working for BG/EN |
| Blog posts | Custom CMS or MDX pipeline | Astro AstroPaper markdown files | Blog infrastructure exists, just add .md files |
| "Coming soon" badges | Complex state management | Static CSS badge classes | These are purely visual indicators, no logic needed |
| Feature comparison | Dynamic feature registry | Static arrays in page components | Content is static, keep it simple |

**Key insight:** This phase has zero infrastructure work. Every pattern is already established. The work is purely editorial: writing copy, updating JSON, writing markdown.

## Common Pitfalls

### Pitfall 1: Forgetting Bulgarian Translations
**What goes wrong:** English translations get updated but Bulgarian versions lag behind or are missed entirely
**Why it happens:** The BG JSON files are separate from EN, easy to forget
**How to avoid:** Process each content surface as EN+BG pair. Never commit an EN change without the corresponding BG change.
**Warning signs:** Site shows English strings when locale is set to BG

### Pitfall 2: Orphaned Translation Keys
**What goes wrong:** Removing a section component but leaving its translation keys, or vice versa
**Why it happens:** Translation keys are referenced by string interpolation, not imports -- no compile-time check
**How to avoid:** When removing a component/section, search for its translation namespace across all files
**Warning signs:** Console warnings about missing translation keys, dead JSON keys bloating bundle

### Pitfall 3: Blog Post Duplication Drift
**What goes wrong:** Blog post in `blog/src/blog/` differs from copy in `www/src/content/blog/`
**Why it happens:** Posts must exist in both locations per project architecture
**How to avoid:** Write once, copy to both directories. Verify identical content.
**Warning signs:** Different content showing on Astro blog vs Next.js blog routes

### Pitfall 4: Breaking Feature Page Data Contracts
**What goes wrong:** Changing `FEATURE_SECTIONS` keys without updating corresponding `pages.json` translation keys
**Why it happens:** The features page reads translations via `t('sections.${key}.title')` -- key mismatch causes missing text
**How to avoid:** When renaming or adding feature keys, update both the component constant AND the translation JSON
**Warning signs:** Build warnings, blank text on features page

### Pitfall 5: Pricing Page Module/Feature Matrix Mismatch
**What goes wrong:** `MODULE_KEYS` array has different length than `FEATURE_MATRIX` boolean arrays
**Why it happens:** The comparison table maps features to modules via boolean arrays indexed by MODULE_KEYS position
**How to avoid:** When changing MODULE_KEYS, update every row in FEATURE_MATRIX to match the new column count
**Warning signs:** Table renders with wrong checkmarks in wrong columns, or JS errors

### Pitfall 6: Claims Creep
**What goes wrong:** New copy subtly re-introduces aspirational claims ("AI-powered", "50+ integrations")
**Why it happens:** Marketing copy patterns are habitual -- easy to slip into feature-forward language
**How to avoid:** Content review checklist: Can a user do this TODAY? If no, it must say "Coming soon" or be removed.
**Warning signs:** Any claim that can't be verified by clicking through the live product

## Code Examples

### Removing Homepage Sections
```tsx
// www/src/app/[locale]/page.tsx -- updated structure
// Source: current codebase analysis
import Hero from '@/components/sections/hero'
import Features from '@/components/sections/features'
import HowItWorks from '@/components/sections/how-it-works'
import BlogPosts from '@/components/sections/blog-posts'
import CTA from '@/components/sections/cta'

// REMOVED: TrustedCompanies, StatsCounters, Testimonials
export default async function HomePage({ params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <Hero />
      <SectionReveal><Features /></SectionReveal>
      <SectionReveal><HowItWorks /></SectionReveal>
      <SectionReveal><BlogPosts /></SectionReveal>
      <SectionReveal><CTA /></SectionReveal>
    </>
  )
}
```

### Updated Homepage Feature Cards
```tsx
// www/src/components/sections/features.tsx
// Change FEATURE_KEYS to reflect real capabilities
const FEATURE_KEYS = ['employees', 'calculators', 'compliance'] as const
```

### Updated Pricing Page Structure (single plan)
```tsx
// Simplified MODULE_KEYS -- one active, rest are coming soon
const ACTIVE_MODULES = ['coreHr'] as const
const COMING_SOON_MODULES = ['ats', 'leave', 'payroll', 'performance', 'onboarding'] as const
```

### Blog Post Template (Bulgarian Labor Law)
```markdown
---
author: "HR Team"
pubDatetime: 2026-03-10T09:00:00.000Z
title: "Title in Bulgarian"
featured: false
draft: false
tags: ["bulgarian-labor-law", "compliance", "contracts"]
description: "150-160 char Bulgarian description"
---

# Title

Content body in Bulgarian...
```

## State of the Art

| Old Approach (Phase 1) | Current Approach (Phase 4) | When Changed | Impact |
|-------------------------|---------------------------|--------------|--------|
| 6-module feature showcase | 3 real features + roadmap section | Phase 4 | Features page restructured |
| Fake stats counters (500+, 12000+, 98%) | Section removed entirely | Phase 4 | Homepage shorter, more honest |
| Fake testimonials (3 fabricated) | Section removed entirely | Phase 4 | No social proof until real |
| Fake company logo strip | Section removed entirely | Phase 4 | No trust signals until real |
| Module-based pricing (6 modules) | Single plan + coming soon add-ons | Phase 4 | Pricing page simplified |
| AI-powered claims throughout | Honest capability descriptions | Phase 4 | All copy rewritten |

**Deprecated/outdated:**
- `stats.json`, `testimonials.json`, `trustedCompanies.json`: Translation files kept but sections removed from homepage
- `StatsCounters`, `Testimonials`, `TrustedCompanies` components: No longer imported on homepage (can be deleted or kept for future use)

## Content Inventory -- What Must Change

### Files Requiring Content Rewrites (EN + BG pairs)
| File | What Changes | Scope |
|------|-------------|-------|
| `hero.json` | Badge, headline, subheadline, trustText, trustedBy | Full rewrite |
| `features.json` | All 6 items -- keep employees, add calculators + compliance, mark rest roadmap | Full rewrite |
| `featuresOverview.json` | heading, subheading, items (change from ats/employees/leave to employees/calculators/compliance) | Full rewrite |
| `stats.json` | Remove or replace with real data | Remove section |
| `testimonials.json` | Remove fake testimonials | Remove section |
| `trustedCompanies.json` | Remove fake company names | Remove section |
| `cta.json` | Remove "500+ companies", "70% faster", "97% less admin" claims | Rewrite copy |
| `howItWorks.json` | Update steps to match real product flow | Moderate rewrite |
| `pricingPreview.json` | Restructure from 3 modules to single plan + roadmap | Full rewrite |
| `helpCenter.json` | Replace ATS/payroll/leave articles with real feature docs | Full rewrite |
| `pages.json` (features) | Rewrite all 6 feature sections; add roadmap concept | Major rewrite |
| `pages.json` (pricing) | Restructure modules, update comparison table | Major rewrite |

### Files Requiring Code Changes
| File | What Changes |
|------|-------------|
| `www/src/app/[locale]/page.tsx` | Remove TrustedCompanies, Stats, Testimonials sections |
| `www/src/app/[locale]/features/page.tsx` | Restructure FEATURE_SECTIONS, add roadmap section |
| `www/src/app/[locale]/pricing/page.tsx` | Restructure MODULE_KEYS, FEATURE_MATRIX, add Coming Soon |
| `www/src/components/sections/features.tsx` | Update FEATURE_KEYS array |

### New Files to Create
| File | Purpose |
|------|---------|
| 4-6 blog posts in `blog/src/blog/` | Bulgarian labor law, platform how-tos, EOOD content |
| 4-6 blog posts in `www/src/content/blog/` | Duplicate of above for Next.js |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x with jsdom |
| Config file | `www/vitest.config.ts` |
| Quick run command | `cd www && bun test` |
| Full suite command | `cd www && bun test` |

### Phase Requirements -> Test Map

Since this is a content-only phase, most validation is visual/manual. Automated tests focus on structural integrity.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONTENT-01 | Homepage renders without removed sections | smoke | `cd www && bun test -- --grep "homepage"` | No -- Wave 0 |
| CONTENT-02 | Features page renders with new feature keys | smoke | `cd www && bun test -- --grep "features"` | No -- Wave 0 |
| CONTENT-03 | Pricing page renders with restructured modules | smoke | `cd www && bun test -- --grep "pricing"` | No -- Wave 0 |
| CONTENT-04 | All EN translation keys have BG counterparts | unit | `cd www && bun test -- --grep "i18n"` | Yes (i18n.test.ts) |
| CONTENT-05 | Blog posts have valid frontmatter | unit | `cd www && bun test -- --grep "blog"` | No -- Wave 0 |
| CONTENT-06 | No fake statistics in translation files | unit | `cd www && bun test -- --grep "content-honesty"` | No -- Wave 0 |
| CONTENT-07 | Build succeeds with all content changes | build | `make build-www` | N/A (build command) |

### Sampling Rate
- **Per task commit:** `cd www && bun test`
- **Per wave merge:** `make build-www`
- **Phase gate:** Full build + visual review of all updated pages

### Wave 0 Gaps
- [ ] Existing `i18n.test.ts` should be sufficient for translation key parity -- verify coverage
- [ ] Build verification via `make build-www` is the primary automated gate
- [ ] Visual review is the primary validation method for content phases -- no test file needed for copy quality

*(Content phases are primarily validated through build success and visual review, not unit tests. The existing i18n test covers translation key completeness.)*

## Open Questions

1. **Help center article slugs/routes**
   - What we know: Dynamic routes exist at `[locale]/help-center/articles/[article]` and `categories/[category]`
   - What's unclear: How articles are resolved -- are they from translation JSON or from a content directory?
   - Recommendation: Investigate the article page component before planning help center tasks. Likely driven by helpCenter.json keys.

2. **Blog post SEO keywords for Bulgarian market**
   - What we know: Posts should target Bulgarian labor law, EOOD, freelancer topics
   - What's unclear: Specific keyword volumes and competition in Bulgarian search
   - Recommendation: Claude's discretion per CONTEXT.md. Write for the target audience, not keyword density.

3. **Whether to delete or keep removed section components**
   - What we know: TrustedCompanies, StatsCounters, Testimonials components will be unused
   - What's unclear: Whether they should be deleted (clean) or kept (future social proof)
   - Recommendation: Keep the component files but remove from homepage imports. They can be restored when real testimonials/stats exist.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all translation JSON files (EN namespace)
- Direct codebase analysis of all page components and section components
- CONTEXT.md user decisions

### Secondary (MEDIUM confidence)
- AstroPaper blog conventions from blog/CLAUDE.md skill file
- next-intl patterns from existing codebase usage

### Tertiary (LOW confidence)
- None -- all findings verified from codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all infrastructure exists, no new dependencies
- Architecture: HIGH - patterns directly observed in codebase
- Pitfalls: HIGH - derived from actual code structure analysis
- Content inventory: HIGH - every file identified and analyzed

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable -- content-only phase with no external dependencies)
