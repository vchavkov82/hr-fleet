import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SearchBar } from '@/components/help/search-bar'
import { HelpCenterBreadcrumbs } from '@/components/help/breadcrumbs'
import { SectionReveal } from '@/components/ui/section-reveal'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const CATEGORY_SLUGS = ['getting-started', 'employees', 'leave', 'payroll', 'integrations', 'security', 'user-guide'] as const

export function generateStaticParams() {
    return routing.locales.flatMap((locale) =>
        CATEGORY_SLUGS.map((category) => ({ locale, category }))
    )
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; category: string }>
}): Promise<Metadata> {
    const { locale, category } = await params
    const canonicalCategory = category === 'user-guide' ? 'getting-started' : category
    const t = await getTranslations({ locale, namespace: 'helpCenter' })

    const categoryTitles: Record<string, string> = {
        'getting-started': t('categories.gettingStarted.title'),
        'employees': t('categories.employees.title'),
        'leave': t('categories.leave.title'),
        'payroll': t('categories.payroll.title'),
        'integrations': t('categories.integrations.title'),
        'security': t('categories.security.title')
    }

    const title = categoryTitles[canonicalCategory] || 'Category'

    return {
        title: `${title} | HR Help Center`,
        description: `Browse all articles in the ${title} category.`
    }
}

