'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface UpcomingEvent {
  id: number
  type: 'birthday' | 'anniversary' | 'review' | 'holiday'
  title: string
  date: string
  daysUntil: number
}

const EVENTS: UpcomingEvent[] = [
  { id: 1, type: 'birthday', title: 'Maria Ivanova', date: 'Mar 12', daysUntil: 4 },
  { id: 2, type: 'review', title: 'Q1 Performance Reviews', date: 'Mar 15', daysUntil: 7 },
  { id: 3, type: 'anniversary', title: 'Georgi Dimitrov - 1 year', date: 'Mar 18', daysUntil: 10 },
  { id: 4, type: 'holiday', title: 'Liberation Day', date: 'Mar 22', daysUntil: 14 },
  { id: 5, type: 'birthday', title: 'Petar Angelov', date: 'Mar 28', daysUntil: 20 },
]

const TYPE_CONFIG: Record<UpcomingEvent['type'], { icon: ReactNode; color: string; bg: string }> = {
  birthday: {
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5V3m6 3.75V3m-9 3.75h12M10.5 21h3" />
      </svg>
    ),
  },
  anniversary: {
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
      </svg>
    ),
  },
  review: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  holiday: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
}

export default function UpcomingEvents({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {EVENTS.map((event, i) => {
          const config = TYPE_CONFIG[event.type]
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-gray-50 cursor-default"
            >
              <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">{event.title}</p>
                <p className="text-xs text-gray-400">{event.date}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  event.daysUntil <= 3
                    ? 'bg-red-50 text-red-600'
                    : event.daysUntil <= 7
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-gray-50 text-gray-500'
                }`}
              >
                {event.daysUntil}d
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
