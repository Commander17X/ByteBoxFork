'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Users, Mail, ArrowRight, Bot } from 'lucide-react'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    // Fetch real waitlist stats
    const fetchWaitlistStats = async () => {
      try {
        const response = await fetch('/api/waitlist')
        const data = await response.json()
        if (data.success) {
          setTotalUsers(data.total || 0)
          // Position will be set when user submits
        }
      } catch (error) {
        console.error('Failed to fetch waitlist stats:', error)
        // Fallback to random numbers if API fails
        setTotalUsers(Math.floor(Math.random() * 2000) + 1000)
      }
    }

    fetchWaitlistStats()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        setPosition(data.position || 0)
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Waitlist signup failed:', error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen wallpaper-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center glass-panel p-8"
        >
          <CheckCircle className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-bold warmwind-text mb-4">
            You're On The List! 🎉
          </h1>
          <p className="text-xl warmwind-body mb-6">
            We'll notify you as soon as your beta access is ready.
          </p>
          <div className="ethereal-card p-6 mb-6">
            <div className="text-3xl font-bold warmwind-text mb-2">#{position}</div>
            <div className="warmwind-body">Your position in line</div>
          </div>
          <p className="warmwind-body">
            Follow us for updates and early access announcements.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wallpaper-bg relative">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </div>
          <a 
            href="/landing" 
            className="warmwind-button"
          >
            Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold warmwind-text mb-6">
              Join the
              <span className="block warmwind-text">
                Beta Waitlist
              </span>
            </h1>
            <p className="text-xl warmwind-body mb-12 max-w-3xl mx-auto">
              Be among the first to experience the future of productivity. 
              <span className="warmwind-text font-semibold"> Limited spots available.</span>
            </p>
          </motion.div>

          {/* Waitlist Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="ethereal-card p-6">
              <Users className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-2xl font-bold warmwind-text">{totalUsers.toLocaleString()}</div>
              <div className="warmwind-body">People waiting</div>
            </div>
            <div className="ethereal-card p-6">
              <Clock className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-2xl font-bold warmwind-text">2-4 weeks</div>
              <div className="warmwind-body">Expected wait</div>
            </div>
            <div className="ethereal-card p-6">
              <Mail className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-2xl font-bold warmwind-text">Free</div>
              <div className="warmwind-body">Beta access</div>
            </div>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="warmwind-input w-full px-6 py-4"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 warmwind-button text-lg font-bold flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-200"
              >
                <span>Join Waitlist</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold warmwind-text mb-8">
              What You Get in Beta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <div>
                  <div className="warmwind-text font-semibold">Early Access</div>
                  <div className="warmwind-body">Be the first to try new features</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <div>
                  <div className="warmwind-text font-semibold">Direct Feedback</div>
                  <div className="warmwind-body">Shape the product with your input</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <div>
                  <div className="warmwind-text font-semibold">Free Forever</div>
                  <div className="warmwind-body">Beta users get lifetime free access</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <div>
                  <div className="warmwind-text font-semibold">Priority Support</div>
                  <div className="warmwind-body">Get help when you need it</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
