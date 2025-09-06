'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Eye,
  Send,
  Image,
  Loader2,
  X,
  Sparkles,
  Camera,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  HardDrive
} from 'lucide-react'
import { visionService, type ModelStatus } from '@/lib/vision-service'
import { gpuOptimizer, type GPUInfo } from '@/lib/gpu-optimizer'
import { cpuOptimizer, type CPUInfo } from '@/lib/cpu-optimizer'
import '@/styles/vision-agent.css'

interface VisionAgentDashboardProps {
  onClose?: () => void
}

interface VisionResponse {
  id: string
  question: string
  imageUrl?: string
  response: string
  timestamp: Date
  status: 'processing' | 'completed' | 'error'
}

export function VisionAgentDashboard({ onClose }: VisionAgentDashboardProps) {
  const [prompt, setPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [responses, setResponses] = useState<VisionResponse[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llava-v1.6-mistral-7b')
  const [modelStatus, setModelStatus] = useState<Record<string, ModelStatus>>({})
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null)
  const [cpuInfo, setCpuInfo] = useState<CPUInfo | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Available local vision models
  const visionModels = visionService.getAvailableModels()

  // Auto-scroll to bottom when new responses are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [responses])

  // Load model statuses and GPU info on mount
  useEffect(() => {
    const loadModelStatuses = async () => {
      for (const model of visionModels) {
        try {
          const status = await visionService.getModelStatus(model.id)
          setModelStatus(prev => ({ ...prev, [model.id]: status }))
        } catch (error) {
          console.error(`Failed to load status for ${model.id}:`, error)
        }
      }
    }

    const loadHardwareInfo = async () => {
      try {
        await gpuOptimizer.initialize()
        const gpuInfo = gpuOptimizer.getGPUInfo()
        setGpuInfo(gpuInfo)
        
        if (!gpuInfo) {
          // Load CPU info if no GPU
          await cpuOptimizer.initialize()
          const cpuInfo = cpuOptimizer.getCPUInfo()
          setCpuInfo(cpuInfo)
        }
      } catch (error) {
        console.error('Failed to load hardware info:', error)
      }
    }

    if (visionService.isReady()) {
      loadModelStatuses()
    }
    loadHardwareInfo()
  }, [visionModels])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() && !imageFile) return

    const newResponse: VisionResponse = {
      id: Date.now().toString(),
      question: prompt,
      imageUrl: imagePreview || undefined,
      response: '',
      timestamp: new Date(),
      status: 'processing'
    }

    setResponses(prev => [...prev, newResponse])
    setIsProcessing(true)
    setPrompt('')
    setImageFile(null)
    setImagePreview(null)

    try {
      // Use local vision service
      const result = await visionService.processVision(
        newResponse.question,
        imagePreview || undefined,
        selectedModel
      )
      
      setResponses(prev => prev.map(r => 
        r.id === newResponse.id 
          ? { ...r, response: result.response, status: 'completed' }
          : r
      ))
    } catch (error) {
      console.error('Vision processing error:', error)
      setResponses(prev => prev.map(r => 
        r.id === newResponse.id 
          ? { ...r, response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, status: 'error' }
          : r
      ))
    } finally {
      setIsProcessing(false)
    }
  }

  const clearHistory = () => {
    setResponses([])
  }

  const handleDownloadModel = async (modelId: string) => {
    setDownloadingModel(modelId)
    setDownloadProgress(0)
    
    try {
      await visionService.downloadModel(modelId, (progress) => {
        setDownloadProgress(progress)
      })
      
      // Update model status
      const status = await visionService.getModelStatus(modelId)
      setModelStatus(prev => ({ ...prev, [modelId]: status }))
      
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloadingModel(null)
      setDownloadProgress(0)
    }
  }

  const getModelStatusIcon = (modelId: string) => {
    const status = modelStatus[modelId]
    if (!status) return <AlertCircle className="w-4 h-4 text-yellow-400" />
    
    if (status.available) {
      return <CheckCircle className="w-4 h-4 text-green-400" />
    } else if (downloadingModel === modelId) {
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
    } else {
      return <Download className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="vision-agent-container flex flex-col h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white/90">Vision Agent</h2>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-white/60">Ask questions about images using AI</p>
              {gpuInfo ? (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/20 border border-green-400/30 rounded text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">GPU: {gpuInfo.device}</span>
                </div>
              ) : cpuInfo ? (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded text-xs">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400">CPU: {cpuInfo.cores}C/{cpuInfo.threads}T + {Math.round(cpuInfo.memory/1024)}GB</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-500/20 border border-gray-400/30 rounded text-xs">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Hardware: Detecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white/90 focus:outline-none focus:border-white/40"
            >
              {visionModels.map(model => (
                <option key={model.id} value={model.id} className="bg-slate-800 text-white">
                  {model.name} ({model.size})
                </option>
              ))}
            </select>
            {getModelStatusIcon(selectedModel)}
            {!modelStatus[selectedModel]?.available && downloadingModel !== selectedModel && (
              <button
                onClick={() => handleDownloadModel(selectedModel)}
                className="px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-xs text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                Download
              </button>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Download Progress */}
      {downloadingModel && (
        <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-400/20">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400">Downloading {visionModels.find(m => m.id === downloadingModel)?.name}</span>
                <span className="text-blue-300">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-blue-500/20 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="vision-scroll flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {responses.length === 0 ? (
                          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="vision-animate-in flex flex-col items-center justify-center h-full text-center"
            >
              <div className="p-4 rounded-full bg-blue-500/20 border border-blue-400/30 mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-2">Vision AI Assistant</h3>
              <p className="text-white/60 max-w-md">
                Upload an image and ask questions about it. I can describe what I see, 
                answer questions, and help you understand visual content.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  "What's in this image?",
                  "Describe the scene",
                  "What colors do you see?",
                  "Count the objects",
                  "What's the mood?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/70 hover:bg-white/20 hover:text-white/90 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            responses.map((response) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="vision-message vision-animate-slide space-y-3"
              >
                {/* User Question */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                    <Bot className="w-4 h-4 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <div className="vision-glass rounded-xl p-3">
                      {response.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={response.imageUrl}
                            alt="Uploaded"
                            className="max-w-xs rounded-lg border border-white/20"
                          />
                        </div>
                      )}
                      <p className="text-white/90">{response.question}</p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Eye className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="vision-glass-strong rounded-xl p-3">
                      {response.status === 'processing' ? (
                        <div className="flex items-center space-x-2 text-white/70">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing image...</span>
                        </div>
                      ) : response.status === 'error' ? (
                        <p className="text-red-400">{response.response}</p>
                      ) : (
                        <p className="text-white/90 whitespace-pre-wrap">{response.response}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Prompt Bar */}
      <div className="border-t border-white/10 p-4 bg-slate-900/30 backdrop-blur-sm flex-shrink-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Image Upload */}
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-white/20"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs"
              >
                <X className="w-3 h-3" />
              </button>
        </div>
      )}

          <div className="flex items-end space-x-3">
            {/* Image Upload Button */}
            <label className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Camera className="w-5 h-5 text-white/70" />
            </label>

            {/* Prompt Input */}
            <div className="flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a question about the image..."
                className="vision-input vision-focus w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl text-white/90 placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!prompt.trim() && !imageFile) || isProcessing}
              className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-blue-400 hover:text-blue-300"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Clear History Button */}
          {responses.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearHistory}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors"
              >
                Clear History
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}