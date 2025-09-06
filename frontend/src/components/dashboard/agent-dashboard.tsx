'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Play,
  Pause,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  MessageSquare,
  TrendingUp,
  Calendar,
  Timer
} from 'lucide-react'
import { useAgentStore, Agent, AgentTask } from '@/store/agent-store'
import TaskSchedulerDashboard from './task-scheduler-dashboard'

interface AgentDashboardProps {
  onClose: () => void
}

export function AgentDashboard({ onClose }: AgentDashboardProps) {
  const {
    agents,
    tasks,
    createTask,
    setAgentStatus,
    setAgentAutonomous,
    getRunningTasks,
    getPendingTasks,
    clearCompletedTasks,
    syncWithBackend
  } = useAgentStore()

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [activeTab, setActiveTab] = useState<'agents' | 'scheduler'>('agents')
  const [newTask, setNewTask] = useState({
    agentId: '',
    type: 'custom',
    payload: {} as Record<string, any>,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })

  const runningTasks = getRunningTasks()
  const pendingTasks = getPendingTasks()
  const completedTasks = tasks.filter(task => task.status === 'completed')

  const handleCreateTask = () => {
    if (!newTask.agentId || !newTask.type) return

    createTask({
      agentId: newTask.agentId,
      type: newTask.type,
      payload: newTask.payload,
      status: 'pending',
      priority: newTask.priority
    })

    setNewTask({
      agentId: '',
      type: 'custom',
      payload: {},
      priority: 'medium'
    })
    setShowTaskCreator(false)
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'autonomous': return 'text-white/80'
      case 'active': return 'text-white/60'
      case 'idle': return 'text-white/50'
      case 'failed': return 'text-white/70'
      default: return 'text-white/50'
    }
  }

  const getTaskStatusColor = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed': return 'text-white/80'
      case 'running': return 'text-white/60'
      case 'pending': return 'text-white/50'
      case 'failed': return 'text-white/70'
      default: return 'text-white/50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ userSelect: 'none' }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full h-full ethereal-card overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl warmwind-text font-display">Agent Dashboard</h1>
            <p className="warmwind-body text-sm">Monitor your autonomous agents and workflow</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'agents' && (
            <>
              <button
                onClick={() => setShowTaskCreator(true)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors warmwind-body text-sm"
              >
                Create Task
              </button>
              <button
                onClick={clearCompletedTasks}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors warmwind-body text-sm"
              >
                Clear Completed
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-white/10">
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
            activeTab === 'agents'
              ? 'text-white border-b-2 border-blue-400 bg-white/5'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="warmwind-body text-sm font-medium">Agents</span>
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
            activeTab === 'scheduler'
              ? 'text-white border-b-2 border-blue-400 bg-white/5'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="warmwind-body text-sm font-medium">Task Scheduler</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'agents' ? (
            <motion.div
              key="agents"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 h-full"
            >
              {/* Agents List */}
              <div className="p-6 border-r border-white/10">
            <h2 className="text-lg warmwind-text font-display mb-4">Your Agents</h2>
            <div className="space-y-3">
              {agents.map(agent => (
                <motion.div
                  key={agent.id}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                    selectedAgent?.id === agent.id
                      ? 'bg-white/15 border-white/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white/80" />
                      </div>
                      <div>
                        <h3 className="warmwind-text text-sm font-medium">{agent.name}</h3>
                        <p className="warmwind-body text-xs text-white/60">{agent.type}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agent.status)} bg-current/20`}>
                      {agent.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="warmwind-body text-white/60">
                      {agent.capabilities.length} capabilities
                    </span>
                    <div className="flex items-center space-x-2">
                      {agent.isAutonomous && (
                        <Zap className="w-3 h-3 text-yellow-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setAgentStatus(agent.id, agent.status === 'active' ? 'idle' : 'active')
                        }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {agent.status === 'active' ? (
                          <Pause className="w-3 h-3 text-white/60" />
                        ) : (
                          <Play className="w-3 h-3 text-white/60" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Agent Details & Tasks */}
          <div className="p-6 lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedAgent ? (
                <motion.div
                  key={selectedAgent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Agent Details */}
                  <div className="ethereal-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white/80" />
                        </div>
                        <div>
                          <h2 className="text-xl warmwind-text font-display">{selectedAgent.name}</h2>
                          <p className="warmwind-body text-sm text-white/70">{selectedAgent.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setAgentAutonomous(selectedAgent.id, !selectedAgent.isAutonomous)}
                          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                            selectedAgent.isAutonomous
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {selectedAgent.isAutonomous ? 'Autonomous' : 'Manual'}
                        </button>
                        <button
                          onClick={() => setAgentStatus(
                            selectedAgent.id,
                            selectedAgent.status === 'active' ? 'idle' : 'active'
                          )}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-xs"
                        >
                          {selectedAgent.status === 'active' ? 'Stop' : 'Start'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl warmwind-text font-display">
                          {Math.floor(selectedAgent.uptime / 3600000)}h
                        </div>
                        <div className="warmwind-body text-xs text-white/60">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl warmwind-text font-display">
                          {tasks.filter(t => t.agentId === selectedAgent.id && t.status === 'completed').length}
                        </div>
                        <div className="warmwind-body text-xs text-white/60">Tasks Done</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl warmwind-text font-display">
                          {tasks.filter(t => t.agentId === selectedAgent.id && t.status === 'running').length}
                        </div>
                        <div className="warmwind-body text-xs text-white/60">Running</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl warmwind-text font-display">
                          {selectedAgent.capabilities.length}
                        </div>
                        <div className="warmwind-body text-xs text-white/60">Capabilities</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="warmwind-text text-sm font-medium">Capabilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.capabilities.map(capability => (
                          <span
                            key={capability}
                            className="px-3 py-1 rounded-full bg-white/10 text-white/80 warmwind-body text-xs"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Agent Tasks */}
                  <div className="ethereal-card p-6">
                    <h3 className="warmwind-text text-lg font-display mb-4">Recent Tasks</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {tasks
                        .filter(task => task.agentId === selectedAgent.id)
                        .slice(0, 10)
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${getTaskStatusColor(task.status)}`} />
                              <div>
                                <div className="warmwind-text text-sm">{task.type}</div>
                                <div className="warmwind-body text-xs text-white/60">
                                  {task.createdAt.toLocaleDateString()} {task.createdAt.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${getTaskStatusColor(task.status)} bg-current/20`}>
                              {task.status}
                            </div>
                          </div>
                        ))}
                      {tasks.filter(task => task.agentId === selectedAgent.id).length === 0 && (
                        <div className="text-center py-8">
                          <Activity className="w-8 h-8 text-white/40 mx-auto mb-2" />
                          <div className="warmwind-body text-sm text-white/60">No tasks yet</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <Bot className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h2 className="text-xl warmwind-text mb-2">Select an Agent</h2>
                    <p className="warmwind-body text-sm text-white/60">
                      Choose an agent from the list to view details and manage tasks
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            </motion.div>
          ) : (
            <motion.div
              key="scheduler"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-hidden"
            >
              <TaskSchedulerDashboard className="h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Creator Modal */}
      <AnimatePresence>
        {showTaskCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md ethereal-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl warmwind-text font-display">Create New Task</h2>
                <button
                  onClick={() => setShowTaskCreator(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">Assign to Agent</label>
                  <select
                    value={newTask.agentId}
                    onChange={(e) => setNewTask({...newTask, agentId: e.target.value})}
                    className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40"
                  >
                    <option value="" className="bg-slate-800/90 text-white">Select an agent...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id} className="bg-slate-800/90 text-white">{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">Task Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                    className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40"
                  >
                    <option value="backup" className="bg-slate-800/90 text-white">Backup</option>
                    <option value="monitor" className="bg-slate-800/90 text-white">Monitor</option>
                    <option value="security-scan" className="bg-slate-800/90 text-white">Security Scan</option>
                    <option value="custom" className="bg-slate-800/90 text-white">Custom Task</option>
                  </select>
                </div>

                <div>
                  <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40"
                  >
                    <option value="low" className="bg-slate-800/90 text-white">Low</option>
                    <option value="medium" className="bg-slate-800/90 text-white">Medium</option>
                    <option value="high" className="bg-slate-800/90 text-white">High</option>
                    <option value="urgent" className="bg-slate-800/90 text-white">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => setShowTaskCreator(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors warmwind-body text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.agentId || !newTask.type}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors warmwind-body text-sm ${
                    newTask.agentId && newTask.type
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
