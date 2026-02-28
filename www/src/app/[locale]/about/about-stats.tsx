'use client'

import { Counter } from '@/components/ui/counter'

interface AboutStatsProps {
  labels: {
    companies: string
    employees: string
    rating: string
    uptime: string
  }
}

export function AboutStats({ labels }: AboutStatsProps) {
  return (
    <div className="bg-surface-lighter rounded-2xl p-8">
      <div className="grid grid-cols-2 gap-6 text-center">
        <div>
          <Counter target={500} suffix="+" className="text-3xl font-bold text-primary mb-2 block" />
          <div className="text-sm text-gray-600">{labels.companies}</div>
        </div>
        <div>
          <Counter target={50000} suffix="+" className="text-3xl font-bold text-primary mb-2 block" />
          <div className="text-sm text-gray-600">{labels.employees}</div>
        </div>
        <div>
          <Counter target={4} suffix=".9" className="text-3xl font-bold text-primary mb-2 block" />
          <div className="text-sm text-gray-600">{labels.rating}</div>
        </div>
        <div>
          <Counter target={99} suffix=".9%" className="text-3xl font-bold text-primary mb-2 block" />
          <div className="text-sm text-gray-600">{labels.uptime}</div>
        </div>
      </div>
    </div>
  )
}
