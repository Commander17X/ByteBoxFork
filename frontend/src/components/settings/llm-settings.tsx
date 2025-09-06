'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle, AlertCircle, Brain, Zap, Shield, Settings, Trash2 } from 'lucide-react'
import { useLLMSetup } from '@/hooks/use-llm-setup'
import { useNotifications } from '@/lib/notifications'
import { LLMModel } from '@/lib/llm-setup-service'

export function LLMSettings() {
  const {
    setupStatus,
    isLoading,
    startSetup,
    getAvailableModels,
    getRequiredModels,
    getTotalModelSize,
    getRequiredModelSize,
    isSetupCompleted
  } = useLLMSetup()
  
  const { success, error } = useNotifications()
  const [showDetails, setShowDetails] = useState(false)
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null)

  const availableModels = getAvailableModels()
  const requiredModels = getRequiredModels()
  const totalSize = getTotalModelSize()
  const requiredSize = getRequiredModelSize()

  const handleDownloadModel = async (modelId: string) => {
    setDownloadingModel(modelId)
    try {
      // This would trigger download of a specific model
      // For now, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 2000))
      success('Model Downloaded', `${availableModels.find(m => m.id === modelId)?.name} is ready to use.`)
    } catch (err: any) {
      error('Download Failed', err.message || 'Failed to download the model.')
    } finally {
      setDownloadingModel(null)
    }
  }

  const handleRemoveModel = async (modelId: string) => {
    try {
      // This would remove the model from local storage
      // For now, we'll just show a success message
      success('Model Removed', `${availableModels.find(m => m.id === modelId)?.name} has been removed.`)
    } catch (err: any) {
      error('Removal Failed', err.message || 'Failed to remove the model.')
    }
  }

  const getModelIcon = (model: LLMModel) => {
    switch (model.id) {
      case 'llava-v1.6-mistral-7b':
        return <Brain className="w-5 h-5 text-blue-400" />
      case 'llava-v1.5-7b':
        return <Zap className="w-5 h-5 text-yellow-400" />
      case 'qwen-vl-7b':
        return <Shield className="w-5 h-5 text-green-400" />
      default:
        return <Brain className="w-5 h-5 text-white/60" />
    }
  }

  const getModelStatus = (modelId: string) => {
    const config = setupStatus.configurations.find(c => c.modelId === modelId)
    if (!config) return 'not-downloaded'

    switch (config.status) {
      case 'completed':
        return 'downloaded'
      case 'configuring':
        return 'downloading'
      case 'error':
        return 'error'
      default:
        return 'not-downloaded'
    }
  }

  const getStatusIcon = (modelId: string) => {
    const status = getModelStatus(modelId)
    
    switch (status) {
      case 'downloaded':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'downloading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Download className="w-5 h-5 text-blue-400" />
          </motion.div>
        )
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-white/30" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl warmwind-text font-display">AI Models</h2>
          <p className="warmwind-body text-sm opacity-80">Manage your local AI models</p>
        </div>
      </div>

      {/* Setup Status */}
      <div className="ethereal-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="warmwind-text font-medium">Setup Status</h3>
          <div className="flex items-center space-x-2">
            {isSetupCompleted ? (
              <span className="text-xs bg-green-400/20 text-green-400 px-3 py-1 rounded-full">
                Complete
              </span>
            ) : (
              <span className="text-xs bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">
                Incomplete
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="warmwind-body text-sm">Overall Progress</span>
            <span className="warmwind-body text-sm font-medium">
              {setupStatus.completedModels}/{setupStatus.totalModels} models
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${setupStatus.overallProgress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-white/30 rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="warmwind-body opacity-70">Required:</span>
              <span className="warmwind-body font-medium ml-2">{requiredSize}</span>
            </div>
            <div>
              <span className="warmwind-body opacity-70">Total:</span>
              <span className="warmwind-body font-medium ml-2">{totalSize}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model List */}
      <div className="ethereal-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="warmwind-text font-medium">Available Models</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="warmwind-body text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        <div className="space-y-3">
          {availableModels.map((model, index) => {
            const status = getModelStatus(model.id)
            const isDownloading = downloadingModel === model.id
            
            return (
              <motion.div
                key={model.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  {getModelIcon(model)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="warmwind-body font-medium">{model.name}</span>
                      {model.required && (
                        <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="warmwind-body text-xs opacity-70">{model.description}</p>
                    <p className="warmwind-body text-xs opacity-60">{model.size}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {status === 'downloaded' && (
                    <div className="flex items-center space-x-2">
                      <span className="warmwind-body text-sm text-green-400">Ready</span>
                      <button
                        onClick={() => handleRemoveModel(model.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove model"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {status === 'downloading' && (
                    <div className="flex items-center space-x-2">
                      <span className="warmwind-body text-sm text-blue-400">Downloading...</span>
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="flex items-center space-x-2">
                      <span className="warmwind-body text-sm text-red-400">Error</span>
                      <button
                        onClick={() => handleDownloadModel(model.id)}
                        className="warmwind-button text-xs px-3 py-1"
                        disabled={isDownloading}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  {status === 'not-downloaded' && (
                    <button
                      onClick={() => handleDownloadModel(model.id)}
                      className="warmwind-button bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 border border-white/20"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {getStatusIcon(model.id)}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ethereal-card p-6">
        <h3 className="warmwind-text font-medium mb-4">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => startSetup()}
            className="warmwind-button bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download All Required Models</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="warmwind-button border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            {showDetails ? 'Hide' : 'Show'} Model Details
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 rounded-xl bg-blue-400/10 border border-blue-400/20">
        <p className="warmwind-body text-sm text-blue-300">
          <strong>Note:</strong> AI models are stored locally on your device for privacy and performance. 
          Downloaded models will be available offline and won't require internet connectivity for basic operations.
        </p>
      </div>
    </motion.div>
  )
}
