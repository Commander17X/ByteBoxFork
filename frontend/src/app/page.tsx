'use client'

import { useAuth } from '@/hooks/use-auth'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { NotificationContainer } from '@/components/ui/notification-toast'
import { useNotifications } from '@/lib/notifications'
import { useState, useEffect, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'

// Lazy load heavy components to reduce initial bundle size
const GettingStarted = lazy(() => import('@/components/onboarding/getting-started').then(mod => ({ default: mod.GettingStarted })))
const BlankDesktop = lazy(() => import('@/components/os/blank-desktop').then(mod => ({ default: mod.BlankDesktop })))

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, isOnboarded, isLoading } = useAuth()
  const { getNotifications, removeNotification } = useNotifications()
  const router = useRouter()

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoading) {
      // Only redirect if we're not already on an auth page
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/landing') {
        console.log('Redirecting unauthenticated user to landing page')
        router.push('/landing')
      }
    }
  }, [mounted, isAuthenticated, isLoading, router])

  // Show enhanced loading screen during hydration
  if (!mounted) {
    return (
      <LoadingScreen
        onComplete={() => {
          // Loading screen will auto-complete based on minimumDuration
        }}
      />
    )
  }

  // Show enhanced loading screen during authentication with contextual messaging
  if (isLoading) {
    return (
      <LoadingScreen
        onComplete={() => {
          // Loading screen will auto-complete based on minimumDuration
        }}
      />
    )
  }


  // Show onboarding if logged in but not onboarded
  if (!isOnboarded) {
    return (
      <Suspense fallback={<LoadingScreen title="Loading..." subtitle="Setting up your workspace" />}>
        <GettingStarted />
      </Suspense>
    )
  }

  // Show the blank desktop environment
  return (
    <Suspense fallback={<LoadingScreen title="Loading..." subtitle="Initializing your OS" />}>
      <BlankDesktop />
      <NotificationContainer
        notifications={getNotifications()}
        onRemove={removeNotification}
        onAction={(action) => action.action()}
      />
    </Suspense>
  )
}
