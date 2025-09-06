'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationManager } from '@/lib/notifications'

export interface UserPreferences {
  theme: string
  layout: string
  customizations: {
    sidebarWidth: string
    animations: boolean
    sounds: boolean
    notifications: boolean
  }
  desktopSettings: {
    wallpaper: string
    gridSize: number
    showGrid: boolean
    showGridOverlay?: boolean
  }
  // Add any new preferences here
  timezone?: string
  language?: string
  dateFormat?: string
  timeFormat?: string
  // Application-specific preferences can also go here
  installedApps?: string[]
  // LLM setup preferences
  llmSetup?: {
    isCompleted: boolean
    completedAt?: string
    downloadedModels: string[]
    skippedSetup: boolean
  }
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  preferences?: UserPreferences
  token?: string // Add token to user interface
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isOnboarded: boolean
  isLoading: boolean
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  completeOnboarding: () => void
  updateUser: (user: Partial<User>) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  setHasHydrated: (state: boolean) => void
  updateLLMSetupStatus: (isCompleted: boolean, downloadedModels?: string[], skippedSetup?: boolean) => void
  isLLMSetupCompleted: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
      _hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Create AbortController for timeout protection
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          // Direct call to orchestrator API with protection against extension interference
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add cache control to prevent extension interference
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
            // Add credentials mode for better security
            credentials: 'same-origin'
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }))

            // Show user-friendly notification instead of throwing error
            let notificationMessage = 'Invalid email or password. Please try again.'

            if (errorData.message) {
              if (errorData.message.includes('Invalid credentials')) {
                notificationMessage = 'The email or password you entered is incorrect. Please check and try again.'
              } else if (errorData.message.includes('not found')) {
                notificationMessage = 'Account not found. Please check your email or create a new account.'
              } else {
                notificationMessage = errorData.message
              }
            }

            notificationManager.error('Login Failed', notificationMessage, {
              duration: 5000
            })

            set({ isLoading: false })
            return // Don't throw error, just return to avoid breaking the form
          }

          const { user, token } = await response.json()

          set({
            user: { ...user, token },
            isAuthenticated: true,
            isLoading: false
          })

          // Show success notification
          notificationManager.success('Welcome back!', `Hello ${user.name}, you've been successfully logged in.`)
        } catch (error: any) {
          set({ isLoading: false })

          // Handle different types of errors
          let errorTitle = 'Connection Error'
          let errorMessage = 'Network error. Please check your connection and try again.'

          if (error.name === 'AbortError') {
            errorTitle = 'Request Timeout'
            errorMessage = 'The request took too long. Please try again.'
          } else if (error.message) {
            // Check if it's an extension-related error
            if (error.message.includes('AllowLocalHost') ||
                error.message.includes('extension') ||
                error.message.includes('fd_content') ||
                error.message.includes('content script')) {
              errorTitle = 'Extension Conflict'
              errorMessage = 'A browser extension may be interfering. Please try disabling extensions or use incognito mode.'
            } else {
              errorMessage = error.message
            }
          }

          notificationManager.error(errorTitle, errorMessage, {
            duration: 6000
          })

          // Log the actual error for debugging but don't expose it to user
          console.warn('Login error (handled gracefully):', error)

          // Still don't throw error to avoid breaking the form
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        try {
          // Create AbortController for timeout protection
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          // Direct call to orchestrator API with protection against extension interference
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add cache control to prevent extension interference
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({ email, password, name }),
            signal: controller.signal,
            // Add credentials mode for better security
            credentials: 'same-origin'
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))

            // Show user-friendly notification for registration errors
            let notificationMessage = 'Registration failed. Please try again.'

            if (errorData.message) {
              if (errorData.message.includes('already exists')) {
                notificationMessage = 'An account with this email already exists. Please use a different email or try logging in.'
              } else if (errorData.message.includes('required')) {
                notificationMessage = 'Please fill in all required fields.'
              } else {
                notificationMessage = errorData.message
              }
            }

            notificationManager.error('Registration Failed', notificationMessage, {
              duration: 6000
            })

            set({ isLoading: false })
            return // Don't throw error to avoid breaking the form
          }

          const { user, token } = await response.json()

          set({
            user: { ...user, token },
            isAuthenticated: true,
            isOnboarded: false, // New users need onboarding
            isLoading: false
          })

          // Show success notification
          notificationManager.success('Welcome!', `Account created successfully. Welcome to H0L0Light-OS, ${user.name}!`)
        } catch (error: any) {
          set({ isLoading: false })

          // Handle different types of errors
          let errorTitle = 'Connection Error'
          let errorMessage = 'Network error. Please check your connection and try again.'

          if (error.name === 'AbortError') {
            errorTitle = 'Request Timeout'
            errorMessage = 'The request took too long. Please try again.'
          } else if (error.message) {
            // Check if it's an extension-related error
            if (error.message.includes('AllowLocalHost') ||
                error.message.includes('extension') ||
                error.message.includes('fd_content') ||
                error.message.includes('content script')) {
              errorTitle = 'Extension Conflict'
              errorMessage = 'A browser extension may be interfering. Please try disabling extensions or use incognito mode.'
            } else {
              errorMessage = error.message
            }
          }

          notificationManager.error(errorTitle, errorMessage, {
            duration: 6000
          })

          // Log the actual error for debugging but don't expose it to user
          console.warn('Registration error (handled gracefully):', error)
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint if user has a token
          const currentUser = get().user
          if (currentUser?.token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
              }
            })
          }
        } catch (error) {
          console.warn('Logout API call failed, but proceeding with client-side logout:', error)
        }

        // Clear all auth state
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false,
          isLoading: false,
          _hasHydrated: false
        })

        // Clear persisted storage - zustand persist will handle this automatically
        // but we'll also clear it manually to ensure clean logout
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('auth-storage')
            // Also clear any other auth-related storage
            localStorage.removeItem('zustand-auth-storage')
          } catch (error) {
            console.warn('Failed to clear localStorage during logout:', error)
          }
        }
      },

      completeOnboarding: () => {
        set({ isOnboarded: true })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...userData } 
          })
        }
      },

      updateUserPreferences: async (preferences: Partial<UserPreferences>) => {
        const currentUser = get().user
        if (currentUser && currentUser.token) {
          try {
            // Direct call to orchestrator API
            const response = await fetch(`http://5.231.82.135:3001/api/auth/users/${currentUser.id}/preferences`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
              },
              body: JSON.stringify({ preferences })
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.message || 'Failed to update preferences')
            }

            const { preferences: updatedPreferences } = await response.json()

            set({ 
              user: { 
                ...currentUser, 
                preferences: { 
                  ...currentUser.preferences, 
                  ...updatedPreferences 
                } 
              } 
            })
          } catch (error) {
            console.error('Failed to update user preferences:', error)
            throw error
          }
        }
      },


      setHasHydrated: (state: boolean) => {
        const currentState = get()
        if (currentState._hasHydrated !== state) {
          set({ _hasHydrated: state })
        }
      },

      updateLLMSetupStatus: (isCompleted: boolean, downloadedModels: string[] = [], skippedSetup: boolean = false) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedPreferences: UserPreferences = {
            theme: currentUser.preferences?.theme || 'dark',
            layout: currentUser.preferences?.layout || 'default',
            customizations: currentUser.preferences?.customizations || {
              sidebarWidth: '280px',
              animations: true,
              sounds: true,
              notifications: true
            },
            desktopSettings: currentUser.preferences?.desktopSettings || {
              wallpaper: '/img/default_wallpaper.jpg',
              gridSize: 80,
              showGrid: false,
              showGridOverlay: false
            },
            ...currentUser.preferences,
            llmSetup: {
              isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : undefined,
              downloadedModels,
              skippedSetup
            }
          }
          
          set({ 
            user: { 
              ...currentUser, 
              preferences: updatedPreferences 
            } 
          })
        }
      },

      isLLMSetupCompleted: () => {
        const currentUser = get().user
        return currentUser?.preferences?.llmSetup?.isCompleted || false
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
        }
      }
    }
  )
)

// Add hydration effect
if (typeof window !== 'undefined') {
  useAuthStore.persist.rehydrate()
}
