// CPU Optimizer for i9-14900K + 64GB RAM
// Optimizes vision processing for high-end CPU when GPU is not available

interface CPUInfo {
  cores: number
  threads: number
  memory: number
  architecture: string
  performance: 'high' | 'medium' | 'low'
}

interface CPUOptimizationConfig {
  batchSize: number
  maxTokens: number
  temperature: number
  useQuantization: boolean
  memoryOptimization: boolean
  parallelProcessing: boolean
  threadCount: number
}

class CPUOptimizer {
  private cpuInfo: CPUInfo | null = null
  private isInitialized = false

  async initialize(): Promise<boolean> {
    try {
      // Detect CPU capabilities
      this.cpuInfo = await this.detectCPU()
      
      if (this.cpuInfo) {
        console.log('CPU detected:', this.cpuInfo)
        this.isInitialized = true
        return true
      }
      
      console.log('Using default CPU optimization')
      return false
    } catch (error) {
      console.error('CPU detection failed:', error)
      return false
    }
  }

  private async detectCPU(): Promise<CPUInfo | null> {
    try {
      // Detect CPU cores and performance
      const cores = navigator.hardwareConcurrency || 16 // Default to 16 for i9-14900K
      const memory = this.estimateMemory()
      
      return {
        cores: cores,
        threads: cores * 2, // Hyperthreading
        memory: memory,
        architecture: 'x86-64',
        performance: this.assessCPUPerformance(cores, memory)
      }
    } catch (error) {
      console.error('CPU detection error:', error)
      return null
    }
  }

  private estimateMemory(): number {
    // Estimate available memory (64GB system)
    if (typeof window !== 'undefined' && (window as any).navigator?.deviceMemory) {
      return (window as any).navigator.deviceMemory * 1024 // Convert GB to MB
    }
    
    // Default to 64GB for i9-14900K system
    return 65536 // 64GB in MB
  }

  private assessCPUPerformance(cores: number, memory: number): 'high' | 'medium' | 'low' {
    // i9-14900K has 16 cores + 64GB RAM = high performance
    if (cores >= 16 && memory >= 32768) { // 16+ cores, 32GB+ RAM
      return 'high'
    } else if (cores >= 8 && memory >= 16384) { // 8+ cores, 16GB+ RAM
      return 'medium'
    } else {
      return 'low'
    }
  }

  getOptimizationConfig(): CPUOptimizationConfig {
    if (!this.cpuInfo) {
      // Default optimization
      return {
        batchSize: 1,
        maxTokens: 512,
        temperature: 0.7,
        useQuantization: true,
        memoryOptimization: true,
        parallelProcessing: false,
        threadCount: 4
      }
    }

    // Optimize for i9-14900K + 64GB RAM
    switch (this.cpuInfo.performance) {
      case 'high':
        return {
          batchSize: 3, // Can handle multiple images with 16 cores
          maxTokens: 1536, // Higher token limit with 64GB RAM
          temperature: 0.7,
          useQuantization: true, // Still use quantization for speed
          memoryOptimization: false, // Plenty of RAM available
          parallelProcessing: true, // 16 cores can handle parallel processing
          threadCount: 12 // Use 12 threads for optimal performance
        }
      
      case 'medium':
        return {
          batchSize: 2,
          maxTokens: 1024,
          temperature: 0.7,
          useQuantization: true,
          memoryOptimization: true,
          parallelProcessing: true,
          threadCount: 8
        }
      
      case 'low':
        return {
          batchSize: 1,
          maxTokens: 512,
          temperature: 0.7,
          useQuantization: true,
          memoryOptimization: true,
          parallelProcessing: false,
          threadCount: 4
        }
      
      default:
        return {
          batchSize: 1,
          maxTokens: 512,
          temperature: 0.7,
          useQuantization: true,
          memoryOptimization: true,
          parallelProcessing: false,
          threadCount: 4
        }
    }
  }

  getModelRecommendations(): string[] {
    if (!this.cpuInfo) {
      return ['llava-v1.5-7b'] // Lightweight for unknown CPU
    }

    switch (this.cpuInfo.performance) {
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
    cpuUtilization: string
  } {
    if (!this.cpuInfo) {
      return {
        modelLoading: '15-30 seconds',
        inferenceSpeed: '3-6 seconds per image',
        memoryUsage: '6-8GB RAM',
        parallelProcessing: false,
        cpuUtilization: '50-70%'
      }
    }

    switch (this.cpuInfo.performance) {
      case 'high':
        return {
          modelLoading: '5-15 seconds', // Fast with 16 cores
          inferenceSpeed: '1-3 seconds per image', // Optimized CPU processing
          memoryUsage: '8-12GB RAM', // Can use more RAM for better performance
          parallelProcessing: true, // 16 cores can handle parallel processing
          cpuUtilization: '60-80%' // High utilization with 16 cores
        }
      
      case 'medium':
        return {
          modelLoading: '10-20 seconds',
          inferenceSpeed: '2-4 seconds per image',
          memoryUsage: '6-10GB RAM',
          parallelProcessing: true,
          cpuUtilization: '70-90%'
        }
      
      case 'low':
        return {
          modelLoading: '15-30 seconds',
          inferenceSpeed: '3-6 seconds per image',
          memoryUsage: '4-8GB RAM',
          parallelProcessing: false,
          cpuUtilization: '80-95%'
        }
      
      default:
        return {
          modelLoading: '15-30 seconds',
          inferenceSpeed: '3-6 seconds per image',
          memoryUsage: '6-8GB RAM',
          parallelProcessing: false,
          cpuUtilization: '50-70%'
        }
    }
  }

  getCPUSpecificTips(): string[] {
    if (!this.cpuInfo) {
      return [
        'Close unnecessary applications to free up CPU resources',
        'Consider using smaller models for better performance'
      ]
    }

    switch (this.cpuInfo.performance) {
      case 'high':
        return [
          'Your i9-14900K + 64GB RAM provides excellent performance',
          'Can handle multiple images simultaneously',
          'Consider running multiple models in parallel',
          'High memory capacity allows for larger models'
        ]
      
      case 'medium':
        return [
          'Good CPU performance for local AI processing',
          'Can handle moderate workloads efficiently',
          'Consider closing other applications during processing'
        ]
      
      case 'low':
        return [
          'Use smaller models for better performance',
          'Close unnecessary applications',
          'Consider upgrading hardware for better performance'
        ]
      
      default:
        return [
          'Close unnecessary applications to free up CPU resources',
          'Consider using smaller models for better performance'
        ]
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getCPUInfo(): CPUInfo | null {
    return this.cpuInfo
  }
}

// Export singleton instance
export const cpuOptimizer = new CPUOptimizer()

// Export types
export type { CPUInfo, CPUOptimizationConfig }
