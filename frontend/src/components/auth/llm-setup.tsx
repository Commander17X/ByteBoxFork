'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle, AlertCircle, Brain, Zap, Shield } from 'lucide-react'
import { llmSetupService, LLMSetupStatus, LLMModel } from '@/lib/llm-setup-service'
import { useNotifications } from '@/lib/notifications'
import { useAuthStore } from '@/store/auth-store'

interface LLMSetupProps {
  onComplete: () => void
  onSkip: () => void
}

export function LLMSetup({ onComplete, onSkip }: LLMSetupProps) {
  const [setupStatus, setSetupStatus] = useState<LLMSetupStatus>(llmSetupService.getSetupStatus())
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { success, error } = useNotifications()
  const { updateLLMSetupStatus } = useAuthStore()

  useEffect(() => {
    const unsubscribe = llmSetupService.onSetupProgress((status) => {
      setSetupStatus(status)
      
      if (status.isSetupComplete) {
        setIsDownloading(false)
        const configuredModels = status.configurations
          .filter(c => c.status === 'completed')
          .map(c => c.modelId)
        updateLLMSetupStatus(true, configuredModels, false)
        success('LLM Setup Complete!', 'All AI models are ready for use.')
        setTimeout(() => onComplete(), 1500)
      }
    })

    return unsubscribe
  }, [onComplete, success])

  const handleStartDownload = async () => {
    setIsDownloading(true)
    try {
      await llmSetupService.startLLMSetup()
    } catch (err: any) {
      setIsDownloading(false)
      error('Download Failed', err.message || 'Failed to download AI models. You can try again later.')
    }
  }

  const handleSkip = async () => {
    await llmSetupService.skipLLMSetup()
    updateLLMSetupStatus(false, [], true)
    onSkip()
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

  const getStatusIcon = (modelId: string) => {
    const config = setupStatus.configurations.find(c => c.modelId === modelId)
    if (!config) return null

    switch (config.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'configuring':
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

  const requiredModels = llmSetupService.getRequiredModels()
  const totalSize = llmSetupService.getTotalModelSize()
  const requiredSize = llmSetupService.getRequiredModelSize()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 4 + 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="ethereal-card p-8 max-w-2xl w-full relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-blue-400" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-3xl warmwind-text font-display mb-4"
          >
            AI Models Setup
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="warmwind-body text-lg mb-2"
          >
            Download AI models to unlock powerful vision and language capabilities
          </motion.p>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="warmwind-body text-sm opacity-80"
          >
            Required: {requiredSize} • Total: {totalSize}
          </motion.p>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="warmwind-body text-sm">Overall Progress</span>
            <span className="warmwind-body text-sm font-medium">
              {setupStatus.completedModels}/{setupStatus.totalModels} models
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${setupStatus.overallProgress}%` }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="h-full bg-white/30 rounded-full"
            />
          </div>
        </motion.div>

        {/* Model Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="warmwind-body text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            {showDetails ? 'Hide' : 'Show'} Model Details
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                {llmSetupService.getDefaultModels().map((model, index) => {
                  const config = setupStatus.configurations.find(c => c.modelId === model.id)
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
                        {config && (
                          <div className="text-right">
                            <div className="warmwind-body text-sm">
                              {config.status === 'configuring' && `${config.progress}%`}
                              {config.status === 'completed' && 'Ready'}
                              {config.status === 'error' && 'Error'}
                              {config.status === 'pending' && 'Pending'}
                            </div>
                            {config.status === 'configuring' && (
                              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${config.progress}%` }}
                                  className="h-full bg-blue-400 rounded-full"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        {getStatusIcon(model.id)}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {!isDownloading && setupStatus.overallProgress === 0 && (
            <>
              <button
                onClick={handleStartDownload}
                className="flex-1 warmwind-button bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20"
              >
                <Download className="w-5 h-5" />
                <span>Configure AI Models</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="flex-1 warmwind-button border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
              >
                Skip for Now
              </button>
            </>
          )}

          {isDownloading && (
            <div className="flex-1 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 mx-auto mb-4 border-2 border-blue-400 border-t-transparent rounded-full"
              />
              <p className="warmwind-body">
                Configuring AI models... Checking server availability.
              </p>
              {setupStatus.currentModel && (
                <p className="warmwind-body text-sm opacity-70 mt-2">
                  Currently configuring: {llmSetupService.getModelInfo(setupStatus.currentModel)?.name}
                </p>
              )}
            </div>
          )}

          {setupStatus.isSetupComplete && (
            <button
              onClick={onComplete}
              className="flex-1 warmwind-button bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Continue to Dashboard</span>
            </button>
          )}
        </motion.div>

        {/* Info Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="mt-6 p-4 rounded-xl bg-blue-400/10 border border-blue-400/20"
        >
          <p className="warmwind-body text-sm text-blue-300">
            <strong>Note:</strong> AI models run on the server for optimal performance and resource management. 
            You can configure additional models later from the settings.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
