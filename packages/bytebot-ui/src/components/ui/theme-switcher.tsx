'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ThemeOption {
  id: string
  name: string
  description: string
  colors: string[]
  gradient: string
}

const themes: ThemeOption[] = [
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Clean grays',
    colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d'],
    gradient: 'linear-gradient(135deg, rgba(200, 200, 200, 0.3) 0%, rgba(180, 180, 180, 0.15) 100%)'
  },
  {
    id: 'soft-cream',
    name: 'Soft Cream',
    description: 'Warm cream tones',
    colors: ['#fefdf8', '#fdf6e3', '#f4e4bc', '#f0d68c', '#e6c865', '#d4b843'],
    gradient: 'linear-gradient(135deg, rgba(240, 226, 150, 0.3) 0%, rgba(230, 207, 111, 0.15) 100%)'
  },
  {
    id: 'cool-blue',
    name: 'Cool Blue',
    description: 'Calming blues',
    colors: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9'],
    gradient: 'linear-gradient(135deg, rgba(135, 221, 252, 0.3) 0%, rgba(66, 199, 248, 0.15) 100%)'
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    description: 'Natural greens',
    colors: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e'],
    gradient: 'linear-gradient(135deg, rgba(144, 249, 182, 0.3) 0%, rgba(84, 232, 138, 0.15) 100%)'
  },
  {
    id: 'lavender-purple',
    name: 'Lavender Purple',
    description: 'Gentle purples',
    colors: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#ddd6fe', '#c4b5fd', '#a78bfa'],
    gradient: 'linear-gradient(135deg, rgba(226, 224, 254, 0.3) 0%, rgba(206, 191, 253, 0.15) 100%)'
  }
]

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('minimal-gray')
  const { user, updateUserPreferences } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user?.preferences?.theme) {
      setCurrentTheme(user.preferences.theme)
      // Apply theme to document on initial load
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', user.preferences.theme)
      }
    }
  }, [user?.preferences?.theme])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleThemeChange = async (themeId: string) => {
    console.log('Theme changing to:', themeId) // Debug log
    setCurrentTheme(themeId)
    setIsOpen(false)
    
    // Immediately apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId)
      console.log('Theme applied to document:', themeId) // Debug log
    }
    
    // Update user preferences
    try {
      await updateUserPreferences({
        ...user?.preferences,
        theme: themeId
      })
      console.log('User preferences updated with theme:', themeId) // Debug log
    } catch (error) {
      console.error('Failed to update user preferences:', error)
    }
  }

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Switcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-300 hover:scale-105"
        style={{
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-accent)',
          color: 'var(--theme-primary)'
        }}
        whileHover={{ 
          backgroundColor: 'var(--theme-hover)',
          boxShadow: '0 4px 12px var(--theme-glow)'
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span className="font-display font-medium">{currentThemeData.name}</span>
        </div>
        
        {/* Current Theme Preview */}
        <div className="flex space-x-1">
          {currentThemeData.colors.slice(0, 4).map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Theme Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ethereal-card w-full min-w-[400px] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-accent)' }}>
                      <Palette className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                    </div>
                    <div>
                      <h2 className="warmwind-text text-xl">Choose Theme</h2>
                      <p className="warmwind-body text-sm opacity-70">Select your preferred color scheme</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" style={{ color: 'var(--theme-muted)' }} />
                  </button>
                </div>
              </div>

              {/* Theme Grid */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className="group relative p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        backgroundColor: theme.id === currentTheme ? 'var(--theme-hover)' : 'var(--theme-accent)',
                        border: theme.id === currentTheme ? '2px solid var(--theme-border)' : '1px solid var(--theme-border)'
                      }}
                      whileHover={{ 
                        backgroundColor: 'var(--theme-hover)',
                        borderColor: 'var(--theme-border)'
                      }}
                    >
                      {/* Theme Preview */}
                      <div className="flex space-x-2 mb-4">
                        {theme.colors.slice(0, 8).map((color, index) => (
                          <motion.div
                            key={index}
                            className="w-6 h-12 rounded-lg border border-white/20"
                            style={{ backgroundColor: color }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                          />
                        ))}
                      </div>
                      
                      {/* Theme Info */}
                      <div className="text-left">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="warmwind-text text-lg font-medium">{theme.name}</h3>
                          {theme.id === currentTheme && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'var(--theme-primary)' }}
                            >
                              <Check className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                            </motion.div>
                          )}
                        </div>
                        <p className="warmwind-body text-sm opacity-70">{theme.description}</p>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                           style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="warmwind-body text-sm">Theme will apply instantly</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="warmwind-button px-6 py-2"
                  >
                    Done
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
