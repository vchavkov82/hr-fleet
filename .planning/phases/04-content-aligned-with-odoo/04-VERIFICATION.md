---
phase: 04-content-aligned-with-odoo
verified: 2026-03-08T22:00:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
human_verification:
  - test: "Load homepage at /en and /bg, visually confirm no empty gaps from removed sections"
    expected: "Hero, Features (3 cards), HowItWorks, BlogPosts, CTA render cleanly with no layout breaks"
    why_human: "Visual layout integrity cannot be verified by grep"
  - test: "Load /en/features and verify active features and roadmap section"
    expected: "3 active feature rows followed by roadmap grid with amber Coming Soon badges on 5 modules"
    why_human: "Visual rendering and badge appearance need human eyes"
  - test: "Load /en/pricing and verify single plan + muted coming-soon modules"
    expected: "Core HR card is full opacity with Get a Quote CTA; 5 coming-soon cards are muted (opacity-60) with amber badges, no CTA buttons"
    why_human: "Opacity and visual hierarchy need human verification"
  - test: "Load /bg/help-center and verify Bulgarian help center articles"
    expected: "6 articles with Bulgarian titles, categories reflect real product areas"
    why_human: "Bulgarian language quality needs native speaker review"
  - test: "Read all 6 blog posts for Bulgarian language quality"
    expected: "Natural professional Bulgarian, not machine-translated"
    why_human: "Language quality assessment requires human judgment"
---

# Phase 4: Content Aligned with Odoo Verification Report

