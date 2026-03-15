#!/bin/bash
# PostgreSQL backup script with 30-day retention
# Run via cron daily, e.g.: 0 2 * * * /path/to/backup-db.sh
#
# Environment variables:
#   DATABASE_URL  — full postgres connection string (preferred)
#   PGHOST, PGUSER, PGDATABASE — fallback individual vars
#   BACKUP_DIR    — override backup directory (default: /backups/postgres)

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/hr_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[backup] Starting PostgreSQL backup at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ -n "${DATABASE_URL:-}" ]; then
    pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
else
    pg_dump | gzip > "${BACKUP_FILE}"
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[backup] Created ${BACKUP_FILE} (${FILE_SIZE})"

# Remove backups older than 30 days
DELETED=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +30 -delete -print | wc -l)
echo "[backup] Removed ${DELETED} backups older than 30 days"

echo "[backup] Complete"
