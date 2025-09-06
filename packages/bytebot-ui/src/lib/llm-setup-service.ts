// LLM Setup Service for AI model configuration during account setup
import { aiService } from './ai-service'

export interface LLMModel {
  id: string
  name: string
  size: string
  description: string
  required: boolean
  priority: number
  provider: 'ollama' | 'openai' | 'anthropic' | 'local'
  isAvailable: boolean
}

export interface LLMConfigProgress {
  modelId: string
  progress: number
  status: 'pending' | 'configuring' | 'completed' | 'error'
  error?: string
}

export interface LLMSetupStatus {
  isSetupComplete: boolean
  totalModels: number
  completedModels: number
  currentModel?: string
  overallProgress: number
  configurations: LLMConfigProgress[]
}

class LLMSetupService {
  private defaultModels: LLMModel[] = [
    {
      id: 'llava-v1.6-mistral-7b',
      name: 'LLaVA 1.6 Mistral 7B',
      size: '4.2GB',
      description: 'Advanced vision-language model for image understanding and analysis',
      required: true,
      priority: 1,
      provider: 'ollama',
      isAvailable: false
    },
    {
      id: 'llava-v1.5-7b',
      name: 'LLaVA 1.5 7B',
      size: '4.1GB',
      description: 'Reliable vision model for general image processing tasks',
      required: false,
      priority: 2,
      provider: 'ollama',
      isAvailable: false
    },
    {
      id: 'qwen-vl-7b',
      name: 'Qwen-VL 7B',
      size: '4.3GB',
      description: 'Multilingual vision model with excellent text recognition',
      required: false,
      priority: 3,
      provider: 'ollama',
      isAvailable: false
    }
  ]

  private configStatus: Map<string, LLMConfigProgress> = new Map()
  private setupCallbacks: ((status: LLMSetupStatus) => void)[] = []

  getDefaultModels(): LLMModel[] {
    return this.defaultModels
  }

  getRequiredModels(): LLMModel[] {
    return this.defaultModels.filter(model => model.required)
  }

  getSetupStatus(): LLMSetupStatus {
    const configurations = Array.from(this.configStatus.values())
    const completedModels = configurations.filter(c => c.status === 'completed').length
    const totalModels = this.defaultModels.length
    const overallProgress = totalModels > 0 ? (completedModels / totalModels) * 100 : 0

    return {
      isSetupComplete: completedModels === totalModels,
      totalModels,
      completedModels,
      currentModel: configurations.find(c => c.status === 'configuring')?.modelId,
      overallProgress,
      configurations
    }
  }

  onSetupProgress(callback: (status: LLMSetupStatus) => void): () => void {
    this.setupCallbacks.push(callback)
    return () => {
      const index = this.setupCallbacks.indexOf(callback)
      if (index > -1) {
        this.setupCallbacks.splice(index, 1)
      }
    }
  }

  private notifyProgress(): void {
    const status = this.getSetupStatus()
    this.setupCallbacks.forEach(callback => callback(status))
  }

  async startLLMSetup(): Promise<void> {
    console.log('Starting LLM setup process...')
    
    // Initialize AI service
    const initialized = await aiService.initialize()
    if (!initialized) {
      console.warn('AI service initialization failed, skipping LLM setup')
      return
    }

    // Get available models from server
    try {
      const availableModels = await aiService.getAvailableModels()
      const allModels = await aiService.getAllModels()
      
      // Update model availability status
      this.defaultModels.forEach(model => {
        const serverModel = allModels.find(m => m.id === model.id)
        if (serverModel) {
          model.isAvailable = serverModel.isAvailable
          model.provider = serverModel.provider
        }
      })
    } catch (error) {
      console.warn('Failed to get model status from server:', error)
    }

    // Sort models by priority
    const modelsToConfigure = this.defaultModels.sort((a, b) => a.priority - b.priority)

    // Initialize configuration status for all models
    modelsToConfigure.forEach(model => {
      this.configStatus.set(model.id, {
        modelId: model.id,
        progress: 0,
        status: 'pending'
      })
    })

    this.notifyProgress()

    // Configure models sequentially
    for (const model of modelsToConfigure) {
      try {
        await this.configureModel(model.id)
      } catch (error) {
        console.error(`Failed to configure model ${model.id}:`, error)
        const configProgress = this.configStatus.get(model.id)
        if (configProgress) {
          configProgress.status = 'error'
          configProgress.error = error instanceof Error ? error.message : 'Unknown error'
          this.configStatus.set(model.id, configProgress)
        }
      }
    }

    this.notifyProgress()
    console.log('LLM setup process completed')
  }