// Mock article data - in a real app, this would come from a CMS or database
const MOCK_ARTICLES = [
    {
        id: 'getting-started',
        title: 'Getting Started with HR',
        description: 'A complete guide to setting up your account and posting your first job.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '5 min',
        lastUpdated: '2024-02-15',
        content: 'Learn how to set up your HR account, configure your company profile, and post your first job opening. This guide covers all the essential steps to get you started with our HR platform.',
        tags: ['setup', 'account', 'first-job', 'onboarding']
    },
    {
        id: 'company-setup',
        title: 'Company Profile Configuration',
        description: 'Configure your company settings, departments, and organizational structure.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '8 min',
        lastUpdated: '2024-02-10',
        content: 'Set up your company profile, add departments, define roles and permissions, and configure basic settings for your HR account.',
        tags: ['company', 'profile', 'settings', 'departments']
    },
    {
        id: 'team-invitation',
        title: 'Inviting Team Members',
        description: 'How to add users, assign roles, and manage team permissions.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '6 min',
        lastUpdated: '2024-02-12',
        content: 'Learn how to invite team members to HR, assign appropriate roles and permissions, and manage user access to different features.',
        tags: ['team', 'users', 'permissions', 'roles']
    },
    {
        id: 'first-job-posting',
        title: 'Creating Your First Job Posting',
        description: 'Step-by-step guide to creating and publishing your first job opening.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '7 min',
        lastUpdated: '2024-02-25',
        content: 'Learn how to create compelling job postings, set requirements, configure application forms, and publish to multiple job boards.',
        tags: ['jobs', 'posting', 'recruiting', 'publish']
    },
    {
        id: 'dashboard-overview',
        title: 'Understanding Your Dashboard',
        description: 'Navigate the HR dashboard and understand key metrics.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '5 min',
        lastUpdated: '2024-02-26',
        content: 'Get familiar with your dashboard, understand key HR metrics, and customize your view for maximum productivity.',
        tags: ['dashboard', 'metrics', 'navigation', 'overview']
    },
    {
        id: 'notification-settings',
        title: 'Configuring Notifications',
        description: 'Set up email and in-app notifications for important HR events.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '4 min',
        lastUpdated: '2024-02-24',
        content: 'Configure notification preferences, set up alerts for applications, approvals, and other important HR activities.',
        tags: ['notifications', 'alerts', 'settings', 'email']
    },
    {
        id: 'mobile-app-setup',
        title: 'Using the Mobile App',
        description: 'Download and set up the HR mobile app for on-the-go access.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '3 min',
        lastUpdated: '2024-02-23',
        content: 'Install the mobile app, sync your account, and manage HR tasks from anywhere with full mobile functionality.',
        tags: ['mobile', 'app', 'ios', 'android']
    },
    {
        id: 'employee-data',
        title: 'Managing Employee Information',
        description: 'How to add, update, and manage employee profiles and data.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '10 min',
        lastUpdated: '2024-02-18',
        content: 'Complete guide to managing employee data in HR. Learn how to add new employees, update profiles, manage documents, and maintain accurate records.',
        tags: ['employees', 'profiles', 'data', 'management']
    },
    {
        id: 'org-chart',
        title: 'Creating Organizational Charts',
        description: 'Build and maintain visual org charts with drag-and-drop functionality.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '7 min',
        lastUpdated: '2024-02-14',
        content: 'Create visual organizational charts, define reporting relationships, and keep your company structure up to date with our intuitive org chart builder.',
        tags: ['org-chart', 'structure', 'reporting', 'visualization']
    },
    {
        id: 'employee-documents',
        title: 'Document Management for Employees',
        description: 'Upload, organize, and manage employee documents with e-signature support.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '9 min',
        lastUpdated: '2024-02-16',
        content: 'Manage employee documents efficiently. Upload contracts, certificates, and other important files. Use e-signature functionality and set document reminders.',
        tags: ['documents', 'files', 'signatures', 'storage']
    },
    {
        id: 'employee-onboarding',
        title: 'Employee Onboarding Process',
        description: 'Create automated onboarding workflows for new hires.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '11 min',
        lastUpdated: '2024-02-27',
        content: 'Set up comprehensive onboarding workflows, assign tasks, collect documents, and ensure smooth integration of new employees.',
        tags: ['onboarding', 'new-hire', 'workflow', 'automation']
    },
    {
        id: 'performance-reviews',
        title: 'Managing Performance Reviews',
        description: 'Set up review cycles, templates, and track employee performance.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '13 min',
        lastUpdated: '2024-02-26',
        content: 'Create performance review cycles, use customizable templates, set goals, and track employee development over time.',
        tags: ['performance', 'reviews', 'goals', 'development']
    },
    {
        id: 'employee-directory',
        title: 'Using the Employee Directory',
        description: 'Search, filter, and manage your company directory.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '5 min',
        lastUpdated: '2024-02-25',
        content: 'Navigate the employee directory, use advanced search filters, export contact lists, and manage employee visibility.',
        tags: ['directory', 'search', 'contacts', 'employees']
    },
    {
        id: 'leave-requests',
        title: 'Managing Leave Requests',
        description: 'How to configure leave types, approval workflows, and team calendars.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '7 min',
        lastUpdated: '2024-02-20',
        content: 'Set up and manage leave requests, configure different leave types, create approval workflows, and use team calendars to track absences effectively.',
        tags: ['leave', 'absence', 'approval', 'calendar', 'workflows']
    },
    {
        id: 'leave-policies',
        title: 'Configuring Leave Policies',
        description: 'Set up leave accrual rules, carry-over policies, and restrictions.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '12 min',
        lastUpdated: '2024-02-17',
        content: 'Configure comprehensive leave policies including accrual rules, carry-over settings, probation periods, and custom leave types for your organization.',
        tags: ['policies', 'accrual', 'rules', 'configuration']
    },
    {
        id: 'team-calendar',
        title: 'Team Calendar and Scheduling',
        description: 'Visualize team availability and prevent scheduling conflicts.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '6 min',
        lastUpdated: '2024-02-19',
        content: 'Use the team calendar to visualize leave schedules, prevent conflicts, and ensure adequate coverage. Export calendars and integrate with external tools.',
        tags: ['calendar', 'scheduling', 'availability', 'conflicts']
    },
    {
        id: 'sick-leave-tracking',
        title: 'Sick Leave and Medical Certificates',
        description: 'Manage sick leave requests and medical documentation.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '8 min',
        lastUpdated: '2024-02-28',
        content: 'Handle sick leave requests, upload medical certificates, track sick days, and ensure compliance with Bulgarian labor law.',
        tags: ['sick-leave', 'medical', 'certificates', 'compliance']
    },
    {
        id: 'public-holidays',
        title: 'Managing Public Holidays',
        description: 'Configure national and regional holidays for accurate leave calculations.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '5 min',
        lastUpdated: '2024-02-27',
        content: 'Set up Bulgarian public holidays, regional observances, and ensure accurate leave balance calculations.',
        tags: ['holidays', 'public-holidays', 'bulgaria', 'calendar']
    },
    {
        id: 'payroll-setup',
        title: 'Running Your First Payroll',
        description: 'Step-by-step guide to processing payroll with Bulgarian tax compliance.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '12 min',
        lastUpdated: '2024-02-21',
        content: 'Complete guide to processing your first payroll in HR, including Bulgarian tax compliance, social security contributions, and generating payslips.',
        tags: ['payroll', 'taxes', 'bulgaria', 'compliance', 'payslips']
    },
    {
        id: 'tax-configuration',
        title: 'Tax and Social Security Setup',
        description: 'Configure tax rates, social security contributions, and deductions.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '15 min',
        lastUpdated: '2024-02-13',
        content: 'Set up tax rates, social security contributions, and various deductions according to Bulgarian legislation. Keep your payroll compliant and accurate.',
        tags: ['taxes', 'social-security', 'deductions', 'compliance']
    },
    {
        id: 'payslips',
        title: 'Generating and Distributing Payslips',
        description: 'Create digital payslips and set up automatic distribution.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '8 min',
        lastUpdated: '2024-02-22',
        content: 'Generate detailed payslips automatically, set up email distribution, and provide employees with secure access to their payment history.',
        tags: ['payslips', 'distribution', 'email', 'access']
    },
    {
        id: 'payroll-reports',
        title: 'Payroll Reporting and Analytics',
        description: 'Generate payroll reports for accounting and compliance.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '10 min',
        lastUpdated: '2024-02-28',
        content: 'Create detailed payroll reports, export data for accounting software, and analyze payroll costs and trends.',
        tags: ['reports', 'analytics', 'accounting', 'export']
    },
    {
        id: 'bonus-management',
        title: 'Managing Bonuses and Allowances',
        description: 'Configure one-time payments, recurring allowances, and bonuses.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '9 min',
        lastUpdated: '2024-02-26',
        content: 'Set up performance bonuses, meal allowances, transportation benefits, and other compensation components.',
        tags: ['bonuses', 'allowances', 'benefits', 'compensation']
    },
    {
        id: 'payroll-corrections',
        title: 'Payroll Corrections and Adjustments',
        description: 'How to correct payroll errors and make retroactive adjustments.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '7 min',
        lastUpdated: '2024-02-25',
        content: 'Learn how to correct payroll mistakes, process retroactive payments, and handle overpayment recovery.',
        tags: ['corrections', 'adjustments', 'errors', 'retroactive']
    },
    {
        id: 'slack-integration',
        title: 'Slack Integration Setup',
        description: 'Connect HR with Slack for notifications and approvals.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '5 min',
        lastUpdated: '2024-02-11',
        content: 'Integrate HR with Slack to receive notifications, approve requests, and stay updated on HR activities without leaving your workspace.',
        tags: ['slack', 'notifications', 'approvals', 'productivity']
    },
    {
        id: 'google-workspace',
        title: 'Google Workspace Integration',
        description: 'Sync with Google Calendar, Drive, and other Google services.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '7 min',
        lastUpdated: '2024-02-09',
        content: 'Connect HR with Google Workspace to sync calendars, store documents in Drive, and streamline user management with Google accounts.',
        tags: ['google', 'workspace', 'calendar', 'drive']
    },
    {
        id: 'microsoft-teams',
        title: 'Microsoft Teams Integration',
        description: 'Connect with Microsoft Teams for notifications and collaboration.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '6 min',
        lastUpdated: '2024-02-28',
        content: 'Integrate HR with Microsoft Teams to receive notifications, approve requests, and collaborate on HR tasks.',
        tags: ['microsoft', 'teams', 'notifications', 'collaboration']
    },
    {
        id: 'accounting-software',
        title: 'Accounting Software Integration',
        description: 'Sync payroll data with accounting platforms like QuickBooks and Xero.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '8 min',
        lastUpdated: '2024-02-27',
        content: 'Connect with popular accounting software to automatically sync payroll data, expenses, and financial reports.',
        tags: ['accounting', 'quickbooks', 'xero', 'sync']
    },
    {
        id: 'sso-setup',
        title: 'Single Sign-On (SSO) Setup',
        description: 'Configure SAML-based SSO for enterprise authentication.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '12 min',
        lastUpdated: '2024-02-26',
        content: 'Set up SSO with providers like Okta, Azure AD, or Google Workspace for seamless and secure authentication.',
        tags: ['sso', 'saml', 'authentication', 'security']
    },
    {
        id: 'gdpr-compliance',
        title: 'GDPR Compliance in HR',
        description: 'How HR handles candidate data and how to configure consent settings.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '10 min',
        lastUpdated: '2024-02-08',
        content: 'Understand how HR ensures GDPR compliance, handles candidate data, and how you can configure consent settings to meet data protection requirements.',
        tags: ['gdpr', 'compliance', 'data-protection', 'security']
    },
    {
        id: 'user-permissions',
        title: 'Managing User Access and Permissions',
        description: 'Configure role-based access control and user permissions.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '8 min',
        lastUpdated: '2024-02-24',
        content: 'Set up role-based access control, define custom permissions, and ensure users have appropriate access to sensitive HR data.',
        tags: ['permissions', 'access', 'security', 'roles']
    },
    {
        id: 'backup-recovery',
        title: 'Data Backup and Recovery',
        description: 'Understand our backup procedures and data recovery options.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '6 min',
        lastUpdated: '2024-02-07',
        content: 'Learn about our automated backup procedures, data retention policies, and recovery options to ensure your HR data is always safe and accessible.',
        tags: ['backup', 'recovery', 'data-safety', 'continuity']
    },
    {
        id: 'two-factor-auth',
        title: 'Two-Factor Authentication',
        description: 'Enable 2FA for enhanced account security.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '5 min',
        lastUpdated: '2024-02-28',
        content: 'Set up two-factor authentication using authenticator apps or SMS to add an extra layer of security to your account.',
        tags: ['2fa', 'security', 'authentication', 'mfa']
    },
    {
        id: 'billing-invoices',
        title: 'Managing Billing and Invoices',
        description: 'View invoices, update payment methods, and manage subscriptions.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '7 min',
        lastUpdated: '2024-02-27',
        content: 'Access billing history, download invoices, update credit card information, and manage your subscription plan.',
        tags: ['billing', 'invoices', 'payment', 'subscription']
    },
    {
        id: 'audit-logs',
        title: 'Viewing Audit Logs',
        description: 'Track user actions and system changes for compliance.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '8 min',
        lastUpdated: '2024-02-26',
        content: 'Access detailed audit logs to track user activities, data changes, and system events for security and compliance.',
        tags: ['audit', 'logs', 'compliance', 'tracking']
    },
    {
        id: 'data-export',
        title: 'Exporting Your Data',
        description: 'Export employee data, reports, and documents for backup or migration.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '6 min',
        lastUpdated: '2024-02-25',
        content: 'Learn how to export your HR data in various formats for backup, reporting, or migration to other systems.',
        tags: ['export', 'data', 'backup', 'migration']
    },
    {
        id: 'candidate-screening',
        title: 'Automated Candidate Screening',
        description: 'Use AI-powered screening to filter and rank candidates automatically.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '9 min',
        lastUpdated: '2024-02-28',
        content: 'Set up automated screening criteria, configure AI-powered candidate matching, and streamline your recruitment process with intelligent filtering.',
        tags: ['screening', 'ai', 'automation', 'recruiting']
    },
    {
        id: 'interview-scheduling',
        title: 'Interview Scheduling and Calendar Integration',
        description: 'Schedule interviews and sync with Google Calendar and Outlook.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '6 min',
        lastUpdated: '2024-02-27',
        content: 'Automate interview scheduling, send calendar invites, and integrate with your existing calendar system for seamless coordination.',
        tags: ['interviews', 'scheduling', 'calendar', 'automation']
    },
    {
        id: 'employee-self-service',
        title: 'Employee Self-Service Portal',
        description: 'Enable employees to manage their own information and requests.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '8 min',
        lastUpdated: '2024-02-26',
        content: 'Set up the self-service portal where employees can update personal information, request leave, view payslips, and access company documents.',
        tags: ['self-service', 'portal', 'employees', 'automation']
    },
    {
        id: 'custom-workflows',
        title: 'Creating Custom Approval Workflows',
        description: 'Design multi-step approval processes for leave, expenses, and more.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '12 min',
        lastUpdated: '2024-02-25',
        content: 'Build custom approval workflows with multiple stages, conditional routing, and automated notifications for various HR processes.',
        tags: ['workflows', 'approvals', 'automation', 'processes']
    },
    {
        id: 'time-tracking',
        title: 'Time Tracking and Attendance',
        description: 'Track employee hours, overtime, and attendance patterns.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '10 min',
        lastUpdated: '2024-02-24',
        content: 'Implement time tracking for hourly employees, monitor attendance, calculate overtime, and generate detailed time reports.',
        tags: ['time-tracking', 'attendance', 'hours', 'overtime']
    },
    {
        id: 'leave-accrual',
        title: 'Leave Accrual and Carryover Rules',
        description: 'Configure how leave days accumulate and carry over year to year.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '9 min',
        lastUpdated: '2024-02-23',
        content: 'Set up leave accrual rules based on tenure, configure carryover policies, and manage leave balances according to Bulgarian labor law.',
        tags: ['leave', 'accrual', 'carryover', 'policies']
    },
    {
        id: 'bulk-payroll-processing',
        title: 'Bulk Payroll Processing',
        description: 'Process payroll for multiple employees simultaneously.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '11 min',
        lastUpdated: '2024-02-22',
        content: 'Run payroll for your entire organization in one batch, handle exceptions, and generate all required reports for NRA submission.',
        tags: ['payroll', 'bulk', 'processing', 'automation']
    },
    {
        id: 'payroll-corrections',
        title: 'Making Payroll Corrections',
        description: 'How to correct payroll errors and reprocess payments.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '8 min',
        lastUpdated: '2024-02-21',
        content: 'Learn how to identify and correct payroll errors, reprocess payments, and maintain accurate payroll records for compliance.',
        tags: ['payroll', 'corrections', 'errors', 'reprocessing']
    },
    {
        id: 'zapier-integration',
        title: 'Zapier Integration Setup',
        description: 'Connect HR with 5000+ apps using Zapier.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '7 min',
        lastUpdated: '2024-02-20',
        content: 'Set up Zapier integration to automate workflows between HR and your other business tools like CRM, email marketing, and project management.',
        tags: ['zapier', 'integration', 'automation', 'workflows']
    },
    {
        id: 'custom-reports',
        title: 'Building Custom Reports',
        description: 'Create custom HR reports and dashboards for your specific needs.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '13 min',
        lastUpdated: '2024-02-19',
        content: 'Use the report builder to create custom HR analytics, schedule automated reports, and export data in multiple formats.',
        tags: ['reports', 'analytics', 'dashboards', 'custom']
    },
    {
        id: 'job-board-integration',
        title: 'Publishing Jobs to Multiple Job Boards',
        description: 'Automatically post job openings to LinkedIn, Indeed, and other platforms.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '8 min',
        lastUpdated: '2024-02-18',
        content: 'Learn how to connect your HR account to popular job boards and automatically syndicate your job postings to reach more candidates.',
        tags: ['job-boards', 'posting', 'integration', 'recruiting']
    },
    {
        id: 'candidate-pipeline',
        title: 'Managing Your Candidate Pipeline',
        description: 'Move candidates through hiring stages and collaborate with your team.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '10 min',
        lastUpdated: '2024-02-17',
        content: 'Master the ATS pipeline to track candidates, add notes, schedule interviews, and collaborate with hiring managers throughout the recruitment process.',
        tags: ['ats', 'pipeline', 'candidates', 'recruiting']
    },
    {
        id: 'employee-benefits',
        title: 'Managing Employee Benefits',
        description: 'Configure and track health insurance, meal vouchers, and other benefits.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '11 min',
        lastUpdated: '2024-02-16',
        content: 'Set up employee benefits packages, track enrollment, manage costs, and ensure compliance with Bulgarian benefits regulations.',
        tags: ['benefits', 'insurance', 'compensation', 'perks']
    },
    {
        id: 'employee-offboarding',
        title: 'Employee Offboarding Process',
        description: 'Handle resignations and terminations professionally and compliantly.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '9 min',
        lastUpdated: '2024-02-15',
        content: 'Follow best practices for employee exits, including exit interviews, equipment return, access revocation, and final payroll processing.',
        tags: ['offboarding', 'resignation', 'termination', 'exit']
    },
    {
        id: 'training-development',
        title: 'Employee Training and Development',
        description: 'Track training programs, certifications, and skill development.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '10 min',
        lastUpdated: '2024-02-14',
        content: 'Manage employee training programs, track certifications, create development plans, and measure learning outcomes.',
        tags: ['training', 'development', 'learning', 'skills']
    },
    {
        id: 'parental-leave',
        title: 'Parental Leave Management',
        description: 'Handle maternity and paternity leave according to Bulgarian law.',
        category: 'leave',
        categoryName: 'Leave & Absence',
        readTime: '12 min',
        lastUpdated: '2024-02-13',
        content: 'Navigate Bulgarian parental leave regulations, calculate benefits, manage leave periods, and ensure smooth transitions.',
        tags: ['parental-leave', 'maternity', 'paternity', 'benefits']
    },
    {
        id: 'overtime-management',
        title: 'Overtime Tracking and Compensation',
        description: 'Track overtime hours and calculate proper compensation.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '9 min',
        lastUpdated: '2024-02-12',
        content: 'Monitor overtime hours, apply correct multipliers according to Bulgarian labor law, and ensure accurate overtime compensation.',
        tags: ['overtime', 'compensation', 'hours', 'labor-law']
    },
    {
        id: 'expense-reimbursement',
        title: 'Employee Expense Reimbursement',
        description: 'Process and approve employee expense claims efficiently.',
        category: 'payroll',
        categoryName: 'Payroll',
        readTime: '7 min',
        lastUpdated: '2024-02-11',
        content: 'Set up expense categories, create approval workflows, and process reimbursements while maintaining tax compliance.',
        tags: ['expenses', 'reimbursement', 'claims', 'approval']
    },
    {
        id: 'webhook-automation',
        title: 'Webhook and API Automation',
        description: 'Automate workflows using webhooks and REST API.',
        category: 'integrations',
        categoryName: 'Integrations',
        readTime: '14 min',
        lastUpdated: '2024-02-10',
        content: 'Set up webhooks to trigger actions in external systems, use the REST API for custom integrations, and automate complex workflows.',
        tags: ['webhooks', 'api', 'automation', 'integration']
    },
    {
        id: 'data-privacy',
        title: 'Data Privacy and GDPR Compliance',
        description: 'Ensure your HR processes comply with GDPR and Bulgarian data protection laws.',
        category: 'security',
        categoryName: 'Account & Billing',
        readTime: '15 min',
        lastUpdated: '2024-02-09',
        content: 'Understand your obligations under GDPR, manage data subject requests, configure retention policies, and maintain compliance documentation.',
        tags: ['gdpr', 'privacy', 'compliance', 'data-protection']
    }
]

