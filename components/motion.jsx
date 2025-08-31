"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

export function FadeIn({ children, delay = 0, y = 10, className }) {
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const initialY = mounted && !prefersReduced ? y : 0
  const duration = mounted && !prefersReduced ? 0.6 : 0.001

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: initialY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration, ease: [0.2, 0.65, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, delay = 0, className }) {
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: mounted && !prefersReduced ? 0.08 : 0,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function Item({ children, className }) {
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: mounted && !prefersReduced ? 8 : 0 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: mounted && !prefersReduced ? 0.5 : 0.001, ease: [0.2, 0.65, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
