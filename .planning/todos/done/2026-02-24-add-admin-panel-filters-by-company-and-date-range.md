---
created: 2026-02-24T18:16:21.747Z
title: Add admin panel filters by company and date range
area: ui
files:
  - admin/packages/manager/src/
---

## Problem

Admin list views (jobs, candidates, companies) lack filtering capabilities:
- Cannot filter records by company (e.g., "show all jobs for Acme Corp")
- Cannot filter records by date range (e.g., "show jobs posted in the last 30 days")
This makes it hard for admins to manage large datasets and find specific records.

## Solution

Add filter controls to admin list views:

1. **Filter by company** — dropdown/autocomplete that fetches company list from `/admin/companies`, applies `company_id` query param to list endpoints
2. **Filter by date range** — date picker pair (from/to) applying `created_after` / `created_before` (or `date_from` / `date_to`) query params

Apply to all relevant admin list views:
- Jobs list (`/admin/jobs/pending` and main jobs list)
- Candidates list
- Companies list (date range only, company filter N/A)

Backend may need new query params on list endpoints if not already supported.
