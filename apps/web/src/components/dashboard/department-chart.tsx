'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DepartmentData {
  name: string
  count: number
  color: string
}

const DEPARTMENTS: DepartmentData[] = [
  { name: 'Research & Development', count: 14, color: '#1B4DDB' },
  { name: 'Marketing', count: 8, color: '#0EA5E9' },
  { name: 'Sales', count: 7, color: '#8B5CF6' },
  { name: 'Human Resources', count: 5, color: '#059669' },
  { name: 'IT', count: 4, color: '#F59E0B' },
  { name: 'Administration', count: 2, color: '#EC4899' },
  { name: 'Accounting', count: 2, color: '#6366F1' },
]

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export default function DepartmentChart({ title }: { title: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const total = DEPARTMENTS.reduce((sum, d) => sum + d.count, 0)

  const cx = 90
  const cy = 90
  const radius = 70
  const strokeWidth = 24

  let currentAngle = 0
  const arcs = DEPARTMENTS.map((dept, i) => {
    const angle = (dept.count / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    return { ...dept, startAngle, endAngle, index: i }
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width={180} height={180} viewBox="0 0 180 180">
            {arcs.map((arc) => (
              <motion.path
                key={arc.name}
                d={describeArc(cx, cy, radius, arc.startAngle, arc.endAngle - 0.5)}
                fill="none"
                stroke={arc.color}
                strokeWidth={hoveredIndex === arc.index ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(arc.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: arc.index * 0.1, ease: 'easeOut' }}
              />
            ))}
          </svg>
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <span className="text-2xl font-bold text-gray-900">{DEPARTMENTS[hoveredIndex].count}</span>
                <span className="text-[10px] text-gray-500 max-w-[80px] text-center leading-tight">
                  {DEPARTMENTS[hoveredIndex].name}
                </span>
              </motion.div>
            )}
            {hoveredIndex === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <span className="text-2xl font-bold text-gray-900">{total}</span>
                <span className="text-[10px] text-gray-500">Total</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {DEPARTMENTS.map((dept, i) => (
            <motion.div
              key={dept.name}
              className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-gray-50"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: dept.color }}
              />
              <span className="text-xs text-gray-600 truncate flex-1">{dept.name}</span>
              <span className="text-xs font-semibold text-gray-900 tabular-nums">{dept.count}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
