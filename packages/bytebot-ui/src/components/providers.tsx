'use client'

import { ReactNode, useEffect } from 'react'
import { taskScheduler } from '@/lib/task-scheduler'
import { backgroundAgent } from '@/lib/background-agent'
import { silentScraper } from '@/lib/silent-scraper'
import { HydrationBoundary } from './providers/hydration-boundary'
import { ThemeProvider } from './providers/theme-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize services when the app starts
    const initializeServices = async () => {
      try {
        // Initialize background agent service
        await backgroundAgent.initialize()
        
        // Initialize task scheduler service
        await taskScheduler.initialize()
        
        // Initialize silent scraper service
        silentScraper.initialize()
        silentScraper.start()
        
        console.log('🚀 All services initialized successfully')
      } catch (error) {
        console.error('Failed to initialize services:', error)
      }
    }

    initializeServices()

    // Cleanup on unmount
    return () => {
      taskScheduler.stop()
      backgroundAgent.stop()
      silentScraper.stop()
    }
  }, [])

  return (
    <HydrationBoundary>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </HydrationBoundary>
  )
}
