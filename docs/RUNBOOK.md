# Operations Runbook

## Service Architecture

### Overview

The HR SaaS platform runs as a set of containerized services orchestrated via Podman Compose behind a Caddy reverse proxy.

### Services

| Service | Port | Description | Health Endpoint |
|---------|------|-------------|-----------------|
| Caddy | 80/443 | Reverse proxy, TLS termination | N/A (upstream health) |
| Go API | 5080 | REST API (Chi router, JWT auth) | `GET /health` |
| Go Worker | - | Asynq background task processor | Redis queue depth |
| Next.js (web) | 5010 | Marketing site + HR tools | `GET /` (200) |
| Astro (blog) | 5013 | Blog content | `GET /` (200) |
| Astro (docs) | 5011 | Documentation hub | `GET /` (200) |
| PostgreSQL | 5432 | Primary application database | `pg_isready` |
| PostgreSQL (Odoo) | 5433 | Odoo-dedicated database | `pg_isready` |
| Redis | 6379 | Cache + Asynq task queue | `redis-cli ping` |
| Odoo | 8069 | ERP backend (HR data source) | `GET /web/login` |

### Request Flow

```
Client -> Caddy (TLS) -> {
  hr.localhost       -> Next.js (5010)
  blog.hr.localhost  -> Astro Blog (5013)
  docs.localhost     -> Astro Docs (5011)
  api.hr.localhost   -> Go API (5080)
}
Go API -> PostgreSQL (queries via sqlc)
Go API -> Redis (L2 cache, Ristretto L1)
Go API -> Odoo (JSON-RPC, circuit breaker)
Go Worker -> Redis (Asynq task consumption)
Go Worker -> PostgreSQL (payroll processing)
```

## Common Operations

### Restart a Single Service

```bash
podman-compose -f deploy/podman-compose.yml restart <service>
```

### View Logs

```bash
# All services
podman-compose -f deploy/podman-compose.yml logs -f

# Single service (last 100 lines)
podman-compose -f deploy/podman-compose.yml logs -f --tail=100 api
```

### Database Backup

```bash
bash deploy/scripts/backup-db.sh
```

### Database Restore

```bash
podman exec -i hr-postgres psql -U hr hr_db < backup.sql
```

### Deploy New Version

```bash
bash deploy/scripts/deploy.sh
```

### Rollback

```bash
bash deploy/scripts/rollback.sh
```

### Clear Redis Cache

```bash
podman exec hr-redis redis-cli FLUSHDB
```

### Check Asynq Queue Depth

```bash
podman exec hr-redis redis-cli LLEN asynq:{default}
```

### Regenerate Swagger Docs

```bash
cd services/api && make swagger
```

## Incident Response

### Severity Levels

| Level | Description | Response Time | Resolution Target |
|-------|-------------|---------------|-------------------|
| P1 | Service down, data loss risk | 15 min | 1 hour |
| P2 | Major feature broken, workaround exists | 30 min | 4 hours |
| P3 | Minor feature degraded | 2 hours | 24 hours |
| P4 | Cosmetic, low-impact | Next business day | 1 week |

### P1 Incident Procedure

1. **Acknowledge** within 15 minutes
2. **Assess** scope: which services affected, user impact
3. **Communicate** to stakeholders (status page update)
4. **Mitigate** - restore service (rollback, restart, failover)
5. **Resolve** - fix root cause
6. **Post-mortem** within 48 hours

### P2 Incident Procedure

1. **Acknowledge** within 30 minutes
2. **Assess** and document workaround for users
3. **Fix** within 4 hours or escalate to P1
4. **Verify** fix with uptime check script

### P3/P4 Incident Procedure

1. Create issue in tracker with severity label
2. Schedule fix in next sprint
3. Monitor for escalation

## Scaling

### Horizontal Scaling

- **Go API**: Stateless; add replicas behind Caddy with `deploy` directive
- **Go Worker**: Add worker instances; Asynq distributes tasks automatically
- **Next.js**: Stateless; replicate and load balance

### Vertical Scaling

- **PostgreSQL**: Increase `shared_buffers`, `work_mem`, `max_connections`
- **Redis**: Increase `maxmemory` (currently uses allkeys-lru eviction)

