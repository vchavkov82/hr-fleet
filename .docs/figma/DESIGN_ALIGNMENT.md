# Design Alignment: Figma ↔ HR App

Use this document to align Figma frames and components with the HR app design system. After creating frames in Figma, apply these tokens and patterns so design and code stay in sync.

---

## 1. Colors

| Token / usage   | Hex       | Tailwind / usage in code        |
|-----------------|-----------|----------------------------------|
| Primary         | `#1B4DDB` | `primary`, `bg-primary`, `text-primary` |
| Primary light   | `#3B6EF0` | `primary-light`                 |
| Primary dark    | `#133AAB` | `primary-dark`, `primary-600`    |
| Primary 50      | `#EEF2FF` | `primary-50` (backgrounds)      |
| Accent          | `#0EA5E9` | `accent`                        |
| Navy (headings) | `#0F172A` | `navy`, `text-navy`             |
| Navy light      | `#1E293B` | `navy-light`                    |
| Success         | `#059669` | `success`                       |
| Warning         | `#D97706` | `warning`                       |
| Body text       | `#4B5563` | `text-gray-600`                 |
| Muted           | `#6B7280` | `text-gray-500`                 |
| Border          | `#E5E7EB` | `border-gray-200`                |
| Background      | `#FFFFFF` | `bg-white`                      |
| Surface light  | `#F0F4FE` | `surface-light`, `light-blue`   |

**Gradients (use as in code):**

- Hero: `linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F5F3FF 100%)` (blue-50 → white → purple-50)
- CTA: `linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)` (blue-600 → purple-600)
- Brand: `linear-gradient(135deg, #1B4DDB 0%, #3B6EF0 100%)`

---

## 2. Typography

| Role        | Font family | Weight | Size (approx) | Usage in code           |
|------------|-------------|--------|----------------|-------------------------|
| Body       | Inter       | 400    | 16px           | `font-sans`             |
| Body strong| Inter       | 500–600| 16px           | `font-medium` / `font-semibold` |
| Headings   | Mulish      | 700    | 24–48px        | `font-heading font-bold` |
| Small/labels | Inter     | 500    | 14px           | `text-sm font-medium`   |
| Caption    | Inter       | 400    | 12–14px        | `text-xs` / `text-sm`   |

**Font loading (code):** Inter and Mulish from `next/font/google`; CSS variables `--font-inter`, `--font-mulish`. Use the same families in Figma (Inter, Mulish) for pixel-perfect alignment.

---

## 3. Spacing and layout

- **Page max width:** `1280px` (`max-w-7xl` = 80rem).
- **Section padding (vertical):** `py-16` to `py-24` (64px–96px).
- **Container padding (horizontal):** `px-4 sm:px-6 lg:px-8` (16px / 24px / 32px).
- **Gap between sections:** 0 (sections stack); internal gaps `gap-8`, `gap-12`.

Use the same max width and similar padding in Figma frames (e.g. 1440px artboard with 1280px content + 80px side margins).

---

## 4. Components to align

| Component   | Location in code | Notes |
|------------|-------------------|--------|
| Header     | `www/src/components/layout/header.tsx` | Sticky, nav links, language switcher, CTA. Height ~64px. |
| Footer     | `www/src/components/layout/footer.tsx` | Links, legal, social. |
| Hero       | `www/src/components/sections/hero.tsx` | Headline (H1), subhead, 2 CTAs (primary + secondary), image. |
| CTA strip  | `www/src/components/sections/cta.tsx` | Full-width gradient, headline, button. |
| Features   | `www/src/components/sections/features.tsx` | Grid of cards with icon, title, description. |
| Metric card| `www/src/components/dashboard/metric-card.tsx` | Value + label. |
| Buttons    | Inline in components | Primary: `bg-primary`; secondary: border + white bg. Radius `rounded-lg`. |

Align Figma components to these names and structure so **Code Connect** mappings (see `HR_TO_FIGMA_MAPPING.json` and the Code Connect skill) stay consistent.

---

## 5. Figma → code checklist

When updating Figma to match the HR app:

1. **Create or update styles** in Figma for: Primary, Primary 50, Navy, Accent, Success, Warning, and the main gradients.
2. **Set text styles** for Body (Inter), Headings (Mulish), and small/labels to match the table above.
3. **Name frames** exactly as in `HR_TO_FIGMA_MAPPING.json` (e.g. "Home", "Features", "Dashboard") so the mapping stays valid.
4. **Name components** that correspond to shared UI (Header, Footer, Hero, CTA, MetricCard, etc.) so they can be linked via Code Connect.
5. **Use 1440×900** (or your standard) for main frames; keep content within 1280px width for consistency with `max-w-7xl`.

---

## 6. Code → Figma checklist

When the app design changes:

1. Update **REQUIRED_FRAMES.md** if new pages or sections are added.
2. Add or edit the corresponding entries in **HR_TO_FIGMA_MAPPING.json** (route, `figmaFrameName`, and optionally `figmaNodeId` when frames exist).
3. Update this **DESIGN_ALIGNMENT.md** if new colors, type styles, or components are introduced (e.g. new tokens in `tailwind.config.js` or new shared components).

Keeping these three files in sync ensures Figma and the HR app stay aligned and mapping (including Code Connect) remains accurate.
