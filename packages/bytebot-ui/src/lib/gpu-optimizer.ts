// GPU Optimizer for RTX 5070
// Optimizes vision processing for GPU passthrough via Proxmox

interface GPUInfo {
  device: string
  memory: number
  computeCapability: string
  isPassthrough: boolean
  performance: 'high' | 'medium' | 'low'
}

interface OptimizationConfig {
  batchSize: number
  maxTokens: number
  temperature: number
  useQuantization: boolean
  memoryOptimization: boolean
}

class GPUOptimizer {
  private gpuInfo: GPUInfo | null = null
  private isInitialized = false

  async initialize(): Promise<boolean> {
    try {
      // Detect GPU capabilities
      this.gpuInfo = await this.detectGPU()
      
      if (this.gpuInfo) {
        console.log('GPU detected:', this.gpuInfo)
        this.isInitialized = true
        return true
      }
      
      console.log('No GPU detected, using CPU optimization')
      return false
    } catch (error) {
      console.error('GPU detection failed:', error)
      return false
    }
  }

  private async detectGPU(): Promise<GPUInfo | null> {
    try {
      // Check for WebGPU support
      if (typeof window !== 'undefined' && (window as any).navigator?.gpu) {
        const adapter = await (window as any).navigator.gpu.requestAdapter()
        
        if (adapter) {
          // Get adapter info using available properties
          const adapterInfo = {
            device: adapter.limits?.maxBufferSize ? 'WebGPU Compatible GPU' : 'WebGPU Adapter',
            limits: adapter.limits || {},
            features: adapter.features || new Set()
          }

          return {
            device: adapterInfo.device,
            memory: this.estimateVRAM(adapterInfo),
            computeCapability: 'WebGPU',
            isPassthrough: this.detectPassthrough(adapterInfo),
            performance: this.assessPerformance(adapterInfo)
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('GPU detection error:', error)
      return null
    }
  }

  private estimateVRAM(info: any): number {
    // RTX 5070 has 16GB VRAM
    // This is a rough estimation based on WebGPU limits
    const deviceName = info.device?.toLowerCase() || ''
    const maxBufferSize = info.limits?.maxBufferSize || 0

    // Check WebGPU limits to estimate VRAM
    if (maxBufferSize >= 16 * 1024 * 1024 * 1024) { // 16GB+
      return 16384 // High-end GPU
    } else if (maxBufferSize >= 8 * 1024 * 1024 * 1024) { // 8GB+
      return 8192 // Mid-range GPU
    } else if (maxBufferSize >= 4 * 1024 * 1024 * 1024) { // 4GB+
      return 4096 // Entry-level GPU
    }

    // Fallback based on device name
    if (deviceName.includes('rtx') || deviceName.includes('geforce')) {
      return 16384 // 16GB for RTX 5070
    }

    return 8192 // Default assumption
  }

  private detectPassthrough(info: any): boolean {
    // Detect if GPU is passed through from Proxmox
    const deviceName = info.device?.toLowerCase() || ''
    const hasComputeFeatures = info.features?.has && (
      info.features.has('shader-f16') ||
      info.features.has('timestamp-query') ||
      info.features.has('pipeline-statistics-query')
    )

    // Proxmox passthrough indicators
    const hasNvidiaIndicators = deviceName.includes('nvidia') ||
           deviceName.includes('geforce') ||
           deviceName.includes('rtx')

    // Check for high-end GPU features that suggest passthrough
    const hasHighEndLimits = (info.limits?.maxBufferSize || 0) >= 8 * 1024 * 1024 * 1024

    return hasNvidiaIndicators || (hasComputeFeatures && hasHighEndLimits)
  }

  private assessPerformance(info: any): 'high' | 'medium' | 'low' {
    const deviceName = info.device?.toLowerCase() || ''
    const maxBufferSize = info.limits?.maxBufferSize || 0
    const hasAdvancedFeatures = info.features?.has && (
      info.features.has('shader-f16') ||
      info.features.has('timestamp-query')
    )

    // Check WebGPU limits and features for performance assessment
    if (maxBufferSize >= 16 * 1024 * 1024 * 1024 && hasAdvancedFeatures) {
      return 'high' // High-end GPU with advanced features
    } else if (maxBufferSize >= 8 * 1024 * 1024 * 1024) {
      return 'medium' // Mid-range GPU
    } else if (maxBufferSize >= 4 * 1024 * 1024 * 1024 || hasAdvancedFeatures) {
      return 'medium' // Entry-level with some advanced features
    }

    // Fallback based on device name
    if (deviceName.includes('rtx 50') || deviceName.includes('rtx 40')) {
      return 'high' // RTX 5070/4090 class
    } else if (deviceName.includes('rtx 30') || deviceName.includes('rtx 20')) {
      return 'medium' // RTX 30/20 series
    } else {
      return 'low' // Other GPUs
    }
  }

  getOptimizationConfig(): OptimizationConfig {
    if (!this.gpuInfo) {
      // High-end CPU optimization (i9-14900K + 64GB RAM)
      return {
        batchSize: 2, // Can handle multiple images with 16 cores
        maxTokens: 1024, // More tokens with 64GB RAM
        temperature: 0.7,
        useQuantization: true, // Still use quantization for speed
        memoryOptimization: false // Plenty of RAM available
      }
    }

    // GPU optimization based on RTX 5070
    switch (this.gpuInfo.performance) {
      case 'high':
        return {
          batchSize: 4, // Can handle multiple images
          maxTokens: 2048, // Higher token limit
          temperature: 0.7,
          useQuantization: false, // Can handle full precision
          memoryOptimization: false // Plenty of VRAM
        }
      
      case 'medium':
        return {
          batchSize: 2,
          maxTokens: 1024,
          temperature: 0.7,
          useQuantization: true,
          memoryOptimization: true
        }
      
      case 'low':
        return {
          batchSize: 1,
          maxTokens: 512,
          temperature: 0.7,
          useQuantization: true,
          memoryOptimization: true
        }
      
      default:
        return {
          batchSize: 1,
          maxTokens: 512,
          temperature: 0.7,
          useQuantization: true,
          memoryOptimization: true
        }
    }
  }

  getModelRecommendations(): string[] {
    if (!this.gpuInfo) {
      return ['llava-v1.5-7b'] // Lightweight for CPU
    }

    switch (this.gpuInfo.performance) {
      case 'high':
        return [
          'llava-v1.6-mistral-7b',
          'qwen-vl-7b',
          'llava-v1.5-7b'
        ]
      
      case 'medium':
        return [
          'llava-v1.5-7b',
          'qwen-vl-7b'
        ]
      
      case 'low':
        return ['llava-v1.5-7b']
      
      default:
        return ['llava-v1.5-7b']
    }
  }

  getExpectedPerformance(): {
    modelLoading: string
    inferenceSpeed: string
    memoryUsage: string
    parallelProcessing: boolean
  } {
    if (!this.gpuInfo) {
      // Optimized for i9-14900K + 64GB RAM
      return {
        modelLoading: '5-15 seconds', // Faster with 16 cores
        inferenceSpeed: '1-3 seconds per image', // Optimized CPU processing
        memoryUsage: '8-12GB RAM', // Can use more RAM for better performance
        parallelProcessing: true // 16 cores can handle parallel processing
      }
    }

    switch (this.gpuInfo.performance) {
      case 'high':
        return {
          modelLoading: '2-5 seconds',
          inferenceSpeed: '0.5-2 seconds per image',
          memoryUsage: '4-6GB VRAM',
          parallelProcessing: true
        }
      
      case 'medium':
        return {
          modelLoading: '5-10 seconds',
          inferenceSpeed: '1-3 seconds per image',
          memoryUsage: '6-8GB VRAM',
          parallelProcessing: true
        }
      
      case 'low':
        return {
          modelLoading: '10-20 seconds',
          inferenceSpeed: '2-4 seconds per image',
          memoryUsage: '8-10GB VRAM',
          parallelProcessing: false
        }
      
      default:
        return {
          modelLoading: '10-30 seconds',
          inferenceSpeed: '2-5 seconds per image',
          memoryUsage: '6-8GB RAM',
          parallelProcessing: false
        }
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getGPUInfo(): GPUInfo | null {
    return this.gpuInfo
  }
}

// Export singleton instance
export const gpuOptimizer = new GPUOptimizer()

// Export types
export type { GPUInfo, OptimizationConfig }