function getCategoryArticles(category: string, articles: typeof MOCK_ARTICLES) {
    return articles.filter(article => article.category === category)
}

function getCategoryInfo(category: string, t: any) {
    const canonicalCategory = category === 'user-guide' ? 'getting-started' : category
    const categoryMap: Record<string, { title: string; description: string; icon: string }> = {
        'getting-started': {
            title: t('categories.gettingStarted.title'),
            description: 'Everything you need to get started with HR, from account setup to your first job posting.',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z'
        },
        'employees': {
            title: t('categories.employees.title'),
            description: 'Manage employee data, documents, organizational structure, and team information.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        },
        'leave': {
            title: t('categories.leave.title'),
            description: 'Configure leave policies, manage requests, and track team absences.',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
        },
        'payroll': {
            title: t('categories.payroll.title'),
            description: 'Process payroll, manage taxes, and generate payslips with Bulgarian compliance.',
            icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
        },
        'integrations': {
            title: t('categories.integrations.title'),
            description: 'Connect with your favorite tools and services to streamline workflows.',
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z'
        },
        'security': {
            title: t('categories.security.title'),
            description: 'Account security, data protection, and billing management.',
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
        }
    }

    return categoryMap[canonicalCategory]
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ locale: string; category: string }>
}) {
    const { locale, category } = await params
    const canonicalCategory = category === 'user-guide' ? 'getting-started' : category

    setRequestLocale(locale)
    const t = await getTranslations('helpCenter')

    const categoryInfo = getCategoryInfo(canonicalCategory, t)
    if (!categoryInfo || !CATEGORY_SLUGS.includes(category as (typeof CATEGORY_SLUGS)[number])) {
        notFound()
    }

    const articles = getCategoryArticles(canonicalCategory, MOCK_ARTICLES)

    const breadcrumbCategory = canonicalCategory

    return (
        <div className="min-h-screen bg-white">
            {/* Category Header */}
            <section className="bg-navy-deep text-white py-16">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <HelpCenterBreadcrumbs
                            currentPage="category"
                            category={breadcrumbCategory}
                            categoryTitle={categoryInfo.title}
                            className="mb-8"
                        />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryInfo.icon} />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold font-heading">
                                    {categoryInfo.title}
                                </h1>
                                <p className="text-blue-200 mt-2">
                                    {articles.length} article{articles.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <p className="text-xl text-blue-200 leading-relaxed mb-8">
                            {categoryInfo.description}
                        </p>
                        <SearchBar placeholder={`Search ${categoryInfo.title}...`} />
                    </div>
                </div>
            </section>

            {/* Articles List */}
            <SectionReveal>
                <section className="py-20">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-4">
                                {articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/${locale}/help-center/articles/${article.id}`}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group block"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {article.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{article.readTime}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                    <span>Updated {article.lastUpdated}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>
        </div>
    )
}