### Database Scaling

- Add read replicas for reporting queries
- Partition large tables (payroll_runs, audit_logs) by date
- Connection pooling via PgBouncer if connections exceed 100

## Monitoring

### Key Metrics

| Metric | Warning | Critical |
|--------|---------|----------|
| API response time (p95) | > 500ms | > 2s |
| API error rate (5xx) | > 1% | > 5% |
| PostgreSQL connections | > 80% max | > 95% max |
| Redis memory usage | > 70% | > 90% |
| Asynq queue depth | > 100 | > 500 |
| Disk usage | > 80% | > 95% |
| CPU usage (sustained) | > 70% | > 90% |

### Health Check Endpoints

```bash
# API health
curl -sf http://localhost:5080/health

# Web app
curl -sf http://localhost:5010/ -o /dev/null

# Blog
curl -sf http://localhost:5013/ -o /dev/null

# Docs
curl -sf http://localhost:5011/ -o /dev/null
```

### Automated Uptime Checks

Run the uptime check script via cron every 5 minutes:

```bash
*/5 * * * * /path/to/deploy/scripts/uptime-check.sh >> /var/log/hr-uptime.log 2>&1
```

## SLA

### Target: 99.9% Uptime

- **Allowed downtime per month**: 43 minutes
- **Allowed downtime per year**: 8 hours 45 minutes
- **Measurement**: HTTP 200 from `/health` endpoint, checked every 60 seconds
- **Exclusions**: Scheduled maintenance windows (announced 48h in advance)

### Maintenance Windows

- **Preferred time**: Saturday 02:00-06:00 UTC
- **Notification**: 48 hours advance notice via status page
- **Duration**: Maximum 2 hours per window

## On-Call Template

### Shift Handoff

```
Date: YYYY-MM-DD
Outgoing: [name]
Incoming: [name]

Active Issues:
- [ ] Issue description (severity, status)

Scheduled Changes:
- [ ] Change description (time, risk level)

Notes:
- Any context the incoming person needs
```

### Escalation Path

1. On-call engineer (primary)
2. On-call engineer (secondary)
3. Engineering lead
4. CTO

## Troubleshooting

### API Returns 502 Bad Gateway

1. Check if API container is running: `podman ps | grep api`
2. Check API logs: `podman-compose logs --tail=50 api`
3. Verify port binding: `ss -tlnp | grep 5080`
4. Restart API: `podman-compose restart api`

### Database Connection Errors

1. Check PostgreSQL is running: `podman exec hr-postgres pg_isready`
2. Check connection count: `podman exec hr-postgres psql -U hr -c "SELECT count(*) FROM pg_stat_activity;"`
3. Check for long-running queries: `podman exec hr-postgres psql -U hr -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 5;"`
4. Kill stuck queries if needed: `podman exec hr-postgres psql -U hr -c "SELECT pg_terminate_backend(<pid>);"`

### Redis Out of Memory

1. Check memory: `podman exec hr-redis redis-cli INFO memory | grep used_memory_human`
2. Check key count: `podman exec hr-redis redis-cli DBSIZE`
3. Flush stale keys: `podman exec hr-redis redis-cli FLUSHDB` (clears cache; Asynq queues in separate DB)
4. Increase maxmemory in Redis config if persistent

### Odoo Connection Failures (Circuit Breaker Open)

1. Check Odoo is reachable: `curl -sf http://localhost:8069/web/login`
2. Check circuit breaker state in API logs (trips after 5 consecutive failures)
3. API serves stale cache (30-min TTL) during Odoo outage
4. Once Odoo recovers, circuit breaker resets automatically on next successful call

### High Asynq Queue Depth

1. Check worker is running: `podman ps | grep worker`
2. Check worker logs: `podman-compose logs --tail=50 worker`
3. Check Redis connectivity from worker
4. Scale workers if queue depth remains high under normal load

### Slow API Responses

1. Check p95 latency in monitoring
2. Identify slow endpoints from access logs
3. Check PostgreSQL slow query log
4. Check Ristretto L1 hit rate (low hit rate = cache miss storm)
5. Check Odoo response times (circuit breaker should protect)
6. Consider adding database indexes for new query patterns
