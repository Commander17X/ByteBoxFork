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
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

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

  useEffect(() => {
    fetchUsers()
  }, [])

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/landing" className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Waitlist Management</span>
            <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-gray-400">Total Users</div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{stats.waiting}</div>
                <div className="text-gray-400">Waiting</div>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.beta}</div>
                <div className="text-gray-400">Beta Users</div>
              </div>
              <Crown className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{stats.removed}</div>
                <div className="text-gray-400">Removed</div>
              </div>
              <UserX className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
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
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 bg-green-600/80 hover:bg-green-700/80 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve Selected</span>
                </button>
                <button
                  onClick={() => handleBulkAction('remove')}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm"
                >
                  <UserX className="w-4 h-4" />
                  <span>Remove Selected</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
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
                      className="rounded border-gray-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
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
                        className="rounded border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'beta' ? 'bg-green-100/20 text-green-400 border border-green-400/30' :
                        user.status === 'waiting' ? 'bg-yellow-100/20 text-yellow-400 border border-yellow-400/30' :
                        'bg-red-100/20 text-red-400 border border-red-400/30'
                      }`}>
                        {user.status === 'beta' ? 'Beta User' :
                         user.status === 'waiting' ? 'Waiting' : 'Removed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      #{user.position}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {user.status === 'waiting' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'approve')}
                            className="p-2 bg-green-600/80 hover:bg-green-700/80 rounded-lg transition-colors backdrop-blur-sm"
                            title="Approve for Beta"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {user.status !== 'removed' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'remove')}
                            className="p-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-colors backdrop-blur-sm"
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
        </motion.div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400">No users found</div>
          </div>
        )}
      </div>
    </div>
  )
}
