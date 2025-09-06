'use client'

import { motion } from 'framer-motion'
import { Palette, Sparkles, Monitor } from 'lucide-react'

export function ThemePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ethereal-card p-6 space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/10 flex items-center justify-center border border-white/20 rounded-xl">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="warmwind-text text-lg font-semibold">Theme Preview</h3>
          <p className="warmwind-body text-sm opacity-70">See how your theme looks</p>
        </div>
      </div>

      {/* Theme Color Palette */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          <span className="warmwind-body text-sm font-medium">Color Palette</span>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="h-8 rounded-lg border border-white/20"
              style={{
                backgroundColor: `hsl(${i * 60}, 70%, ${90 - i * 10}%)`,
                opacity: 0.8 + (i * 0.03)
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Sample UI Elements */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Monitor className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          <span className="warmwind-body text-sm font-medium">UI Elements</span>
        </div>
        
        <div className="space-y-2">
          {/* Sample Button */}
          <motion.button
            className="warmwind-button w-full py-2 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sample Button
          </motion.button>
          
          {/* Sample Input */}
          <div className="warmwind-input">
            <input
              type="text"
              placeholder="Sample input field"
              className="w-full bg-transparent border-none outline-none"
              readOnly
            />
          </div>
          
          {/* Sample Card */}
          <div 
            className="p-3 rounded-lg border"
            style={{
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-accent)'
            }}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--theme-primary)' }}
              >
                Sample card content
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between text-xs">
          <span className="warmwind-body opacity-60">Current theme colors are applied</span>
          <div className="flex space-x-1">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: 'var(--theme-primary)',
                  opacity: 0.3 + (i * 0.2)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
