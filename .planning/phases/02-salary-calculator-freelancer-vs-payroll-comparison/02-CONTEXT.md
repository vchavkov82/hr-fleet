# Phase 2: Salary Calculator — Freelancer vs Payroll Comparison - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a new comparison calculator page at `/hr-tools/freelancer-comparison` showing freelancers how much money they lose running an EOOD/OOD (limited company) vs being employed through our payroll service. This is a marketing conversion tool — it should clearly demonstrate employment wins financially and in benefits. Requirements CALC-01 through CALC-10.

</domain>

<decisions>
## Implementation Decisions

### Page & Navigation
- New standalone page at `/hr-tools/freelancer-comparison` (not integrated into existing salary calculator)
- Linked from HR Tools main page alongside existing calculators
- Own SEO content above/below the calculator (targeting "ЕООД vs трудов договор", "freelancer vs employment Bulgaria")
- Breadcrumb navigation like existing calculator pages

### Layout & Input
- Side-by-side columns: EOOD on left (muted styling), Employment on right (green border, highlighted bg as the winner)
- Single input: monthly invoice amount (what client pays) — this equals EOOD revenue AND equivalent gross salary
- Born after 1959 checkbox (same as existing calculator)
- Monthly/annual toggle to flip between timeframes (annual makes savings more impactful)
- Columns stack vertically on mobile

### EOOD Calculation Model
- Model the most common optimization: self-insure on minimum (1,077 BGN), take rest as dividends
- Corporate tax 10% on profit, then dividend tax 10% on after-tax profit (~19% effective)
- Illness/maternity insurance: default ON with toggle to disable (changes 31.3% to 27.8%)
- Optional VAT toggle: when ON, show invoice breakdown (excl VAT + 20% VAT + total) with note that VAT is pass-through and doesn't affect net income
- No VAT by default (most freelancer EOODs under 100K BGN aren't registered)

### EOOD Overhead Costs
- Editable fields with pre-filled defaults:
  - Accountant fee: 294 BGN/month
  - Bank fees: 25 BGN/month
  - Admin time: 150 BGN/month
  - Registration amortized: 40 BGN/month (over 5 years)
- All overhead values deducted from EOOD net income
- Users can adjust any value to match their actual costs

### Savings Messaging
- Pro-employment tone: employment column visually highlighted as the better option
- Green checkmark, savings banner showing "Save X BGN/month" and "Save X BGN/year"
- Show effective tax rate comparison (e.g., "EOOD: 30% → Employment: 22%")
- CTA below results ("Switch to our payroll service — start free trial")
- Sticky bottom bar on mobile with savings amount + CTA button
- Small footnote disclaimer: "EOOD may be advantageous if you can negotiate 20-30% higher rates or deduct significant business expenses"

### Benefits Comparison
- Checklist table below the financial comparison
- Two columns: EOOD (mostly ✗) vs Employment (mostly ✓)
- Benefits listed: paid leave, sick pay (80%), maternity (410 days), unemployment insurance, mortgage eligibility, labor code protection
- Editable vacation days field (default 20, minimum 20 by Bulgarian law)
- Monetize paid leave: calculate BGN value based on entered salary and vacation days, add to total savings
- Maternity and mortgage get ⚠ for EOOD (limited/harder, not impossible)

### Claude's Discretion
- Exact component structure and file organization
- Animation and transition details
- Responsive breakpoint behavior
- Color shades for muted EOOD vs highlighted Employment columns
- SEO content copywriting approach
- Error states and edge cases (e.g., very low or very high amounts)
- Whether to extract shared calculation logic from existing salary calculator

</decisions>

<specifics>
## Specific Ideas

- The comparison should feel like a "no-brainer" — visually obvious that employment wins at same income level
- Use the existing `BG_TAX_2026` constants and `BG_EOOD_2026` constants (already added to `lib/bulgarian-tax.ts`)
- Reuse `computeNetFromGross()` for the employment side calculation
- Annual view makes savings more impactful: "save 4,764 BGN/year" hits harder than "397/month"
- Footnote about EOOD advantages keeps the tool credible with sophisticated freelancers

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BG_TAX_2026` constants: All employment social security rates, income tax, min/max insurable income
- `BG_EOOD_2026` constants: Corporate tax, dividend tax, self-insurance rates, overhead defaults (just added)
- `computeNetFromGross()` function in `salary-calculator.tsx`: Full employment net calculation (can be extracted to shared lib)
- `Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' })` formatter pattern
- Server/client component split pattern from existing calculator pages

### Established Patterns
- Calculator pages: server component (SEO content + translations) wrapping client component (interactive calculator)
- Labels passed as `Record<string, string>` from server to client component
- `next-intl` for translations, namespace `pages.hrTools.*`
- Tailwind CSS with `card`, `btn-primary`, `section-label`, `container-xl` utility classes
- `cn()` utility for conditional class merging
- Color-coded result cards: `bg-primary-50`, `bg-green-50`, `bg-amber-50`

### Integration Points
- HR Tools main page (`/hr-tools/page.tsx`): add new calculator card linking to freelancer-comparison
- Translation files: `messages/en/pages.json` and `messages/bg/pages.json` — new namespace under `hrTools`
- Routing: `app/[locale]/hr-tools/freelancer-comparison/page.tsx`
- Static params: `generateStaticParams()` using `routing.locales`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-salary-calculator-freelancer-vs-payroll-comparison*
*Context gathered: 2026-03-08*
