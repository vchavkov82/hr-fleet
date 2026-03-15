# Launch Checklist

## Pre-Launch (1 Week Before)

- [ ] All CI/CD pipelines green on main branch
- [ ] Security scan (Trivy, gosec, npm audit) passes with no critical/high findings
- [ ] Load test passes k6 thresholds (p50<100ms, p95<500ms, p99<2s at 10k req/min)
- [ ] Database migrations applied and verified on staging
- [ ] Backup and restore procedure tested end-to-end
- [ ] SSL/TLS certificates provisioned for production domains
- [ ] DNS TTL lowered to 300s (5 min) for quick cutover
- [ ] Monitoring and alerting configured (Prometheus, Grafana, Sentry env vars)
- [ ] Operations runbook reviewed by on-call team (see docs/RUNBOOK.md)
- [ ] Uptime check script deployed to cron on monitoring host
- [ ] All environment variables set in production (see reference below)
- [ ] Rate limiting verified: 1000/min public, 10000/min authenticated
- [ ] CORS, CSP, HSTS, and security headers validated
- [ ] Rollback procedure tested (deploy/scripts/rollback.sh)
- [ ] Stakeholder sign-off on staging environment

## Launch Day

### DNS Cutover

- [ ] Verify production containers are running: `podman-compose ps`
- [ ] Run health checks: `bash deploy/scripts/uptime-check.sh`
- [ ] Update DNS A/CNAME records for production domains
- [ ] Verify DNS propagation: `dig +short hr.example.com`
- [ ] Verify TLS handshake on all subdomains
- [ ] Smoke test: visit each public URL and verify content loads
- [ ] Verify API responds: `curl -sf https://api.hr.example.com/health`
- [ ] Test authentication flow end-to-end (login, token refresh, logout)

## Post-Launch (First 24 Hours)

- [ ] Monitor error rates in application logs (target: <0.1% 5xx)
- [ ] Monitor API response times (p95 < 500ms)
- [ ] Monitor database connection pool usage
- [ ] Monitor Redis memory and Asynq queue depth
- [ ] Verify automated backups are running on schedule
- [ ] Check uptime script cron output for any failures
- [ ] Restore DNS TTL to normal (3600s) after 24h stable
- [ ] Send launch confirmation to stakeholders

## Environment Variables Reference

### Go API (`services/api`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_PRIVATE_KEY` | RS256 private key (PEM) | Yes |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM) | Yes |
| `ODOO_URL` | Odoo JSON-RPC endpoint | Yes |
| `ODOO_DB` | Odoo database name | Yes |
| `ODOO_USERNAME` | Odoo API user | Yes |
| `ODOO_PASSWORD` | Odoo API password | Yes |
| `WEBHOOK_SECRET` | HMAC-SHA256 signing key | Yes |
| `PII_ENCRYPTION_KEY` | 32-byte hex key for PII at rest | Yes |
| `SENTRY_DSN` | Sentry error tracking | No |
| `API_PORT` | Server port (default: 5080) | No |

### Frontend Apps

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | API base URL for web app | Yes |
| `AN_API_KEY` | 21st Agents API key (AI assistant) | No |
