'use client'

import { motion } from 'framer-motion'
import { 
  Bot, 
  Zap, 
  Globe, 
  ArrowRight, 
  Brain
} from 'lucide-react'

export default function LandingPage() {
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
          <div className="flex items-center space-x-4">
            <a 
              href="/login" 
              className="warmwind-button"
            >
              Sign In
            </a>
            <a 
              href="/waitlist" 
              className="warmwind-button"
            >
              Join Waitlist
            </a>
            <a 
              href="/admin/login" 
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 px-4 py-2 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              Admin Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold warmwind-text mb-6">
              Stop Wasting Time.
              <span className="block warmwind-text">
                Get 10+ Hours Back.
              </span>
            </h1>
            <p className="text-xl md:text-2xl warmwind-body mb-8 max-w-3xl mx-auto">
              <span className="warmwind-text font-bold">AI does your boring work.</span> You focus on what matters. 
              <span className="block warmwind-text font-semibold">Works in 2 minutes. No setup.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <a 
              href="/waitlist" 
              className="group px-10 py-5 warmwind-button text-xl font-bold hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>GET STARTED FREE</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="warmwind-body text-center">
              <div className="text-sm font-semibold">✓ 2 minute setup</div>
              <div className="text-sm font-semibold">✓ Works immediately</div>
              <div className="text-sm font-semibold">✓ Premium support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section - Automation & Persistent Web OS */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold warmwind-text mb-6">
              The Future of Productivity
            </h2>
            <p className="text-xl warmwind-body max-w-3xl mx-auto">
              Experience true automation with our persistent Web OS that never stops working, 
              even when your browser is closed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Key Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="ethereal-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold warmwind-text mb-3">
                      True Automation
                    </h3>
                    <p className="warmwind-body">
                      Our AI doesn't just assist—it works independently. Set it up once and watch 
                      it handle complex tasks while you focus on what matters most.
                    </p>
                  </div>
                </div>
              </div>

              <div className="ethereal-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold warmwind-text mb-3">
                      Persistent Web OS
                    </h3>
                    <p className="warmwind-body">
                      <span className="warmwind-text font-semibold">Your work continues even when you close your browser.</span> 
                      Our Web OS runs in the background, ensuring your automation never stops.
                    </p>
                  </div>
                </div>
              </div>

              <div className="ethereal-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold warmwind-text mb-3">
                      Intelligent & Autonomous
                    </h3>
                    <p className="warmwind-body">
                      Our AI learns your patterns and makes decisions independently. 
                      It's not just a tool—it's your digital assistant that never sleeps.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Visual Representation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="ethereal-card p-8 text-center">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-3xl font-bold warmwind-text mb-4">
                  Always Working
                </h3>
                <p className="warmwind-body text-lg mb-6">
                  Close your browser. Go to sleep. Your AI continues working.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="warmwind-body">Processing tasks...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span className="warmwind-body">Monitoring web activity...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <span className="warmwind-body">Learning patterns...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-panel p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold warmwind-text mb-6">
              Get Your 10 Hours Back Today
            </h2>
            <p className="text-xl warmwind-body mb-8">
              <span className="font-bold">2 minutes setup.</span> <span className="font-bold">10+ hours saved.</span> <span className="font-bold">Free to start.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a 
                href="/waitlist" 
                className="group px-10 py-5 warmwind-button text-xl font-bold hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <span>GET STARTED FREE</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="warmwind-body text-center">
                <div className="text-sm font-semibold">✓ 2 minute setup</div>
                <div className="text-sm font-semibold">✓ Works immediately</div>
                <div className="text-sm font-semibold">✓ Premium support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </div>
          <p className="warmwind-body mb-4">
            The future of productivity is here. Transform your digital life today.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm warmwind-body">
            <a href="/privacy" className="hover:warmwind-text transition-colors">Privacy</a>
            <a href="/terms" className="hover:warmwind-text transition-colors">Terms</a>
            <a href="/services" className="hover:warmwind-text transition-colors">Services</a>
            <a href="/support" className="hover:warmwind-text transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}