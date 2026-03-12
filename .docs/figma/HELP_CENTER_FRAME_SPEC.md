# Help Center frames – match www implementation

Use this spec to align **Figma Help Center frames** with the live design in `www/src/app/[locale]/help-center/`. The app does **not** use the marketing header/footer on help-center pages; the page is full-width with its own sections.

---

## Shared layout (all help-center pages)

- **Background:** `#FFFFFF` (white) for main content; **hero/header strip:** `#030B24` (navy-deep).
- **Container:** Max width 1280px, horizontal padding 16px (sm: 24px, lg: 32px) — use `container-xl` in code = `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Fonts:** Mulish for headings (bold), Inter for body. Primary blue `#1B4DDB`, navy text `#0F172A`, navy-deep bg `#030B24`.
- **No global Header/Footer** in the frame — help-center is a standalone page layout.

---

## Frame: Help Center (home) — `/[locale]/help-center`

**Source:** `www/src/app/[locale]/help-center/page.tsx`

### 1. Hero (navy-deep)

- **Background:** `#030B24` (navy-deep).
- **Text:** White for heading, `white/70` for subheading.
- **Layout:** Centered, max content width ~576px for text, ~672px for search.
- **Elements:**
  - H1: 36px / 48px (sm) font-heading bold, margin-bottom 16px.
  - Subheading: text-lg, white/70, max-w-xl, margin-bottom 32px.
  - **Search:** Full-width input, white bg, rounded-xl, px-6 py-4, search icon button on the right (primary color). Placeholder gray-400.

### 2. Quick Links

- **Background:** `#F0F4FE` (surface-light). Border-bottom gray-100.
- **Layout:** Grid 2 cols (md: 4 cols), gap 16px, max-w-4xl centered, py-12.
- **Cards:** 4 items. Each card: white bg, rounded-xl, p-5, shadow-sm, border gray-100. Content: emoji (text-3xl), title (font-semibold text-navy text-sm), short description (text-xs text-gray-500). Hover: shadow-md, border-primary/20.

### 3. Browse by Category

- **Background:** White. Section py-16 sm:py-20.
- **Heading:** Centered, H2 text-2xl sm:text-3xl font-heading bold text-navy, then subheading text gray-600. mb-12.
- **Grid:** 3 cols (lg), 2 cols (sm), 1 col (default). Gap 24px. 5 category cards.
- **Category card:** Flex row, items-start, gap 16px, p-6, rounded-xl, border gray-200, white bg. Left: icon box 40×40, rounded-lg, bg primary-50, icon primary. Center: category title (font-semibold text-navy), below it “X articles” (text-sm text-gray-500). Right: chevron 16×16 gray-400. Hover: border-primary/30, shadow-md.

### 4. Popular Articles

- **Background:** `#F0F4FE` (surface-light). py-16 sm:py-20.
- **Heading:** Same as categories — centered H2, subheading, mb-12.
- **Grid:** 2 cols (md), 1 col default. Gap 16px, max-w-4xl mx-auto. 6 article cards.
- **Article card:** Flex row gap 16px, p-5, rounded-xl, border gray-200, white bg. Left: small icon box 32×32, primary-50, primary icon. Right: title (font-medium text-navy text-sm), description (text-xs text-gray-500, line-clamp-2), then row: category pill (primary-50 bg, primary text, rounded-full, text-xs) and read time (text-xs text-gray-400). Hover: border-primary/30, shadow-sm.

### 5. Still Need Help

- **Background:** White. py-16 sm:py-20.
- **Heading:** Centered H2, subheading max-w-lg, mb-12.
- **Grid:** 3 cols (md), 1 col default. Gap 24px, max-w-3xl mx-auto. 3 cards.
- **Card:** Centered content, p-6, rounded-xl, border gray-200, white bg. Icon box 48×48, primary-50 bg, rounded-xl, primary icon, mb-4. Title font-semibold text-navy, description text-sm text-gray-600 mb-4, then link/button text-sm font-medium text-primary (e.g. “Start chat”, “support@hr.bg”, “Sign up”).

---

## Frame: Help Center Category — `/[locale]/help-center/categories/[category]`

