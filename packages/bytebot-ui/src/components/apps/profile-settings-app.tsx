'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Key, Edit3, X, Check, AlertCircle, LogOut, BarChart3, CheckCircle, Clock, Activity } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ProfileSettingsAppProps {
  onClose: () => void
}

export function ProfileSettingsApp({ onClose }: ProfileSettingsAppProps) {
  const { user, updateUser, logout } = useAuth()
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.name || '')
  const [usernameRetries, setUsernameRetries] = useState(3)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState(user?.email || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="w-full h-full flex flex-col profile-settings-app">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
          {/* App Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl warmwind-text font-display">Profile</h1>
              <p className="warmwind-body text-sm text-white/70">Manage your account settings and preferences</p>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-20 h-20 bg-white/10 flex items-center justify-center border border-white/20 rounded-2xl flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl warmwind-text font-display mb-1">{user?.name || 'User'}</h2>
              <p className="warmwind-body text-white/70 mb-3">{user?.email || 'user@example.com'}</p>
              <div className="text-sm text-white/60 space-y-1">
                <div>Account ID: <span className="font-mono">{user?.id?.slice(0, 8) || 'Unknown'}...</span></div>
                <div>Joined: <span className="font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span></div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-lg warmwind-text font-medium flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Account Status
            </h3>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-300 font-medium">Active</span>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm text-green-400/80 mt-2">
                Last active: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="space-y-4">
            <h3 className="text-lg warmwind-text font-medium flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
              Your Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-300">24</div>
                <div className="text-sm text-blue-400/80">Tasks Completed</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-sm text-white/70">Questions Asked</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-300">8.5h</div>
                <div className="text-sm text-orange-400/80">Time Saved</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-300">95%</div>
                <div className="text-sm text-green-400/80">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="space-y-4">
            <h3 className="text-lg warmwind-text font-medium flex items-center">
              <Clock className="w-5 h-5 text-indigo-400 mr-2" />
              This Week's Progress
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/70">Tasks Completed</span>
                <span className="text-sm text-white/70">7/10</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div className="bg-white/20 h-3 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="text-sm text-white/60">Great progress this week!</div>
            </div>
          </div>

          {/* Username Section */}
          <div className="space-y-4">
            <h3 className="text-lg warmwind-text font-medium">Username</h3>
            {isEditingUsername ? (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl warmwind-body text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15"
                  placeholder="Enter new username"
                  maxLength={30}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleUsernameSave}
                    className="flex-1 sm:flex-none p-3 text-green-400 hover:bg-green-500/20 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newUsername.trim() || isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleUsernameCancel}
                    className="flex-1 sm:flex-none p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="warmwind-body text-white/80">{user?.name || 'Not set'}</span>
                <button
                  onClick={handleUsernameEdit}
                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            {usernameRetries < 3 && (
              <div className="flex items-center space-x-2 text-sm text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <AlertCircle className="w-4 h-4" />
                <span>{usernameRetries} attempts remaining</span>
              </div>
            )}
          </div>

          {/* Password Reset Section */}
          <div className="space-y-4">
            <h3 className="text-lg warmwind-text font-medium">Password Reset</h3>
            {isResettingPassword ? (
              <div className="space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl warmwind-body text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15"
                  placeholder="Enter your email"
                />
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handlePasswordReset}
                    className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-3 rounded-xl text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    disabled={!resetEmail.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsResettingPassword(false)}
                    className="flex-1 sm:flex-none px-4 py-3 text-white/60 hover:bg-white/10 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsResettingPassword(true)}
                className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-sm transition-colors border border-white/10"
              >
                <Key className="w-5 h-5" />
                <span>Reset Password</span>
              </button>
            )}
          </div>

          {/* Logout Section */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition-colors border border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