**Phase Goal:** Align all marketing content with real platform capabilities. Strip fabricated statistics and fake social proof. Rewrite homepage, features, pricing, and help center to reflect what actually works. Add roadmap sections for planned modules. Write 6 new targeted blog posts.
**Verified:** 2026-03-08T22:00:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Homepage renders without fake stats, testimonials, or company logos | VERIFIED | `page.tsx` has no TrustedCompanies/StatsCounters/Testimonials imports. Only Hero, Features, HowItWorks, BlogPosts, CTA rendered. |
| 2 | Homepage hero shows honest value-proposition (employee management, calculators, compliance) | VERIFIED | `hero.json` badge="HR platform for Bulgarian businesses", subheadline mentions employee management, salary calculations, freelancer comparison. No AI claims. |
| 3 | Homepage feature cards show employees, calculators, compliance | VERIFIED | `features.tsx` FEATURE_KEYS = ['employees', 'calculators', 'compliance']. `featuresOverview.json` has matching items with substantive descriptions. |
| 4 | CTA section contains no fabricated statistics | VERIFIED | `cta.json` subheading: "Manage your employees, calculate salaries, and ensure Bulgarian compliance". No "500+", "97%", "70%" found anywhere. |
| 5 | HowItWorks steps describe real product flow | VERIFIED | Steps: "Sign up in minutes", "Add your employees", "Manage your HR". No references to ATS, leave tracking, or payroll. |
| 6 | Features page shows active features + roadmap with Coming Soon badges | VERIFIED | `features/page.tsx` has ACTIVE_FEATURES (employees, calculators, compliance) and ROADMAP_FEATURES (ats, leave, payroll, performance, onboarding). Roadmap section renders amber Coming Soon badges. |
| 7 | Pricing page shows single HR Platform plan with coming-soon modules | VERIFIED | `pricing/page.tsx` has ACTIVE_MODULES=['coreHr'] and COMING_SOON_MODULES with opacity-60 and amber badges. No CTA buttons on coming-soon cards. Feature checklist is single-column (coreHr only). |
| 8 | Feature comparison table only shows available features | VERIFIED | FEATURE_ROWS=['employeeProfiles','orgChart','documentStorage'], FEATURE_MATRIX has single boolean column `[true]` for each. |
| 9 | Help center articles describe real features only | VERIFIED | `helpCenter.json` has 6 articles: Getting Started, Employee Directory, Salary Calculator, Freelancer Comparison, Dashboard Overview, Tax & Social Security Guide. No ATS/payroll/AI references. |
| 10 | Help center categories reflect actual product capabilities | VERIFIED | Categories: Getting Started, Employee Management, HR Tools & Calculators, Bulgarian Compliance, Account & Settings. Old categories (Leave, Payroll, Integrations) removed. |
| 11 | Help center content is bilingual (EN + BG) | VERIFIED | Both `www/messages/en/helpCenter.json` (3.7KB) and `www/messages/bg/helpCenter.json` (5.9KB) exist with matching structure. |
| 12 | 6 new blog posts exist in both blog/ and www/src/content/blog/ | VERIFIED | All 6 posts present in both directories. `diff` confirms identical content. File sizes range 11-16KB (substantive). |
| 13 | Blog posts have valid Astro frontmatter and are not drafts | VERIFIED | All 6 posts have author, pubDatetime, title, featured:false, draft:false, tags, description. Titles in Bulgarian. |
| 14 | All translation files updated in EN+BG pairs | VERIFIED | All 8 BG translation files exist and match EN structure: hero, cta, howItWorks, features, featuresOverview, helpCenter, pages, pricingPreview. |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `www/src/app/[locale]/page.tsx` | Homepage without fake sections | VERIFIED | No TrustedCompanies/StatsCounters/Testimonials. 43 lines, clean. |
| `www/src/components/sections/features.tsx` | Updated FEATURE_KEYS | VERIFIED | FEATURE_KEYS=['employees','calculators','compliance'] with matching SVG icons. 80 lines, substantive. |
| `www/messages/en/hero.json` | Honest hero copy | VERIFIED | Badge: "HR platform for Bulgarian businesses". No AI/fake claims. |
| `www/messages/en/featuresOverview.json` | Real feature descriptions | VERIFIED | 3 items (employees, calculators, compliance) with accurate descriptions. |
| `www/messages/en/cta.json` | CTA without fabricated stats | VERIFIED | No percentages, no "500+ companies". Honest value prop. |
| `www/messages/en/howItWorks.json` | Real product steps | VERIFIED | 3 steps reflecting actual workflow. |
| `www/src/app/[locale]/features/page.tsx` | Active + roadmap split | VERIFIED | ACTIVE_FEATURES (3) + ROADMAP_FEATURES (5) with Coming Soon badges. 125 lines. |
| `www/src/app/[locale]/pricing/page.tsx` | Single plan + coming-soon | VERIFIED | ACTIVE_MODULES=['coreHr'], COMING_SOON_MODULES (5) with opacity-60. 412 lines. |
| `www/messages/en/pages.json` | Rewritten features/pricing content | VERIFIED | Features hero: "HR Platform Features". Pricing heading: "Simple pricing for growing teams". Sections include all 8 feature areas. |
| `www/messages/en/helpCenter.json` | Real-feature help articles | VERIFIED | 6 articles about working features, 5 real-product categories. 116 lines. |
| `www/messages/en/pricingPreview.json` | Updated pricing preview | VERIFIED | Heading: "Simple pricing", subheading mentions coming soon. |
| `blog/src/blog/bulgarian-labor-contracts-guide.md` | Labor law blog post | VERIFIED | 161 lines, Bulgarian, valid frontmatter. |
| `blog/src/blog/eood-vs-employment-tax-comparison-2026.md` | EOOD comparison post | VERIFIED | 192 lines, Bulgarian, valid frontmatter. |
| `blog/src/blog/salary-calculator-bulgaria-2026.md` | Salary calculator how-to | VERIFIED | 165 lines, Bulgarian, valid frontmatter. |
| All BG translation files | Bulgarian pair for each EN file | VERIFIED | 8 BG files exist with matching structure. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| features.tsx | featuresOverview.json | `t('items.${key}.title')` where key in FEATURE_KEYS | WIRED | FEATURE_KEYS=['employees','calculators','compliance'] matches JSON items keys exactly. |
| features/page.tsx | pages.json | `t('sections.${key}.title')` | WIRED | pages.json has sections.employees, sections.calculators, sections.compliance, plus 5 roadmap sections. |
| pricing/page.tsx | pages.json | `t('modules.${key}.name')` | WIRED | pages.json has modules.coreHr plus 5 coming-soon module entries. |
| help-center/page.tsx | helpCenter.json | `getTranslations('helpCenter')` | WIRED | JSON structure matches page expectations (popular.articles, categories, quickLinks). |
| blog/src/blog/*.md | www/src/content/blog/*.md | Identical filenames and content | WIRED | All 6 posts identical in both directories (verified via diff). |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CONTENT-01 | 04-01 | Homepage renders without removed sections | SATISFIED | TrustedCompanies, StatsCounters, Testimonials removed from page.tsx |
| CONTENT-02 | 04-02 | Features page renders with new feature keys | SATISFIED | ACTIVE_FEATURES + ROADMAP_FEATURES split implemented |
| CONTENT-03 | 04-02 | Pricing page renders with restructured modules | SATISFIED | ACTIVE_MODULES + COMING_SOON_MODULES split implemented |
| CONTENT-04 | 04-03 | All EN translation keys have BG counterparts | SATISFIED | All 8 BG translation files verified present |
| CONTENT-05 | 04-04 | Blog posts have valid frontmatter | SATISFIED | All 6 posts have complete valid AstroPaper frontmatter |
| CONTENT-06 | 04-01 | No fake statistics in translation files | SATISFIED | No "500+", "97%", "70% faster" found in any translation file |
| CONTENT-07 | 04-04 | Build succeeds with all content changes | SATISFIED | Summaries report builds pass (standalone mode failure is pre-existing, unrelated) |

**Note:** CONTENT-01 through CONTENT-07 are referenced in ROADMAP.md but are not formally defined in REQUIREMENTS.md. They exist only in the phase research/validation files. This is not a blocking gap -- the requirements were clearly understood and met -- but REQUIREMENTS.md should be updated to include these definitions for traceability.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| www/messages/en/pages.json | 102 | "AI-powered screening" in ATS roadmap section | Info | In roadmap/coming-soon module description, not active features. Acceptable for now but should be revisited when ATS is built. |
| www/messages/en/pages.json | 1621 | "ATS with AI-powered matching" in Terms of Service | Warning | Terms of Service references unbuilt feature. Outside Phase 4 scope but should be addressed. |
| www/messages/en/auth.json | 160 | "ATS with AI-powered candidate matching" in Terms of Service | Warning | Same ToS issue in auth flow. Outside Phase 4 scope. |
| www/messages/en/blogPosts.json | 9 | "AI in Recruiting" blog post title | Info | Pre-existing blog post, not in Phase 4 scope. |

### Human Verification Required

### 1. Homepage Visual Layout
**Test:** Load homepage at /en and /bg in browser
**Expected:** Hero, Features (3 cards: Employee Management, HR Calculators, Bulgarian Compliance), HowItWorks (3 steps), BlogPosts, CTA render cleanly with no empty gaps from removed sections
**Why human:** Visual layout integrity and spacing after section removal

### 2. Features Page Active/Roadmap Split
**Test:** Load /en/features in browser
**Expected:** 3 full feature rows for active capabilities, followed by a grid of 5 compact cards with amber "Coming Soon" badges
**Why human:** Visual hierarchy between active and roadmap sections

### 3. Pricing Page Single Plan Structure
**Test:** Load /en/pricing in browser
**Expected:** Core HR card at full opacity with Get a Quote CTA. 5 coming-soon cards muted with amber badges, no CTA buttons. Single-column feature checklist below.
**Why human:** Opacity difference, badge rendering, and overall pricing layout

### 4. Bulgarian Language Quality
**Test:** Have a Bulgarian speaker review all 6 blog posts and BG translation files
**Expected:** Natural professional Bulgarian HR terminology, not machine-translated English
**Why human:** Language quality requires native speaker assessment

### 5. Help Center Navigation
**Test:** Navigate help center categories and click through articles
**Expected:** Categories lead to relevant article listings, article pages render properly
**Why human:** Navigation flow and page rendering across routes

### Gaps Summary

No blocking gaps found. All 14 observable truths verified, all 7 requirements satisfied, all key links wired.

**Minor observations (non-blocking):**
- REQUIREMENTS.md does not formally define CONTENT-01 through CONTENT-07 (they exist only in ROADMAP.md and phase research). Recommend adding formal definitions.
- Terms of Service text in pages.json and auth.json still references "ATS with AI-powered matching" -- this is outside Phase 4 scope but should be addressed in a future content cleanup.
- Pre-existing blog posts about AI recruiting remain in the blog listing -- not in scope but noted.

---

_Verified: 2026-03-08T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
