# Phase 2: Salary Calculator — Freelancer vs Payroll Comparison - Research

**Researched:** 2026-03-08
**Domain:** Bulgarian tax calculation, Next.js client components, comparison UI
**Confidence:** HIGH

## Summary

This phase adds a marketing-focused comparison calculator at `/hr-tools/freelancer-comparison` that shows freelancers the financial disadvantage of running an EOOD vs being employed through the payroll service. The existing codebase already contains all tax constants (`BG_TAX_2026`, `BG_EOOD_2026`), the core employment calculation logic (`computeNetFromGross()`), and established patterns for calculator pages (server/client component split, `next-intl` labels, breadcrumbs, SEO content sections).

The primary work is: (1) extract `computeNetFromGross()` to a shared module, (2) build the EOOD calculation function using `BG_EOOD_2026` constants, (3) create the comparison UI with side-by-side columns, benefits table, and savings messaging, (4) add translations for both BG and EN, and (5) wire into the HR Tools page navigation.

**Primary recommendation:** Follow the existing calculator page pattern exactly (server page component + client calculator component + labels Record), extract shared calculation logic to `lib/calculations.ts`, and build the EOOD calculation as a pure function alongside the extracted employment calculation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- New standalone page at `/hr-tools/freelancer-comparison` (not integrated into existing salary calculator)
- Linked from HR Tools main page alongside existing calculators
- Own SEO content above/below the calculator (targeting "ЕООД vs трудов договор", "freelancer vs employment Bulgaria")
- Breadcrumb navigation like existing calculator pages
- Side-by-side columns: EOOD on left (muted styling), Employment on right (green border, highlighted bg as the winner)
- Single input: monthly invoice amount (what client pays) — this equals EOOD revenue AND equivalent gross salary
- Born after 1959 checkbox (same as existing calculator)
- Monthly/annual toggle to flip between timeframes (annual makes savings more impactful)
- Columns stack vertically on mobile
- Model the most common optimization: self-insure on minimum (1,077 BGN), take rest as dividends
- Corporate tax 10% on profit, then dividend tax 10% on after-tax profit (~19% effective)
- Illness/maternity insurance: default ON with toggle to disable (changes 31.3% to 27.8%)
- Optional VAT toggle: when ON, show invoice breakdown (excl VAT + 20% VAT + total) with note that VAT is pass-through and doesn't affect net income
- No VAT by default (most freelancer EOODs under 100K BGN aren't registered)
- Editable overhead fields with pre-filled defaults: Accountant fee 294 BGN/month, Bank fees 25 BGN/month, Admin time 150 BGN/month, Registration amortized 40 BGN/month
- All overhead values deducted from EOOD net income
- Pro-employment tone: employment column visually highlighted as the better option
- Green checkmark, savings banner showing "Save X BGN/month" and "Save X BGN/year"
- Show effective tax rate comparison
- CTA below results ("Switch to our payroll service — start free trial")
- Sticky bottom bar on mobile with savings amount + CTA button
- Small footnote disclaimer about EOOD advantages
- Benefits checklist table with two columns: EOOD (mostly X) vs Employment (mostly check)
- Benefits listed: paid leave, sick pay (80%), maternity (410 days), unemployment insurance, mortgage eligibility, labor code protection
- Editable vacation days field (default 20, minimum 20)
- Monetize paid leave: calculate BGN value based on entered salary and vacation days, add to total savings
- Maternity and mortgage get warning for EOOD (limited/harder, not impossible)

### Claude's Discretion
- Exact component structure and file organization
- Animation and transition details
- Responsive breakpoint behavior
- Color shades for muted EOOD vs highlighted Employment columns
- SEO content copywriting approach
- Error states and edge cases (e.g., very low or very high amounts)
- Whether to extract shared calculation logic from existing salary calculator

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CALC-01 | Side-by-side comparison showing net income: EOOD freelancer vs employment | Existing `computeNetFromGross()` handles employment side; new `computeEoodNet()` needed using `BG_EOOD_2026` constants |
| CALC-02 | EOOD calculation: corporate tax, dividend tax, self-insurance, accountant fee, admin overhead | `BG_EOOD_2026` constants already define all rates and overhead defaults |
| CALC-03 | Employment calculation uses existing salary calculator logic | `computeNetFromGross()` in `salary-calculator.tsx` -- extract to shared lib |
| CALC-04 | Comparison at user-entered gross: net to person, total cost, effective tax rate, savings | Pure calculation functions return all needed values for side-by-side display |
| CALC-05 | Visual highlight of savings when using payroll service vs EOOD | UI concern: green border/bg on employment column, savings banner component |
| CALC-06 | Hidden costs breakdown: accountant, admin time, registration, bank fees, closure risk | `BG_EOOD_2026.OVERHEAD` constants provide defaults; editable fields in UI |
| CALC-07 | Benefits comparison table: paid leave, sick leave, maternity, unemployment, mortgage, labor protection | Static comparison table with dynamic paid leave value calculation |
| CALC-08 | Fully localized in Bulgarian and English | `next-intl` with namespace `pages.hrTools.freelancerComparison` in `messages/en/pages.json` and `messages/bg/pages.json` |
| CALC-09 | SEO content sections explaining the comparison | Server component renders SEO content above/below calculator (established pattern) |
| CALC-10 | Mobile-responsive design consistent with existing calculators | Tailwind responsive classes, columns stack vertically, sticky mobile CTA bar |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.2 | App router, server/client components | Already in use |
| React | 19 | UI rendering, useState/useMemo for calculations | Already in use |
| next-intl | latest | i18n translations (getTranslations, setRequestLocale) | Already in use |
| Tailwind CSS | latest | Utility-first styling | Already in use |
| Vitest | latest | Unit testing | Already configured |
| Playwright | latest | E2E testing (Firefox) | Already configured |

### Supporting (already in project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | latest | Component testing | Unit tests for calculator component |
| Intl.NumberFormat | built-in | BGN currency formatting | Already patterned in salary-calculator.tsx |

### No New Dependencies Needed
This phase requires zero new npm packages. Everything is built on existing stack.

## Architecture Patterns

### Recommended Project Structure
```
www/src/
├── lib/
│   ├── bulgarian-tax.ts            # EXISTS: BG_TAX_2026 + BG_EOOD_2026 constants
│   └── calculations.ts             # NEW: extracted computeNetFromGross + new computeEoodNet
├── components/calculators/
│   ├── salary-calculator.tsx        # EXISTS: refactor to import from calculations.ts
│   └── freelancer-comparison.tsx    # NEW: client component with comparison UI
├── app/[locale]/hr-tools/
│   ├── page.tsx                     # EXISTS: add new calculator card
│   └── freelancer-comparison/
│       └── page.tsx                 # NEW: server component (SEO + labels + client component)
www/messages/
├── en/pages.json                    # MODIFY: add freelancerComparison namespace
└── bg/pages.json                    # MODIFY: add freelancerComparison namespace
www/tests/
├── unit/
│   ├── calculations.test.ts         # NEW: pure function tests for both calculation models
│   └── freelancer-comparison.test.tsx  # NEW: component render tests
└── e2e/
    └── calculators.spec.ts          # MODIFY: add freelancer comparison tests
```

### Pattern 1: Server/Client Component Split (existing pattern)
**What:** Server component handles SEO, metadata, translations; client component handles interactivity
**When to use:** All calculator pages follow this pattern
**Example (from existing salary-calculator page.tsx):**
```typescript
// Server component (page.tsx)
export default async function FreelancerComparisonPage({ params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools.freelancerComparison')
  const labels: Record<string, string> = { /* all translated strings */ }
  return (
    <div className="py-16 sm:py-20">
      <div className="container-xl">
        {/* Breadcrumb */}
        {/* SEO content above */}
        <FreelancerComparison labels={labels} />
        {/* SEO content below */}
        {/* CTA */}
      </div>
    </div>
  )
}
```

### Pattern 2: Pure Calculation Functions
**What:** All tax math in pure functions, no React dependencies
**When to use:** Any calculation that needs to be testable independently
**Example:**
```typescript
// lib/calculations.ts
export function computeNetFromGross(gross: number, bornAfter1960: boolean) { /* ... */ }
export function computeEoodNet(revenue: number, options: EoodOptions) { /* ... */ }
export function computeSavings(employment: EmploymentResult, eood: EoodResult) { /* ... */ }
```

### Pattern 3: Labels as Record<string, string>
**What:** Server component passes all translated strings to client component as a flat Record
**When to use:** Every calculator component (established convention)

### Anti-Patterns to Avoid
- **Don't duplicate `computeNetFromGross`:** Extract it to `lib/calculations.ts`, import in both salary-calculator and freelancer-comparison
- **Don't hardcode Bulgarian text in client components:** All strings must go through the labels pattern
- **Don't use `useEffect` for calculations:** Use `useMemo` (existing pattern, avoids render flicker)
- **Don't mix server and client concerns:** Keep calculation logic in lib, UI state in client component

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom BGN format function | `Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' })` | Already patterned, handles edge cases |
| Percentage formatting | Manual string concat | `Intl.NumberFormat('bg-BG', { style: 'percent', minimumFractionDigits: 1 })` | Locale-aware |
| Responsive column layout | Custom CSS grid | Tailwind `grid grid-cols-1 lg:grid-cols-2 gap-6` | Consistent with existing patterns |
| Static params | Custom locale logic | `generateStaticParams()` using `routing.locales` | Already patterned |

## Common Pitfalls

### Pitfall 1: EOOD Tax Calculation Order
**What goes wrong:** Calculating dividend tax on revenue instead of post-corporate-tax profit
**Why it happens:** The EOOD model has a two-step tax: (1) corporate tax on profit, (2) dividend tax on after-tax profit
**How to avoid:** Follow this exact order: revenue - self-insurance - overhead = taxable profit -> corporate tax -> after-tax profit -> dividend tax -> net to owner
**Warning signs:** Effective EOOD tax rate below 19% or above 25% at typical income levels

### Pitfall 2: Self-Insurance Base vs Income
**What goes wrong:** Applying self-insurance rate to full revenue instead of to the minimum insurance base (1,077 BGN)
**Why it happens:** The EOOD optimization is specifically to self-insure on minimum, not on actual income
**How to avoid:** Always use `BG_EOOD_2026.MIN_SELF_INSURANCE_INCOME` as the insurance base, not the revenue
**Warning signs:** EOOD social contributions that scale with income (they should be flat at ~337 BGN/month)

### Pitfall 3: Employment Side Must Match Existing Calculator
**What goes wrong:** Re-implementing employment calculation with subtle differences from existing salary calculator
**Why it happens:** Copy-paste instead of extraction
**How to avoid:** Extract `computeNetFromGross()` to shared lib, import in both places
**Warning signs:** Different net salary results between salary calculator and comparison tool for same gross input

### Pitfall 4: Missing Insurable Income Clamping on Employment Side
**What goes wrong:** Not clamping gross salary to min/max insurable income range for social security
**Why it happens:** Forgetting that social security has a ceiling (3,850 BGN) and floor (1,213 BGN)
**How to avoid:** Already handled in `computeNetFromGross()` -- just reuse it
**Warning signs:** Absurdly high social security deductions at high salaries

### Pitfall 5: Translation Key Explosion
**What goes wrong:** Creating 80+ translation keys that are hard to maintain
**Why it happens:** Over-granular key structure
**How to avoid:** Group keys logically: `input.*`, `eood.*`, `employment.*`, `benefits.*`, `savings.*`, `seo.*`
**Warning signs:** Flat list of 50+ keys in the labels Record

### Pitfall 6: Sticky Mobile Bar Overlapping Content
**What goes wrong:** Bottom sticky bar covers the last section of content
**Why it happens:** No padding-bottom on the main container to account for the sticky bar
**How to avoid:** Add `pb-20 lg:pb-0` to the main container when sticky bar is visible
**Warning signs:** Content cut off on mobile when scrolled to bottom

## Code Examples

### EOOD Net Income Calculation
```typescript
// lib/calculations.ts
import { BG_EOOD_2026, BG_TAX_2026 } from './bulgarian-tax'

export interface EoodOptions {
  bornAfter1960: boolean
  includeIllnessMaternity: boolean
  includeVat: boolean
  overhead: {
    accountantFee: number
    bankFees: number
    adminTime: number
    registrationAmortized: number
  }
}

export function computeEoodNet(monthlyRevenue: number, options: EoodOptions) {
  const { bornAfter1960, includeIllnessMaternity, overhead } = options
  const eood = BG_EOOD_2026

  // 1. Self-insurance contributions (on minimum base)
  const insuranceBase = eood.MIN_SELF_INSURANCE_INCOME
  const insuranceRate = includeIllnessMaternity
    ? eood.SELF_INSURANCE.TOTAL_AFTER_1959_WITH_SICK
    : eood.SELF_INSURANCE.TOTAL_AFTER_1959_NO_SICK
  const monthlyInsurance = insuranceBase * insuranceRate

  // 2. Total overhead
  const totalOverhead =
    overhead.accountantFee +
    overhead.bankFees +
    overhead.adminTime +
    overhead.registrationAmortized

  // 3. Taxable profit (revenue - insurance - overhead)
  const taxableProfit = Math.max(0, monthlyRevenue - monthlyInsurance - totalOverhead)

  // 4. Corporate tax (10%)
  const corporateTax = taxableProfit * eood.CORPORATE_TAX_RATE

  // 5. After-tax profit
  const afterTaxProfit = taxableProfit - corporateTax

  // 6. Dividend tax (10% on after-tax profit)
  const dividendTax = afterTaxProfit * eood.DIVIDEND_TAX_RATE

  // 7. Net to owner
  const netToOwner = afterTaxProfit - dividendTax

  // 8. Effective tax rate
  const effectiveTaxRate = monthlyRevenue > 0
    ? 1 - (netToOwner / monthlyRevenue)
    : 0

  return {
    monthlyRevenue,
    insuranceBase,
    monthlyInsurance,
    totalOverhead,
    overheadBreakdown: overhead,
    taxableProfit,
    corporateTax,
    afterTaxProfit,
    dividendTax,
    netToOwner,
    effectiveTaxRate,
  }
}
```

### Employment Calculation (extracted from existing)
```typescript
// lib/calculations.ts (extracted from salary-calculator.tsx)
export function computeNetFromGross(gross: number, bornAfter1960: boolean) {
  // Exact same logic as currently in salary-calculator.tsx
  // Returns: { gross, netSalary, totalEmployerCost, totalEmployeeDeductions, ... }
}

export function computeEmploymentEffectiveTaxRate(result: EmploymentResult): number {
  return result.totalEmployerCost > 0
    ? 1 - (result.netSalary / result.totalEmployerCost)
    : 0
}
```

### Savings Calculation
```typescript
export function computeSavings(
  employmentNet: number,
  eoodNet: number,
  vacationDays: number,
  dailySalary: number
) {
  const monthlySavings = employmentNet - eoodNet
  const vacationValue = vacationDays * dailySalary / 12 // monthly equivalent
  const totalMonthlySavings = monthlySavings + vacationValue
  return {
    monthlySavings,
    annualSavings: monthlySavings * 12,
    vacationValueMonthly: vacationValue,
    vacationValueAnnual: vacationValue * 12,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Bulgarian dividend tax 5% | Dividend tax 10% | 2026 | BG_EOOD_2026 already has correct 10% rate |
| Self-insurance minimum 933 BGN | Self-insurance minimum 1,077 BGN | April 2025 | BG_EOOD_2026 already has correct value |
| Max insurable 3,750 BGN | Max insurable 3,850 BGN | 2026 | BG_TAX_2026 already has correct value |
| Minimum wage 933 BGN | Minimum wage 1,213 BGN | 2026 | BG_TAX_2026 already has correct value |

**All constants are already up-to-date in `lib/bulgarian-tax.ts`.** No updates needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (unit) + Playwright with Firefox (E2E) |
| Config file | `www/vitest.config.ts` + `www/playwright.config.ts` |
| Quick run command | `cd www && bun run test` |
| Full suite command | `cd www && bun run test && bun run test:e2e -- --project=firefox` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALC-01 | Side-by-side net income comparison | unit + e2e | `cd www && vitest run tests/unit/calculations.test.ts` | No -- Wave 0 |
| CALC-02 | EOOD calculation (corporate+dividend tax, self-insurance, overhead) | unit | `cd www && vitest run tests/unit/calculations.test.ts` | No -- Wave 0 |
| CALC-03 | Employment calculation reuses existing logic | unit | `cd www && vitest run tests/unit/calculations.test.ts` | No -- Wave 0 |
| CALC-04 | Comparison at user-entered gross with net, cost, tax rate, savings | unit | `cd www && vitest run tests/unit/calculations.test.ts` | No -- Wave 0 |
| CALC-05 | Visual savings highlight | e2e | `cd www && npx playwright test tests/e2e/calculators.spec.ts` | Partially (file exists, no freelancer tests) |
| CALC-06 | Hidden costs breakdown with editable fields | unit + e2e | `cd www && vitest run tests/unit/freelancer-comparison.test.tsx` | No -- Wave 0 |
| CALC-07 | Benefits comparison table | e2e | `cd www && npx playwright test tests/e2e/calculators.spec.ts` | Partially |
| CALC-08 | BG/EN localization | e2e | `cd www && npx playwright test tests/e2e/basic.spec.ts` | Partially (basic locale tests exist) |
| CALC-09 | SEO content sections | e2e | `cd www && npx playwright test tests/e2e/calculators.spec.ts` | Partially |
| CALC-10 | Mobile-responsive design | manual-only | N/A (visual inspection) | N/A |

### Sampling Rate
- **Per task commit:** `cd www && bun run test`
- **Per wave merge:** `cd www && bun run test && npx playwright test tests/e2e/calculators.spec.ts --project=firefox`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `www/tests/unit/calculations.test.ts` -- pure function tests for `computeEoodNet()`, `computeNetFromGross()`, `computeSavings()`
- [ ] `www/tests/unit/freelancer-comparison.test.tsx` -- component render tests
- [ ] E2E tests in `www/tests/e2e/calculators.spec.ts` -- add `Freelancer Comparison` describe block

## Open Questions

1. **Exact color values for muted EOOD vs highlighted Employment**
   - What we know: Employment should have green border and highlighted bg; EOOD should be muted
   - What's unclear: Exact Tailwind color classes
   - Recommendation: Use `bg-gray-50 border-gray-200` for EOOD, `bg-green-50 border-green-300 ring-2 ring-green-200` for Employment (matches existing green result card pattern)

2. **Input validation range**
   - What we know: Calculator needs to handle arbitrary amounts
   - What's unclear: Min/max reasonable input values
   - Recommendation: Min 0, max 50,000 BGN/month, clamp display to this range, show warning below minimum wage

3. **Whether to extract shared calculation logic**
   - What we know: `computeNetFromGross()` exists in `salary-calculator.tsx` as a non-exported function
   - Recommendation: YES, extract to `lib/calculations.ts` -- it avoids duplication, enables independent testing, and both calculators import from same source of truth

## Sources

### Primary (HIGH confidence)
- `www/src/lib/bulgarian-tax.ts` -- all tax constants with cited official sources (PWC, Ministry of Economy, Eurofast, BTA)
- `www/src/components/calculators/salary-calculator.tsx` -- existing calculation logic and UI patterns
- `www/src/app/[locale]/hr-tools/salary-calculator/page.tsx` -- server/client component split pattern
- `www/src/app/[locale]/hr-tools/page.tsx` -- HR tools navigation and calculator cards

### Secondary (MEDIUM confidence)
- Bulgarian tax law 2026 rates as coded in constants (verified by multiple official sources cited in code comments)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, zero new dependencies
- Architecture: HIGH - follows exact existing patterns from Phase 1 calculators
- Pitfalls: HIGH - EOOD tax model is well-understood, constants already verified
- Calculations: HIGH - tax rates sourced from official Bulgarian government publications

**Research date:** 2026-03-08
**Valid until:** 2026-06-30 (tax constants are annual, stable through year-end)
