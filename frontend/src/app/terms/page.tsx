'use client'

import { motion } from 'framer-motion'
import { Bot, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
              Terms of Service
            </h1>
            
            <div className="space-y-8 warmwind-body">
              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Acceptance of Terms</h2>
                <p>
                  By accessing and using H0L0Light-OS, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily use H0L0Light-OS for personal, non-commercial 
                  transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Service Availability</h2>
                <p>
                  We strive to maintain high service availability, but we do not guarantee uninterrupted 
                  access. We reserve the right to modify, suspend, or discontinue the service at any time 
                  with or without notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">User Responsibilities</h2>
                <p className="mb-4">
                  Users are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of their account</li>
                  <li>All activities that occur under their account</li>
                  <li>Using the service in compliance with applicable laws</li>
                  <li>Not using the service for illegal or harmful purposes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Limitation of Liability</h2>
                <p>
                  In no event shall H0L0Light-OS or its suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business interruption) 
                  arising out of the use or inability to use the service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in accordance with applicable 
                  laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold warmwind-text mb-4">Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us through our 
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
