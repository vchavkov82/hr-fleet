# Security Runbook

Operational security guide for the HR SaaS platform covering multi-tenancy isolation, scaling, penetration testing, encryption, and dependency management.

## 1. Multi-Tenancy and Data Isolation

All tenant data is scoped by `org_id`. Every database query that touches tenant-specific tables (employees, contracts, leave_requests, payroll_runs, payslips, webhooks) MUST include an `org_id` filter.

### Query Filtering

- sqlc-generated queries in `services/api/internal/db/queries/` include `org_id` in WHERE clauses
- Service layer extracts `org_id` from JWT claims via `auth.GetUserFromContext(ctx)`
- Handlers never accept `org_id` from request body or query params — it comes from the authenticated token

### Row-Level Security (RLS)

PostgreSQL RLS policies provide defense-in-depth. Even if application code omits an `org_id` filter, RLS prevents cross-tenant reads:

```sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON employees
  USING (org_id = current_setting('app.current_org_id')::BIGINT);
```

The API sets `app.current_org_id` on each database connection from the JWT-extracted org.

### RBAC Enforcement

Seven roles (super_admin, org_admin, hr_manager, hr_staff, payroll_admin, payroll_staff, employee) control access. Middleware in `internal/middleware/` enforces role checks before handlers execute. Permission matrix covers 11 granular permissions.

## 2. Scaling

### Podman Replicas (Current)

Scale the API service horizontally with Podman Compose:

```yaml
# deploy/podman-compose.override.yml
services:
  api:
    deploy:
      replicas: 3
    # NFR-04: Horizontal scaling via replicas behind Caddy load balancer
```

Caddy automatically load-balances across replicas. Health checks ensure traffic routes only to healthy instances.

### Kubernetes HPA (Production)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hr-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hr-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Health Checks

- `GET /health` — returns 200 with database and Redis connectivity status
- `GET /metrics` — Prometheus-format metrics for alerting and autoscaler decisions
- Liveness probe: `/health` every 10s, failure threshold 3
- Readiness probe: `/health` every 5s, failure threshold 2

## 3. Penetration Test Checklist (OWASP Top 10)

| OWASP Category | Mitigation | Verify |
|---|---|---|
| A01 Broken Access Control | RBAC middleware, org_id scoping, RLS | Attempt cross-tenant access with valid token |
| A02 Cryptographic Failures | AES-256-GCM for PII (`internal/crypto/aes.go`), RS256 JWT | Check encrypted fields in DB, verify key rotation process |
| A03 Injection | sqlc parameterized queries, no raw SQL concatenation | SQLi payloads in all string inputs |
| A04 Insecure Design | Rate limiting (httprate 1000/min public, 10000/min auth) | Brute force login, API enumeration |
| A05 Security Misconfiguration | HSTS 2-year preload, X-Content-Type-Options, CSP headers | Header scan with security-headers.com |
| A06 Vulnerable Components | Weekly govulncheck + pnpm audit (`.github/workflows/security.yml`) | Review latest scan results |
| A07 Auth Failures | JWT RS256 with refresh rotation, bcrypt passwords, API key hashing | Token replay, expired token, brute force |
| A08 Data Integrity | HMAC-SHA256 webhook signatures, Asynq task validation | Tamper with webhook payloads |
| A09 Logging Failures | zerolog with request ID correlation, structured error responses | Verify sensitive data not in logs |
| A10 SSRF | No user-controlled URL fetching, Odoo calls to fixed internal URL | Attempt SSRF via webhook URL registration |

### Pre-Engagement Checklist

1. Scope: API endpoints (`/api/v1/*`), admin panel, marketing site
2. Credentials: Create test accounts for each of the 7 roles
3. Environment: Use staging with production-like data (anonymized)
4. Tools: Burp Suite, OWASP ZAP, sqlmap, nuclei
5. Duration: Minimum 3 business days for full coverage

## 4. Encryption at Rest

### PII Encryption

Sensitive employee data (national ID, bank account numbers) is encrypted at the application layer using AES-256-GCM before storage in PostgreSQL.

Implementation: `services/api/internal/crypto/aes.go`

- Algorithm: AES-256-GCM (authenticated encryption)
- Key size: 32 bytes from `PII_ENCRYPTION_KEY` environment variable
- Nonce: 12-byte random nonce prepended to ciphertext before base64 encoding
- Storage format: base64(nonce + ciphertext) as a single TEXT column value

### Key Management

- Keys stored in environment variables, never in code or config files
- Production keys managed via cloud secret manager (Vault, AWS Secrets Manager, or GCP Secret Manager)
- Key rotation: deploy new key, re-encrypt affected rows in background job, remove old key
- Key versioning: version byte prefix reserved in ciphertext format for future multi-key support

### Database Encryption

- PostgreSQL `ssl = on` for connections in transit
- Volume-level encryption on production storage (cloud provider managed)
- Backup encryption enabled on all automated backup jobs

## 5. Dependency Scanning

Automated scanning runs via `.github/workflows/security.yml`:

### Schedule

- **Weekly**: Monday 06:00 UTC cron scan of all dependencies
- **On push**: Every push to `main` triggers a scan

### JavaScript (pnpm)

```bash
pnpm audit --audit-level=high
```

Flags vulnerabilities at `high` and `critical` severity. Runs with `continue-on-error: true` to avoid blocking deploys on known low-risk issues — results must be reviewed weekly.

### Go (govulncheck)

```bash
cd services/api && govulncheck ./...
```

Checks Go module dependencies against the Go vulnerability database. Only reports vulnerabilities in code paths actually used by the application (not transitive-only).

### Response Process

1. **Critical/High**: Patch within 24 hours, deploy hotfix
2. **Medium**: Patch within 1 week, include in next release
3. **Low**: Track in backlog, patch within 1 month
4. **False positive**: Document in `.github/security-exceptions.md` with justification

### Container Scanning

Production container images should be scanned with Trivy or Grype before deployment:

```bash
trivy image hr-api:latest --severity HIGH,CRITICAL
```
