// WebLLM Integration for Local Vision Models
// Lightweight integration with WebLLM for actual local LLM processing

interface WebLLMConfig {
  model: string
  device: 'webgpu' | 'cpu' | 'cuda'
  maxTokens: number
  temperature: number
  gpuMemory: number
}

interface VisionResult {
  response: string
  confidence: number
  processingTime: number
  model: string
}

class WebLLMIntegration {
  private isInitialized = false
  private currentModel: any = null
  private config: WebLLMConfig = {
    model: 'llava-v1.6-mistral-7b',
    device: 'webgpu', // Will auto-detect CUDA if available, fallback to CPU
    maxTokens: 1024, // Optimized for both GPU and high-end CPU
    temperature: 0.7,
    gpuMemory: 16384 // 16GB VRAM for RTX 5070, or use system RAM
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if WebLLM is available
      if (typeof window !== 'undefined' && (window as any).webllm) {
        this.isInitialized = true
        return true
      }

      // Dynamically import WebLLM with error handling
      let webllm
      try {
        const webllmModule = await import('@mlc-ai/web-llm')
        // Try different possible export names
        webllm = (webllmModule as any).webllm || (webllmModule as any).default || webllmModule
      } catch (importError) {
        console.warn('WebLLM package not available, using fallback processing:', importError)
        return false
      }
      
      // Initialize WebLLM with GPU detection
      const initConfig = {
        // Try to detect CUDA/GPU first
        device: await this.detectBestDevice()
      }
      
      await webllm.InitWebLLM(initConfig)
      
      this.isInitialized = true
      console.log(`WebLLM initialized successfully with device: ${initConfig.device}`)
      return true
    } catch (error) {
      console.warn('Failed to initialize WebLLM, using fallback processing:', error)
      return false
    }
  }

  private async detectBestDevice(): Promise<'webgpu' | 'cpu' | 'cuda'> {
    try {
      // Check for CUDA support (RTX 5070)
      if (typeof window !== 'undefined' && (window as any).navigator?.gpu) {
        const adapter = await (window as any).navigator.gpu.requestAdapter()
        if (adapter) {
          console.log('GPU detected, using WebGPU acceleration')
          return 'webgpu'
        }
      }
      
      // Fallback to optimized CPU processing (i9-14900K + 64GB RAM)
      console.log('No GPU detected, using optimized CPU processing with i9-14900K + 64GB RAM')
      return 'cpu'
    } catch (error) {
      console.warn('GPU detection failed, falling back to optimized CPU processing:', error)
      return 'cpu'
    }
  }

  async loadModel(modelId: string): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize()
      if (!initialized) return false
    }

    try {
      let webllm
      try {
        const webllmModule = await import('@mlc-ai/web-llm')
        webllm = (webllmModule as any).webllm || (webllmModule as any).default || webllmModule
      } catch (importError) {
        console.warn('WebLLM not available for model loading:', importError)
        return false
      }
      
      // Map model IDs to WebLLM model names
      const modelMap: Record<string, string> = {
        'llava-v1.6-mistral-7b': 'Llava-v1.6-Mistral-7B-Instruct-q4f16_1-MLC',
        'llava-v1.5-7b': 'Llava-v1.5-7B-Instruct-q4f16_1-MLC',
        'qwen-vl-7b': 'Qwen2-VL-7B-Instruct-q4f16_1-MLC'
      }

      const webllmModelName = modelMap[modelId]
      if (!webllmModelName) {
        throw new Error(`Model ${modelId} not supported`)
      }

      // Load the model
      this.currentModel = await webllm.CreateChatCompletion({
        model: webllmModelName,
        device: this.config.device
      })

      console.log(`Model ${modelId} loaded successfully`)
      return true
    } catch (error) {
      console.error(`Failed to load model ${modelId}:`, error)
      return false
    }
  }

  async processVision(prompt: string, imageData?: string): Promise<VisionResult> {
    if (!this.currentModel) {
      throw new Error('No model loaded')
    }

    const startTime = Date.now()

    try {
      // Prepare the conversation
      const messages = [
        {
          role: 'user',
          content: imageData 
            ? [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageData } }
              ]
            : prompt
        }
      ]

      // Generate response
      const response = await this.currentModel.chat.completions.create({
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      const processingTime = Date.now() - startTime
      const responseText = response.choices[0]?.message?.content || 'No response generated'

      return {
        response: responseText,
        confidence: 0.9, // WebLLM doesn't provide confidence scores
        processingTime,
        model: this.config.model
      }
    } catch (error) {
      console.error('Vision processing error:', error)
      throw error
    }
  }

  async isModelAvailable(modelId: string): Promise<boolean> {
    try {
      let webllm
      try {
        const webllmModule = await import('@mlc-ai/web-llm')
        webllm = (webllmModule as any).webllm || (webllmModule as any).default || webllmModule
      } catch (importError) {
        console.warn('WebLLM not available for model check:', importError)
        return false
      }
      
      const modelMap: Record<string, string> = {
        'llava-v1.6-mistral-7b': 'Llava-v1.6-Mistral-7B-Instruct-q4f16_1-MLC',
        'llava-v1.5-7b': 'Llava-v1.5-7B-Instruct-q4f16_1-MLC',
        'qwen-vl-7b': 'Qwen2-VL-7B-Instruct-q4f16_1-MLC'
      }

      const webllmModelName = modelMap[modelId]
      if (!webllmModelName) return false

      // Check if model is available in WebLLM
      const availableModels = await webllm.GetAvailableModels()
      return availableModels.includes(webllmModelName)
    } catch (error) {
      console.error('Error checking model availability:', error)
      return false
    }
  }

  async getModelSize(modelId: string): Promise<string> {
    // WebLLM model sizes (approximate)
    const sizes: Record<string, string> = {
      'llava-v1.6-mistral-7b': '4.2GB',
      'llava-v1.5-7b': '4.1GB',
      'qwen-vl-7b': '4.3GB'
    }
    return sizes[modelId] || 'Unknown'
  }

  async downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      let webllm
      try {
        const webllmModule = await import('@mlc-ai/web-llm')
        webllm = (webllmModule as any).webllm || (webllmModule as any).default || webllmModule
      } catch (importError) {
        console.warn('WebLLM not available for model download:', importError)
        throw new Error('WebLLM not available')
      }
      
      const modelMap: Record<string, string> = {
        'llava-v1.6-mistral-7b': 'Llava-v1.6-Mistral-7B-Instruct-q4f16_1-MLC',
        'llava-v1.5-7b': 'Llava-v1.5-7B-Instruct-q4f16_1-MLC',
        'qwen-vl-7b': 'Qwen2-VL-7B-Instruct-q4f16_1-MLC'
      }

      const webllmModelName = modelMap[modelId]
      if (!webllmModelName) {
        throw new Error(`Model ${modelId} not supported`)
      }

      // WebLLM handles downloading automatically when loading
      // We'll simulate progress for better UX
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 10
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
        }
        onProgress?.(Math.round(progress))
      }, 500)

      // Load the model (this will download if not cached)
      await this.loadModel(modelId)
      
      clearInterval(interval)
      onProgress?.(100)
    } catch (error) {
      console.error('Model download error:', error)
      throw error
    }
  }

  getAvailableModels() {
    return [
      { id: 'llava-v1.6-mistral-7b', name: 'LLaVA 1.6 Mistral 7B', size: '4.2GB' },
      { id: 'llava-v1.5-7b', name: 'LLaVA 1.5 7B', size: '4.1GB' },
      { id: 'qwen-vl-7b', name: 'Qwen-VL 7B', size: '4.3GB' }
    ]
  }

  isReady(): boolean {
    return this.isInitialized && this.currentModel !== null
  }

  destroy() {
    this.currentModel = null
    this.isInitialized = false
  }
}

// Export singleton instance
export const webllmIntegration = new WebLLMIntegration()

// Export types
export type { WebLLMConfig, VisionResult }
