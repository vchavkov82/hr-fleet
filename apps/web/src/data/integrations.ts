export interface Integration {
  slug: string
  name: string
  description: string
  category: 'erp' | 'communication' | 'productivity' | 'accounting' | 'hr' | 'automation'
  icon: string
}

export const integrations: Integration[] = [
  {
    slug: 'odoo',
    name: 'Odoo',
    description: 'Full ERP integration for seamless HR, accounting, and business management workflows.',
    category: 'erp',
    icon: 'O',
  },
  {
    slug: 'slack',
    name: 'Slack',
    description: 'Get HR notifications, leave approvals, and team updates directly in Slack channels.',
    category: 'communication',
    icon: 'S',
  },
  {
    slug: 'google-workspace',
    name: 'Google Workspace',
    description: 'Sync employee directories, calendars, and documents with Google Workspace.',
    category: 'productivity',
    icon: 'G',
  },
  {
    slug: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Connect with Outlook, Teams, and SharePoint for unified employee experience.',
    category: 'productivity',
    icon: 'M',
  },
  {
    slug: 'xero',
    name: 'Xero',
    description: 'Automatic payroll journal entries and expense reconciliation with Xero.',
    category: 'accounting',
    icon: 'X',
  },
  {
    slug: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync payroll data, employee records, and financial reports with QuickBooks.',
    category: 'accounting',
    icon: 'Q',
  },
  {
    slug: 'bamboohr',
    name: 'BambooHR',
    description: 'Import employee data and sync HR records for smooth migration.',
    category: 'hr',
    icon: 'B',
  },
  {
    slug: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5,000+ apps through automated workflows and triggers.',
    category: 'automation',
    icon: 'Z',
  },
  {
    slug: 'make',
    name: 'Make',
    description: 'Build complex HR automation scenarios with visual workflow builder.',
    category: 'automation',
    icon: 'K',
  },
]

export const categoryLabels: Record<Integration['category'], string> = {
  erp: 'ERP',
  communication: 'Communication',
  productivity: 'Productivity',
  accounting: 'Accounting',
  hr: 'HR Systems',
  automation: 'Automation',
}
