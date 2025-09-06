'use client'

import { motion } from 'framer-motion'
import { Bot, Activity, Cpu, MemoryStick, Clock } from 'lucide-react'
import { Agent } from '@/store/app-store'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusClasses = {
    idle: 'status-idle',
    active: 'status-active',
    failed: 'status-failed',
    autonomous: 'status-autonomous',
  }

  const statusLabels = {
    idle: 'Idle',
    active: 'Active',
    failed: 'Failed',
    autonomous: 'Autonomous',
  }

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  const formatLastActivity = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="glass-panel p-4 card-hover"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-neon-blue/20 rounded-lg">
            <Bot className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-400">
              {agent.currentTask || 'No active task'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={cn("status-indicator", statusClasses[agent.status])} />
          <span className="text-sm text-gray-300">
            {statusLabels[agent.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{agent.cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <MemoryStick className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{agent.memoryUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{formatUptime(agent.uptime)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last activity: {formatLastActivity(agent.lastActivity)}</span>
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>Monitoring</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
