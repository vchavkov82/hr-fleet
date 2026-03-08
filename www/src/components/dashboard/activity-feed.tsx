'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ActivityItem {
  id: number
  type: 'hire' | 'leave' | 'promotion' | 'offboard' | 'update'
  person: string
  description: string
  time: string
  avatar: string
}

const ACTIVITIES: ActivityItem[] = [
  { id: 1, type: 'hire', person: 'Nikolay Stoyanov', description: 'joined as QA Engineer', time: '2h ago', avatar: 'NS' },
  { id: 2, type: 'leave', person: 'Maria Ivanova', description: 'requested 5 days leave', time: '4h ago', avatar: 'MI' },
  { id: 3, type: 'promotion', person: 'Ivan Petrov', description: 'promoted to Tech Lead', time: '1d ago', avatar: 'IP' },
  { id: 4, type: 'update', person: 'Elena Todorova', description: 'updated department to HR', time: '1d ago', avatar: 'ET' },
  { id: 5, type: 'offboard', person: 'Dessislava Koleva', description: 'last day on Dec 31', time: '2d ago', avatar: 'DK' },
  { id: 6, type: 'hire', person: 'Petar Angelov', description: 'joined as System Admin', time: '3d ago', avatar: 'PA' },
]

const TYPE_STYLES: Record<ActivityItem['type'], { bg: string; ring: string; icon: ReactNode }> = {
  hire: {
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-500/20',
    icon: (
      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  leave: {
    bg: 'bg-amber-50',
    ring: 'ring-amber-500/20',
    icon: (
      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  promotion: {
    bg: 'bg-violet-50',
    ring: 'ring-violet-500/20',
    icon: (
      <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
      </svg>
    ),
  },
  offboard: {
    bg: 'bg-red-50',
    ring: 'ring-red-500/20',
    icon: (
      <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
      </svg>
    ),
  },
  update: {
    bg: 'bg-blue-50',
    ring: 'ring-blue-500/20',
    icon: (
      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
}

const AVATAR_COLORS = [
  'bg-primary text-white',
  'bg-violet-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-600 text-white',
]

export default function ActivityFeed({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button className="text-xs text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer">
          View all
        </button>
      </div>

      <div className="space-y-0">
        {ACTIVITIES.map((activity, i) => {
          const style = TYPE_STYLES[activity.type]
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-start gap-3 py-3 group relative"
            >
              {i < ACTIVITIES.length - 1 && (
                <div className="absolute left-[18px] top-[44px] bottom-0 w-px bg-gray-100" />
              )}

              <div className="relative flex-shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {activity.avatar}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center ${style.bg} ring-2 ring-white`}
                >
                  {style.icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.person}</span>{' '}
                  <span className="text-gray-500">{activity.description}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
