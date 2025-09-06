// Vision Service - Lightweight local LLM integration
// Handles communication with service worker and local model processing

import { webllmIntegration } from './webllm-integration'
import { gpuOptimizer } from './gpu-optimizer'
import { cpuOptimizer } from './cpu-optimizer'
import { fallbackProcessor } from './fallback-processor'

interface VisionRequest {
  prompt: string
  imageData?: string
  modelId: string
  requestId: string
}

interface VisionResponse {
  response: string
  confidence: number
  processingTime: number
  model: string
}

interface ModelStatus {
  available: boolean
  size: string
  progress: number
}

class VisionService {
  private worker: Worker | null = null
  private messageQueue: Map<string, (response: any) => void> = new Map()
  private isInitialized = false

  constructor() {
    this.initializeWorker()
    this.initializeGPU()
  }

  private async initializeGPU() {
    try {
      await gpuOptimizer.initialize()
      const gpuInfo = gpuOptimizer.getGPUInfo()
      if (gpuInfo) {
        console.log('GPU optimization enabled:', gpuInfo)
      } else {
        // Fallback to CPU optimization for i9-14900K + 64GB RAM
        await cpuOptimizer.initialize()
        const cpuInfo = cpuOptimizer.getCPUInfo()
        if (cpuInfo) {
          console.log('CPU optimization enabled for high-end hardware:', cpuInfo)
        }
      }
      
      // Initialize fallback processor as last resort
      await fallbackProcessor.initialize()
    } catch (error) {
      console.warn('Hardware optimization failed:', error)
    }
  }

  private async initializeWorker() {
    try {
      this.worker = new Worker('/vision-worker.js')
      
      this.worker.onmessage = (event) => {
        const { type, requestId, ...data } = event.data
        
        if (requestId && this.messageQueue.has(requestId)) {
          const resolver = this.messageQueue.get(requestId)!
          this.messageQueue.delete(requestId)
          resolver(event.data)
        }
      }
      
      this.worker.onerror = (error) => {
        console.error('Vision worker error:', error)
      }
      
      this.isInitialized = true
      console.log('Vision service initialized')
    } catch (error) {
      console.error('Failed to initialize vision worker:', error)
    }
  }

  private async sendMessage(type: string, data: any): Promise<any> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Vision service not initialized')
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageQueue.delete(requestId)
        reject(new Error('Request timeout'))
      }, 30000) // 30 second timeout

      this.messageQueue.set(requestId, (response) => {
        clearTimeout(timeout)
        if (response.type === 'VISION_ERROR' || response.type === 'DOWNLOAD_ERROR') {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })

      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        const resolver = this.messageQueue.get(requestId)
        if (resolver) {
          resolver(event.data)
        }
      }

      this.worker!.postMessage(
        { type, data: { ...data, requestId } },
        [messageChannel.port2]
      )
    })
  }

  async processVision(prompt: string, imageData?: string, modelId = 'llava-v1.6-mistral-7b'): Promise<VisionResponse> {
    try {
      // Try WebLLM first (local processing)
      if (webllmIntegration.isReady()) {
        try {
          return await webllmIntegration.processVision(prompt, imageData)
        } catch (error) {
          console.warn('WebLLM processing failed, trying fallback processor:', error)
        }
      }

      // Try fallback processor
      if (fallbackProcessor.isReady()) {
        try {
          return await fallbackProcessor.processVision(prompt, imageData)
        } catch (error) {
          console.warn('Fallback processor failed, trying service worker:', error)
        }
      }

      // Fallback to service worker
      const response = await this.sendMessage('PROCESS_VISION', {
        prompt,
        imageData,
        modelId
      })

      if (response.type === 'MODEL_NOT_AVAILABLE') {
        throw new Error(`Model ${modelId} is not available locally. Please download it first.`)
      }

      if (response.type === 'VISION_RESULT') {
        return response.result
      }

      throw new Error('Unexpected response type')
    } catch (error) {
      console.error('Vision processing error:', error)
      throw error
    }
  }

  async downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      // Try WebLLM first
      if (await webllmIntegration.isModelAvailable(modelId)) {
        await webllmIntegration.downloadModel(modelId, onProgress)
        return
      }

      // Fallback to service worker
      const response = await this.sendMessage('DOWNLOAD_MODEL', { modelId })
      
      if (response.type === 'DOWNLOAD_STARTED') {
        // Set up progress tracking
        const progressHandler = (event: MessageEvent) => {
          if (event.data.type === 'DOWNLOAD_PROGRESS' && event.data.modelId === modelId) {
            onProgress?.(event.data.progress)
          }
        }
        
        this.worker?.addEventListener('message', progressHandler)
        
        // Wait for completion
        await new Promise((resolve, reject) => {
          const completionHandler = (event: MessageEvent) => {
            if (event.data.type === 'DOWNLOAD_COMPLETE' && event.data.modelId === modelId) {
              this.worker?.removeEventListener('message', progressHandler)
              this.worker?.removeEventListener('message', completionHandler)
              resolve(undefined)
            } else if (event.data.type === 'DOWNLOAD_ERROR' && event.data.modelId === modelId) {
              this.worker?.removeEventListener('message', progressHandler)
              this.worker?.removeEventListener('message', completionHandler)
              reject(new Error(event.data.error))
            }
          }
          
          this.worker?.addEventListener('message', completionHandler)
        })
      }
    } catch (error) {
      console.error('Model download error:', error)
      throw error
    }
  }

  async getModelStatus(modelId: string): Promise<ModelStatus> {
    try {
      // Check WebLLM first
      const webllmAvailable = await webllmIntegration.isModelAvailable(modelId)
      if (webllmAvailable) {
        const size = await webllmIntegration.getModelSize(modelId)
        return {
          available: true,
          size,
          progress: 100
        }
      }

      // Fallback to service worker
      const response = await this.sendMessage('GET_MODEL_STATUS', { modelId })
      
      if (response.type === 'MODEL_STATUS') {
        return {
          available: response.available,
          size: response.size,
          progress: response.progress
        }
      }
      
      throw new Error('Unexpected response type')
    } catch (error) {
      console.error('Model status error:', error)
      throw error
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.sendMessage('CLEAR_CACHE', {})
    } catch (error) {
      console.error('Cache clear error:', error)
      throw error
    }
  }

  // Get available models
  getAvailableModels() {
    return webllmIntegration.getAvailableModels()
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized && this.worker !== null
  }

  // Cleanup
  destroy() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.messageQueue.clear()
    this.isInitialized = false
  }
}

// Export singleton instance
export const visionService = new VisionService()

// Export types
export type { VisionRequest, VisionResponse, ModelStatus }
