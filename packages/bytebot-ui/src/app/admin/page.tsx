'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Crown, 
  Settings,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  MessageCircle,
  LogOut
} from 'lucide-react'
import ChatManagement from '../components/admin/chat-management'
import EmailComposer from '../components/admin/email-composer'

interface WaitlistUser {
  id: string
  email: string
  joinedAt: string
  status: 'waiting' | 'beta' | 'removed'
  position: number
  notes?: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<WaitlistUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'beta' | 'removed'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'waitlist' | 'chat'>('waitlist')
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [adminUser, setAdminUser] = useState<string>('')

  useEffect(() => {
    fetchUsers()
    fetchAdminUser()
  }, [])

  const fetchAdminUser = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAdminUser(data.username || 'Admin')
      }
    } catch (error) {
      console.error('Failed to fetch admin user:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include'
      })
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/waitlist')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'approve' | 'remove') => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleBulkAction = async (action: 'approve' | 'remove') => {
    try {
      const response = await fetch('/api/admin/waitlist/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers, action })
      })

      if (response.ok) {
        setSelectedUsers([])
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to bulk update users:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: users.length,
    waiting: users.filter(u => u.status === 'waiting').length,
    beta: users.filter(u => u.status === 'beta').length,
    removed: users.filter(u => u.status === 'removed').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wallpaper-bg flex items-center justify-center">
        <div className="warmwind-text text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wallpaper-bg">
      {/* Header */}
      <div className="glass-panel border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold warmwind-text">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm warmwind-body">Waitlist Management</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm warmwind-body">Welcome, {adminUser}</span>
              <button 
                onClick={handleLogout}
                className="warmwind-button flex items-center space-x-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="ethereal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold warmwind-text">{stats.total}</div>
                <div className="warmwind-body">Total Users</div>
              </div>
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="ethereal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold warmwind-text">{stats.waiting}</div>
                <div className="warmwind-body">Waiting</div>
              </div>
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="ethereal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold warmwind-text">{stats.beta}</div>
                <div className="warmwind-body">Beta Users</div>
              </div>
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="ethereal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold warmwind-text">{stats.removed}</div>
                <div className="warmwind-body">Removed</div>
              </div>
              <UserX className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="ethereal-card p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'waitlist'
                  ? 'warmwind-button'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Waitlist Management</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'warmwind-button'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Live Chat</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'waitlist' && (
          <>
            {/* Controls */}
            <div className="ethereal-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="warmwind-input pl-10 pr-4 py-2"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="warmwind-input px-4 py-2"
              >
                <option value="all">All Users</option>
                <option value="waiting">Waiting</option>
                <option value="beta">Beta Users</option>
                <option value="removed">Removed</option>
              </select>
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEmailComposer(true)}
                  className="warmwind-button flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="warmwind-button flex items-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve Selected</span>
                </button>
                <button
                  onClick={() => handleBulkAction('remove')}
                  className="warmwind-button flex items-center space-x-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>Remove Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="ethereal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded border-white/30"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium warmwind-body uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium warmwind-body uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium warmwind-body uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium warmwind-body uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium warmwind-body uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="rounded border-white/30"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="warmwind-text font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'beta' ? 'bg-white/20 text-white' :
                        user.status === 'waiting' ? 'bg-white/15 text-white' :
                        'bg-white/10 text-white/70'
                      }`}>
                        {user.status === 'beta' ? 'Beta User' :
                         user.status === 'waiting' ? 'Waiting' : 'Removed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 warmwind-body">
                      #{user.position}
                    </td>
                    <td className="px-6 py-4 warmwind-body">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {user.status === 'waiting' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'approve')}
                            className="warmwind-button p-2"
                            title="Approve for Beta"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {user.status !== 'removed' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'remove')}
                            className="warmwind-button p-2"
                            title="Remove from Waitlist"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <div className="warmwind-body">No users found</div>
          </div>
        )}
          </>
        )}

        {activeTab === 'chat' && (
          <ChatManagement />
        )}
      </div>

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <EmailComposer
          selectedUsers={selectedUsers}
          onClose={() => setShowEmailComposer(false)}
        />
      )}
    </div>
  )
}
