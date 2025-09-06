'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSounds } from '@/lib/sounds'
import { useNotifications } from '@/lib/notifications'
import { AnimatedButton } from '@/components/ui/animated-button'
import { useFormHydration } from '@/hooks/use-hydration-safe'
import { HydrationSafeInput } from '@/components/ui/hydration-safe-input'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { register, isLoading } = useAuth()
  const { playSuccess, playError } = useSounds()
  const { success, error } = useNotifications()
  const router = useRouter()
  const mounted = useFormHydration()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      // Register function now handles notifications internally
      await register(formData.email, formData.password, formData.name)
      playSuccess()
      // Redirect to home page after successful registration
      router.push('/waitlist')
    } catch (error: any) {
      // Handle any unexpected errors (including browser extension interference)
      console.warn('Registration form error:', error)

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
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl warmwind-text mb-2 font-display">Join Us!</h1>
            <p className="warmwind-body text-sm">Welcome to H0L0Light-OS! Let's get you started</p>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <div className="warmwind-input w-full pl-12 pr-4 h-12 bg-white/10 border border-white/20 rounded-xl" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <div className="warmwind-input w-full pl-12 pr-4 h-12 bg-white/10 border border-white/20 rounded-xl" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <div className="warmwind-input w-full pl-12 pr-12 h-12 bg-white/10 border border-white/20 rounded-xl" />
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
             <User className="w-6 h-6 text-white" />
           </motion.div>
           <h1 className="text-xl warmwind-text mb-2 font-display">Join Us! </h1>
           <p className="warmwind-body text-sm">Welcome to H0L0Light-OS! Let's get you started</p>
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
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <HydrationSafeInput
                type="text"
                placeholder="First Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-12 pr-4"
                autoComplete="given-name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-white/70">{errors.name}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
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
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <HydrationSafeInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-12 pr-12"
                autoComplete="new-password"
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

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <HydrationSafeInput
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-12 pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-white/70">{errors.confirmPassword}</p>}
          </motion.div>

          <AnimatedButton
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="lg"
            animation="bounce"
            className="w-full"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </AnimatedButton>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="warmwind-body">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
