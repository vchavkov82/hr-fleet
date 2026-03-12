# Features page frame – match www implementation

Use this spec to align the **Figma Features frame** with the live design in `www/src/app/[locale]/features/page.tsx`. The page uses the same **navy-deep hero** pattern as Help Center, then alternating feature rows and a roadmap section.

---

## Shared layout

- **Container:** `container-xl` = max width 1280px, `mx-auto`, `px-4 sm:px-6 lg:px-8`.
- **Colors:** Navy-deep `#030B24` (hero), primary `#1B4DDB`, navy text `#0F172A`, surface-lighter `#F8FAFC`, white `#FFFFFF`. CTA strip: gradient `linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)`.
- **Fonts:** Mulish for headings (bold), Inter for body. Section padding `py-20`.

---

## Frame: Features — `/[locale]/features`

**Source:** `www/src/app/[locale]/features/page.tsx`  
**Components:** `FeatureRow` (`www/src/components/sections/feature-row.tsx`), `CTA` (`www/src/components/sections/cta.tsx`).

### 1. Hero (navy-deep)

- **Background:** `#030B24` (navy-deep).
- **Layout:** `container-xl text-center`, `py-20`.
- **Elements:**
  - **H1:** `text-4xl sm:text-5xl lg:text-6xl` font-heading bold, white, leading-tight.
  - **Subheading:** `mt-6 text-xl text-blue-200 max-w-3xl mx-auto`.

### 2. Active feature rows (3 sections)

Alternating background: **Section 1** white → **Section 2** surface-lighter → **Section 3** white. Each section `py-20`, `container-xl`.

#### Row layout (FeatureRow)

- **Grid:** 1 column on small screens, 2 columns on `lg` (`lg:grid-cols-2`), `gap-12 lg:gap-16`, `items-center`.
- **Reversed:** Section 1 (employees) and 3 (compliance): **image left, text right**. Section 2 (calculators): **text left, image right** (`reversed`).

**Image side (mock dashboard):**

- Wrapper: `rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-gray-50`.
- Inner: `aspect-[16/10]`, gradient `from-primary-50 to-primary-100`, padding. Inside that: white `rounded-xl shadow-sm` card with:
  - **Sidebar:** Narrow strip (e.g. 56–64px), `bg-navy-dark` (#020617), vertical blocks (one primary/40, rest white/10).
  - **Main:** Top bar (border-b gray-100, height ~40–48px), then content area with:
    - Row of small stat cards (primary/10, accent/10, success/10).
    - Chart placeholder (gray-50, border gray-100, centered placeholder text in primary/30).
    - Table row placeholders (gray-100 bars).

**Text side:**

- **Title:** H3 `text-3xl font-bold font-heading text-navy`.
- **Description:** `mt-4 text-lg text-gray-600 leading-relaxed`.
- **List:** `mt-6 space-y-3`, ul with list items. Each item: checkmark icon (primary, 20×20), then text `text-gray-700`. Checkmark is a small tick SVG.

**Section order in www:**

1. **Employees** — image left, text right; bg white.
2. **Calculators** — text left, image right; bg surface-lighter.
3. **Compliance** — image left, text right; bg white.

### 3. Roadmap section

- **Background:** `#F8FAFC` (surface-lighter). `py-20`, `container-xl`.
- **Header:** Centered. H2 `text-3xl font-bold font-heading text-navy mb-3`. Subheading `text-gray-600 max-w-xl mx-auto`.
- **Grid:** 1 col (md: 2, lg: 3), `gap-6`. **5 cards:** ATS, Leave, Payroll, Performance, Onboarding.
- **Card:** `bg-white rounded-2xl p-8 border border-gray-200 shadow-sm`, flex column. Top row: title (`text-lg font-bold font-heading text-navy`) + **badge** “Coming soon” (`bg-amber-100 text-amber-800 rounded-full px-2.5 py-0.5 text-xs font-medium`). Below: description `text-sm text-gray-600`.

### 4. Closing CTA

- **Background:** Gradient `linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)` (blue-600 → purple-600). `py-20`, `container-xl` (max-w-7xl), text-center.
- **Heading:** H2 `text-3xl sm:text-4xl font-bold text-white mb-4`.
- **Subheading:** `text-xl text-blue-100 mb-8 max-w-2xl mx-auto`.
- **Buttons:** Two. Primary: white bg, blue-600 text, rounded-lg, px-8 py-4. Secondary: transparent bg, white border-2, white text, rounded-lg.

---

## Summary for Figma

| Section        | Background     | Content |
|----------------|----------------|--------|
| Hero           | navy-deep      | Centered H1 + subheading (blue-200). |
| Row 1 (Employees)   | white          | 2-col: left = mock dashboard image (16:10), right = title + description + bullet list with checkmarks. |
| Row 2 (Calculators) | surface-lighter| 2-col: left = title + description + list, right = mock dashboard image. |
| Row 3 (Compliance)  | white          | Same as row 1 (image left, text right). |
| Roadmap        | surface-lighter| Centered H2 + subheading; 5 cards (rounded-2xl, p-8) with title + “Coming soon” badge + description. |
| CTA            | blue→purple gradient | Centered H2 + subheading + 2 buttons (white primary, white outline). |

Use **navy-deep** for the hero (same as Help Center), **container-xl** width, and **FeatureRow** layout (image + text, with one row reversed) so the Figma frame matches www.
