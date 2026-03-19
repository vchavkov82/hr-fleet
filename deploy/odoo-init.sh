#!/usr/bin/env bash
# -------------------------------------------------------------------
# Odoo Full Platform initialization script (one-time setup)
#
# Run this after the Odoo container is up and healthy to install
# all platform modules: base setup, website, portal, HR, and OCA extensions.
#
# Usage: ./odoo-init.sh
# -------------------------------------------------------------------
set -euo pipefail

# Step 1: Base platform modules (mail, website, portal, auth)
BASE_PLATFORM="base_setup,mail,auth_signup,website,portal"

# Step 2: Core HR modules
CORE_HR="hr,hr_skills,hr_holidays,hr_attendance,hr_recruitment,hr_expense,hr_contract,hr_appraisal,hr_fleet"

# Step 3: Project and timesheet integration
PROJECT_MODULES="project,project_timesheet_holidays"

# Step 4: OCA web widgets (dependencies for other OCA modules)
OCA_WEB="web_widget_x2many_2d_matrix"

# Step 5: OCA payroll and extensions
OCA_PAYROLL="payroll"
OCA_TIMESHEET="hr_timesheet_sheet"
OCA_REPORTING="report_xlsx"

# Step 6: OCA contract management
OCA_CONTRACT="contract"

# Step 7: OCA partner/contact extensions
OCA_PARTNER="partner_contact_birthdate,partner_contact_gender,partner_contact_job_position"

# Step 8: OCA data protection (GDPR)
OCA_PRIVACY="privacy"

# Step 9: OCA surveys
OCA_SURVEY="survey_xlsx"

# Step 10: OCA server UX (approval workflows)
OCA_SERVER_UX="base_tier_validation"

install_modules() {
  local modules="$1"
  local description="$2"
  
  echo ""
  echo "Installing: ${description}..."
  echo "Modules: ${modules}"
  echo ""
  
  # Stop Odoo service
  podman stop hr-odoo >/dev/null 2>&1 || true
  sleep 2
  
  # Run Odoo in initialization mode
  podman run --rm \
    --network deploy_hr \
    -v deploy_odoo_data:/var/lib/odoo \
    -v "$(pwd)/deploy/odoo.conf:/etc/odoo/odoo.conf:ro" \
    -v "$(pwd)/deploy/odoo-addons/web:/mnt/extra-addons/web:ro" \
    -v "$(pwd)/deploy/odoo-addons/server-tools:/mnt/extra-addons/server-tools:ro" \
    -v "$(pwd)/deploy/odoo-addons/payroll:/mnt/extra-addons/payroll:ro" \
    -v "$(pwd)/deploy/odoo-addons/hr:/mnt/extra-addons/hr:ro" \
    -v "$(pwd)/deploy/odoo-addons/hr-holidays:/mnt/extra-addons/hr-holidays:ro" \
    -v "$(pwd)/deploy/odoo-addons/hr-attendance:/mnt/extra-addons/hr-attendance:ro" \
    -v "$(pwd)/deploy/odoo-addons/hr-expense:/mnt/extra-addons/hr-expense:ro" \
    -v "$(pwd)/deploy/odoo-addons/timesheet:/mnt/extra-addons/timesheet:ro" \
    -v "$(pwd)/deploy/odoo-addons/reporting-engine:/mnt/extra-addons/reporting-engine:ro" \
    -v "$(pwd)/deploy/odoo-addons/account-financial-reporting:/mnt/extra-addons/account-financial-reporting:ro" \
    -v "$(pwd)/deploy/odoo-addons/project:/mnt/extra-addons/project:ro" \
    -v "$(pwd)/deploy/odoo-addons/fleet:/mnt/extra-addons/fleet:ro" \
    -v "$(pwd)/deploy/odoo-addons/contract:/mnt/extra-addons/contract:ro" \
    -v "$(pwd)/deploy/odoo-addons/partner-contact:/mnt/extra-addons/partner-contact:ro" \
    -v "$(pwd)/deploy/odoo-addons/data-protection:/mnt/extra-addons/data-protection:ro" \
    -v "$(pwd)/deploy/odoo-addons/survey:/mnt/extra-addons/survey:ro" \
    -v "$(pwd)/deploy/odoo-addons/server-ux:/mnt/extra-addons/server-ux:ro" \
    -e HOST=hr-odoo-db \
    -e PORT=5432 \
    -e USER=odoo \
    -e PASSWORD=odoo \
    localhost/hr-odoo:18.0-oca \
    odoo -c /etc/odoo/odoo.conf -d odoo -i "${modules}" --stop-after-init
  
  # Restart Odoo service
  podman start hr-odoo >/dev/null 2>&1 || true
  sleep 5
}

echo "============================================================"
echo "Odoo Full Platform Installation"
echo "============================================================"

# Change to repo root
cd "$(dirname "$0")/.."

echo ""
echo "Step 1/10: Base platform modules"
install_modules "${BASE_PLATFORM}" "mail, website, portal, auth"

echo ""
echo "Step 2/10: Core HR modules"
install_modules "${CORE_HR}" "HR suite"

echo ""
echo "Step 3/10: Project and timesheet"
install_modules "${PROJECT_MODULES}" "project and timesheets"

echo ""
echo "Step 4/10: OCA web widgets"
install_modules "${OCA_WEB}" "OCA web widgets"

echo ""
echo "Step 5/10: OCA payroll and reporting"
install_modules "${OCA_PAYROLL},${OCA_TIMESHEET},${OCA_REPORTING}" "OCA payroll, timesheet, reporting"

echo ""
echo "Step 6/10: OCA contract management"
install_modules "${OCA_CONTRACT}" "OCA contract management"

echo ""
echo "Step 7/10: OCA partner/contact extensions"
install_modules "${OCA_PARTNER}" "OCA partner contact extensions"

echo ""
echo "Step 8/10: OCA data protection (GDPR)"
install_modules "${OCA_PRIVACY}" "OCA privacy/GDPR"

echo ""
echo "Step 9/10: OCA surveys"
install_modules "${OCA_SURVEY}" "OCA survey extensions"

echo ""
echo "Step 10/10: OCA server UX (approval workflows)"
install_modules "${OCA_SERVER_UX}" "OCA approval workflows"

echo ""
echo "============================================================"
echo "Installation complete!"
echo ""
echo "Installed modules:"
echo "  - Base: ${BASE_PLATFORM}"
echo "  - HR: ${CORE_HR}"
echo "  - Project: ${PROJECT_MODULES}"
echo "  - OCA Web: ${OCA_WEB}"
echo "  - OCA Extensions: ${OCA_PAYROLL},${OCA_TIMESHEET},${OCA_REPORTING}"
echo "  - OCA Contract: ${OCA_CONTRACT}"
echo "  - OCA Partner: ${OCA_PARTNER}"
echo "  - OCA Privacy: ${OCA_PRIVACY}"
echo "  - OCA Survey: ${OCA_SURVEY}"
echo "  - OCA Server UX: ${OCA_SERVER_UX}"
echo ""
echo "Access Odoo at: http://odoo.hr.localhost:5090"
echo "Default credentials: admin / admin"
echo "============================================================"
