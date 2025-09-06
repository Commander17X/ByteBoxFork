'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AgentTask {
  id: string
  agentId: string
  type: string
  payload: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  result?: any
  error?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface Agent {
  id: string
  name: string
  type: string
  status: 'idle' | 'active' | 'failed' | 'autonomous'
  config: Record<string, any>
  createdAt: Date
  lastActivity: Date
  uptime: number
  currentTask?: string
  capabilities: string[]
  policies: string[]
  isAutonomous: boolean
}

interface AgentState {
  agents: Agent[]
  tasks: AgentTask[]
  isInitialized: boolean
  lastSync: Date | null

  // Actions
  initializeAgents: () => void
  createTask: (task: Omit<AgentTask, 'id' | 'createdAt'>) => void
  updateTask: (taskId: string, updates: Partial<AgentTask>) => void
  completeTask: (taskId: string, result?: any) => void
  failTask: (taskId: string, error: string) => void
  setAgentStatus: (agentId: string, status: Agent['status']) => void
  setAgentAutonomous: (agentId: string, isAutonomous: boolean) => void
  updateAgentActivity: (agentId: string) => void
  getAgentTasks: (agentId: string) => AgentTask[]
  getRunningTasks: () => AgentTask[]
  getPendingTasks: () => AgentTask[]
  clearCompletedTasks: () => void
  syncWithBackend: () => Promise<void>
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      tasks: [],
      isInitialized: false,
      lastSync: null,

      initializeAgents: () => {
        const defaultAgents: Agent[] = [
          {
            id: 'backup-agent',
            name: 'Backup Agent',
            type: 'backup',
            status: 'autonomous',
            config: { schedule: 'daily', retentionDays: 30 },
            createdAt: new Date(),
            lastActivity: new Date(),
            uptime: 0,
            capabilities: ['file-backup', 'database-backup', 'scheduled-tasks'],
            policies: ['daily-backup', 'retention-policy'],
            isAutonomous: true
          },
          {
            id: 'monitoring-agent',
            name: 'Monitoring Agent',
            type: 'monitoring',
            status: 'autonomous',
            config: { checkInterval: 300000 }, // 5 minutes
            createdAt: new Date(),
            lastActivity: new Date(),
            uptime: 0,
            capabilities: ['system-monitoring', 'alerting', 'performance-optimization'],
            policies: ['resource-monitoring', 'auto-scaling'],
            isAutonomous: true
          },
          {
            id: 'security-agent',
            name: 'Security Agent',
            type: 'security',
            status: 'autonomous',
            config: { scanInterval: 3600000 }, // 1 hour
            createdAt: new Date(),
            lastActivity: new Date(),
            uptime: 0,
            capabilities: ['threat-detection', 'access-control', 'audit-logging'],
            policies: ['security-scan', 'access-monitoring'],
            isAutonomous: true
          },
          {
            id: 'task-agent',
            name: 'Task Management Agent',
            type: 'task-manager',
            status: 'idle',
            config: { maxConcurrentTasks: 5 },
            createdAt: new Date(),
            lastActivity: new Date(),
            uptime: 0,
            capabilities: ['task-scheduling', 'workflow-automation', 'deadline-tracking'],
            policies: ['task-priority', 'deadline-alerts'],
            isAutonomous: false
          }
        ]

        set({
          agents: defaultAgents,
          isInitialized: true
        })
      },

      createTask: (taskData) => {
        const task: AgentTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          ...taskData
        }

        set(state => ({
          tasks: [...state.tasks, task]
        }))
      },

      updateTask: (taskId, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? { ...task, ...updates }
              : task
          )
        }))
      },

      completeTask: (taskId, result) => {
        const now = new Date()
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'completed' as const,
                  completedAt: now,
                  result
                }
              : task
          )
        }))
      },

      failTask: (taskId, error) => {
        const now = new Date()
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'failed' as const,
                  completedAt: now,
                  error
                }
              : task
          )
        }))
      },

      setAgentStatus: (agentId, status) => {
        set(state => ({
          agents: state.agents.map(agent =>
            agent.id === agentId
              ? { ...agent, status, lastActivity: new Date() }
              : agent
          )
        }))
      },

      setAgentAutonomous: (agentId, isAutonomous) => {
        set(state => ({
          agents: state.agents.map(agent =>
            agent.id === agentId
              ? { ...agent, isAutonomous }
              : agent
          )
        }))
      },

      updateAgentActivity: (agentId) => {
        set(state => ({
          agents: state.agents.map(agent =>
            agent.id === agentId
              ? { ...agent, lastActivity: new Date() }
              : agent
          )
        }))
      },

      getAgentTasks: (agentId) => {
        return get().tasks.filter(task => task.agentId === agentId)
      },

      getRunningTasks: () => {
        return get().tasks.filter(task => task.status === 'running')
      },

      getPendingTasks: () => {
        return get().tasks.filter(task => task.status === 'pending')
      },

      clearCompletedTasks: () => {
        set(state => ({
          tasks: state.tasks.filter(task => task.status !== 'completed')
        }))
      },

      syncWithBackend: async () => {
        try {
          // Simulate backend sync
          await new Promise(resolve => setTimeout(resolve, 1000))

          set({ lastSync: new Date() })

          // In a real implementation, this would sync with your backend API
          console.log('Synced agent data with backend')
        } catch (error) {
          console.error('Failed to sync with backend:', error)
        }
      }
    }),
    {
      name: 'agent-storage',
      partialize: (state) => ({
        agents: state.agents,
        tasks: state.tasks.filter(task => task.status !== 'completed'), // Don't persist completed tasks
        isInitialized: state.isInitialized,
        lastSync: state.lastSync
      })
    }
  )
)

// Initialize agents on first load
if (typeof window !== 'undefined') {
  const store = useAgentStore.getState()
  if (!store.isInitialized) {
    store.initializeAgents()
  }
}
