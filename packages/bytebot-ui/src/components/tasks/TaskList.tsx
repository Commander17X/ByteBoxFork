'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, XCircle, Play, Pause } from 'lucide-react'
import { Task } from '@/types'
import { getTasks } from '@/utils/taskUtils'

interface TaskListProps {
  className?: string
  title: string
  description: string
  limit?: number
}

export function TaskList({ className = '', title, description, limit = 5 }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks(1, limit)
        setTasks(data.tasks)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [limit])

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'RUNNING':
        return <Play className="w-4 h-4 text-blue-400" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'NEEDS_HELP':
      case 'NEEDS_REVIEW':
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'CANCELLED':
        return <Pause className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400'
      case 'RUNNING':
        return 'text-blue-400'
      case 'PENDING':
        return 'text-yellow-400'
      case 'NEEDS_HELP':
      case 'NEEDS_REVIEW':
        return 'text-orange-400'
      case 'FAILED':
        return 'text-red-400'
      case 'CANCELLED':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/60">{description}</p>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>

      {tasks.length === 0 ? (
        <div className="p-6 text-center bg-white/5 rounded-lg border border-white/10">
          <Clock className="w-8 h-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60">No tasks yet</p>
          <p className="text-sm text-white/40">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.status)}
                  <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-white/40">
                  {formatDate(task.createdAt)}
                </span>
              </div>
              
              <p className="text-white/80 text-sm mb-2 line-clamp-2">
                {task.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-xs text-white/60">
                    {task.model.title}
                  </span>
                </div>
                
                {task.files && task.files.length > 0 && (
                  <span className="text-xs text-white/60">
                    {task.files.length} file{task.files.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
