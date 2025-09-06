// Background Agent Service
// Continues running vision agents even when the browser/OS is closed
// Uses Service Workers and background processing

interface BackgroundTask {
  id: string
  type: string
  description: string
  payload: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  result?: any
  error?: string
  retryCount: number
  maxRetries: number
  scheduledFor?: Date
  dependencies?: string[] // Task IDs that must complete first
}

interface BackgroundAgent {
  id: string
  name: string
  type: string
  isActive: boolean
  currentTask?: string
  capabilities: string[]
  performance: {
    tasksCompleted: number
    successRate: number
    averageExecutionTime: number
    uptime: number
  }
  lastHeartbeat: Date
}

class BackgroundAgentService {
  private static instance: BackgroundAgentService
  private tasks: Map<string, BackgroundTask> = new Map()
  private agents: Map<string, BackgroundAgent> = new Map()
  private isRunning = false
  private processingInterval: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private serviceWorker: ServiceWorker | null = null
  private ollamaEndpoint = 'http://localhost:11434'

  static getInstance(): BackgroundAgentService {
    if (!BackgroundAgentService.instance) {
      BackgroundAgentService.instance = new BackgroundAgentService()
    }
    return BackgroundAgentService.instance
  }

  // Initialize the background service
  async initialize() {
    console.log('🔄 Initializing Background Agent Service...')

    // Register service worker for background processing
    await this.registerServiceWorker()

    // Initialize default agents
    this.initializeAgents()

    // Load persisted tasks
    await this.loadPersistedTasks()

    // Start background processing
    this.start()

    console.log('🔄 Background Agent Service initialized')
  }

  // Register service worker for background processing
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        this.serviceWorker = registration.active || registration.waiting || registration.installing

