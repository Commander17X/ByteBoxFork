'use client'

import { motion } from 'framer-motion'
import { Palette, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ThemeIndicatorProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ThemeIndicator({ showLabel = true, size = 'md' }: ThemeIndicatorProps) {
  const { user } = useAuth()
  const currentTheme = user?.preferences?.theme || 'minimal-gray'

  const getThemeColors = (theme: string) => {
    const themeColors = {
      'minimal-gray': ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d'],
      'soft-cream': ['#fefdf8', '#fdf6e3', '#f4e4bc', '#f0d68c', '#e6c865', '#d4b843'],
      'cool-blue': ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9'],
      'sage-green': ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e'],
      'lavender-purple': ['#faf5ff', '#f3e8ff', '#e9d5ff', '#ddd6fe', '#c4b5fd', '#a78bfa']
    }
    return themeColors[theme as keyof typeof themeColors] || themeColors['minimal-gray']
  }

  const getThemeName = (theme: string) => {
    const themeNames = {
      'minimal-gray': 'Minimal Gray',
      'soft-cream': 'Soft Cream',
      'cool-blue': 'Cool Blue',
      'sage-green': 'Sage Green',
      'lavender-purple': 'Lavender Purple'
    }
    return themeNames[theme as keyof typeof themeNames] || 'Minimal Gray'
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }

  const colors = getThemeColors(currentTheme)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-3"
    >
      {/* Theme Color Palette */}
      <div className="flex items-center space-x-1">
        <div className="flex space-x-0.5">
          {colors.slice(0, 4).map((color, index) => (
            <motion.div
              key={index}
              className={`${sizeClasses[size]} rounded-full border border-white/20`}
              style={{ backgroundColor: color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
        
        {/* Theme Icon */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center border border-white/20`}
          style={{ backgroundColor: 'var(--theme-accent)' }}
          whileHover={{ scale: 1.05 }}
        >
          <Palette className={`${iconSizes[size]} text-white/80`} />
        </motion.div>
      </div>

      {/* Theme Label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          <span 
            className="font-display font-medium text-sm"
            style={{ color: 'var(--theme-primary)' }}
          >
            {getThemeName(currentTheme)}
          </span>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3" style={{ color: 'var(--theme-muted)' }} />
            <span 
              className="text-xs"
              style={{ color: 'var(--theme-muted)' }}
            >
              Active Theme
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
