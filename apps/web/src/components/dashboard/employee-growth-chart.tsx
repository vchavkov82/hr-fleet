'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DataPoint {
  month: string
  hired: number
  left: number
  total: number
}

const MONTHLY_DATA: DataPoint[] = [
  { month: 'Jul', hired: 3, left: 1, total: 32 },
  { month: 'Aug', hired: 2, left: 0, total: 34 },
  { month: 'Sep', hired: 4, left: 1, total: 37 },
  { month: 'Oct', hired: 1, left: 2, total: 36 },
  { month: 'Nov', hired: 3, left: 0, total: 39 },
  { month: 'Dec', hired: 2, left: 1, total: 40 },
  { month: 'Jan', hired: 1, left: 0, total: 41 },
  { month: 'Feb', hired: 3, left: 1, total: 43 },
  { month: 'Mar', hired: 2, left: 1, total: 44 },
  { month: 'Apr', hired: 4, left: 2, total: 46 },
  { month: 'May', hired: 1, left: 1, total: 46 },
  { month: 'Jun', hired: 3, left: 0, total: 49 },
]

const W = 560
const H = 200
const PAD_X = 40
const PAD_Y = 20
const CHART_W = W - PAD_X * 2
const CHART_H = H - PAD_Y * 2

export default function EmployeeGrowthChart({ title }: { title: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const maxTotal = Math.max(...MONTHLY_DATA.map((d) => d.total))
  const minTotal = Math.min(...MONTHLY_DATA.map((d) => d.total))
  const range = maxTotal - minTotal || 1
  const yPad = range * 0.15

  const scaleX = (i: number) => PAD_X + (i / (MONTHLY_DATA.length - 1)) * CHART_W
  const scaleY = (val: number) =>
    PAD_Y + CHART_H - ((val - minTotal + yPad) / (range + yPad * 2)) * CHART_H

  const linePath = MONTHLY_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.total)}`).join(' ')
  const areaPath = `${linePath} L ${scaleX(MONTHLY_DATA.length - 1)} ${H - PAD_Y} L ${scaleX(0)} ${H - PAD_Y} Z`

  const gridLines = [minTotal, minTotal + range * 0.33, minTotal + range * 0.66, maxTotal].map(
    (v) => Math.round(v),
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Hired
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Left
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 400 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B4DDB" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#1B4DDB" stopOpacity={0} />
            </linearGradient>
          </defs>

          {gridLines.map((val) => (
            <g key={val}>
              <line
                x1={PAD_X}
                y1={scaleY(val)}
                x2={W - PAD_X}
                y2={scaleY(val)}
                stroke="#E5E7EB"
                strokeDasharray="4 4"
              />
              <text x={PAD_X - 6} y={scaleY(val) + 3} textAnchor="end" className="text-[10px] fill-gray-400">
                {val}
              </text>
            </g>
          ))}

          <motion.path
            d={areaPath}
            fill="url(#areaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          <motion.path
            d={linePath}
            fill="none"
            stroke="#1B4DDB"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {MONTHLY_DATA.map((d, i) => {
            const x = scaleX(i)
            const y = scaleY(d.total)
            const isHovered = hoveredIndex === i
            return (
              <g key={d.month}>
                <rect
                  x={x - CHART_W / MONTHLY_DATA.length / 2}
                  y={PAD_Y}
                  width={CHART_W / MONTHLY_DATA.length}
                  height={CHART_H}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {isHovered && (
                  <line x1={x} y1={PAD_Y} x2={x} y2={H - PAD_Y} stroke="#1B4DDB" strokeOpacity={0.1} strokeWidth={1} />
                )}

                <motion.circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  fill="white"
                  stroke="#1B4DDB"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                />

                <text
                  x={x}
                  y={H - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-gray-400"
                >
                  {d.month}
                </text>

                {isHovered && (
                  <g>
                    <rect
                      x={x - 48}
                      y={y - 52}
                      width={96}
                      height={42}
                      rx={8}
                      fill="#0F172A"
                      fillOpacity={0.95}
                    />
                    <text x={x} y={y - 34} textAnchor="middle" className="text-[11px] fill-white font-semibold">
                      Total: {d.total}
                    </text>
                    <text x={x} y={y - 18} textAnchor="middle" className="text-[10px] fill-gray-300">
                      +{d.hired} hired · -{d.left} left
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
