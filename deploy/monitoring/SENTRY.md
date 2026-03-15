# Sentry Error Tracking

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SENTRY_DSN` | Sentry Data Source Name (project DSN) | `https://examplePublicKey@o0.ingest.sentry.io/0` |
| `SENTRY_ENVIRONMENT` | Deployment environment | `production`, `staging` |
| `SENTRY_RELEASE` | Release version for tracking | `hr-api@1.0.0` |
| `SENTRY_TRACES_SAMPLE_RATE` | Performance monitoring sample rate (0.0 - 1.0) | `0.1` (10% of transactions) |
| `SENTRY_PROFILES_SAMPLE_RATE` | Profiling sample rate (0.0 - 1.0) | `0.1` |

## Setup

1. Create a project at https://sentry.io (or self-hosted instance)
2. Get the DSN from Project Settings > Client Keys
3. Add variables to `.env` or container environment
4. Install Sentry SDK when ready:
   - Go API: `go get github.com/getsentry/sentry-go`
   - Next.js: `pnpm add @sentry/nextjs`

## Notes

- Sentry packages are NOT installed yet -- only env vars are documented
- Install when ready to integrate error tracking into the codebase
- Use `SENTRY_TRACES_SAMPLE_RATE=1.0` in staging, `0.1` in production
