// AI Service for communicating with the server-side AI service
// This replaces the local WebLLM integration with server-side processing

export interface AIModel {
  id: string
  name: string
  provider: 'ollama' | 'openai' | 'anthropic' | 'local'
  endpoint: string
  maxTokens: number
  temperature: number
  isAvailable: boolean
  lastChecked?: Date
}

export interface AIRequest {
  modelId: string
  prompt: string
  imageData?: string
  maxTokens?: number
  temperature?: number
  userId?: string
}

export interface AIResponse {
  success: boolean
  response?: string
  model: string
  processingTime: number
  tokensUsed?: number
  error?: string
}

export interface ModelStatus {
  modelId: string
  isAvailable: boolean
  lastChecked: Date
  responseTime?: number
  error?: string
}

export interface AIServiceStatus {
  isReady: boolean
  totalModels: number
  availableModels: number
  models: Array<{
    id: string
    name: string
    provider: string
    isAvailable: boolean
    lastChecked?: Date
  }>
}

class AIService {
  private baseUrl: string
  private isInitialized = false

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://5.231.82.135:3001/api/ai'
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if AI service is available
      const status = await this.getServiceStatus()
      this.isInitialized = status.isReady
      return this.isInitialized
    } catch (error) {
      console.warn('AI service not available:', error)
      this.isInitialized = false
      return false
    }
  }

  async getServiceStatus(): Promise<AIServiceStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`)
      if (!response.ok) {
        throw new Error(`AI service status check failed: ${response.statusText}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get AI service status:', error)
      throw error
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`)
      if (!response.ok) {
        throw new Error(`Failed to get available models: ${response.statusText}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get available models:', error)
      throw error
    }
  }

  async getAllModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models/all`)
      if (!response.ok) {
        throw new Error(`Failed to get all models: ${response.statusText}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get all models:', error)
      throw error
    }
  }

  async getModel(modelId: string): Promise<AIModel | null> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to get model: ${response.statusText}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to get model ${modelId}:`, error)
      throw error
    }
  }

  async checkModelHealth(modelId: string): Promise<ModelStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}/health`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to check model health: ${response.statusText}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to check health for model ${modelId}:`, error)
      throw error
    }
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to process AI request:', error)
      throw error
    }
  }

  async processVisionRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Vision request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to process vision request:', error)
      throw error
    }
  }

  async checkAllModelsHealth(): Promise<ModelStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/health-check`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to check all models health:', error)
      throw error
    }
  }

  async updateModelConfig(modelId: string, config: Partial<AIModel>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update model config: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to update model config for ${modelId}:`, error)
      throw error
    }
  }

  // Convenience methods for common operations
  async processText(prompt: string, modelId = 'llava-v1.6-mistral-7b'): Promise<string> {
    const response = await this.processRequest({
      modelId,
      prompt,
      maxTokens: 1024,
      temperature: 0.7
    })

    if (!response.success) {
      throw new Error(response.error || 'Text processing failed')
    }

    return response.response || 'No response generated'
  }

  async processImage(prompt: string, imageData: string, modelId = 'llava-v1.6-mistral-7b'): Promise<string> {
    const response = await this.processVisionRequest({
      modelId,
      prompt,
      imageData,
      maxTokens: 1024,
      temperature: 0.7
    })

    if (!response.success) {
      throw new Error(response.error || 'Image processing failed')
    }

    return response.response || 'No response generated'
  }

  isReady(): boolean {
    return this.isInitialized
  }

  // Get default models for setup
  getDefaultModels(): AIModel[] {
    return [
      {
        id: 'llava-v1.6-mistral-7b',
        name: 'LLaVA 1.6 Mistral 7B',
        provider: 'ollama',
        endpoint: 'http://5.231.82.135:11434/api/generate',
        maxTokens: 1024,
        temperature: 0.7,
        isAvailable: false
      },
      {
        id: 'llava-v1.5-7b',
        name: 'LLaVA 1.5 7B',
        provider: 'ollama',
        endpoint: 'http://5.231.82.135:11434/api/generate',
        maxTokens: 1024,
        temperature: 0.7,
        isAvailable: false
      },
      {
        id: 'qwen-vl-7b',
        name: 'Qwen-VL 7B',
        provider: 'ollama',
        endpoint: 'http://5.231.82.135:11434/api/generate',
        maxTokens: 1024,
        temperature: 0.7,
        isAvailable: false
      }
    ]
  }

  // Get model size information (for display purposes)
  getModelSize(modelId: string): string {
    const sizes: Record<string, string> = {
      'llava-v1.6-mistral-7b': '4.2GB',
      'llava-v1.5-7b': '4.1GB',
      'qwen-vl-7b': '4.3GB',
      'gpt-4-vision': 'API',
      'claude-3-sonnet': 'API'
    }
    return sizes[modelId] || 'Unknown'
  }

  // Get model description
  getModelDescription(modelId: string): string {
    const descriptions: Record<string, string> = {
      'llava-v1.6-mistral-7b': 'Advanced vision-language model for image understanding and analysis',
      'llava-v1.5-7b': 'Reliable vision model for general image processing tasks',
      'qwen-vl-7b': 'Multilingual vision model with excellent text recognition',
      'gpt-4-vision': 'OpenAI\'s advanced vision model with excellent image understanding',
      'claude-3-sonnet': 'Anthropic\'s powerful vision model with strong reasoning capabilities'
    }
    return descriptions[modelId] || 'AI model for text and image processing'
  }
}

// Export singleton instance
export const aiService = new AIService()

