'use client'

import { Counter } from '@/components/ui/counter'

interface StatItem {
  value: number
  suffix: string
  label: string
}

interface StatsCountersProps {
  items: StatItem[]
}

export function StatsCounters({ items }: StatsCountersProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
      {items.map((stat) => (
        <div key={stat.label} className="text-center rounded-2xl bg-white/5 border border-white/10 px-4 py-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)]">
          <div className="text-4xl sm:text-5xl font-bold font-heading text-white mb-2">
            <Counter target={stat.value} suffix={stat.suffix} />
          </div>
          <p className="text-blue-200 text-sm font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
