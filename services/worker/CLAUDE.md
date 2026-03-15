# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Service

Standalone background worker (`@hr/worker`). Processes async tasks from the Redis-backed Asynq queue.

## Commands

```bash
go run ./cmd/worker     # Run worker
go build -o bin/worker ./cmd/worker  # Build binary
go test ./...           # Run tests
golangci-lint run ./... # Lint
```

## Notes

- The main API service (`services/api`) can also run in worker mode via `--mode=worker` or `--mode=both`
- This standalone worker shares task handler logic with `services/api/internal/worker/`
