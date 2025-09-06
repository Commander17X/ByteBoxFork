'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

interface LoadingScreenProps {
  onComplete?: () => void
  minimumDuration?: number
  title?: string
  subtitle?: string
}

export function LoadingScreen({
  onComplete,
  minimumDuration = 1500, // Reduced from 3000ms for faster loading
  title = "Loading H0L0Light-OS",
  subtitle = "Initializing your experience"
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const updateProgress = useCallback((startTime: number) => {
    const elapsed = Date.now() - startTime
    const progressRatio = Math.min(elapsed / minimumDuration, 1)
    const easedProgress = progressRatio * 100

    setProgress(Math.floor(easedProgress))

    if (progressRatio < 1) {
      requestAnimationFrame(() => updateProgress(startTime))
    } else {
      setProgress(100)
      // Faster completion
      setTimeout(() => {
        setIsLoading(false)
        onComplete?.()
      }, 200) // Reduced from 500ms
    }
  }, [minimumDuration, onComplete])

  useEffect(() => {
    const startTime = Date.now()
    requestAnimationFrame(() => updateProgress(startTime))
  }, [updateProgress])

  // Early return for faster unmounting
  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center"
        >
          <Zap className="w-8 h-8 text-indigo-600" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-slate-800 mb-2"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 mb-6"
        >
          {subtitle}
        </motion.p>

        <div className="w-64 mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs text-slate-500">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-1 bg-indigo-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
