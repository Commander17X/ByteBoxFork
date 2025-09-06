// Vision-Capable Autonomous Agent Service
// Uses LLMs with vision capabilities to perform human-like tasks

interface VisionTask {
  id: string
  type: 'visual_analysis' | 'web_interaction' | 'data_extraction' | 'content_creation' | 'automation'
  description: string
  payload: {
    imageUrl?: string
    screenshot?: string
    targetUrl?: string
    instructions: string
    context?: any
    expectedOutcome?: string
  }
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

interface VisionAgent {
  id: string
  name: string
  type: 'general_purpose' | 'web_automation' | 'content_analysis' | 'data_processing'
  capabilities: string[]
  isActive: boolean
  currentTask?: string
  taskHistory: VisionTask[]
  performance: {
    tasksCompleted: number
    successRate: number
    averageExecutionTime: number
  }
}

interface VisionCapabilities {
  imageAnalysis: boolean
  webScreenshot: boolean
  textExtraction: boolean
  formInteraction: boolean
  navigation: boolean
  dataProcessing: boolean
  contentGeneration: boolean
}

class VisionAgentService {
  private static instance: VisionAgentService
  private agents: Map<string, VisionAgent> = new Map()
  private tasks: Map<string, VisionTask> = new Map()
  private isRunning = false
  private ollamaEndpoint = 'http://localhost:11434'

  static getInstance(): VisionAgentService {
    if (!VisionAgentService.instance) {
      VisionAgentService.instance = new VisionAgentService()
    }
    return VisionAgentService.instance
  }

