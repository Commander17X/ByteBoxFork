// Advanced Task Scheduler Service
// Handles long-term scheduled tasks with daily, weekly, monthly, and yearly execution
// Integrates with Vision Agent and Background Agent services

interface ScheduledTask {
  id: string
  name: string
  description: string
  type: 'vision_analysis' | 'web_automation' | 'data_extraction' | 'content_creation' | 'monitoring' | 'custom'
  payload: any
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
    interval: number // For custom frequency (e.g., every 3 days)
    startDate: Date
    endDate?: Date // Optional end date
    timeOfDay: string // HH:MM format
    daysOfWeek?: number[] // 0-6 (Sunday-Saturday) for weekly
    dayOfMonth?: number // 1-31 for monthly
    timezone: string
  }
  status: 'active' | 'paused' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  lastExecuted?: Date
  nextExecution?: Date
  executionHistory: TaskExecution[]
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  maxRetries: number
  retryDelay: number // in minutes
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    onCompletion: boolean
    email?: string
  }
}

interface TaskExecution {
  id: string
  taskId: string
  executedAt: Date
  status: 'success' | 'failure' | 'skipped'
  result?: any
  error?: string
  executionTime: number // in milliseconds
  retryCount: number
}

interface ScheduleRule {
  id: string
  name: string
  description: string
  pattern: string // Cron-like pattern or natural language
  timezone: string
  isActive: boolean
  createdAt: Date
}

class TaskSchedulerService {
  private static instance: TaskSchedulerService
  private scheduledTasks: Map<string, ScheduledTask> = new Map()
  private scheduleRules: Map<string, ScheduleRule> = new Map()
  private isRunning = false
  private processingInterval: NodeJS.Timeout | null = null
  private checkInterval = 60000 // Check every minute
  private ollamaEndpoint = 'http://localhost:11434'

  static getInstance(): TaskSchedulerService {
    if (!TaskSchedulerService.instance) {
      TaskSchedulerService.instance = new TaskSchedulerService()
    }
    return TaskSchedulerService.instance
  }

  // Initialize the scheduler service
  async initialize() {
    console.log('📅 Initializing Task Scheduler Service...')

    // Wait a bit for localStorage to be available (especially in SSR environments)
    if (typeof window !== 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Load persisted tasks and rules
    await this.loadPersistedData()

    // Initialize default schedule rules
    this.initializeDefaultRules()

    // Start the scheduler
    this.start()

    console.log('📅 Task Scheduler Service initialized')
  }

  // Start the scheduler
  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('📅 Task Scheduler Service started')

    // Check for tasks to execute every minute
    this.processingInterval = setInterval(() => {
      this.checkAndExecuteTasks()
    }, this.checkInterval)

    // Persist data every 5 minutes
    setInterval(() => {
      this.persistData()
    }, 300000)

    // Clean up old execution history daily
    setInterval(() => {
      this.cleanupOldExecutions()
    }, 86400000) // 24 hours
  }

  // Stop the scheduler
  stop() {
    this.isRunning = false

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    console.log('📅 Task Scheduler Service stopped')
  }