**Source:** `www/src/app/[locale]/help-center/categories/[category]/page.tsx`

### 1. Category Header (navy-deep)

- **Background:** `#030B24`. py-16.
- **Layout:** container-xl, inner max-w-4xl mx-auto.
- **Elements (top to bottom):**
  - Breadcrumbs (Help Center > Category name).
  - Row: icon 48×48 (primary/10 bg, primary icon, rounded-xl), then title (text-3xl md:text-4xl font-heading bold) and “X articles” (text blue-200).
  - Description paragraph (text-xl text-blue-200), mb-8.
  - Search bar (same style as home, placeholder “Search [Category]...”).

### 2. Articles List

- **Background:** White. py-20.
- **Layout:** container-xl, max-w-4xl mx-auto, space-y-4.
- **Article row:** Card, white bg, border gray-200, rounded-lg, p-6. Flex row: left icon box 40×40 primary/10, primary icon; right: title (text-lg font-semibold), description (text-sm text-gray-600 line-clamp-2), meta row (read time, dot, “Updated date”) text-xs text-gray-500. Hover: shadow-md, border-primary/30.

---

## Frame: Help Center Article — `/[locale]/help-center/articles/[article]`

**Source:** `www/src/app/[locale]/help-center/articles/[article]/page.tsx`

### 1. Article Header (navy-deep)

- **Background:** `#030B24`. py-16.
- **Layout:** container-xl, max-w-4xl mx-auto.
- **Elements:** Breadcrumbs (Help Center > Category > Article). Category pill (primary/10 bg, primary text, rounded-full). H1 (text-3xl md:text-4xl font-heading bold). Meta row: read time, dot, “Updated date” (text-sm text-blue-200).

### 2. Article Content

- **Background:** White. py-20.
- **Layout:** container-xl, max-w-4xl, grid lg:grid-cols-4 gap-8.
- **Sidebar (TOC):** lg:col-span-1, sticky. Label “Table of contents” (text-sm uppercase tracking-wide text-navy). Links list (can be placeholder).
- **Main:** lg:col-span-3. Prose body (text-gray-700). Below: feedback component; then tags (gray-100 bg, gray-600 text, rounded-full pills).

### 3. Related Articles (optional in frame)

- **Background:** `#F8FAFC` (surface-lighter). py-20.
- **Heading:** “Related Articles” H2 centered, mb-8.
- **Grid:** md:grid-cols-3, gap-6. Cards: white bg, border gray-200, rounded-lg, p-6. Title, description line-clamp-2. Hover: border-primary/30, shadow-md.

### 4. Still Need Help (same as home)

- **Background:** White. py-20. Centered H2 “Still Need Help?”, subheading, then 3 cards (Live Chat, Email, Book a Demo) — same structure as home page.

---

## Colors quick reference (help-center)

| Token        | Hex       | Usage in help-center        |
|-------------|-----------|-----------------------------|
| navy-deep   | `#030B24` | Hero/header background      |
| white       | `#FFFFFF` | Cards, input bg, body       |
| primary     | `#1B4DDB` | Links, icons, buttons       |
| primary-50  | `#EEF2FF` | Icon backgrounds, pills     |
| navy        | `#0F172A` | Headings, card titles       |
| blue-200    | (Tailwind)| Meta text on navy-deep      |
| surface-light   | `#F0F4FE` | Section alternating bg  |
| surface-lighter | `#F8FAFC` | Related articles section |
| gray-200    | Border for cards            |
| gray-500/600| Secondary text              |

---

## Figma checklist

1. **Help Center (home):** One frame with 5 sections in order: navy-deep hero + search → quick links (4 cards) → categories (5 cards, 3-col grid) → popular articles (6 cards, 2-col) → still need help (3 cards).
2. **Help Center Category:** Navy-deep header (breadcrumbs, icon+title, description, search) → white area with list of article cards.
3. **Help Center Article:** Navy-deep header (breadcrumbs, category pill, title, meta) → content area (TOC sidebar + prose) → related articles strip → still need help.
4. Use **navy-deep `#030B24`** for all help-center hero/header areas (not the marketing hero gradient).
5. Use **container-xl** width (1280px max) and section padding as above so the frame matches www.
