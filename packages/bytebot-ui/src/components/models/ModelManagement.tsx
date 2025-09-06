'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Trash2, Play, Pause, Settings } from 'lucide-react'
import { Model } from '@/types'
import { Button } from '@/components/ui/button'

interface ModelManagementProps {
  className?: string
}

export function ModelManagement({ className = '' }: ModelManagementProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/tasks/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoading(false)
    }
  }

  const installModel = async (modelName: string) => {
    setInstalling(modelName)
    try {
      // This would typically call an API to install the model
      console.log('Installing model:', modelName)
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000))
      await fetchModels() // Refresh the list
    } catch (error) {
      console.error('Failed to install model:', error)
    } finally {
      setInstalling(null)
    }
  }

  const removeModel = async (modelName: string) => {
    try {
      // This would typically call an API to remove the model
      console.log('Removing model:', modelName)
      await fetchModels() // Refresh the list
    } catch (error) {
      console.error('Failed to remove model:', error)
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Model Management</h2>
        <p className="text-white/60">Install and manage AI models for ByteBot</p>
      </div>

      <div className="space-y-4">
        {models.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No models installed</p>
            <p className="text-sm text-white/40">Install your first model to get started</p>
          </div>
        ) : (
          models.map((model) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {model.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-2">
                    {model.provider} • {model.name}
                  </p>
                  {model.contextWindow && (
                    <p className="text-xs text-white/40">
                      Context: {model.contextWindow.toLocaleString()} tokens
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => installModel(model.name)}
                    disabled={installing === model.name}
                  >
                    {installing === model.name ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeModel(model.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
