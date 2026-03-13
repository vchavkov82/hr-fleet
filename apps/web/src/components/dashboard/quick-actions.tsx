'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/navigation'

interface QuickAction {
  label: string
  description: string
  href: string
  icon: ReactNode
  color: string
  bgColor: string
  disabled?: boolean
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Add Employee',
    description: 'Onboard a new team member',
    href: '/dashboard/employees/new',
    color: 'text-primary',
    bgColor: 'bg-primary-50',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
  },
  {
    label: 'View Directory',
    description: 'Browse all employees',
    href: '/dashboard/employees',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: 'Request Leave',
    description: 'Submit a leave request',
    href: '/dashboard/leave',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    disabled: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Run Payroll',
    description: 'Process monthly payroll',
    href: '/dashboard/payroll',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    disabled: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
]

export default function QuickActions({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action, i) => {
          const content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`relative rounded-xl border border-gray-100 p-4 transition-all duration-200 ${
                action.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:border-gray-200 hover:shadow-sm group'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${action.bgColor} ${action.color} flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110`}>
                {action.icon}
              </div>
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
              {action.disabled && (
                <span className="absolute top-3 right-3 text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium">
                  Soon
                </span>
              )}
            </motion.div>
          )

          if (action.disabled) {
            return <div key={action.label}>{content}</div>
          }

          return (
            <Link key={action.label} href={action.href} className="block">
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
