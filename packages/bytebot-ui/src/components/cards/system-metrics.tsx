'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemMetricsCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: 'neon-blue' | 'neon-green' | 'neon-purple' | 'neon-pink'
  trend: 'up' | 'down' | 'stable'
}

export function SystemMetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: SystemMetricsCardProps) {
  const colorClasses = {
    'neon-blue': 'text-neon-blue border-neon-blue/30 bg-neon-blue/10',
    'neon-green': 'text-neon-green border-neon-green/30 bg-neon-green/10',
    'neon-purple': 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
    'neon-pink': 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  }

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }

  const TrendIcon = trendIcons[trend]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-panel p-6 card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-lg border",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <TrendIcon className="w-4 h-4" />
          <span className="text-gray-400 capitalize">{trend}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  )
}