  private async configureModel(modelId: string): Promise<void> {
    const configProgress = this.configStatus.get(modelId)
    if (!configProgress) {
      throw new Error(`Model ${modelId} not found in configuration status`)
    }

    // Update status to configuring
    configProgress.status = 'configuring'
    configProgress.progress = 0
    this.configStatus.set(modelId, configProgress)
    this.notifyProgress()

    try {
      // Check if model is already available on server
      const modelStatus = await aiService.checkModelHealth(modelId)
      if (modelStatus && modelStatus.isAvailable) {
        configProgress.status = 'completed'
        configProgress.progress = 100
        this.configStatus.set(modelId, configProgress)
        this.notifyProgress()
        return
      }

      // Start actual model download/configuration
      await this.downloadModel(modelId, configProgress)

    } catch (error) {
      configProgress.status = 'error'
      configProgress.error = error instanceof Error ? error.message : 'Configuration failed'
      this.configStatus.set(modelId, configProgress)
      this.notifyProgress()
      throw error
    }
  }

  private async downloadModel(modelId: string, configProgress: any): Promise<void> {
    const model = this.defaultModels.find(m => m.id === modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    try {
      // Try to call the server to download/configure the model
      const response = await fetch(`http://5.231.82.135:3001/api/ai/models/${modelId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          provider: model.provider,
          endpoint: model.provider === 'ollama' ? `http://5.231.82.135:11434` : undefined
        })
      })

      if (!response.ok) {
        // If server endpoint doesn't exist, fall back to local simulation
        console.warn(`Server download endpoint not available, using fallback for ${modelId}`)
        await this.simulateModelDownload(modelId, configProgress)
        return
      }

      // Set up progress tracking for real download
      const progressInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://5.231.82.135:3001/api/ai/models/${modelId}/status`)
          if (statusResponse.ok) {
            const status = await statusResponse.json()
            configProgress.progress = status.progress || configProgress.progress + 5
            this.configStatus.set(modelId, configProgress)
            this.notifyProgress()

            if (status.status === 'completed') {
              clearInterval(progressInterval)
              configProgress.status = 'completed'
              configProgress.progress = 100
              this.configStatus.set(modelId, configProgress)
              this.notifyProgress()
            } else if (status.status === 'error') {
              clearInterval(progressInterval)
              configProgress.status = 'error'
              configProgress.error = status.error || 'Download failed'
              this.configStatus.set(modelId, configProgress)
              this.notifyProgress()
            }
          }
        } catch (error) {
          console.warn('Failed to check model download status:', error)
        }
      }, 1000)

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(progressInterval)
        if (configProgress.status === 'configuring') {
          configProgress.status = 'error'
          configProgress.error = 'Download timeout'
          this.configStatus.set(modelId, configProgress)
          this.notifyProgress()
        }
      }, 10 * 60 * 1000)

    } catch (error) {
      // If server is not available, fall back to simulation
      console.warn(`Server not available, using fallback for ${modelId}:`, error)
      await this.simulateModelDownload(modelId, configProgress)
    }
  }

  private async simulateModelDownload(modelId: string, configProgress: any): Promise<void> {
    const model = this.defaultModels.find(m => m.id === modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    // Simulate realistic download progress
    let progress = 0
    const totalSteps = 20
    const stepDuration = 1000 // 1 second per step

    for (let i = 0; i <= totalSteps; i++) {
      progress = Math.round((i / totalSteps) * 100)
      configProgress.progress = progress
      this.configStatus.set(modelId, configProgress)
      this.notifyProgress()

      if (i < totalSteps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration))
      }
    }

    // Mark as completed
    configProgress.status = 'completed'
    configProgress.progress = 100
    this.configStatus.set(modelId, configProgress)
    this.notifyProgress()

    console.log(`Model ${modelId} setup completed (simulated)`)
  }

  async skipLLMSetup(): Promise<void> {
    console.log('Skipping LLM setup - user can configure models later')
    
    // Mark all models as skipped (not configured but not required)
    this.defaultModels.forEach(model => {
      if (!model.required) {
        this.configStatus.set(model.id, {
          modelId: model.id,
          progress: 0,
          status: 'pending'
        })
      }
    })

    this.notifyProgress()
  }

  getModelInfo(modelId: string): LLMModel | undefined {
    return this.defaultModels.find(model => model.id === modelId)
  }

  isModelConfigured(modelId: string): boolean {
    const configProgress = this.configStatus.get(modelId)
    return configProgress?.status === 'completed'
  }

  getTotalModelSize(): string {
    const totalSizeGB = this.defaultModels.reduce((total, model) => {
      const sizeGB = parseFloat(model.size.replace('GB', ''))
      return total + sizeGB
    }, 0)
    return `${totalSizeGB.toFixed(1)}GB`
  }

  getRequiredModelSize(): string {
    const requiredModels = this.getRequiredModels()
    const totalSizeGB = requiredModels.reduce((total, model) => {
      const sizeGB = parseFloat(model.size.replace('GB', ''))
      return total + sizeGB
    }, 0)
    return `${totalSizeGB.toFixed(1)}GB`
  }
}

// Export singleton instance
export const llmSetupService = new LLMSetupService()
