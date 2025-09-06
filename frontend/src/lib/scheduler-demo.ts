// Task Scheduler Demo
// Demonstrates how to create long-term scheduled tasks

import { taskScheduler } from './task-scheduler'

export const createFinanceSummaryDemo = async () => {
  console.log('📅 Creating Finance Summary Demo Task...')
  
  try {
    // Create a 31-day finance summary task
    const taskId = await taskScheduler.createFinanceSummaryTask(
      { days: 31 }, // Run for 31 days
      '09:00' // Every day at 9 AM
    )
    
    console.log('✅ Finance Summary Task Created:', taskId)
    
    // Get task details
    const task = taskScheduler.getScheduledTask(taskId)
    if (task) {
      console.log('📋 Task Details:', {
        name: task.name,
        description: task.description,
        nextExecution: task.nextExecution,
        totalDuration: `${task.schedule.endDate ? Math.ceil((task.schedule.endDate.getTime() - task.schedule.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'} days`,
        frequency: task.schedule.frequency,
        timeOfDay: task.schedule.timeOfDay
      })
    }
    
    return taskId
  } catch (error) {
    console.error('❌ Failed to create finance summary task:', error)
    throw error
  }
}

export const createCustomDailyTask = async (
  name: string,
  description: string,
  duration: { days: number },
  timeOfDay: string = '09:00'
) => {
  console.log(`📅 Creating Custom Daily Task: ${name}`)
  
  try {
    const taskId = await taskScheduler.createDailyTask(
      name,
      description,
      'data_extraction',
      {
        source: 'custom_request',
        format: 'excel',
        includeCharts: true,
        instructions: `Generate a comprehensive daily report including:
        - Data analysis for the last 24 hours
        - Key metrics and trends
        - Visualizations and charts
        - Actionable insights and recommendations`
      },
      duration,
      timeOfDay,
      {
        priority: 'high',
        notifications: {
          onSuccess: true,
          onFailure: true,
          onCompletion: true
        }
      }
    )
    
    console.log('✅ Custom Daily Task Created:', taskId)
    return taskId
  } catch (error) {
    console.error('❌ Failed to create custom daily task:', error)
    throw error
  }
}

export const createWeeklyReportTask = async () => {
  console.log('📅 Creating Weekly Report Task...')
  
  try {
    const taskId = await taskScheduler.createScheduledTask({
      name: 'Weekly Performance Report',
      description: 'Generate comprehensive weekly performance analysis and reports',
      type: 'data_extraction',
      payload: {
        source: 'performance_metrics',
        format: 'excel',
        includeCharts: true,
        timeRange: 'weekly',
        categories: ['performance', 'productivity', 'goals', 'metrics'],
        instructions: `Generate a comprehensive weekly performance report including:
        - Performance metrics for the past 7 days
        - Productivity analysis and trends
        - Goal progress tracking
        - Comparative analysis with previous weeks
        - Recommendations for improvement
        - Visual charts and graphs`
      },
      schedule: {
        frequency: 'weekly',
        interval: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + (52 * 7 * 24 * 60 * 60 * 1000)), // 52 weeks
        timeOfDay: '08:00',
        daysOfWeek: [1] // Monday
      },
      priority: 'high',
      notifications: {
        onSuccess: true,
        onFailure: true,
        onCompletion: false
      }
    })
    
    console.log('✅ Weekly Report Task Created:', taskId)
    return taskId
  } catch (error) {
    console.error('❌ Failed to create weekly report task:', error)
    throw error
  }
}

export const createMonthlyAnalysisTask = async () => {
  console.log('📅 Creating Monthly Analysis Task...')
  
  try {
    const taskId = await taskScheduler.createScheduledTask({
      name: 'Monthly Business Analysis',
      description: 'Comprehensive monthly business analysis and strategic insights',
      type: 'data_extraction',
      payload: {
        source: 'business_metrics',
        format: 'excel',
        includeCharts: true,
        timeRange: 'monthly',
        categories: ['revenue', 'expenses', 'growth', 'market', 'competition'],
        instructions: `Generate a comprehensive monthly business analysis including:
        - Revenue and expense analysis
        - Growth metrics and trends
        - Market analysis and insights
        - Competitive landscape review
        - Strategic recommendations
        - Financial projections
        - Risk assessment`
      },
      schedule: {
        frequency: 'monthly',
        interval: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + (12 * 30 * 24 * 60 * 60 * 1000)), // 12 months
        timeOfDay: '07:00',
        dayOfMonth: 1 // First day of each month
      },
      priority: 'critical',
      notifications: {
        onSuccess: true,
        onFailure: true,
        onCompletion: true
      }
    })
    
    console.log('✅ Monthly Analysis Task Created:', taskId)
    return taskId
  } catch (error) {
    console.error('❌ Failed to create monthly analysis task:', error)
    throw error
  }
}

export const getSchedulerStatus = () => {
  const status = taskScheduler.getStatus()
  const tasks = taskScheduler.getScheduledTasks()
  
  console.log('📊 Task Scheduler Status:', {
    isRunning: status.isRunning,
    totalTasks: status.totalTasks,
    activeTasks: status.activeTasks,
    totalExecutions: status.totalExecutions,
    successRate: status.totalExecutions > 0 
      ? Math.round((status.successfulExecutions / status.totalExecutions) * 100)
      : 0
  })
  
  console.log('📋 Active Tasks:', tasks
    .filter(task => task.status === 'active')
    .map(task => ({
      name: task.name,
      nextExecution: task.nextExecution,
      frequency: task.schedule.frequency,
      executions: task.totalExecutions
    }))
  )
  
  return { status, tasks }
}

// Demo function to showcase all capabilities
export const runSchedulerDemo = async () => {
  console.log('🚀 Starting Task Scheduler Demo...')
  
  try {
    // Create different types of scheduled tasks
    const financeTask = await createFinanceSummaryDemo()
    const weeklyTask = await createWeeklyReportTask()
    const monthlyTask = await createMonthlyAnalysisTask()
    const customTask = await createCustomDailyTask(
      'Daily Health Metrics',
      'Track and analyze daily health and wellness metrics',
      { days: 90 }, // 3 months
      '06:00' // 6 AM
    )
    
    console.log('✅ All demo tasks created successfully!')
    
    // Show scheduler status
    getSchedulerStatus()
    
    return {
      financeTask,
      weeklyTask,
      monthlyTask,
      customTask
    }
  } catch (error) {
    console.error('❌ Demo failed:', error)
    throw error
  }
}

// Export for use in browser console or other scripts
if (typeof window !== 'undefined') {
  (window as any).schedulerDemo = {
    createFinanceSummaryDemo,
    createCustomDailyTask,
    createWeeklyReportTask,
    createMonthlyAnalysisTask,
    getSchedulerStatus,
    runSchedulerDemo
  }
}
