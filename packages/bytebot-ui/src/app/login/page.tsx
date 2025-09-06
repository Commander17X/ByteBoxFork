'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSwitchToRegister = () => {
    router.push('/register')
  }

  // Generate consistent particle data
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: (i * 7.3) % 100, // Use deterministic values instead of Math.random()
    top: (i * 11.7) % 100,
    width: 4 + (i % 6),
    height: 4 + (i % 6),
    duration: 8 + (i % 6),
    delay: i * 0.3,
    xOffset: (i * 13) % 100 - 50
  }))

  return (
    <div className="min-h-screen wallpaper-bg relative flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-white/15 to-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-white/10 to-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Particles - Only render on client to avoid hydration mismatch */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute bg-white/60 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.width}px`,
                height: `${particle.height}px`,
              }}
              animate={{
                y: [0, -200, 0],
                x: [0, particle.xOffset, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/20 to-white/8 border border-white/20 flex items-center justify-center"
          >
            <span className="text-2xl">👋</span>
          </motion.div>
          <h1 className="text-2xl warmwind-text mb-2 font-display">Welcome to H0L0Light-OS</h1>
          <p className="warmwind-body">Your personalized operating system awaits</p>
        </motion.div>

        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      </div>
    </div>
  )
}
