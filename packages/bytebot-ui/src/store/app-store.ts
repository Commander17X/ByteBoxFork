import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ViewType = 'overview' | 'agents' | 'decisions' | 'apps' | 'settings'

export interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'failed' | 'autonomous'
  currentTask?: string
  uptime: number
  cpuUsage: number
  memoryUsage: number
  lastActivity: Date
}

export interface SystemMetrics {
  cpu: number
  memory: number
  storage: number
  uptime: number
  activeAgents: number
  totalAgents: number
}

export interface Decision {
  id: string
  timestamp: Date
  agent: string
  action: string
  reasoning: string
  status: 'pending' | 'approved' | 'blocked' | 'executed'
  impact: 'low' | 'medium' | 'high'
}

interface AppState {
  currentView: ViewType
  systemMetrics: SystemMetrics
  agents: Agent[]
  decisions: Decision[]
  isLoading: boolean
  
  // Actions
  setCurrentView: (view: ViewType) => void
  updateSystemMetrics: (metrics: SystemMetrics) => void
  updateAgents: (agents: Agent[]) => void
  addDecision: (decision: Decision) => void
  updateDecision: (id: string, status: Decision['status']) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      currentView: 'overview',
      systemMetrics: {
        cpu: 0,
        memory: 0,
        storage: 0,
        uptime: 0,
        activeAgents: 0,
        totalAgents: 0,
      },
      agents: [],
      decisions: [],
      isLoading: false,

      setCurrentView: (view) => set({ currentView: view }),
      
      updateSystemMetrics: (metrics) => set({ systemMetrics: metrics }),
      
      updateAgents: (agents) => set({ agents }),
      
      addDecision: (decision) => set((state) => ({
        decisions: [decision, ...state.decisions].slice(0, 100) // Keep last 100
      })),
      
      updateDecision: (id, status) => set((state) => ({
        decisions: state.decisions.map(d => 
          d.id === id ? { ...d, status } : d
        )
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'h0l0light-app-store',
    }
  )
)
