'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Calendar, DollarSign, FileSpreadsheet, Clock } from 'lucide-react'

interface FinanceSchedulerExampleProps {
  className?: string
}

const FinanceSchedulerExample: React.FC<FinanceSchedulerExampleProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false)
  const [taskCreated, setTaskCreated] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    days: 31,
    timeOfDay: '09:00',
    priority: 'high' as 'low' | 'medium' | 'high' | 'critical'
  })

  const handleCreateFinanceTask = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/task-scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'createFinanceSummary',
          days: formData.days,
          timeOfDay: formData.timeOfDay,
          priority: formData.priority
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setTaskId(result.data.taskId)
        setTaskCreated(true)
      } else {
        console.error('Failed to create finance task:', result.error)
      }
    } catch (error) {
      console.error('Error creating finance task:', error)
    } finally {
      setLoading(false)
    }
  }

  if (taskCreated && taskId) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Finance Summary Task Created!</h3>
          <p className="text-gray-600 mb-4">
            Your daily finance summary task has been scheduled successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-2">
                <span>Task ID:</span>
                <span className="font-mono text-xs">{taskId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Duration:</span>
                <span>{formData.days} days</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Time:</span>
                <span>{formData.timeOfDay}</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span className="capitalize">{formData.priority}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            The task will run every day at {formData.timeOfDay} for {formData.days} days, 
            generating Excel summaries of your daily finances.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Finance Summary</h3>
          <p className="text-sm text-gray-600">Schedule automated Excel finance reports</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Days)
          </label>
          <Input
            type="number"
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 31 })}
            placeholder="31"
            min="1"
            max="365"
          />
          <p className="text-xs text-gray-500 mt-1">
            How many days should the task run? (1-365 days)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time of Day
          </label>
          <Input
            type="time"
            value={formData.timeOfDay}
            onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            What time should the summary be generated each day?
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What this task will do:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Extract all financial transactions from the last 24 hours</li>
            <li>• Categorize transactions (income, expenses, savings, investments)</li>
            <li>• Generate comprehensive Excel summary with charts</li>
            <li>• Include trend analysis and budget comparisons</li>
            <li>• Run automatically every day at the specified time</li>
          </ul>
        </div>

        <Button
          onClick={handleCreateFinanceTask}
          disabled={loading || formData.days < 1 || formData.days > 365}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Task...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Finance Summary Task
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

export default FinanceSchedulerExample
