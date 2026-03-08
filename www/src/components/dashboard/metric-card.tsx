import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: { value: number; label: string }
}

export default function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-sm">
              <span
                className={trend.value >= 0 ? 'text-green-600' : 'text-red-600'}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>{' '}
              <span className="text-gray-500">{trend.label}</span>
            </p>
          )}
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-blue-700">{icon}</div>
      </div>
    </div>
  )
}
