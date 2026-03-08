#!/usr/bin/env bash
# -------------------------------------------------------------------
# Odoo HR module initialization script (one-time setup)
#
# Run this after the Odoo container is up and healthy to install
# the core HR modules into the database.
#
# Usage: ./odoo-init.sh
# -------------------------------------------------------------------
set -euo pipefail

MODULES="hr,hr_holidays,hr_attendance,hr_recruitment,hr_expense,hr_contract"

echo "Installing Odoo HR modules: ${MODULES}"
podman exec hr-odoo odoo \
  -c /etc/odoo/odoo.conf \
  -d odoo \
  -i "${MODULES}" \
  --stop-after-init

echo "Done. HR modules installed successfully."
