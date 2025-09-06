'use client'

import { motion } from 'framer-motion'
import { Play, Plus, FileText, Settings, Bot, Zap } from 'lucide-react'

const actions = [
  {
    id: 'start-agent',
    label: 'Start Agent',
    icon: Play,
    color: 'neon-green',
    description: 'Deploy a new AI agent',
  },
  {
    id: 'deploy-app',
    label: 'Deploy App',
    icon: Plus,
    color: 'neon-blue',
    description: 'Install new application',
  },
  {
    id: 'review-log',
    label: 'Review Log',
    icon: FileText,
    color: 'neon-purple',
    description: 'Check decision history',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    color: 'neon-pink',
    description: 'Configure policies',
  },
]

export function QuickActions() {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="w-5 h-5 text-neon-blue" />
        <h2 className="text-xl font-semibold">Quick Actions</h2>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg 
                       hover:bg-white/10 transition-all duration-200 group"
            >
              <div className={`p-2 rounded-lg bg-${action.color}/20 border border-${action.color}/30`}>
                <Icon className={`w-4 h-4 text-${action.color}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white group-hover:text-neon-blue transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