  // Initialize vision agents with different specializations
  initialize() {
    const defaultAgents: VisionAgent[] = [
      {
        id: 'vision-general',
        name: 'General Purpose Vision Agent',
        type: 'general_purpose',
        capabilities: [
          'image_analysis',
          'web_screenshot',
          'text_extraction',
          'form_interaction',
          'navigation',
          'data_processing',
          'content_generation'
        ],
        isActive: true,
        taskHistory: [],
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageExecutionTime: 0
        }
      },
      {
        id: 'vision-web',
        name: 'Web Automation Vision Agent',
        type: 'web_automation',
        capabilities: [
          'web_screenshot',
          'form_interaction',
          'navigation',
          'data_extraction',
          'button_clicking',
          'text_input'
        ],
        isActive: true,
        taskHistory: [],
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageExecutionTime: 0
        }
      },
      {
        id: 'vision-content',
        name: 'Content Analysis Vision Agent',
        type: 'content_analysis',
        capabilities: [
          'image_analysis',
          'text_extraction',
          'content_generation',
          'data_processing',
          'sentiment_analysis',
          'classification'
        ],
        isActive: true,
        taskHistory: [],
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageExecutionTime: 0
        }
      }
    ]

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent)
    })

    console.log('🤖 Vision agents initialized:', this.agents.size)
  }

  // Start the vision agent service
  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🤖 Vision Agent Service started')

    // Process pending tasks every 5 seconds
    setInterval(() => {
      this.processPendingTasks()
    }, 5000)

    // Clean up old tasks every hour
    setInterval(() => {
      this.cleanupOldTasks()
    }, 3600000)
  }

  // Stop the vision agent service
  stop() {
    this.isRunning = false
    console.log('🤖 Vision Agent Service stopped')
  }

  // Create a new vision task
  async createTask(taskData: Omit<VisionTask, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const task: VisionTask = {
      id: `vision-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
      ...taskData
    }

    this.tasks.set(task.id, task)
    console.log('🤖 Vision task created:', task.id, task.description)

    // Immediately try to process if agents are available
    this.processPendingTasks()

    return task.id
  }

  // Process pending tasks
  private async processPendingTasks() {
    if (!this.isRunning) return

    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    for (const task of pendingTasks) {
      const availableAgent = this.findBestAgent(task)
      if (availableAgent) {
        await this.executeTask(task, availableAgent)
      }
    }
  }

  // Find the best agent for a task based on capabilities
  private findBestAgent(task: VisionTask): VisionAgent | null {
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

    // Return the highest scoring agent
    scoredAgents.sort((a, b) => b.score - a.score)
    return scoredAgents[0]?.agent || null
  }

  // Get required capabilities for a task type
  private getRequiredCapabilities(taskType: VisionTask['type']): string[] {
    const capabilityMap = {
      'visual_analysis': ['image_analysis', 'text_extraction'],
      'web_interaction': ['web_screenshot', 'form_interaction', 'navigation'],
      'data_extraction': ['text_extraction', 'data_processing'],
      'content_creation': ['content_generation', 'text_extraction'],
      'automation': ['web_screenshot', 'form_interaction', 'navigation', 'button_clicking']
    }

    return capabilityMap[taskType] || []
  }

  // Execute a task with a specific agent
  private async executeTask(task: VisionTask, agent: VisionAgent) {
    task.status = 'running'
    task.startedAt = new Date()
    agent.currentTask = task.id

    console.log(`🤖 Agent ${agent.name} executing task: ${task.description}`)

    try {
      let result: any

      switch (task.type) {
        case 'visual_analysis':
          result = await this.performVisualAnalysis(task, agent)
          break
        case 'web_interaction':
          result = await this.performWebInteraction(task, agent)
          break
        case 'data_extraction':
          result = await this.performDataExtraction(task, agent)
          break
        case 'content_creation':
          result = await this.performContentCreation(task, agent)
          break
        case 'automation':
          result = await this.performAutomation(task, agent)
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

      console.log(`🤖 Task completed successfully: ${task.id}`)

    } catch (error) {
      // Mark task as failed
      task.status = 'failed'
      task.completedAt = new Date()
      task.error = error instanceof Error ? error.message : 'Unknown error'

      // Update agent performance
      this.updateAgentPerformance(agent, false, task.startedAt!, task.completedAt!)

      console.error(`🤖 Task failed: ${task.id}`, error)
    } finally {
      agent.currentTask = undefined
    }
  }

  // Perform visual analysis using LLM with vision
  private async performVisualAnalysis(task: VisionTask, agent: VisionAgent): Promise<any> {
    const { imageUrl, screenshot, instructions, context } = task.payload

    // Get image data (either from URL or screenshot)
    let imageData: string
    if (screenshot) {
      imageData = screenshot
    } else if (imageUrl) {
      // Convert image URL to base64
      imageData = await this.urlToBase64(imageUrl)
    } else {
      throw new Error('No image data provided for visual analysis')
    }

    // Create prompt for vision model
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

    // Call Ollama with vision model
    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llava:7b', // Vision-capable model
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
      throw new Error(`Vision analysis failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      analysis: data.response,
      model: 'llava:7b',
      timestamp: new Date().toISOString()
    }
  }

  // Perform web interaction tasks
  private async performWebInteraction(task: VisionTask, agent: VisionAgent): Promise<any> {
    const { targetUrl, instructions, context } = task.payload

    if (!targetUrl) {
      throw new Error('Target URL is required for web interaction')
    }

    // Take screenshot of the target page
    const screenshot = await this.takeWebScreenshot(targetUrl)
    
    // Analyze the page and determine actions
    const analysisPrompt = `You are a web automation expert. Analyze this webpage screenshot and determine what actions need to be taken based on these instructions:

${instructions}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}

Please identify:
1. Key elements on the page (buttons, forms, links, etc.)
2. The sequence of actions needed to complete the task
3. Any data that needs to be extracted or input
4. Potential obstacles or challenges

Provide a detailed action plan with specific steps.`

    const analysisResponse = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llava:7b',
        prompt: analysisPrompt,
        images: [screenshot],
        stream: false,
        options: {
          temperature: 0.1,
          max_tokens: 1500
        }
      })
    })

    if (!analysisResponse.ok) {
      throw new Error(`Web analysis failed: ${analysisResponse.statusText}`)
    }

    const analysisData = await analysisResponse.json()

    // Execute the determined actions (simplified for now)
    const actions = await this.executeWebActions(targetUrl, analysisData.response)

    return {
      analysis: analysisData.response,
      actions: actions,
      screenshot: screenshot,
      timestamp: new Date().toISOString()
    }
  }

  // Perform data extraction tasks
  private async performDataExtraction(task: VisionTask, agent: VisionAgent): Promise<any> {
    const { imageUrl, screenshot, instructions, context } = task.payload

    let imageData: string
    if (screenshot) {
      imageData = screenshot
    } else if (imageUrl) {
      imageData = await this.urlToBase64(imageUrl)
    } else {
      throw new Error('No image data provided for data extraction')
    }

    const prompt = `You are a data extraction specialist. Extract all relevant data from this image based on these instructions:

${instructions}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}

Please extract:
1. All text content (tables, lists, paragraphs, etc.)
2. Structured data (if any)
3. Key metrics or numbers
4. Any specific information requested

Format the extracted data as structured JSON when possible.`

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
          temperature: 0.0,
          max_tokens: 2000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Data extraction failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Try to parse as JSON, fallback to text
    let extractedData
    try {
      extractedData = JSON.parse(data.response)
    } catch {
      extractedData = {
        raw_text: data.response,
        extracted_at: new Date().toISOString()
      }
    }

    return {
      data: extractedData,
      model: 'llava:7b',
      timestamp: new Date().toISOString()
    }
  }

  // Perform content creation tasks
  private async performContentCreation(task: VisionTask, agent: VisionAgent): Promise<any> {
    const { imageUrl, screenshot, instructions, context } = task.payload

    let imageData: string | undefined
    if (screenshot) {
      imageData = screenshot
    } else if (imageUrl) {
      imageData = await this.urlToBase64(imageUrl)
    }

    const prompt = `You are a creative content specialist. Create content based on these instructions:

${instructions}

${imageData ? 'Use the provided image as reference or inspiration.' : ''}
${context ? `Additional context: ${JSON.stringify(context)}` : ''}

Please create high-quality, engaging content that meets the requirements. Be creative and professional.`

    const requestBody: any = {
      model: 'deepseek-r1:1.5b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 2000
      }
    }

    if (imageData) {
      requestBody.images = [imageData]
      requestBody.model = 'llava:7b'
    }

    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Content creation failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.response,
      model: imageData ? 'llava:7b' : 'deepseek-r1:1.5b',
      timestamp: new Date().toISOString()
    }
  }

  // Perform automation tasks
  private async performAutomation(task: VisionTask, agent: VisionAgent): Promise<any> {
    // This would integrate with browser automation tools
    // For now, we'll simulate the process
    const { targetUrl, instructions, context } = task.payload

    console.log(`🤖 Automation task: ${instructions} on ${targetUrl}`)

    // Take screenshot
    const screenshot = await this.takeWebScreenshot(targetUrl || '')

    // Analyze and plan actions
    const analysis = await this.performVisualAnalysis({
      ...task,
      payload: {
        ...task.payload,
        screenshot,
        instructions: `Analyze this webpage and create an automation plan for: ${instructions}`
      }
    }, agent)

    // Simulate action execution
    const actions = [
      { type: 'navigate', target: targetUrl },
      { type: 'analyze', result: analysis.analysis },
      { type: 'execute', status: 'completed' }
    ]

    return {
      actions,
      analysis: analysis.analysis,
      screenshot,
      timestamp: new Date().toISOString()
    }
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
          resolve(base64.split(',')[1]) // Remove data:image/...;base64, prefix
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      throw new Error(`Failed to convert URL to base64: ${error}`)
    }
  }

  private async takeWebScreenshot(url: string): Promise<string> {
    // This would integrate with a headless browser service
    // For now, we'll simulate by taking a screenshot of the current page
    try {
      // Use the browser's built-in screenshot capability
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // This is a simplified approach - in production, you'd use a proper screenshot service
      canvas.width = 1920
      canvas.height = 1080
      
      // Fill with a placeholder for now
      if (ctx) {
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#333'
        ctx.font = '24px Arial'
        ctx.fillText(`Screenshot of: ${url}`, 50, 100)
        ctx.fillText('This would be a real screenshot', 50, 150)
        ctx.fillText('in a production environment', 50, 200)
      }

      return canvas.toDataURL('image/png').split(',')[1]
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`)
    }
  }

  private async executeWebActions(url: string, actionPlan: string): Promise<any[]> {
    // This would integrate with browser automation tools like Playwright or Puppeteer
    // For now, we'll return a simulated result
    return [
      { type: 'navigate', url, status: 'completed' },
      { type: 'analyze', result: actionPlan, status: 'completed' },
      { type: 'execute', status: 'simulated' }
    ]
  }

  private updateAgentPerformance(agent: VisionAgent, success: boolean, startTime: Date, endTime: Date) {
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

    // Add to task history
    const task = this.tasks.get(agent.currentTask || '')
    if (task) {
      agent.taskHistory.push(task)
      // Keep only last 100 tasks
      if (agent.taskHistory.length > 100) {
        agent.taskHistory = agent.taskHistory.slice(-100)
      }
    }
  }

  private cleanupOldTasks() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    
    for (const [taskId, task] of Array.from(this.tasks.entries())) {
      if (task.createdAt < cutoffTime && (task.status === 'completed' || task.status === 'failed')) {
        this.tasks.delete(taskId)
      }
    }
  }

  // Public API methods
  getAgents(): VisionAgent[] {
    return Array.from(this.agents.values())
  }

  getTasks(limit = 50): VisionTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  getTask(taskId: string): VisionTask | undefined {
    return this.tasks.get(taskId)
  }

  getAgent(agentId: string): VisionAgent | undefined {
    return this.agents.get(agentId)
  }

  // Create a simple task for testing
  async createSimpleTask(description: string, instructions: string, imageUrl?: string): Promise<string> {
    return this.createTask({
      type: 'visual_analysis',
      description,
      payload: {
        imageUrl,
        instructions,
        context: { source: 'user_request' }
      }
    })
  }
}

export const visionAgent = VisionAgentService.getInstance()
export type { VisionTask, VisionAgent, VisionCapabilities }
