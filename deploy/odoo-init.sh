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

# Core Odoo modules
CORE_MODULES="hr,hr_holidays,hr_attendance,hr_recruitment,hr_expense,hr_contract"

# OCA server-tools (dependencies for other OCA modules)
OCA_SERVER_TOOLS="base_technical_features"

# OCA web widgets (dependencies for other OCA modules)
OCA_WEB="web_widget_x2many_2d_matrix"

# OCA payroll
OCA_PAYROLL="payroll"

# OCA HR extensions (hr_skills is a core Odoo module, installed in step 1 automatically)
OCA_HR=""

# OCA timesheet
OCA_TIMESHEET="hr_timesheet_sheet"

# OCA reporting
OCA_REPORTING="report_xlsx"

ALL_MODULES="${CORE_MODULES},${OCA_SERVER_TOOLS},${OCA_WEB},${OCA_PAYROLL},${OCA_TIMESHEET},${OCA_REPORTING}"

echo "Installing Odoo modules: ${ALL_MODULES}"
echo ""
echo "Step 1: Core + server-tools base modules"
podman exec hr-odoo odoo \
  -c /etc/odoo/odoo.conf \
  -d odoo \
  -i "${CORE_MODULES},${OCA_SERVER_TOOLS}" \
  --stop-after-init

echo ""
echo "Step 2: OCA functional modules"
podman exec hr-odoo odoo \
  -c /etc/odoo/odoo.conf \
  -d odoo \
  -i "${OCA_PAYROLL},${OCA_HR},${OCA_TIMESHEET},${OCA_REPORTING}" \
  --stop-after-init

echo ""
echo "Done. All HR + OCA modules installed successfully."
