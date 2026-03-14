'use client'

import { motion, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const noMotion: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
}

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Viewport-triggered fade-in-up animation wrapper.
 * Single framer-motion import point for marketing pages.
 * Respects prefers-reduced-motion.
 */
export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <motion.div
      variants={reducedMotion ? noMotion : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
