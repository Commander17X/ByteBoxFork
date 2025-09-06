import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { llmSetupService, LLMSetupStatus } from '@/lib/llm-setup-service'

export const useLLMSetup = () => {
  const { user, updateLLMSetupStatus, isLLMSetupCompleted } = useAuthStore()
  const [setupStatus, setSetupStatus] = useState<LLMSetupStatus>(llmSetupService.getSetupStatus())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = llmSetupService.onSetupProgress((status) => {
      setSetupStatus(status)
    })

    return unsubscribe
  }, [])

  const startSetup = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      await llmSetupService.startLLMSetup()
    } catch (error) {
      console.error('LLM setup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const skipSetup = async () => {
    if (!user?.id) return

    try {
      await llmSetupService.skipLLMSetup()
      updateLLMSetupStatus(false, [], true)
    } catch (error) {
      console.error('Failed to skip LLM setup:', error)
      throw error
    }
  }

  const getSetupProgress = () => {
    return {
      isCompleted: isLLMSetupCompleted(),
      progress: setupStatus.overallProgress,
      completedModels: setupStatus.completedModels,
      totalModels: setupStatus.totalModels,
      currentModel: setupStatus.currentModel,
      configurations: setupStatus.configurations
    }
  }

  const getAvailableModels = () => {
    return llmSetupService.getDefaultModels()
  }

  const getRequiredModels = () => {
    return llmSetupService.getRequiredModels()
  }

  const getTotalModelSize = () => {
    return llmSetupService.getTotalModelSize()
  }

  const getRequiredModelSize = () => {
    return llmSetupService.getRequiredModelSize()
  }

  return {
    setupStatus,
    isLoading,
    startSetup,
    skipSetup,
    getSetupProgress,
    getAvailableModels,
    getRequiredModels,
    getTotalModelSize,
    getRequiredModelSize,
    isSetupCompleted: isLLMSetupCompleted()
  }
}
