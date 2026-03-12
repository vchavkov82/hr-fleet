# Required Figma Frames – HR App

Use this spec with **Figma Make** (or create manually) to generate frames that match the HR app pages. Each frame should represent one screen at **1440×900** (desktop) or provide a second variant at **375×812** (mobile) if needed.

## Prompt for Figma Make

You can paste this into Figma Make (or use as a brief):

```
Create the following frames for an HR SaaS web app. Use a consistent layout: header (sticky), main content, footer. Design system: primary blue #1B4DDB, navy headings #0F172A, body text gray-600, fonts Inter (body) and Mulish (headings). Each frame is a separate artboard at 1440×900.

Frames to create:
1. Home – Hero with headline and CTA, stats strip, features grid, testimonials, final CTA
2. **Features** – Navy-deep hero (H1 + subheading); 3 feature rows (image + text, alternating left/right) with mock dashboard; Roadmap (5 “Coming soon” cards); CTA strip. See FEATURES_FRAME_SPEC.md.
3. Pricing – Plans (Free / Pro / Enterprise), feature comparison, FAQ
4. Blog – Blog listing with cards, sidebar
5. Blog Post – Single article layout with TOC and related posts
6. About – Company story, team, values
7. **Help Center** – Navy-deep hero with H1 + search bar; Quick Links (4 cards); Browse by Category (5 cards, 3-col grid); Popular Articles (6 cards, 2-col); Still Need Help (3 cards: Live Chat, Email, Demo). See **HELP_CENTER_FRAME_SPEC.md** for exact layout.
8. **Help Center Category** – Navy-deep header with breadcrumbs, category icon+title+description, search; then article list (cards with icon, title, description, meta). See HELP_CENTER_FRAME_SPEC.md.
9. **Help Center Article** – Navy-deep header (breadcrumbs, category pill, H1, meta); content with TOC sidebar + prose; Related Articles; Still Need Help strip. See HELP_CENTER_FRAME_SPEC.md.
10. Contact – Contact form (name, email, company, message)
11. Auth Login – Email/password form, sign-up link
12. Auth Sign-up – Registration form (name, company, email, password)
13. Dashboard – Sidebar nav, metric cards, activity feed, quick actions
14. Dashboard Employees – Employee table/list, filters, add employee
15. Dashboard Employee Detail – Employee profile, edit/delete, details
16. HR Tools – Hero, calculator/template cards (Salary, Leave, Freelancer, AI Assistant, Templates)
17. HR Tools – Salary Calculator – Form and results
18. HR Tools – Freelancer Comparison – Comparison table/cards
19. HR Tools – AI Assistant – Chat-style interface
20. HR Tools Templates – Template cards (Employment contract, Job description, etc.)
21. Partners – Partner form or partner program info
22. Careers – Jobs listing or careers content
23. Legal – Privacy / Terms / Cookies / GDPR (shared layout, different content)
24. System Status – Status page layout
```

## Frame List (for manual creation or scripting)

| # | Frame name (Figma) | HR route | Description |
|---|--------------------|----------|-------------|
| 1 | Home | `/[locale]` | Landing: Hero, stats, features, testimonials, CTA |
| 2 | Features | `/[locale]/features` | Navy-deep hero, 3 FeatureRows (mock dashboard + text), roadmap (5 cards), CTA. **Spec:** FEATURES_FRAME_SPEC.md |
| 3 | Pricing | `/[locale]/pricing` | Plans + FAQ |
| 4 | Blog | `/[locale]/blog` | Blog listing |
| 5 | Blog Post | `/[locale]/blog/[slug]` | Single article |
| 6 | About | `/[locale]/about` | About page |
| 7 | Help Center | `/[locale]/help-center` | Help home — navy-deep hero, quick links, categories, popular articles, still need help. **Spec:** HELP_CENTER_FRAME_SPEC.md |
| 8 | Help Center Category | `/[locale]/help-center/categories/[category]` | Category view — navy-deep header + article list. **Spec:** HELP_CENTER_FRAME_SPEC.md |
| 9 | Help Center Article | `/[locale]/help-center/articles/[article]` | Article view — navy-deep header, TOC+content, related, still need help. **Spec:** HELP_CENTER_FRAME_SPEC.md |
| 10 | Help Center Contact | `/[locale]/help-center/contact` | Help contact |
| 11 | Help Center Search | `/[locale]/help-center/search` | Search results |
| 12 | Contact | `/[locale]/contact` | Contact form |
| 13 | Login | `/[locale]/auth/login` | Login form |
| 14 | Sign Up | `/[locale]/auth/sign-up` | Sign-up form |
| 15 | Dashboard | `/[locale]/dashboard` | Dashboard overview |
| 16 | Dashboard Employees | `/[locale]/dashboard/employees` | Employee directory |
| 17 | Dashboard Employee Detail | `/[locale]/dashboard/employees/[id]` | Employee profile |
| 18 | HR Tools | `/[locale]/hr-tools` | HR tools hub |
| 19 | HR Tools – Salary Calculator | `/[locale]/hr-tools/salary-calculator` | Calculator |
| 20 | HR Tools – Freelancer Comparison | `/[locale]/hr-tools/freelancer-comparison` | Comparison |
| 21 | HR Tools – AI Assistant | `/[locale]/hr-tools/ai-assistant` | AI chat |
| 22 | HR Tools – Templates | `/[locale]/hr-tools/templates` | Template list |
| 23 | HR Tools – Template (e.g. Employment Contract) | `/[locale]/hr-tools/templates/employment-contract` | Single template |
| 24 | Partners | `/[locale]/partners` | Partners |
| 25 | Careers | `/[locale]/careers` | Careers |
| 26 | Privacy / Terms / Cookies / GDPR | `/[locale]/privacy`, terms, cookies, gdpr | Legal pages |
| 27 | System Status | `/[locale]/system-status` | Status page |

After creating frames, fill in **node-id** values in `HR_TO_FIGMA_MAPPING.json` so the mapping stays in sync.
