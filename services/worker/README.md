# services/worker

Background processing for this monorepo lives in **`services/api`**: run `go run ./cmd/server/ -mode=worker` or `-mode=both` (see root `Makefile` `dev-backend` and `deploy/podman-compose.yml` for `hr-api`). This directory is not the active Asynq worker entrypoint.
