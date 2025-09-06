'use client'

import { motion } from 'framer-motion'
import { Palette, Sparkles, Monitor, Zap, Star, Heart } from 'lucide-react'

export function ThemeShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ethereal-card p-8 space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto bg-white/10 flex items-center justify-center border border-white/20 rounded-2xl"
        >
          <Palette className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="warmwind-text text-2xl font-bold">Theme Showcase</h2>
        <p className="warmwind-body text-sm opacity-70">
          Experience the beautiful theming system with enhanced visibility
        </p>
      </div>

      {/* Color Palette Grid */}
      <div className="space-y-4">
        <h3 className="warmwind-text text-lg font-semibold flex items-center space-x-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          <span>Color Palette</span>
        </h3>
        
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="h-16 rounded-xl border border-white/20 flex items-center justify-center"
              style={{
                backgroundColor: `hsl(${i * 30}, 70%, ${85 - i * 3}%)`,
                opacity: 0.7 + (i * 0.02)
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              transition={{ duration: 0.2 }}
            >
              <span 
                className="text-xs font-mono font-bold"
                style={{ color: 'var(--theme-primary)' }}
              >
                {i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* UI Components Showcase */}
      <div className="space-y-6">
        <h3 className="warmwind-text text-lg font-semibold flex items-center space-x-2">
          <Monitor className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          <span>UI Components</span>
        </h3>

        {/* Buttons */}
        <div className="space-y-3">
          <h4 className="warmwind-body text-sm font-medium opacity-80">Buttons</h4>
          <div className="flex flex-wrap gap-3">
            <motion.button
              className="warmwind-button px-6 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Primary Button
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-lg border transition-all duration-300"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-primary)'
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'var(--theme-hover)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Secondary Button
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: 'var(--theme-glow)',
                color: 'var(--theme-primary)'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 4px 12px var(--theme-glow)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Glow Button
            </motion.button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <h4 className="warmwind-body text-sm font-medium opacity-80">Input Fields</h4>
          <div className="space-y-3">
            <div className="warmwind-input">
              <input
                type="text"
                placeholder="Sample text input"
                className="w-full bg-transparent border-none outline-none"
                readOnly
              />
            </div>
            <div className="warmwind-input">
              <input
                type="email"
                placeholder="Sample email input"
                className="w-full bg-transparent border-none outline-none"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <h4 className="warmwind-body text-sm font-medium opacity-80">Cards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className="p-4 rounded-xl border"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-accent)'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-hover)' }}
                >
                  <Zap className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                </div>
                <div>
                  <h5 className="warmwind-text font-medium">Feature Card</h5>
                  <p className="warmwind-body text-sm opacity-70">Description text</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-4 rounded-xl border"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-card-bg)'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-glow)' }}
                >
                  <Star className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                </div>
                <div>
                  <h5 className="warmwind-text font-medium">Another Card</h5>
                  <p className="warmwind-body text-sm opacity-70">More content here</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-3">
          <h4 className="warmwind-body text-sm font-medium opacity-80">Status Indicators</h4>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-active" />
              <span className="warmwind-body text-sm">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-idle" />
              <span className="warmwind-body text-sm">Idle</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-autonomous" />
              <span className="warmwind-body text-sm">Autonomous</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-6 border-t"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            <span className="warmwind-body text-sm">
              Theme colors are dynamically applied throughout the interface
            </span>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: 'var(--theme-primary)',
                  opacity: 0.2 + (i * 0.2)
                }}
                animate={{ 
                  opacity: [0.2 + (i * 0.2), 0.8, 0.2 + (i * 0.2)],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
