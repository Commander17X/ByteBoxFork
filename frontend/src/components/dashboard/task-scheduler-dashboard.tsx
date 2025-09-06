'use client'

import React, { useState, useEffect } from 'react'
import { taskScheduler, type ScheduledTask, type TaskExecution, testTaskPersistence, checkExistingTaskData } from '@/lib/task-scheduler'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import FinanceSchedulerExample from './finance-scheduler-example'

interface TaskSchedulerDashboardProps {
  className?: string
}

const TaskSchedulerDashboard: React.FC<TaskSchedulerDashboardProps> = ({ className = '' }) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null)
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    type: 'data_extraction' as ScheduledTask['type'],
    frequency: 'daily' as const,
    timeOfDay: '09:00',
    duration: { days: 31 },
    priority: 'medium' as ScheduledTask['priority']
  })

  useEffect(() => {
    loadData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const schedulerTasks = taskScheduler.getScheduledTasks()
      const schedulerStatus = taskScheduler.getStatus()
      
      setTasks(schedulerTasks)
      setStatus(schedulerStatus)
    } catch (error) {
      console.error('Failed to load scheduler data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    try {
      setLoading(true)
      
      const payload = {
        source: 'user_request',
        format: 'excel',
        includeCharts: true,
        categories: ['income', 'expenses', 'savings', 'investments'],
        instructions: `Generate a comprehensive Excel summary of daily finances including:
        - All transactions from the last 24 hours
        - Categorized breakdown (income, expenses, savings, investments)
        - Charts and visualizations
        - Trend analysis
        - Budget vs actual comparison`
      }

      await taskScheduler.createDailyTask(
        newTask.name,
        newTask.description,
        newTask.type,
        payload,
        newTask.duration,
        newTask.timeOfDay,
        {
          priority: newTask.priority,
          notifications: {
            onSuccess: true,
            onFailure: true,
            onCompletion: true
          }
        }
      )

      setShowCreateModal(false)
      setNewTask({
        name: '',
        description: '',
        type: 'data_extraction',
        frequency: 'daily',
        timeOfDay: '09:00',
        duration: { days: 31 },
        priority: 'medium'
      })
      
      await loadData()
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseTask = async (taskId: string) => {
    try {
      await taskScheduler.pauseTask(taskId)
      await loadData()
    } catch (error) {
      console.error('Failed to pause task:', error)
    }
  }

  const handleResumeTask = async (taskId: string) => {
    try {
      await taskScheduler.resumeTask(taskId)
      await loadData()
    } catch (error) {
      console.error('Failed to resume task:', error)
    }
  }

  const handleCancelTask = async (taskId: string) => {
    try {
      await taskScheduler.cancelTask(taskId)
      await loadData()
    } catch (error) {
      console.error('Failed to cancel task:', error)
    }
  }

  const handleViewDetails = (task: ScheduledTask) => {
    setSelectedTask(task)
    setShowDetailsModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const formatDuration = (duration: { days?: number; weeks?: number; months?: number; years?: number }) => {
    if (duration.days) return `${duration.days} day${duration.days > 1 ? 's' : ''}`
    if (duration.weeks) return `${duration.weeks} week${duration.weeks > 1 ? 's' : ''}`
    if (duration.months) return `${duration.months} month${duration.months > 1 ? 's' : ''}`
    if (duration.years) return `${duration.years} year${duration.years > 1 ? 's' : ''}`
    return 'N/A'
  }

  if (loading && tasks.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Scheduler</h2>
          <p className="text-gray-600">Manage long-term scheduled tasks and automation</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Scheduled Task
        </Button>
      </div>

      {/* Status Overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900">{status.totalTasks}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active Tasks</div>
            <div className="text-2xl font-bold text-green-600">{status.activeTasks}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Executions</div>
            <div className="text-2xl font-bold text-blue-600">{status.totalExecutions}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">
              {status.totalExecutions > 0 
                ? Math.round((status.successfulExecutions / status.totalExecutions) * 100)
                : 0}%
            </div>
          </Card>
        </div>
      )}

      {/* Debug/Test Section */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug & Testing</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={async () => {
              console.log('🔍 Checking existing task data...')
              checkExistingTaskData()
            }}
            variant="outline"
            size="sm"
          >
            Check Stored Data
          </Button>
          <Button
            onClick={async () => {
              console.log('🧪 Running persistence test...')
              const result = await testTaskPersistence()
              console.log('Test result:', result)
            }}
            variant="outline"
            size="sm"
          >
            Test Persistence
          </Button>
          <Button
            onClick={() => {
              console.log('🔧 Running scheduler debug...')
              taskScheduler.debug()
            }}
            variant="outline"
            size="sm"
          >
            Debug Scheduler
          </Button>
          <Button
            onClick={async () => {
              console.log('🔄 Reloading data...')
              await loadData()
            }}
            variant="outline"
            size="sm"
          >
            Reload Data
          </Button>
        </div>
      </Card>

      {/* Finance Example */}
      <FinanceSchedulerExample />

      {/* Tasks List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Tasks</h3>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No scheduled tasks found. Create your first task to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Next: {formatDate(task.nextExecution)}</span>
                      <span>Last: {formatDate(task.lastExecuted)}</span>
                      <span>Executions: {task.totalExecutions}</span>
                      <span>Success: {task.successfulExecutions}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(task)}
                    >
                      Details
                    </Button>
                    {task.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseTask(task.id)}
                      >
                        Pause
                      </Button>
                    )}
                    {task.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResumeTask(task.id)}
                      >
                        Resume
                      </Button>
                    )}
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create Scheduled Task</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <Input
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder="e.g., Daily Finance Summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Describe what this task will do"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Type
            </label>
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value as ScheduledTask['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="data_extraction">Data Extraction</option>
              <option value="vision_analysis">Vision Analysis</option>
              <option value="web_automation">Web Automation</option>
              <option value="content_creation">Content Creation</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Days)
            </label>
            <Input
              type="number"
              value={newTask.duration.days}
              onChange={(e) => setNewTask({ 
                ...newTask, 
                duration: { ...newTask.duration, days: parseInt(e.target.value) || 31 }
              })}
              placeholder="31"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Day
            </label>
            <Input
              type="time"
              value={newTask.timeOfDay}
              onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as ScheduledTask['priority'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.name || !newTask.description}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Task
            </Button>
          </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Task Details Modal */}
      <Modal open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{selectedTask?.name || 'Task Details'}</ModalTitle>
          </ModalHeader>
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Task Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Description:</span> {selectedTask.description}</div>
                <div><span className="font-medium">Type:</span> {selectedTask.type}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <div><span className="font-medium">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div><span className="font-medium">Created:</span> {formatDate(selectedTask.createdAt)}</div>
                <div><span className="font-medium">Next Execution:</span> {formatDate(selectedTask.nextExecution)}</div>
                <div><span className="font-medium">Last Executed:</span> {formatDate(selectedTask.lastExecuted)}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Schedule</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Frequency:</span> {selectedTask.schedule.frequency}</div>
                <div><span className="font-medium">Time:</span> {selectedTask.schedule.timeOfDay}</div>
                <div><span className="font-medium">Start Date:</span> {formatDate(selectedTask.schedule.startDate)}</div>
                <div><span className="font-medium">End Date:</span> {formatDate(selectedTask.schedule.endDate)}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Total Executions:</span> {selectedTask.totalExecutions}</div>
                <div><span className="font-medium">Successful:</span> {selectedTask.successfulExecutions}</div>
                <div><span className="font-medium">Failed:</span> {selectedTask.failedExecutions}</div>
                <div><span className="font-medium">Success Rate:</span> 
                  {selectedTask.totalExecutions > 0 
                    ? Math.round((selectedTask.successfulExecutions / selectedTask.totalExecutions) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            {selectedTask.executionHistory.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recent Executions</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedTask.executionHistory.slice(-5).map((execution) => (
                    <div key={execution.id} className="border border-gray-200 rounded p-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formatDate(execution.executedAt)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          execution.status === 'success' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}>
                          {execution.status}
                        </span>
                      </div>
                      {execution.error && (
                        <div className="text-red-600 text-xs mt-1">{execution.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default TaskSchedulerDashboard
