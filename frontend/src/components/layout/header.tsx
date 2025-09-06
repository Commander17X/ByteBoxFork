'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, User, Activity, LogIn, LogOut, Bot, Settings, BarChart3, CheckCircle, MessageSquare, Clock, X, Check, Edit3, Key, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { NotificationCenter } from '@/components/ui/notification-center'
import { useAuth } from '@/hooks/use-auth'
import { HoloAIController } from '@/components/ui/holo-ai-controller'

export function Header() {
  const { systemMetrics } = useAppStore()
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showHoloAI, setShowHoloAI] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [usernameRetries, setUsernameRetries] = useState(3)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()


  const handleLogout = async () => {
    setShowUserDropdown(false) // Close dropdown immediately

    try {
      await logout()
      // Redirect immediately after logout
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, redirect to login
      router.push('/login')
    }
  }

  const handleLoginClick = () => {
    router.push('/login')
  }

  const handleProfileSettingsClick = () => {
    setShowUserDropdown(false)
    setShowProfileModal(true)
    setNewUsername(user?.name || '')
    setResetEmail(user?.email || '')
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
    setIsEditingUsername(false)
    setIsResettingPassword(false)
    setUsernameRetries(3)
    setMessage(null)
  }

  const handleUsernameEdit = () => {
    setIsEditingUsername(true)
  }

  const handleUsernameSave = async () => {
    if (!newUsername.trim()) return

    setIsLoading(true)
    setMessage(null)

    try {
      await updateUser({ name: newUsername.trim() })
      setIsEditingUsername(false)
      setUsernameRetries(3)
      setMessage({ type: 'success', text: 'Username updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setUsernameRetries(prev => Math.max(0, prev - 1))
      setMessage({ type: 'error', text: 'Failed to update username. Please try again.' })
      setTimeout(() => setMessage(null), 3000)
      if (usernameRetries <= 1) {
        setIsEditingUsername(false)
        setUsernameRetries(3)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsernameCancel = () => {
    setIsEditingUsername(false)
    setNewUsername(user?.name || '')
    setUsernameRetries(3)
  }

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      if (response.ok) {
        setIsResettingPassword(false)
        setMessage({ type: 'success', text: 'Password reset email sent successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to send password reset email' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      setMessage({ type: 'error', text: 'Failed to send password reset email' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }



  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  // Handle escape key for dropdown and modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showProfileModal) {
          handleCloseProfileModal()
        } else if (showUserDropdown) {
          setShowUserDropdown(false)
        }
      }
    }

    if (showProfileModal || showUserDropdown) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showProfileModal, showUserDropdown])

  return (
    <>
      <header className="heavenly-glass border-b border-white/20 p-6">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search agents, apps, or decisions..."
              className="warmwind-input w-full pl-12 pr-6 py-4 text-lg"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center space-x-8">
          {/* Quick Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-white/80" />
              <span className="warmwind-body">
                {systemMetrics.activeAgents}/{systemMetrics.totalAgents} Agents
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white/80 rounded-full" />
              <span className="warmwind-body">
                CPU: {systemMetrics.cpu}%
              </span>
            </div>
          </div>


          {/* Notifications */}
          <NotificationCenter />

          {/* Logout Button */}
          {isAuthenticated && user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 hover:bg-red-500/20 transition-all duration-200 rounded-lg border border-red-500/30"
              title="Logout"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/30 to-red-600/20 flex items-center justify-center border border-red-500/40 rounded-lg">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="warmwind-body font-medium text-red-300">Logout</span>
            </motion.button>
          )}

          {/* Holo-AI Assistant */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHoloAI(true)}
            className="flex items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-200 rounded-lg"
            title="Holo-AI Assistant"
          >
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center border border-white/30 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="warmwind-body font-medium">AI</span>
          </motion.button>

        </div>
      </div>
    </header>

    {/* Profile Settings Modal */}
    {showProfileModal && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleCloseProfileModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/20 rounded-xl">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-lg"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
                  <p className="text-sm text-gray-500">Manage your account</p>
                </div>
              </div>
              <button
                onClick={handleCloseProfileModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg border mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              </div>
            )}

            {/* Profile Settings Content */}
            <div className="space-y-6">
              {/* Username Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                {isEditingUsername ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new username"
                      maxLength={30}
                    />
                    <button
                      onClick={handleUsernameSave}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      type="button"
                      disabled={!newUsername.trim() || isLoading}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleUsernameCancel}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{user?.name || 'Not set'}</span>
                    <button
                      onClick={handleUsernameEdit}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      type="button"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {usernameRetries < 3 && (
                  <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    <span>{usernameRetries} attempts remaining</span>
                  </div>
                )}
              </div>

              {/* Password Reset Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Password Reset
                </label>
                {isResettingPassword ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePasswordReset}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        type="button"
                        disabled={!resetEmail.trim() || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>Send Reset Link</span>
                        )}
                      </button>
                      <button
                        onClick={() => setIsResettingPassword(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsResettingPassword(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    type="button"
                  >
                    <Key className="w-4 h-4" />
                    <span>Reset Password</span>
                  </button>
                )}
              </div>

              {/* Account Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Account ID: <span className="font-mono">{user?.id?.slice(0, 8) || 'Unknown'}...</span></div>
                  <div>Joined: <span className="font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Holo-AI Controller Modal */}
    <HoloAIController
      isOpen={showHoloAI}
      onClose={() => setShowHoloAI(false)}
    />
  </>
  )
}
