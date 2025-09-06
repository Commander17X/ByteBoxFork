'use client'

import { motion } from 'framer-motion'
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Clock, 
  Bot, 
  Activity,
  Play,
  Plus,
  FileText
} from 'lucide-react'
import { SystemMetricsCard } from '@/components/cards/system-metrics'
import { AgentCard } from '@/components/cards/agent-card'
import { QuickActions } from '@/components/cards/quick-actions'
import { RecentDecisions } from '@/components/cards/recent-decisions'
import { useAppStore } from '@/store/app-store'
import { useEffect } from 'react'

export function OverviewDashboard() {
  const { systemMetrics, agents, updateSystemMetrics, updateAgents } = useAppStore()

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate system metrics updates
      updateSystemMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        uptime: Date.now() - 86400000, // 1 day ago
        activeAgents: Math.floor(Math.random() * 5) + 1,
        totalAgents: 8,
      })

      // Simulate agent updates
      const mockAgents = [
        {
          id: '1',
          name: 'Backup Agent',
          status: 'active' as const,
          currentTask: 'Backing up user data',
          uptime: 3600000,
          cpuUsage: Math.random() * 20,
          memoryUsage: Math.random() * 30,
          lastActivity: new Date(),
        },
        {
          id: '2',
          name: 'Monitoring Agent',
          status: 'autonomous' as const,
          currentTask: 'Optimizing system performance',
          uptime: 7200000,
          cpuUsage: Math.random() * 15,
          memoryUsage: Math.random() * 25,
          lastActivity: new Date(),
        },
        {
          id: '3',
          name: 'Security Agent',
          status: 'idle' as const,
          uptime: 1800000,
          cpuUsage: Math.random() * 5,
          memoryUsage: Math.random() * 10,
          lastActivity: new Date(Date.now() - 300000),
        },
      ]
      updateAgents(mockAgents)
    }, 2000)

    return () => clearInterval(interval)
  }, [updateSystemMetrics, updateAgents])

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome to <span className="neon-text">H0l0Light-OS</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Your AI-first cloud platform is running autonomously
          </p>
        </motion.div>

        {/* System Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <SystemMetricsCard
            title="CPU Usage"
            value={`${systemMetrics.cpu.toFixed(1)}%`}
            icon={Cpu}
            color="neon-blue"
            trend="stable"
          />
          <SystemMetricsCard
            title="Memory"
            value={`${systemMetrics.memory.toFixed(1)}%`}
            icon={MemoryStick}
            color="neon-green"
            trend="stable"
          />
          <SystemMetricsCard
            title="Storage"
            value={`${systemMetrics.storage.toFixed(1)}%`}
            icon={HardDrive}
            color="neon-purple"
            trend="stable"
          />
          <SystemMetricsCard
            title="Uptime"
            value={`${Math.floor(systemMetrics.uptime / 3600000)}h`}
            icon={Clock}
            color="neon-pink"
            trend="up"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Agents */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-neon-blue" />
                  <span>Active Agents</span>
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>{systemMetrics.activeAgents} of {systemMetrics.totalAgents} running</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <AgentCard agent={agent} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Recent Decisions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <QuickActions />
            <RecentDecisions />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
