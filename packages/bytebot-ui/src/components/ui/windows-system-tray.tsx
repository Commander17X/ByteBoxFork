'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export function WindowsSystemTray() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed bottom-0 right-0 z-50">
      {/* Time Display Only */}
      <div className="flex items-center p-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-3"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Clock className="w-5 h-5 text-white" />
          <div className="text-right">
            <div className="warmwind-text text-lg font-semibold">
              {formatTime(currentTime)}
            </div>
            <div className="warmwind-body text-sm opacity-70">
              {formatDate(currentTime)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}