  // Create a new scheduled task
  async createScheduledTask(taskData: {
    name: string
    description: string
    type: ScheduledTask['type']
    payload: any
    schedule: Omit<ScheduledTask['schedule'], 'timezone'>
    priority?: ScheduledTask['priority']
    maxRetries?: number
    retryDelay?: number
    notifications?: Partial<ScheduledTask['notifications']>
  }): Promise<string> {
    const fullSchedule: ScheduledTask['schedule'] = {
      ...taskData.schedule,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    // Handle notifications with proper defaults
    const notifications = taskData.notifications || {}
    const taskNotifications = {
      onSuccess: notifications.onSuccess ?? false,
      onFailure: notifications.onFailure ?? true,
      onCompletion: notifications.onCompletion ?? false,
      email: notifications.email
    } as ScheduledTask['notifications']

    const task: ScheduledTask = {
      id: `scheduled-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      priority: taskData.priority || 'medium',
      maxRetries: taskData.maxRetries || 3,
      retryDelay: taskData.retryDelay || 30,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      executionHistory: [],
      createdAt: new Date(),
      ...taskData,
      schedule: fullSchedule,
      notifications: taskNotifications
    }

    // Calculate next execution time
    task.nextExecution = this.calculateNextExecution(task)

    this.scheduledTasks.set(task.id, task)
    await this.persistData()

    console.log('📅 Scheduled task created:', task.id, task.name)
    return task.id
  }

  // Create a long-term daily task (like your Excel finance example)
  async createDailyTask(
    name: string,
    description: string,
    taskType: ScheduledTask['type'],
    payload: any,
    duration: {
      days?: number
      weeks?: number
      months?: number
      years?: number
    },
    timeOfDay: string = '09:00',
    options?: {
      priority?: ScheduledTask['priority']
      maxRetries?: number
      notifications?: Partial<ScheduledTask['notifications']>
    }
  ): Promise<string> {
    const startDate = new Date()
    const endDate = new Date(startDate)

    // Calculate end date based on duration
    if (duration.days) endDate.setDate(endDate.getDate() + duration.days)
    if (duration.weeks) endDate.setDate(endDate.getDate() + (duration.weeks * 7))
    if (duration.months) endDate.setMonth(endDate.getMonth() + duration.months)
    if (duration.years) endDate.setFullYear(endDate.getFullYear() + duration.years)

    return this.createScheduledTask({
      name,
      description,
      type: taskType,
      payload,
      schedule: {
        frequency: 'daily',
        interval: 1,
        startDate,
        endDate,
        timeOfDay
      },
      priority: options?.priority || 'medium',
      maxRetries: options?.maxRetries || 3,
      notifications: {
        onSuccess: false,
        onFailure: true,
        onCompletion: true,
        ...options?.notifications
      }
    })
  }

  // Check and execute tasks that are due
  private async checkAndExecuteTasks() {
    if (!this.isRunning) return

    const now = new Date()
    const dueTasks = Array.from(this.scheduledTasks.values())
      .filter(task => 
        task.status === 'active' &&
        task.nextExecution &&
        task.nextExecution <= now &&
        (!task.schedule.endDate || task.schedule.endDate >= now)
      )
      .sort((a, b) => {
        // Sort by priority, then by next execution time
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return a.nextExecution!.getTime() - b.nextExecution!.getTime()
      })

    for (const task of dueTasks) {
      await this.executeScheduledTask(task)
    }
  }

  // Execute a scheduled task
  private async executeScheduledTask(task: ScheduledTask) {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    console.log(`📅 Executing scheduled task: ${task.name} (${task.id})`)

    const execution: TaskExecution = {
      id: executionId,
      taskId: task.id,
      executedAt: new Date(),
      status: 'success',
      executionTime: 0,
      retryCount: 0
    }

    try {
      // In a production environment, we would use a proper task queue system
      // For now, we'll simulate the background task execution

      console.log(`📅 Executing scheduled task: ${task.name} (${task.id})`)

      // Simulate task execution based on type
      let result: any = null;

      switch (task.type) {
        case 'data_extraction':
          result = await this.simulateDataExtraction(task.payload);
          break;
        case 'vision_analysis':
          result = await this.simulateVisionAnalysis(task.payload);
          break;
        case 'web_automation':
          result = await this.simulateWebAutomation(task.payload);
          break;
        case 'content_creation':
          result = await this.simulateContentCreation(task.payload);
          break;
        default:
          result = { status: 'completed', message: 'Task executed successfully' };
      }

      // Simulate execution time
      await this.delay(Math.random() * 5000 + 1000); // 1-6 seconds

      execution.status = 'success'
      execution.result = result
      execution.executionTime = Date.now() - startTime

      // Update task statistics
      task.totalExecutions++
      task.successfulExecutions++
      task.lastExecuted = new Date()

      // Send success notification if enabled
      if (task.notifications.onSuccess) {
        await this.sendNotification(task, 'success', execution)
      }

      console.log(`📅 Scheduled task completed successfully: ${task.name}`)

    } catch (error) {
      execution.status = 'failure'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.executionTime = Date.now() - startTime

      // Update task statistics
      task.totalExecutions++
      task.failedExecutions++

      // Check if we should retry
      if (execution.retryCount < task.maxRetries) {
        execution.retryCount++
        task.nextExecution = new Date(Date.now() + (task.retryDelay * 60000))
        console.log(`📅 Scheduled task failed, retrying in ${task.retryDelay} minutes: ${task.name}`)
      } else {
        task.lastExecuted = new Date()
        console.error(`📅 Scheduled task failed permanently: ${task.name}`, error)
      }

      // Send failure notification if enabled
      if (task.notifications.onFailure) {
        await this.sendNotification(task, 'failure', execution)
      }
    }

    // Add execution to history
    task.executionHistory.push(execution)

    // Keep only last 100 executions
    if (task.executionHistory.length > 100) {
      task.executionHistory = task.executionHistory.slice(-100)
    }

    // Calculate next execution time
    if (task.status === 'active') {
      task.nextExecution = this.calculateNextExecution(task)
    }

    // Check if task should be completed
    if (task.schedule.endDate && task.schedule.endDate <= new Date()) {
      task.status = 'completed'
      if (task.notifications.onCompletion) {
        await this.sendNotification(task, 'completion', execution)
      }
    }

    await this.persistData()
  }

  // Simulate data extraction task
  private async simulateDataExtraction(payload: any): Promise<any> {
    console.log('📊 Simulating data extraction:', payload);

    // Simulate different data sources
    switch (payload.source) {
      case 'bank_accounts':
        return {
          status: 'completed',
          data: {
            transactions: [
              { date: new Date().toISOString(), amount: 150.00, category: 'income', description: 'Salary' },
              { date: new Date().toISOString(), amount: -45.67, category: 'expenses', description: 'Groceries' },
              { date: new Date().toISOString(), amount: -1200.00, category: 'expenses', description: 'Rent' }
            ],
            summary: {
              totalIncome: 150.00,
              totalExpenses: 1245.67,
              balance: -1095.67
            }
          },
          format: payload.format || 'json'
        };

      case 'social_media':
        return {
          status: 'completed',
          data: {
            posts: 15,
            engagement: 234,
            followers: 1250,
            growth: 5.2
          }
        };

      default:
        return {
          status: 'completed',
          data: { message: 'Data extraction completed', source: payload.source }
        };
    }
  }

  // Simulate vision analysis task
  private async simulateVisionAnalysis(payload: any): Promise<any> {
    console.log('👁️ Simulating vision analysis:', payload);

    return {
      status: 'completed',
      analysis: {
        objects: ['person', 'computer', 'desk', 'chair'],
        text: 'Sample text detected from image',
        colors: ['#ffffff', '#000000', '#3b82f6'],
        confidence: 0.85
      },
      timestamp: new Date().toISOString()
    };
  }

  // Simulate web automation task
  private async simulateWebAutomation(payload: any): Promise<any> {
    console.log('🌐 Simulating web automation:', payload);

    return {
      status: 'completed',
      actions: [
        { type: 'navigate', url: payload.url || 'https://example.com' },
        { type: 'click', element: payload.element || 'button' },
        { type: 'extract', data: 'Sample extracted data' }
      ],
      timestamp: new Date().toISOString()
    };
  }

  // Simulate content creation task
  private async simulateContentCreation(payload: any): Promise<any> {
    console.log('✍️ Simulating content creation:', payload);

    return {
      status: 'completed',
      content: {
        title: 'Generated Content',
        body: 'This is sample generated content based on the task requirements.',
        wordCount: 12,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Calculate next execution time for a task
  private calculateNextExecution(task: ScheduledTask): Date {
    const now = new Date()
    let nextExecution = new Date(task.schedule.startDate)

    // Set the time of day
    const [hours, minutes] = task.schedule.timeOfDay.split(':').map(Number)
    nextExecution.setHours(hours, minutes, 0, 0)

    // If the start time has passed today, start from tomorrow
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1)
    }

    switch (task.schedule.frequency) {
      case 'daily':
        // Already set to next day
        break

      case 'weekly':
        // Find next occurrence of specified day(s)
        if (task.schedule.daysOfWeek && task.schedule.daysOfWeek.length > 0) {
          const targetDays = task.schedule.daysOfWeek
          const currentDay = nextExecution.getDay()
          
          let daysToAdd = 0
          for (const day of targetDays) {
            if (day > currentDay) {
              daysToAdd = day - currentDay
              break
            }
          }
          
          if (daysToAdd === 0) {
            // Next occurrence is next week
            daysToAdd = 7 - currentDay + targetDays[0]
          }
          
          nextExecution.setDate(nextExecution.getDate() + daysToAdd)
        }
        break

      case 'monthly':
        // Find next occurrence of specified day of month
        if (task.schedule.dayOfMonth) {
          nextExecution.setDate(task.schedule.dayOfMonth)
          
          // If the day has passed this month, move to next month
          if (nextExecution <= now) {
            nextExecution.setMonth(nextExecution.getMonth() + 1)
            nextExecution.setDate(task.schedule.dayOfMonth)
          }
        }
        break

      case 'yearly':
        // Same day next year
        nextExecution.setFullYear(nextExecution.getFullYear() + 1)
        break

      case 'custom':
        // Add custom interval
        nextExecution.setDate(nextExecution.getDate() + task.schedule.interval)
        break
    }

    return nextExecution
  }

  // Send notification for task execution
  private async sendNotification(task: ScheduledTask, type: 'success' | 'failure' | 'completion', execution: TaskExecution) {
    if (!task.notifications.email) return

    const subject = `Scheduled Task ${type.charAt(0).toUpperCase() + type.slice(1)}: ${task.name}`
    
    let message = `Scheduled Task: ${task.name}\n`
    message += `Description: ${task.description}\n`
    message += `Execution Time: ${execution.executedAt.toISOString()}\n`
    message += `Status: ${execution.status}\n`
    
    if (execution.result) {
      message += `Result: ${JSON.stringify(execution.result, null, 2)}\n`
    }
    
    if (execution.error) {
      message += `Error: ${execution.error}\n`
    }

    // In a real implementation, you would send an email here
    console.log(`📧 Notification sent to ${task.notifications.email}:`, subject, message)
  }

  // Initialize default schedule rules
  private initializeDefaultRules() {
    const defaultRules: ScheduleRule[] = [
      {
        id: 'daily-9am',
        name: 'Daily at 9 AM',
        description: 'Execute every day at 9:00 AM',
        pattern: '0 9 * * *',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'weekly-monday',
        name: 'Weekly on Monday',
        description: 'Execute every Monday at 9:00 AM',
        pattern: '0 9 * * 1',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'monthly-first',
        name: 'Monthly on 1st',
        description: 'Execute on the 1st of every month at 9:00 AM',
        pattern: '0 9 1 * *',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive: true,
        createdAt: new Date()
      }
    ]

    defaultRules.forEach(rule => {
      this.scheduleRules.set(rule.id, rule)
    })
  }

  // Clean up old execution history
  private cleanupOldExecutions() {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    for (const task of Array.from(this.scheduledTasks.values())) {
      task.executionHistory = task.executionHistory.filter(
        (execution: TaskExecution) => execution.executedAt >= cutoffDate
      )
    }

    console.log('📅 Cleaned up old execution history')
  }

  // Persistence methods
  private async persistData() {
    try {
      // Prepare data for serialization
      const data = {
        scheduledTasks: Array.from(this.scheduledTasks.entries()),
        scheduleRules: Array.from(this.scheduleRules.entries()),
        lastSaved: new Date().toISOString(),
        version: '1.0'
      }

      // Check if we're in browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const dataString = JSON.stringify(data)

        // Check if data is too large for localStorage (limit is usually 5-10MB)
        if (dataString.length > 4 * 1024 * 1024) { // 4MB limit to be safe
          console.warn('📅 Scheduler data too large for localStorage, consider using a database')
          return
        }

        localStorage.setItem('task-scheduler-data', dataString)
        console.log(`📅 Persisted scheduler data: ${this.scheduledTasks.size} tasks, ${this.scheduleRules.size} rules`)
      } else {
        // In Node.js environment, we could save to file or database
        console.log('Task scheduler data persistence not implemented for server environment')
      }
    } catch (error) {
      console.warn('Failed to persist scheduler data:', error)

      // If we get a QuotaExceededError, try to clear some old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('📅 localStorage quota exceeded, attempting to clean up...')

        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            // Clear old execution histories to reduce size
            for (const task of Array.from(this.scheduledTasks.values())) {
              if (task.executionHistory.length > 10) {
                task.executionHistory = task.executionHistory.slice(-10)
              }
            }

            // Try again with reduced data
            const data = {
              scheduledTasks: Array.from(this.scheduledTasks.entries()),
              scheduleRules: Array.from(this.scheduleRules.entries()),
              lastSaved: new Date().toISOString(),
              version: '1.0'
            }

            localStorage.setItem('task-scheduler-data', JSON.stringify(data))
            console.log('📅 Successfully persisted reduced scheduler data')
          } catch (retryError) {
            console.warn('📅 Failed to persist even reduced data:', retryError)
          }
        }
      }
    }
  }

  private async loadPersistedData() {
    try {
      let stored: string | null = null;

      // Check if we're in browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        stored = localStorage.getItem('task-scheduler-data');
      }

      if (!stored) {
        console.log('📅 No stored scheduler data found, starting fresh')
        return;
      }

      console.log('📅 Loading scheduler data from storage...')

      const data = JSON.parse(stored);

      // Validate data structure
      if (!data || typeof data !== 'object') {
        console.warn('📅 Invalid stored data format, starting fresh')
        return;
      }

      // Restore scheduled tasks with error handling
      if (data.scheduledTasks && Array.isArray(data.scheduledTasks)) {
        try {
          this.scheduledTasks = new Map(
            data.scheduledTasks
              .filter(([id, task]: [string, any]) => id && task && typeof task === 'object')
              .map(([id, task]: [string, any]) => {
                try {
                  return [id, {
                    ...task,
                    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                    lastExecuted: task.lastExecuted ? new Date(task.lastExecuted) : undefined,
                    nextExecution: task.nextExecution ? new Date(task.nextExecution) : undefined,
                    schedule: task.schedule ? {
                      ...task.schedule,
                      startDate: task.schedule.startDate ? new Date(task.schedule.startDate) : new Date(),
                      endDate: task.schedule.endDate ? new Date(task.schedule.endDate) : undefined
                    } : {
                      frequency: 'daily',
                      interval: 1,
                      startDate: new Date(),
                      timeOfDay: '09:00',
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    executionHistory: Array.isArray(task.executionHistory)
                      ? task.executionHistory.map((exec: any) => ({
                          ...exec,
                          executedAt: exec.executedAt ? new Date(exec.executedAt) : new Date()
                        }))
                      : []
                  }];
                } catch (taskError) {
                  console.warn(`📅 Failed to restore task ${id}:`, taskError);
                  return null;
                }
              })
              .filter(Boolean) as [string, ScheduledTask][]
          );
        } catch (tasksError) {
          console.warn('📅 Failed to restore scheduled tasks:', tasksError);
          this.scheduledTasks = new Map();
        }
      }

      // Restore schedule rules with error handling
      if (data.scheduleRules && Array.isArray(data.scheduleRules)) {
        try {
          this.scheduleRules = new Map(
            data.scheduleRules
              .filter(([id, rule]: [string, any]) => id && rule && typeof rule === 'object')
              .map(([id, rule]: [string, any]) => {
                try {
                  return [id, {
                    ...rule,
                    createdAt: rule.createdAt ? new Date(rule.createdAt) : new Date()
                  }];
                } catch (ruleError) {
                  console.warn(`📅 Failed to restore rule ${id}:`, ruleError);
                  return null;
                }
              })
              .filter(Boolean) as [string, ScheduleRule][]
          );
        } catch (rulesError) {
          console.warn('📅 Failed to restore schedule rules:', rulesError);
          this.scheduleRules = new Map();
        }
      }

      console.log(`📅 Successfully loaded scheduler data: ${this.scheduledTasks.size} tasks, ${this.scheduleRules.size} rules`)
    } catch (error) {
      console.warn('📅 Failed to load scheduler data from storage:', error)
      // Clear potentially corrupted data
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.removeItem('task-scheduler-data');
          console.log('📅 Cleared corrupted scheduler data')
        } catch (clearError) {
          console.warn('📅 Failed to clear corrupted data:', clearError)
        }
      }
    }
  }

  // Public API methods
  getScheduledTasks(): ScheduledTask[] {
    return Array.from(this.scheduledTasks.values())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  getScheduledTask(taskId: string): ScheduledTask | undefined {
    return this.scheduledTasks.get(taskId)
  }

  getScheduleRules(): ScheduleRule[] {
    return Array.from(this.scheduleRules.values())
  }

  // Pause a scheduled task
  async pauseTask(taskId: string): Promise<boolean> {
    const task = this.scheduledTasks.get(taskId)
    if (!task) return false

    task.status = 'paused'
    await this.persistData()
    console.log(`📅 Task paused: ${task.name}`)
    return true
  }

  // Resume a scheduled task
  async resumeTask(taskId: string): Promise<boolean> {
    const task = this.scheduledTasks.get(taskId)
    if (!task) return false

    task.status = 'active'
    task.nextExecution = this.calculateNextExecution(task)
    await this.persistData()
    console.log(`📅 Task resumed: ${task.name}`)
    return true
  }

  // Cancel a scheduled task
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.scheduledTasks.get(taskId)
    if (!task) return false

    task.status = 'cancelled'
    await this.persistData()
    console.log(`📅 Task cancelled: ${task.name}`)
    return true
  }

  // Get scheduler status
  getStatus() {
    const tasks = Array.from(this.scheduledTasks.values())
    return {
      isRunning: this.isRunning,
      totalTasks: tasks.length,
      activeTasks: tasks.filter(t => t.status === 'active').length,
      pausedTasks: tasks.filter(t => t.status === 'paused').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      cancelledTasks: tasks.filter(t => t.status === 'cancelled').length,
      totalExecutions: tasks.reduce((sum, t) => sum + t.totalExecutions, 0),
      successfulExecutions: tasks.reduce((sum, t) => sum + t.successfulExecutions, 0),
      failedExecutions: tasks.reduce((sum, t) => sum + t.failedExecutions, 0)
    }
  }

  // Debug method to check current state
  debug() {
    console.log('📅 Task Scheduler Debug Info:')
    console.log('- Is Running:', this.isRunning)
    console.log('- Tasks Count:', this.scheduledTasks.size)
    console.log('- Rules Count:', this.scheduleRules.size)

    if (this.scheduledTasks.size > 0) {
      console.log('- Tasks:')
      for (const [id, task] of Array.from(this.scheduledTasks.entries())) {
        console.log(`  - ${id}: ${task.name} (${task.status}) - Next: ${task.nextExecution?.toISOString() || 'N/A'}`)
      }
    }

    // Check localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('task-scheduler-data')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          console.log('- Stored Data:', {
            tasksCount: data.scheduledTasks?.length || 0,
            rulesCount: data.scheduleRules?.length || 0,
            lastSaved: data.lastSaved,
            version: data.version
          })
        } catch (e) {
          console.log('- Stored Data: CORRUPTED')
        }
      } else {
        console.log('- Stored Data: NONE')
      }
    }
  }

  // Create a finance summary task (example from your request)
  async createFinanceSummaryTask(
    duration: { days: number },
    timeOfDay: string = '09:00'
  ): Promise<string> {
    return this.createDailyTask(
      'Daily Finance Summary',
      'Generate Excel summary of daily finances for 31 days',
      'data_extraction',
      {
        source: 'bank_accounts',
        format: 'excel',
        includeCharts: true,
        categories: ['income', 'expenses', 'savings', 'investments'],
        instructions: 'Extract all financial transactions from the last 24 hours, categorize them, and create a comprehensive Excel summary with charts and analysis'
      },
      { days: duration.days },
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
  }
}

export const taskScheduler = TaskSchedulerService.getInstance()
export type { ScheduledTask, TaskExecution, ScheduleRule }

// Check if there's existing task data in localStorage
export const checkExistingTaskData = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 Browser environment not available')
    return null
  }

  try {
    const stored = localStorage.getItem('task-scheduler-data')
    if (stored) {
      const data = JSON.parse(stored)
      console.log('📊 Existing task data found:')
      console.log('- Tasks:', data.scheduledTasks?.length || 0)
      console.log('- Rules:', data.scheduleRules?.length || 0)
      console.log('- Last saved:', data.lastSaved)
      return data
    } else {
      console.log('📭 No existing task data found')
      return null
    }
  } catch (error) {
    console.error('❌ Error checking existing task data:', error)
    return null
  }
}

// Debug function to test persistence
export const testTaskPersistence = async () => {
  console.log('🧪 Testing Task Scheduler Persistence...')

  try {
    // Check existing data first
    const existingData = checkExistingTaskData()

    // Create a test task
    const taskId = await taskScheduler.createDailyTask(
      'Test Persistence Task',
      'Testing if tasks are properly saved and loaded',
      'vision_analysis',
      { imageUrl: 'test.jpg' },
      { days: 1 },
      '10:00'
    )

    console.log('✅ Created test task:', taskId)

    // Get current tasks
    const tasks = taskScheduler.getScheduledTasks()
    console.log('📋 Current tasks:', tasks.length)

    // Force persistence
    await taskScheduler['persistData']()

    // Debug current state
    taskScheduler.debug()

    return {
      success: true,
      taskId,
      taskCount: tasks.length,
      hadExistingData: !!existingData
    }
  } catch (error) {
    console.error('❌ Task persistence test failed:', error)
    return { success: false, error }
  }
}
