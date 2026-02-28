'use client'

import { useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface CounterProps {
  target: number
  suffix?: string
  prefix?: string
  className?: string
}

export function Counter({ target, suffix = '', prefix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 })
  const display = useTransform(spring, (v: number) => {
    return `${prefix}${Math.round(v).toLocaleString()}${suffix}`
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(target)
    }
  }, [isInView, motionValue, target])

  return <motion.span ref={ref} className={className}>{display}</motion.span>
}
