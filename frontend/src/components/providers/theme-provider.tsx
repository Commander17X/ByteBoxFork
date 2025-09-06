'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    const theme = user?.preferences?.theme || 'minimal-gray'

    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      console.log('Theme applied:', theme) // Debug log
    }
  }, [user?.preferences?.theme])

  // Apply default theme on initial load
  useEffect(() => {
    if (typeof document !== 'undefined' && !user?.preferences?.theme) {
      document.documentElement.setAttribute('data-theme', 'minimal-gray')
      console.log('Default theme applied: minimal-gray') // Debug log
    }
  }, [])

  return <>{children}</>
}
