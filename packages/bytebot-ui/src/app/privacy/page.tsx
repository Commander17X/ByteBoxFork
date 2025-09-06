'use client'

import { motion } from 'framer-motion'
import { Bot, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen wallpaper-bg relative">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </Link>
          <Link 
            href="/landing" 
            className="warmwind-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-panel p-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold warmwind-text mb-8">
              Privacy Policy
            </h1>
            
            <div className="space-y-8 warmwind-body">
              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Information We Collect</h2>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (email, name)</li>
                  <li>Usage data and analytics</li>
                  <li>Communication preferences</li>
                  <li>Support tickets and interactions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our AI automation services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. Your data is encrypted 
                  in transit and at rest.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Your Rights</h2>
                <p className="mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our 
                  <Link href="/support" className="warmwind-text hover:underline"> support system</Link>.
                </p>
              </div>

              <div className="pt-8 border-t border-white/20">
                <div className="flex items-center justify-center space-x-6 text-sm warmwind-body">
                  <Link href="/privacy" className="hover:warmwind-text transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:warmwind-text transition-colors">Terms</Link>
                  <Link href="/services" className="hover:warmwind-text transition-colors">Services</Link>
                  <Link href="/support" className="hover:warmwind-text transition-colors">Support</Link>
                </div>
              </div>

              <div className="pt-8 border-t border-white/20">
                <p className="text-sm warmwind-body">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