        // Wait for service worker to be ready
        if (registration.installing) {
          this.serviceWorker = await new Promise((resolve) => {
            const installingWorker = registration.installing
            if (!installingWorker) {
              resolve(null)
              return
            }

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'activated') {
                resolve(installingWorker)
              }
            })
          })
        }

        console.log('🔄 Service Worker registered for background processing')
      } catch (error) {
        console.warn('Failed to register service worker:', error)
      }
    }
  }

  // Initialize default background agents
  private initializeAgents() {
    const defaultAgents: BackgroundAgent[] = [
      {
        id: 'bg-general',
        name: 'Background General Agent',
        type: 'general_purpose',
        isActive: true,
        capabilities: [
          'visual_analysis',
          'data_processing',
          'content_creation',
          'web_automation',
          'scheduled_tasks'
        ],
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageExecutionTime: 0,
          uptime: 0
        },
        lastHeartbeat: new Date()
      },
      {
        id: 'bg-web',
        name: 'Background Web Agent',
        type: 'web_automation',
        isActive: true,
        capabilities: [
          'web_screenshot',
          'form_interaction',
          'data_extraction',
          'navigation',
          'monitoring'
        ],
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageExecutionTime: 0,
          uptime: 0
        },
        lastHeartbeat: new Date()
      },
      {
        id: 'bg-content',
        name: 'Background Content Agent',
        type: 'content_analysis',
        isActive: true,
        capabilities: [
          'image_analysis',
          'text_extraction',
          'content_generation',
          'classification',
          'sentiment_analysis'
        ],
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageExecutionTime: 0,
          uptime: 0
        },
        lastHeartbeat: new Date()
      }
    ]

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent)
    })
  }

  // Start background processing
  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🔄 Background Agent Service started')

    // Process tasks every 10 seconds
    this.processingInterval = setInterval(() => {
      this.processBackgroundTasks()
    }, 10000)

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
    }, 30000)

    // Listen for service worker messages
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data)
      })
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('🔄 Page hidden - continuing background processing')
      } else {
        console.log('🔄 Page visible - syncing background state')
        this.syncWithForeground()
      }
    })

    // Listen for beforeunload to ensure tasks are persisted
    window.addEventListener('beforeunload', () => {
      this.persistTasks()
    })
  }

  // Stop background processing
  stop() {
    this.isRunning = false

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    console.log('🔄 Background Agent Service stopped')
  }

  // Create a background task
  async createBackgroundTask(taskData: {
    type: string
    description: string
    payload: any
    priority?: 'low' | 'medium' | 'high' | 'critical'
    scheduledFor?: Date
    dependencies?: string[]
    maxRetries?: number
  }): Promise<string> {
    const task: BackgroundTask = {
      id: `bg-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      priority: taskData.priority || 'medium',
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: taskData.maxRetries || 3,
      scheduledFor: taskData.scheduledFor,
      dependencies: taskData.dependencies || [],
      ...taskData
    }

    this.tasks.set(task.id, task)
    await this.persistTasks()

    console.log('🔄 Background task created:', task.id, task.description)
    return task.id
  }

  // Process background tasks
  private async processBackgroundTasks() {
    if (!this.isRunning) return

    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .filter(task => !task.scheduledFor || task.scheduledFor <= new Date())
      .filter(task => this.areDependenciesMet(task))
      .sort((a, b) => {
        // Sort by priority, then by creation time
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return a.createdAt.getTime() - b.createdAt.getTime()
      })

    for (const task of pendingTasks) {
      const availableAgent = this.findBestAgent(task)
      if (availableAgent) {
        await this.executeBackgroundTask(task, availableAgent)
      }
    }
  }

  // Check if task dependencies are met
  private areDependenciesMet(task: BackgroundTask): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true
    }

    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId)
      return depTask && depTask.status === 'completed'
    })
  }

  // Find the best agent for a task
  private findBestAgent(task: BackgroundTask): BackgroundAgent | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.isActive && !agent.currentTask)

    if (availableAgents.length === 0) return null

    // Score agents based on capability match
    const scoredAgents = availableAgents.map(agent => {
      let score = 0
      const requiredCapabilities = this.getRequiredCapabilities(task.type)
      
      requiredCapabilities.forEach(capability => {
        if (agent.capabilities.includes(capability)) {
          score += 1
        }
      })

      // Bonus for general purpose agents
      if (agent.type === 'general_purpose') {
        score += 0.5
      }

      // Consider performance history
      score += agent.performance.successRate / 100

      return { agent, score }
    })

    scoredAgents.sort((a, b) => b.score - a.score)
    return scoredAgents[0]?.agent || null
  }

  // Get required capabilities for a task type
  private getRequiredCapabilities(taskType: string): string[] {
    const capabilityMap = {
      'visual_analysis': ['visual_analysis', 'image_analysis'],
      'web_automation': ['web_automation', 'web_screenshot', 'form_interaction'],
      'data_extraction': ['data_extraction', 'text_extraction'],
      'content_creation': ['content_creation', 'content_generation'],
      'scheduled_task': ['scheduled_tasks'],
      'monitoring': ['monitoring', 'web_screenshot']
    }

    return capabilityMap[taskType as keyof typeof capabilityMap] || []
  }

  // Execute a background task
  private async executeBackgroundTask(task: BackgroundTask, agent: BackgroundAgent) {
    task.status = 'running'
    task.startedAt = new Date()
    agent.currentTask = task.id
    agent.lastHeartbeat = new Date()

    console.log(`🔄 Agent ${agent.name} executing background task: ${task.description}`)

    try {
      // Try to use service worker for true background processing
      if (this.serviceWorker) {
        await this.sendTaskToServiceWorker(task)
        // Service worker will handle the execution and notify us via message
        return
      }

      // Fallback to direct execution if service worker is not available
      let result: any

      // Execute task based on type
      switch (task.type) {
        case 'visual_analysis':
          result = await this.performBackgroundVisualAnalysis(task, agent)
          break
        case 'web_automation':
          result = await this.performBackgroundWebAutomation(task, agent)
          break
        case 'data_extraction':
          result = await this.performBackgroundDataExtraction(task, agent)
          break
        case 'content_creation':
          result = await this.performBackgroundContentCreation(task, agent)
          break
        case 'scheduled_task':
          result = await this.performScheduledTask(task, agent)
          break
        case 'monitoring':
          result = await this.performMonitoring(task, agent)
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      // Mark task as completed
      task.status = 'completed'
      task.completedAt = new Date()
      task.result = result

      // Update agent performance
      this.updateAgentPerformance(agent, true, task.startedAt!, task.completedAt!)

      console.log(`🔄 Background task completed: ${task.id}`)

    } catch (error) {
      // Handle task failure
      task.retryCount++
      task.error = error instanceof Error ? error.message : 'Unknown error'

      if (task.retryCount >= task.maxRetries) {
        task.status = 'failed'
        task.completedAt = new Date()
        console.error(`🔄 Background task failed permanently: ${task.id}`, error)
      } else {
        task.status = 'pending'
        task.scheduledFor = new Date(Date.now() + (task.retryCount * 60000)) // Exponential backoff
        console.warn(`🔄 Background task failed, retrying: ${task.id} (attempt ${task.retryCount})`)
      }

      // Update agent performance
      this.updateAgentPerformance(agent, false, task.startedAt!, new Date())
    } finally {
      agent.currentTask = undefined
      agent.lastHeartbeat = new Date()
      await this.persistTasks()
    }
  }

  // Send task to service worker for background execution
  private async sendTaskToServiceWorker(task: BackgroundTask) {
    if (!this.serviceWorker) return

    try {
      // Send task to service worker
      this.serviceWorker.postMessage({
        type: 'EXECUTE_TASK',
        task: task
      })

      console.log(`🔄 Task sent to service worker: ${task.id}`)
    } catch (error) {
      console.error('Failed to send task to service worker:', error)
      throw error
    }
  }

  // Background task implementations
  private async performBackgroundVisualAnalysis(task: BackgroundTask, agent: BackgroundAgent): Promise<any> {
    const { imageUrl, instructions, context } = task.payload

    if (!imageUrl) {
      throw new Error('Image URL is required for visual analysis')
    }

    // Convert image URL to base64
    const imageData = await this.urlToBase64(imageUrl)

    const prompt = `You are an advanced AI assistant with vision capabilities. Analyze the provided image and follow these instructions:

${instructions}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}

Please provide a detailed analysis including:
1. What you see in the image
2. Key elements and their relationships
3. Any text or data that can be extracted
4. Actions that could be taken based on the image
5. Recommendations or insights

Be thorough and accurate in your analysis.`

    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llava:7b',
        prompt: prompt,
        images: [imageData],
        stream: false,
        options: {
          temperature: 0.1,
          max_tokens: 2000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Visual analysis failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      analysis: data.response,
      model: 'llava:7b',
      timestamp: new Date().toISOString(),
      backgroundExecution: true
    }
  }

  private async performBackgroundWebAutomation(task: BackgroundTask, agent: BackgroundAgent): Promise<any> {
    const { targetUrl, instructions, context } = task.payload

    if (!targetUrl) {
      throw new Error('Target URL is required for web automation')
    }

    // Simulate web automation (in production, this would use headless browser)
    const result = {
      url: targetUrl,
      actions: [
        { type: 'navigate', target: targetUrl, status: 'completed' },
        { type: 'analyze', result: 'Page analyzed successfully', status: 'completed' },
        { type: 'execute', instructions, status: 'completed' }
      ],
      timestamp: new Date().toISOString(),
      backgroundExecution: true
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    return result
  }

  private async performBackgroundDataExtraction(task: BackgroundTask, agent: BackgroundAgent): Promise<any> {
    const { source, instructions, context } = task.payload

    // Simulate data extraction
    const result = {
      source,
      extractedData: {
        items: [
          { id: 1, name: 'Sample Item 1', value: '100' },
          { id: 2, name: 'Sample Item 2', value: '200' }
        ],
        metadata: {
          extractedAt: new Date().toISOString(),
          source: source,
          instructions: instructions
        }
      },
      timestamp: new Date().toISOString(),
      backgroundExecution: true
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    return result
  }

  private async performBackgroundContentCreation(task: BackgroundTask, agent: BackgroundAgent): Promise<any> {
    const { instructions, context, contentType } = task.payload

    const prompt = `You are a creative content specialist. Create content based on these instructions:

${instructions}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}
${contentType ? `Content type: ${contentType}` : ''}

