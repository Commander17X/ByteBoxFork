'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const [mounted, setMounted] = useState(false)
  const authStore = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
      _hasHydrated: false,
      login: authStore.login,
      register: authStore.register,
      logout: authStore.logout,
      completeOnboarding: authStore.completeOnboarding,
      updateUser: authStore.updateUser,
      updateUserPreferences: authStore.updateUserPreferences,
      setHasHydrated: authStore.setHasHydrated
    }
  }

  return authStore
}
