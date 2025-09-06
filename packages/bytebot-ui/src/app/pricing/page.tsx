'use client'

import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { 
  Users, 
  Target, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Lock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PricingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen wallpaper-bg flex items-center justify-center">
        <div className="warmwind-text text-xl">Loading pricing...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen wallpaper-bg flex items-center justify-center">
        <div className="ethereal-card p-8 text-center max-w-md mx-auto">
          <Lock className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-2xl font-bold warmwind-text mb-4">
            Access Required
          </h1>
          <p className="warmwind-body mb-6">
            Please sign in to view our pricing plans.
          </p>
          <a 
            href="/login" 
            className="warmwind-button"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wallpaper-bg">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="warmwind-button"
            >
              Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold warmwind-text mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl warmwind-body max-w-3xl mx-auto">
              Carefully selected plans designed for everyone, businesses, and enterprise needs. 
              Start free and scale as you grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PRO Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="ethereal-card p-8 relative"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold warmwind-text mb-2">PRO</h3>
                <p className="warmwind-body mb-6">Perfect for everyone</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold warmwind-text">$25</span>
                  <span className="warmwind-body">/month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">10+ hours saved per week</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">AI-powered automation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Persistent Web OS</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Smart web navigation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Visual understanding</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Email support</span>
                  </li>
                </ul>
                <a 
                  href="/waitlist" 
                  className="warmwind-button w-full py-3 text-center block hover:scale-105 transition-all duration-200"
                >
                  Start Free Trial
                </a>
              </div>
            </motion.div>

            {/* BUSINESS Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="ethereal-card p-8 relative border-2 border-white/30"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 text-sm warmwind-text font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold warmwind-text mb-2">BUSINESS</h3>
                <p className="warmwind-body mb-6">Perfect for businesses</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold warmwind-text">$99</span>
                  <span className="warmwind-body">/month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Everything in PRO</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Team collaboration</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Advanced analytics</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Custom integrations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Priority support</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">API access</span>
                  </li>
                </ul>
                <a 
                  href="/waitlist" 
                  className="warmwind-button w-full py-3 text-center block hover:scale-105 transition-all duration-200"
                >
                  Start Free Trial
                </a>
              </div>
            </motion.div>

            {/* ENTERPRISE Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ethereal-card p-8 relative"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold warmwind-text mb-2">ENTERPRISE</h3>
                <p className="warmwind-body mb-6">Perfect for enterprise</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold warmwind-text">Custom</span>
                  <span className="warmwind-body"> pricing</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Everything in BUSINESS</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Unlimited users</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Custom deployment</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">Dedicated support</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">SLA guarantee</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="warmwind-body">White-label options</span>
                  </li>
                </ul>
                <a 
                  href="/waitlist" 
                  className="warmwind-button w-full py-3 text-center block hover:scale-105 transition-all duration-200"
                >
                  Contact Sales
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-12"
          >
            <div className="ethereal-card p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold warmwind-text mb-4">
                All Plans Include
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="warmwind-text font-semibold mb-2">14-Day Free Trial</h4>
                  <p className="warmwind-body text-sm">No credit card required</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="warmwind-text font-semibold mb-2">Cancel Anytime</h4>
                  <p className="warmwind-body text-sm">No long-term commitments</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="warmwind-text font-semibold mb-2">Persistent Web OS</h4>
                  <p className="warmwind-body text-sm">Works even when browser is closed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
