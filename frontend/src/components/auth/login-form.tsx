'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useFormHydration } from '@/hooks/use-hydration-safe'
import { HydrationSafeInput } from '@/components/ui/hydration-safe-input'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login, isLoading } = useAuth()
  const router = useRouter()
  const mounted = useFormHydration()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Clear any previous errors
    setErrors({})

    // Add a small delay to prevent rapid-fire submissions that might trigger extension interference
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      // Login function now handles errors through notifications
      await login(formData.email, formData.password)
      // Redirect to home page after successful login
      router.push('/')
    } catch (error: any) {
      // Handle any unexpected errors (including browser extension interference)
      console.warn('Login form error:', error)

      // Only show error if it's not related to browser extensions
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message
        if (!errorMessage.includes('AllowLocalHost') &&
            !errorMessage.includes('extension') &&
            !errorMessage.includes('fd_content') &&
            !errorMessage.includes('content script')) {
          setErrors({ general: 'An unexpected error occurred. Please try again.' })
        } else {
          // For extension-related errors, show a helpful message
          setErrors({ general: 'Browser extension conflict detected. Try disabling extensions or use incognito mode.' })
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' })
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!mounted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="ethereal-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-white/20 to-white/8 border border-white/20 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl warmwind-text mb-2 font-display">Welcome Back!</h1>
            <p className="warmwind-body text-sm">Great to see you again! Sign in to continue</p>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <div className="warmwind-input w-full pl-12 pr-4 h-12 bg-white/10 border border-white/20 rounded-xl" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <div className="warmwind-input w-full pl-12 pr-12 h-12 bg-white/10 border border-white/20 rounded-xl" />
            </div>
            <div className="warmwind-button w-full py-4 text-lg bg-white/10 border border-white/20 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="ethereal-card p-8">
                 <div className="text-center mb-8">
           <motion.div
             initial={{ scale: 0.8 }}
             animate={{ scale: 1 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-white/20 to-white/8 border border-white/20 flex items-center justify-center"
           >
             <LogIn className="w-6 h-6 text-white" />
           </motion.div>
           <h1 className="text-xl warmwind-text mb-2 font-display">Welcome Back!</h1>
           <p className="warmwind-body text-sm">Great to see you again! Sign in to continue</p>
         </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-white/10 border border-white/20"
          >
            <p className="text-sm text-white/80">{errors.general}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <HydrationSafeInput
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-12 pr-4"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-white/70">{errors.email}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <HydrationSafeInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-12 pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-white/70">{errors.password}</p>}
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="warmwind-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="warmwind-body">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Create Account
            </button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
