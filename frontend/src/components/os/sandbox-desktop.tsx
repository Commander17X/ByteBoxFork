'use client'

import { motion } from 'framer-motion'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Header } from '@/components/layout/header'

export function SandboxDesktop() {
  return (
    <motion.div
      className="h-screen flex flex-col wallpaper-bg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Header with Theme Switcher */}
      <Header />

      {/* Desktop Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="w-full h-full relative desktop-area flex items-center justify-center">
          {/* Theme Test Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="ethereal-card p-8 max-w-md mx-auto">
              <h1 className="warmwind-text text-2xl mb-4">Sandbox Desktop</h1>
              <p className="warmwind-body mb-6">
                This is the sandbox desktop environment. The theme selector in the header should be fully functional.
              </p>
              
              {/* Theme Switcher Test */}
              <div className="flex justify-center">
                <ThemeSwitcher />
              </div>
              
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-accent)' }}>
                <p className="warmwind-body text-sm">
                  This card uses theme variables and should change color when you switch themes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
