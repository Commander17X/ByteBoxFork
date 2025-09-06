'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DesktopContainerProps {
  children: React.ReactNode
  className?: string
}

export function DesktopContainer({ children, className = '' }: DesktopContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-screen flex flex-col overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  )
}
