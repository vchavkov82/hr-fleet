# Requirements: HR Platform

**Defined:** 2026-02-26
**Core Value:** Bulgarian SMBs can manage their HR operations (employee management, leave tracking, payroll integration, ATS, performance reviews, onboarding) through a single unified platform with Bulgarian tax/legal compliance built-in.

## v1.0 Requirements (MVP)

### HR App Marketing & Launch
- [x] **MKT-01**: Bulgarian-language marketing pages (home, features, pricing, hr-tools, about, contact, etc.)
- [x] **MKT-02**: Free trial sign-up flow with instant account creation
- [x] **MKT-03**: Interactive HR tools (salary calculator, leave calculator, cost calculator) with Bulgarian 2026 tax rates
- [x] **MKT-04**: Email-gated HR document templates (contracts, policies, forms)
- [x] **MKT-05**: Blog integration via Astro subpath proxy
- [x] **MKT-06**: AI Assistant integration via 21st Agents (Claude Sonnet 4.6)

### Salary Calculator — Freelancer vs Payroll Comparison
- [x] **CALC-01**: Side-by-side comparison showing net income: EOOD/OOD freelancer vs employment through payroll service
- [x] **CALC-02**: EOOD calculation includes: corporate tax (10%), dividend tax (10%), self-insurance on minimum (1,077 BGN), monthly accountant fee (~150 EUR), company admin overhead
- [x] **CALC-03**: Employment calculation uses existing salary calculator logic (employee/employer social security, income tax)
- [x] **CALC-04**: Comparison at user-entered gross amount showing: net to person, total cost to client/employer, effective tax rate, money saved/lost
- [x] **CALC-05**: Visual highlight of savings when using payroll service vs EOOD (marketing angle: "save X BGN/month")
- [x] **CALC-06**: Include hidden costs breakdown: accountant fees, admin time, company registration amortized, bank fees, closure risk
- [x] **CALC-07**: Benefits comparison table: paid leave, sick leave, maternity, unemployment insurance, mortgage eligibility, labor code protection
- [x] **CALC-08**: Fully localized in Bulgarian and English
- [x] **CALC-09**: SEO content sections explaining the comparison for organic traffic
- [x] **CALC-10**: Mobile-responsive design consistent with existing calculators

### HR Employee Management
- [ ] **EMP-01**: Admin can create employee records (name, email, role, start date, contract type)
- [ ] **EMP-02**: Admin can view employee directory with filtering/search
- [ ] **EMP-03**: Admin can manage employee leave balances and requests
- [ ] **EMP-04**: Admin can track time-off and generate absence reports

### ATS (Applicant Tracking)
- [ ] **ATS-01**: Company can post job openings through integrated ATS
- [ ] **ATS-02**: Candidates can apply to jobs and track application status
- [ ] **ATS-03**: Recruiters can manage candidate pipeline with Kanban board
- [ ] **ATS-04**: Interview scheduling and notifications

### Compliance & Integration
- [ ] **COMP-01**: Platform respects Bulgarian labor laws and regulations
- [ ] **COMP-02**: Payroll integration foundation (prepared for module)
- [ ] **COMP-03**: Performance review workflows

## v1.1 Requirements

### Advanced Features
- [ ] **ADV-01**: Multi-language support beyond Bulgarian
- [ ] **ADV-02**: Team member invitations and role-based access
- [ ] **ADV-03**: Advanced reporting and analytics

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MKT-01 | Phase 1 | Complete |
| MKT-02 | Phase 1 | Complete |
| MKT-03 | Phase 1 | Complete |
| MKT-04 | Phase 1 | Complete |
| MKT-05 | Phase 1 | Complete |
| MKT-06 | Phase 1 | Complete |

| CALC-01 | Phase 2 | Complete |
| CALC-02 | Phase 2 | Complete |
| CALC-03 | Phase 2 | Complete |
| CALC-04 | Phase 2 | Complete |
| CALC-05 | Phase 2 | Complete |
| CALC-06 | Phase 2 | Complete |
| CALC-07 | Phase 2 | Complete |
| CALC-08 | Phase 2 | Complete |
| CALC-09 | Phase 2 | Complete |
| CALC-10 | Phase 2 | Complete |

**Coverage:**
- v1.0 requirements: 6 marketing (complete), 10 calculator comparison (pending), 4 HR features (pending), 4 ATS features (pending)
- Mapped to phases: 2/2
- Unmapped: 0

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-03-05 after job/HR project separation*