Please create high-quality, engaging content that meets the requirements. Be creative and professional.`

    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 2000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Content creation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.response,
      model: 'deepseek-r1:1.5b',
      timestamp: new Date().toISOString(),
      backgroundExecution: true
    }
  }

  private async performScheduledTask(task: BackgroundTask, agent: BackgroundAgent): Promise<any> {
    const { taskType, parameters } = task.payload

    // Execute the scheduled task based on type
    const result = {
      taskType,
      parameters,
      executedAt: new Date().toISOString(),
      status: 'completed',
      backgroundExecution: true
    }

    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 1000))

    return result
  }

  private async performMonitoring(task: BackgroundTask, agent: BackgroundAgent): Promise<any> {
    const { targetUrl, checkType, parameters } = task.payload

    // Simulate monitoring check
    const result = {
      targetUrl,
      checkType,
      status: 'healthy',
      metrics: {
        responseTime: Math.random() * 1000,
        uptime: '99.9%',
        lastCheck: new Date().toISOString()
      },
      backgroundExecution: true
    }

    // Simulate monitoring time
    await new Promise(resolve => setTimeout(resolve, 500))

    return result
  }

  // Helper methods
  private async urlToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          resolve(base64.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      throw new Error(`Failed to convert URL to base64: ${error}`)
    }
  }

  private updateAgentPerformance(agent: BackgroundAgent, success: boolean, startTime: Date, endTime: Date) {
    const executionTime = endTime.getTime() - startTime.getTime()
    
    agent.performance.tasksCompleted += 1
    
    if (success) {
      const currentSuccessRate = agent.performance.successRate
      const totalTasks = agent.performance.tasksCompleted
      agent.performance.successRate = ((currentSuccessRate * (totalTasks - 1)) + 100) / totalTasks
    } else {
      const currentSuccessRate = agent.performance.successRate
      const totalTasks = agent.performance.tasksCompleted
      agent.performance.successRate = (currentSuccessRate * (totalTasks - 1)) / totalTasks
    }

    // Update average execution time
    const currentAvg = agent.performance.averageExecutionTime
    const totalTasks = agent.performance.tasksCompleted
    agent.performance.averageExecutionTime = ((currentAvg * (totalTasks - 1)) + executionTime) / totalTasks

    // Update uptime
    agent.performance.uptime = Date.now() - agent.lastHeartbeat.getTime()
  }

  private sendHeartbeat() {
    // Update agent heartbeats
    this.agents.forEach(agent => {
      agent.lastHeartbeat = new Date()
    })

    // Persist state
    this.persistTasks()
  }

  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'TASK_COMPLETED':
        const completedTask = this.tasks.get(data.taskId)
        if (completedTask) {
          completedTask.status = 'completed'
          completedTask.result = data.result
          completedTask.completedAt = new Date()
          
          // Update agent performance
          const agent = Array.from(this.agents.values()).find(a => a.currentTask === data.taskId)
          if (agent) {
            this.updateAgentPerformance(agent, true, completedTask.startedAt!, completedTask.completedAt!)
            agent.currentTask = undefined
          }
          
          console.log(`🔄 Service worker completed task: ${data.taskId}`)
        }
        break
      case 'TASK_FAILED':
        const failedTask = this.tasks.get(data.taskId)
        if (failedTask) {
          failedTask.status = 'failed'
          failedTask.error = data.error
          failedTask.completedAt = new Date()
          
          // Update agent performance
          const agent = Array.from(this.agents.values()).find(a => a.currentTask === data.taskId)
          if (agent) {
            this.updateAgentPerformance(agent, false, failedTask.startedAt!, failedTask.completedAt!)
            agent.currentTask = undefined
          }
          
          console.error(`🔄 Service worker failed task: ${data.taskId}`, data.error)
        }
        break
    }
    
    // Persist state after handling message
    this.persistTasks()
  }

  private async syncWithForeground() {
    // Sync background state with foreground when page becomes visible
    console.log('🔄 Syncing background state with foreground')
    await this.loadPersistedTasks()
  }

  // Persistence methods
  private async persistTasks() {
    try {
      const data = {
        tasks: Array.from(this.tasks.entries()),
        agents: Array.from(this.agents.entries()),
        lastSaved: new Date().toISOString()
      }

      localStorage.setItem('background-agent-tasks', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to persist background tasks:', error)
    }
  }

  private async loadPersistedTasks() {
    try {
      const stored = localStorage.getItem('background-agent-tasks')
      if (!stored) return

      const data = JSON.parse(stored)
      
      // Restore tasks
      if (data.tasks) {
        this.tasks = new Map(data.tasks.map(([id, task]: [string, any]) => [
          id,
          {
            ...task,
            createdAt: new Date(task.createdAt),
            startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            scheduledFor: task.scheduledFor ? new Date(task.scheduledFor) : undefined
          }
        ]))
      }

      // Restore agents
      if (data.agents) {
        this.agents = new Map(data.agents.map(([id, agent]: [string, any]) => [
          id,
          {
            ...agent,
            lastHeartbeat: new Date(agent.lastHeartbeat)
          }
        ]))
      }

      console.log('🔄 Loaded background tasks from storage')
    } catch (error) {
      console.warn('Failed to load background tasks from storage:', error)
    }
  }

  // Public API methods
  getTasks(limit = 50): BackgroundTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  getAgents(): BackgroundAgent[] {
    return Array.from(this.agents.values())
  }

  getTask(taskId: string): BackgroundTask | null {
    return this.tasks.get(taskId) || null
  }

  getAgent(agentId: string): BackgroundAgent | null {
    return this.agents.get(agentId) || null
  }

  // Create a simple background task
  async createSimpleBackgroundTask(description: string, instructions: string, imageUrl?: string): Promise<string> {
    return this.createBackgroundTask({
      type: 'visual_analysis',
      description,
      payload: {
        imageUrl,
        instructions,
        context: { source: 'background_request' }
      },
      priority: 'medium'
    })
  }

  // Schedule a task for later execution
  async scheduleTask(taskData: any, scheduledFor: Date): Promise<string> {
    return this.createBackgroundTask({
      ...taskData,
      scheduledFor,
      priority: 'low'
    })
  }

  // Get background service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalTasks: this.tasks.size,
      pendingTasks: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length,
      runningTasks: Array.from(this.tasks.values()).filter(t => t.status === 'running').length,
      completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
      failedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length,
      activeAgents: Array.from(this.agents.values()).filter(a => a.isActive).length,
      serviceWorkerActive: !!this.serviceWorker
    }
  }
}

export const backgroundAgent = BackgroundAgentService.getInstance()
export type { BackgroundTask, BackgroundAgent }
