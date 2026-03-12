# Figma Make → HR repo mapping

Figma Make project: **HR**  
URL: https://www.figma.com/make/nrV3Duz7q5bznSy5B3LaG0/HR

## Frame → app mapping

| Figma Make frame / route | HR repo app | Notes |
|--------------------------|-------------|--------|
| **homepage** (/) | `www` | Marketing homepage: hero, stats, features, testimonials, CTA |
| **program** + other marketing frames | `www` | About, Features, Pricing, Contact, etc. |
| **help-center** (/help-center, /help-center/:category, /help-center/:category/:article) | `docs` | Starlight docs; align layout and theme with Help Center design |
| **blog** (/blog, /blog/:slug) | `blog` | Astro blog; align shell (header, cards) with Blog design |
| **admin** (/admin, /admin/employees, …) | `www` (dashboard) | Portal pages; admin UI should match Figma Layout + Sidebar + Dashboard/Employees/LeaveRequests/Documents/Profile |

## Make routes (reference)

**Public (PublicLayout):**
- `/` — Homepage
- `/about` — About
- `/features` — Features
- `/pricing` — Pricing
- `/contact` — Contact
- `/help-center` — HelpCenter
- `/help-center/:categorySlug` — HelpCategory
- `/help-center/:categorySlug/:articleSlug` — HelpArticle
- `/blog` — Blog
- `/blog/:slug` — BlogPost

**Admin (Layout):**
- `/admin` — Dashboard
- `/admin/employees` — Employees
- `/admin/leave-requests` — LeaveRequests
- `/admin/documents` — Documents
- `/admin/profile` — Profile

## Make design tokens (theme.css)

- Primary: `#030213`
- Background/foreground, card, muted, accent, border defined in `:root` and `.dark`
- Radius: `0.625rem` (--radius)

Use these as reference when aligning www/docs/blog and admin styles with Figma Make.

## Source files (Figma MCP)

Fetch Make source via:

- `get_design_context(fileKey="nrV3Duz7q5bznSy5B3LaG0", nodeId="0:1")` → lists all source files
- Resources: `file://figma/make/source/nrV3Duz7q5bznSy5B3LaG0/src/app/components/Homepage.tsx` etc.
