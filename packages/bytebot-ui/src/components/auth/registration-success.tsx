'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LLMSetup } from './llm-setup'

interface RegistrationSuccessProps {
  userName: string
  onContinue: () => void
}

export function RegistrationSuccess({ userName, onContinue }: RegistrationSuccessProps) {
  const [showLLMSetup, setShowLLMSetup] = useState(false)
  const [autoContinueTimer, setAutoContinueTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Auto-continue after 5 seconds (increased to allow for LLM setup)
    const timer = setTimeout(() => {
      if (!showLLMSetup) {
        onContinue()
      }
    }, 5000)

    setAutoContinueTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [onContinue, showLLMSetup])

  const handleShowLLMSetup = () => {
    if (autoContinueTimer) {
      clearTimeout(autoContinueTimer)
      setAutoContinueTimer(null)
    }
    setShowLLMSetup(true)
  }

  const handleLLMSetupComplete = () => {
    onContinue()
  }

  const handleLLMSetupSkip = () => {
    onContinue()
  }

  if (showLLMSetup) {
    return <LLMSetup onComplete={handleLLMSetupComplete} onSkip={handleLLMSetupSkip} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
            }}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        className="ethereal-card p-12 text-center max-w-md mx-auto relative"
      >
        {/* Giant Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            delay: 0.3,
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
          className="relative mb-8"
        >
          {/* Checkmark Background Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.1,
              ease: "easeOut"
            }}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-2 border-green-400/30 flex items-center justify-center"
          >
            {/* Animated Checkmark */}
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.8,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <Check 
                className="w-16 h-16 text-green-400" 
                strokeWidth={3}
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Success Ring Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              delay: 1.2,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute inset-0 rounded-full border-2 border-green-400/50"
          />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="space-y-4"
        >
          <h1 className="text-3xl warmwind-text font-display">
            Welcome, {userName}! 🎉
          </h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="warmwind-body text-lg"
          >
            Your account has been created successfully!
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="warmwind-body text-sm opacity-80"
          >
            Ready to configure your AI models for the best experience?
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="mt-8 space-y-4"
        >
          <button
            onClick={handleShowLLMSetup}
            className="w-full warmwind-button bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20"
          >
            <span>🚀</span>
            <span>Configure AI Models</span>
          </button>
          
          <button
            onClick={onContinue}
            className="w-full warmwind-button border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
          >
            Continue Without Setup
          </button>
        </motion.div>

        {/* Auto-continue indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="mt-4 text-center"
        >
          <p className="warmwind-body text-xs opacity-60">
            Auto-continuing in a few seconds...
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
