export interface FeatureDetail {
  slug: string
  name: string
  headline: string
  description: string
  benefits: string[]
  howItWorks: { step: string; description: string }[]
  faqs: { question: string; answer: string }[]
}

export const featureDetails: FeatureDetail[] = [
  {
    slug: 'payroll',
    name: 'Payroll Processing',
    headline: 'Accurate, compliant payroll for Bulgarian businesses',
    description: 'Automate payroll calculations, tax withholdings, and social security contributions with full Bulgarian labor law compliance.',
    benefits: [
      'Automated Bulgarian social security and tax calculations',
      'Support for all employment types: full-time, part-time, civil contracts',
      'Payslip generation in Bulgarian and English',
      'Integration with NRA reporting requirements',
      'Bulk payroll processing for multiple employees',
    ],
    howItWorks: [
      { step: 'Configure', description: 'Set up company tax details, salary structures, and benefit plans.' },
      { step: 'Process', description: 'Run monthly payroll with automatic tax and social security calculations.' },
      { step: 'Review', description: 'Review calculated amounts, make adjustments, and approve the payroll run.' },
      { step: 'Distribute', description: 'Generate payslips and export bank payment files.' },
    ],
    faqs: [
      { question: 'Does it support Bulgarian social security calculations?', answer: 'Yes, all social security funds (DOO, DZPO, ZO) are calculated automatically based on current rates and thresholds.' },
      { question: 'Can I process payroll for different contract types?', answer: 'Yes, we support labor contracts, civil contracts (GDD), and management contracts with different calculation rules.' },
      { question: 'How are tax declarations handled?', answer: 'Monthly tax declarations are generated automatically in the format required by NRA.' },
    ],
  },
  {
    slug: 'onboarding',
    name: 'Employee Onboarding',
    headline: 'Streamlined onboarding from offer to first day',
    description: 'Create structured onboarding workflows that ensure every new hire has a smooth, consistent start.',
    benefits: [
      'Customizable onboarding checklists per department',
      'Automated document collection and e-signatures',
      'Welcome portal with company policies and training materials',
      'Manager notifications for pending onboarding tasks',
      'Progress tracking for each new hire',
    ],
    howItWorks: [
      { step: 'Create', description: 'Build onboarding templates with tasks, documents, and training requirements.' },
      { step: 'Invite', description: 'Send the new hire a welcome link to complete pre-boarding tasks.' },
      { step: 'Track', description: 'Monitor progress as the new hire completes each onboarding step.' },
      { step: 'Complete', description: 'Verify all tasks are done and transition the employee to active status.' },
    ],
    faqs: [
      { question: 'Can I customize onboarding for different roles?', answer: 'Yes, create role-specific templates with different tasks, documents, and training requirements.' },
      { question: 'Does it support remote onboarding?', answer: 'Absolutely. The entire onboarding process can be completed remotely through the self-service portal.' },
      { question: 'How do I track onboarding progress?', answer: 'The dashboard shows real-time progress for each new hire with completion percentages and pending tasks.' },
    ],
  },
  {
    slug: 'compliance',
    name: 'Compliance Management',
    headline: 'Stay compliant with Bulgarian labor law',
    description: 'Automated compliance monitoring, alerts, and reporting to keep your business aligned with Bulgarian regulations.',
    benefits: [
      'Real-time monitoring of Bulgarian labor law requirements',
      'Automated alerts for regulatory changes and deadlines',
      'GDPR-compliant data handling and retention policies',
      'Audit-ready reports for labor inspections',
      'Document templates updated with latest legal requirements',
    ],
    howItWorks: [
      { step: 'Assess', description: 'Review your current compliance status across all regulatory areas.' },
      { step: 'Configure', description: 'Set up monitoring rules, alert thresholds, and reporting schedules.' },
      { step: 'Monitor', description: 'Receive automated alerts for upcoming deadlines and regulatory changes.' },
      { step: 'Report', description: 'Generate compliance reports for audits and management review.' },
    ],
    faqs: [
      { question: 'Which Bulgarian regulations are covered?', answer: 'We cover the Labor Code, Social Security Code, GDPR, Health and Safety regulations, and NRA reporting requirements.' },
      { question: 'How quickly are regulatory changes reflected?', answer: 'Our legal team monitors changes continuously. Updates are typically reflected within 48 hours of official publication.' },
      { question: 'Can I generate reports for labor inspections?', answer: 'Yes, pre-built report templates cover all common inspection requirements with one-click generation.' },
    ],
  },
  {
    slug: 'time-tracking',
    name: 'Time Tracking',
    headline: 'Effortless time tracking for every team',
    description: 'Track working hours, overtime, and breaks with precision. Integrated directly with payroll for accurate compensation.',
    benefits: [
      'Simple clock-in/clock-out for office and remote workers',
      'Automatic overtime calculation per Bulgarian labor law',
      'Break time tracking and compliance monitoring',
      'Project-based time allocation for cost analysis',
      'Direct integration with payroll processing',
    ],
    howItWorks: [
      { step: 'Set Up', description: 'Define work schedules, overtime rules, and break policies.' },
      { step: 'Track', description: 'Employees log hours via web, mobile, or integrated time clocks.' },
      { step: 'Approve', description: 'Managers review and approve timesheets with exception flagging.' },
      { step: 'Sync', description: 'Approved hours flow automatically into payroll calculations.' },
    ],
    faqs: [
      { question: 'Does it calculate overtime automatically?', answer: 'Yes, overtime is calculated based on Bulgarian labor law rules including daily, weekly, and monthly thresholds.' },
      { question: 'Can employees track time from mobile?', answer: 'Yes, our mobile-friendly interface allows clock-in/clock-out from any device.' },
      { question: 'How does it integrate with payroll?', answer: 'Approved timesheets automatically feed into payroll calculations, ensuring accurate compensation.' },
    ],
  },
  {
    slug: 'employee-management',
    name: 'Employee Management',
    headline: 'All your employee data in one place',
    description: 'Centralized employee profiles, organizational charts, and document management for your entire workforce.',
    benefits: [
      'Complete employee profiles with personal and professional data',
      'Organizational chart with reporting relationships',
      'Document storage for contracts, certificates, and IDs',
      'Employee self-service portal for data updates',
      'Customizable fields for industry-specific data',
    ],
    howItWorks: [
      { step: 'Import', description: 'Import existing employee data from spreadsheets or other HR systems.' },
      { step: 'Organize', description: 'Set up departments, teams, and reporting structures.' },
      { step: 'Manage', description: 'Maintain employee records, track changes, and store documents.' },
      { step: 'Empower', description: 'Enable employee self-service for profile updates and document access.' },
    ],
    faqs: [
      { question: 'Can I import data from other systems?', answer: 'Yes, we support CSV import and have built-in migration tools for common HR systems including BambooHR.' },
      { question: 'Is employee data GDPR compliant?', answer: 'Yes, all data is stored with full GDPR compliance including consent management and right-to-erasure support.' },
      { question: 'Can employees update their own information?', answer: 'Yes, the self-service portal allows employees to update personal details, with manager approval for sensitive fields.' },
    ],
  },
  {
    slug: 'reporting',
    name: 'HR Reporting',
    headline: 'Data-driven HR insights and analytics',
    description: 'Generate comprehensive reports on headcount, turnover, compensation, and compliance with real-time dashboards.',
    benefits: [
      'Pre-built report templates for common HR metrics',
      'Custom report builder with drag-and-drop interface',
      'Real-time dashboards for key HR indicators',
      'Export to PDF, Excel, and CSV formats',
      'Scheduled report delivery to stakeholders',
    ],
    howItWorks: [
      { step: 'Select', description: 'Choose from pre-built templates or create custom reports.' },
      { step: 'Configure', description: 'Set date ranges, filters, and grouping criteria.' },
      { step: 'Generate', description: 'Run reports with real-time data from across the platform.' },
      { step: 'Share', description: 'Export reports or schedule automatic delivery to stakeholders.' },
    ],
    faqs: [
      { question: 'What metrics can I track?', answer: 'Track headcount, turnover, time-to-hire, compensation costs, leave utilization, compliance status, and many more.' },
      { question: 'Can I create custom reports?', answer: 'Yes, the custom report builder lets you combine any data fields with flexible filtering and grouping.' },
      { question: 'Can reports be scheduled?', answer: 'Yes, schedule any report for daily, weekly, or monthly automatic delivery via email.' },
    ],
  },
]

export function getFeatureBySlug(slug: string): FeatureDetail | undefined {
  return featureDetails.find((f) => f.slug === slug)
}
