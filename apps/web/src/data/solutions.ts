export interface Solution {
  slug: string
  name: string
  headline: string
  description: string
  challenges: string[]
  benefits: string[]
  features: string[]
}

export const solutions: Solution[] = [
  {
    slug: 'technology',
    name: 'Technology',
    headline: 'HR solutions for fast-growing tech companies',
    description: 'Streamline hiring, onboarding, and compliance for distributed engineering teams.',
    challenges: [
      'Managing remote and hybrid workforce across time zones',
      'Competing for top talent with complex compensation packages',
      'Keeping up with rapidly changing labor regulations',
      'Scaling HR processes as the team grows quickly',
    ],
    benefits: [
      'Automated onboarding workflows reduce time-to-productivity by 50%',
      'Centralized employee data accessible from anywhere',
      'Real-time compliance monitoring for Bulgarian labor law',
      'Self-service portal reduces HR admin workload',
    ],
    features: ['Employee Management', 'Compliance Tracking', 'Payroll Processing', 'Time Tracking'],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    headline: 'HR management built for healthcare organizations',
    description: 'Handle shift scheduling, certifications, and compliance for medical staff.',
    challenges: [
      'Complex shift scheduling across departments and locations',
      'Tracking medical certifications and mandatory training',
      'Managing overtime and on-call compensation',
      'Strict regulatory compliance requirements',
    ],
    benefits: [
      'Automated certification expiry alerts prevent compliance gaps',
      'Shift management integrated with payroll calculations',
      'Audit-ready reporting for healthcare regulations',
      'Secure handling of sensitive employee health data',
    ],
    features: ['Compliance Tracking', 'Employee Management', 'Reporting', 'Payroll Processing'],
  },
  {
    slug: 'finance',
    name: 'Finance',
    headline: 'Precision HR for financial services firms',
    description: 'Ensure regulatory compliance and manage compensation for finance teams.',
    challenges: [
      'Strict regulatory requirements for employee screening',
      'Complex bonus and commission structures',
      'Audit trail requirements for all HR actions',
      'Data security and privacy for sensitive financial roles',
    ],
    benefits: [
      'Complete audit trail for every HR action and decision',
      'Configurable compensation structures with approval workflows',
      'Role-based access control for sensitive employee data',
      'Automated compliance reporting for financial regulators',
    ],
    features: ['Compliance Tracking', 'Payroll Processing', 'Reporting', 'Employee Management'],
  },
  {
    slug: 'retail',
    name: 'Retail',
    headline: 'HR tools designed for retail and hospitality',
    description: 'Manage seasonal staff, shifts, and payroll for multi-location retail teams.',
    challenges: [
      'High employee turnover and seasonal hiring spikes',
      'Managing staff across multiple store locations',
      'Tracking hours and overtime for part-time workers',
      'Onboarding large numbers of new hires quickly',
    ],
    benefits: [
      'Bulk onboarding workflows for seasonal hiring periods',
      'Multi-location employee management from one dashboard',
      'Accurate time tracking integrated with payroll',
      'Mobile-friendly self-service for frontline workers',
    ],
    features: ['Employee Management', 'Time Tracking', 'Payroll Processing', 'Onboarding'],
  },
]

export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug)
}
