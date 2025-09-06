'use client'

import { motion } from 'framer-motion'
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

export function RecentDecisions() {
  const { decisions } = useAppStore()

  // Mock recent decisions for demo
  const mockDecisions = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      agent: 'Backup Agent',
      action: 'Scheduled backup',
      reasoning: 'Daily backup routine triggered',
      status: 'executed' as const,
      impact: 'low' as const,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      agent: 'Security Agent',
      action: 'Blocked suspicious connection',
      reasoning: 'Detected unusual traffic pattern',
      status: 'approved' as const,
      impact: 'high' as const,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      agent: 'Monitoring Agent',
      action: 'Restarted service',
      reasoning: 'Service was consuming excessive memory',
      status: 'executed' as const,
      impact: 'medium' as const,
    },
  ]

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    blocked: XCircle,
    executed: CheckCircle,
  }

  const statusColors = {
    pending: 'text-yellow-400',
    approved: 'text-neon-green',
    blocked: 'text-red-400',
    executed: 'text-neon-blue',
  }

  const impactColors = {
    low: 'bg-neon-green/20 text-neon-green border-neon-green/30',
    medium: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
    high: 'bg-red-400/20 text-red-400 border-red-400/30',
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="w-5 h-5 text-neon-purple" />
        <h2 className="text-xl font-semibold">Recent Decisions</h2>
      </div>
      
      <div className="space-y-4">
        {mockDecisions.map((decision, index) => {
          const StatusIcon = statusIcons[decision.status]
          
          return (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <StatusIcon className={cn("w-4 h-4", statusColors[decision.status])} />
                  <span className="text-sm font-medium text-white">{decision.agent}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs border",
                    impactColors[decision.impact]
                  )}>
                    {decision.impact}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(decision.timestamp)}</span>
                </div>
              </div>
              
              <div className="mb-2">
                <p className="text-sm text-gray-300 font-medium">{decision.action}</p>
                <p className="text-xs text-gray-500 mt-1">{decision.reasoning}</p>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500">Status:</span>
                <span className={cn("capitalize", statusColors[decision.status])}>
                  {decision.status}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 p-3 text-sm text-neon-blue hover:bg-neon-blue/10 
                 rounded-lg border border-neon-blue/30 transition-colors"
      >
        View All Decisions
      </motion.button>
    </div>
  )
}
