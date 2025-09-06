'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Play,
  Pause,
  Square,
  Send,
  Eye,
  MousePointer,
  Keyboard,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  MessageSquare,
  Zap
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface HoloAIControllerProps {
  isOpen: boolean
  onClose: () => void
}

interface Task {
  id: string
  description: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  createdAt: string
  updatedAt: string
  result?: any
  error?: string
}

interface AgentStatus {
  isActive: boolean
  currentTask?: Task
  capabilities: Record<string, boolean>
}

export function HoloAIController({ isOpen, onClose }: HoloAIControllerProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    isActive: false,
    capabilities: {}
  })
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [taskHistory, setTaskHistory] = useState<Task[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      connectToHoloAI()
    } else {
      disconnectFromHoloAI()
    }

    return () => {
      disconnectFromHoloAI()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [taskHistory])

  const connectToHoloAI = () => {
    try {
      socketRef.current = io('http://localhost:3002', {
        transports: ['websocket', 'polling']
      })

      socketRef.current.on('connect', () => {
        console.log('Connected to Holo-AI')
        setIsConnected(true)
        fetchAgentStatus()
      })

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from Holo-AI')
        setIsConnected(false)
      })

      socketRef.current.on('agent-status', (status: AgentStatus) => {
        setAgentStatus(status)
      })

      socketRef.current.on('task-started', (data: { taskId: string, description: string }) => {
        setCurrentTask({
          id: data.taskId,
          description: data.description,
          type: 'unknown',
          status: 'running',
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      socketRef.current.on('task-progress', (data: { taskId: string, progress: number, currentStep: string }) => {
        setCurrentTask(prev => prev ? {
          ...prev,
          progress: data.progress,
          currentStep: data.currentStep
        } : null)
      })

      socketRef.current.on('task-completed', (data: { taskId: string, result: any }) => {
        if (currentTask) {
          const completedTask: Task = {
            ...currentTask,
            status: 'completed',
            progress: 100,
            result: data.result,
            updatedAt: new Date().toISOString()
          }
          setTaskHistory(prev => [completedTask, ...prev.slice(0, 9)])
          setCurrentTask(null)
        }
      })

      socketRef.current.on('task-failed', (data: { taskId: string, error: string }) => {
        if (currentTask) {
          const failedTask: Task = {
            ...currentTask,
            status: 'failed',
            error: data.error,
            updatedAt: new Date().toISOString()
          }
          setTaskHistory(prev => [failedTask, ...prev.slice(0, 9)])
          setCurrentTask(null)
        }
      })

    } catch (error) {
      console.error('Failed to connect to Holo-AI:', error)
    }
  }

  const disconnectFromHoloAI = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/agent/status')
      const data = await response.json()
      if (data.success) {
        setAgentStatus(data.agent)
      }
    } catch (error) {
      console.error('Failed to fetch agent status:', error)
    }
  }

  const handleStartAgent = async () => {
    try {
      const response = await fetch('/api/agent/start', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setAgentStatus(prev => ({ ...prev, isActive: true }))
      }
    } catch (error) {
      console.error('Failed to start agent:', error)
    }
  }

  const handleStopAgent = async () => {
    try {
      const response = await fetch('/api/agent/stop', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setAgentStatus(prev => ({ ...prev, isActive: false }))
        setCurrentTask(null)
      }
    } catch (error) {
      console.error('Failed to stop agent:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    if (!isConnected || !agentStatus.isActive) {
      // Show a helpful message when not connected by creating a system task
      const systemTask: Task = {
        id: `system-${Date.now()}`,
        description: '🔴 Holo-AI service is not connected. Please wait for the service to start or check the connection.',
        type: 'system',
        status: 'failed',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        error: 'Service not available'
      }
      setTaskHistory(prev => [systemTask, ...prev.slice(0, 9)])
      return
    }

    setIsTyping(true)

    try {
      // Parse the natural language command
      const taskData = await parseNaturalLanguageCommand(inputMessage.trim())

      // Execute the task
      socketRef.current?.emit('execute-task', taskData)

      // Clear input
      setInputMessage('')

    } catch (error) {
      console.error('Failed to process command:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const parseNaturalLanguageCommand = async (command: string) => {
    // Simple command parsing for web OS - in production, use NLP models
    const lowerCommand = command.toLowerCase()

    // Open web apps
    if (lowerCommand.includes('open') && lowerCommand.includes('excel')) {
      return {
        type: 'web_automation',
        description: 'Open Excel web app',
        parameters: {
          action: 'open',
          target: { app: 'excel' },
          data: { arguments: [] }
        }
      }
    }

    if (lowerCommand.includes('open') && lowerCommand.includes('browser')) {
      return {
        type: 'web_automation',
        description: 'Open web browser',
        parameters: {
          action: 'open',
          target: { app: 'browser' },
          data: { arguments: [] }
        }
      }
    }

    if (lowerCommand.includes('open') && lowerCommand.includes('terminal')) {
      return {
        type: 'web_automation',
        description: 'Open terminal',
        parameters: {
          action: 'open',
          target: { app: 'terminal' },
          data: { arguments: [] }
        }
      }
    }

    if (lowerCommand.includes('open') && lowerCommand.includes('calculator')) {
      return {
        type: 'web_automation',
        description: 'Open calculator',
        parameters: {
          action: 'open',
          target: { app: 'calculator' },
          data: { arguments: [] }
        }
      }
    }

    // Click actions
    if (lowerCommand.includes('click') || lowerCommand.includes('press')) {
      const targetText = extractTargetText(command);
      return {
        type: 'web_automation',
        description: `Click on ${targetText}`,
        parameters: {
          action: 'click',
          target: { label: targetText, type: 'button' },
          data: {}
        }
      }
    }

    // Type actions
    if (lowerCommand.includes('type') || lowerCommand.includes('write') || lowerCommand.includes('enter')) {
      const textToType = extractTextToType(command);
      return {
        type: 'web_automation',
        description: `Type "${textToType}"`,
        parameters: {
          action: 'type',
          target: { type: 'input' },
          data: { text: textToType }
        }
      }
    }

    // Navigation actions
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate')) {
      const url = extractUrl(command);
      if (url) {
        return {
          type: 'web_automation',
          description: `Navigate to ${url}`,
          parameters: {
            action: 'navigate',
            target: { app: 'browser' },
            data: { url }
          }
        }
      }
    }

    // Analysis actions
    if (lowerCommand.includes('analyze') || lowerCommand.includes('check')) {
      return {
        type: 'screen_analysis',
        description: 'Analyze current screen',
        parameters: {
          analysisType: 'elements',
          target: {}
        }
      }
    }

    // Data processing
    if (lowerCommand.includes('summarize') || lowerCommand.includes('process')) {
      return {
        type: 'data_processing',
        description: 'Process data',
        parameters: {
          source: 'current',
          operation: 'summarize',
          destination: 'output'
        }
      }
    }

    // Default to complex task
    return {
      type: 'complex_task',
      description: command,
      parameters: { command }
    }
  }

  const extractTargetText = (command: string): string => {
    // Extract what to click on from the command
    const patterns = [
      /click on (?:the )?(.+?)(?:\s|$)/i,
      /press (?:the )?(.+?)(?:\s|$)/i,
      /click (.+?)(?:\s|$)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'target';
  }

  const extractTextToType = (command: string): string => {
    // Extract text to type from the command
    const patterns = [
      /type ["'](.+?)["'](?:\s|$)/i,
      /write ["'](.+?)["'](?:\s|$)/i,
      /enter ["'](.+?)["'](?:\s|$)/i,
      /type (.+?)(?:\s|$)/i,
      /write (.+?)(?:\s|$)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'text';
  }

  const extractUrl = (text: string): string => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(urlRegex)
    return matches ? matches[0] : ''
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'warmwind-text'
      case 'completed': return 'warmwind-text'
      case 'failed': return 'text-red-400'
      case 'cancelled': return 'warmwind-body opacity-60'
      default: return 'warmwind-body'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-4xl h-[80vh] bg-gradient-to-br from-white/15 to-white/8 border border-white/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex items-center justify-center rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold warmwind-text">Holo-AI Assistant</h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm warmwind-body">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Agent Control Buttons */}
                {agentStatus.isActive ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStopAgent}
                    className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-lg transition-colors"
                    title="Stop Agent"
                  >
                    <Square className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartAgent}
                    className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-lg transition-colors"
                    title="Start Agent"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100%-88px)]">
              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Current Task Status */}
                  {currentTask && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 border border-white/20 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="warmwind-text font-medium">Executing Task</span>
                      </div>
                      <p className="warmwind-body text-sm mb-3">{currentTask.description}</p>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div
                          className="bg-white/60 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${currentTask.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="warmwind-body text-xs mt-2">{currentTask.progress}% complete</p>
                    </motion.div>
                  )}

                  {/* Task History */}
                  {taskHistory.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/20 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(task.status)}
                        <span className={`font-medium ${getStatusColor(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                        <span className="warmwind-body text-sm opacity-70">
                          {new Date(task.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="warmwind-body text-sm">{task.description}</p>
                      {task.error && (
                        <p className="text-red-400 text-xs mt-2 opacity-80">{task.error}</p>
                      )}
                    </motion.div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/20">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Tell Holo-AI what to do... (e.g., 'open Excel and summarize the data')"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 warmwind-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      disabled={isTyping}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-4 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed border border-white/20 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Send</span>
                    </motion.button>
                  </div>

                  {/* Status Message */}
                  <div className="mt-2 text-xs warmwind-body opacity-70">
                    {!isConnected && "🔴 Not connected to Holo-AI"}
                    {isConnected && !agentStatus.isActive && "⚪ Agent is inactive"}
                    {isConnected && agentStatus.isActive && "🟢 Agent is ready to execute tasks"}
                  </div>
                </div>
              </div>

              {/* Sidebar with Capabilities */}
              <div className="w-80 border-l border-white/20 bg-white/5">
                <div className="p-4 border-b border-white/20">
                  <h3 className="text-lg font-semibold warmwind-text mb-3">Capabilities</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="warmwind-body">Screen Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MousePointer className="w-4 h-4 text-green-400" />
                      <span className="warmwind-body">Mouse Control</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Keyboard className="w-4 h-4 text-purple-400" />
                      <span className="warmwind-body">Keyboard Control</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="warmwind-body">Application Control</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-medium warmwind-body mb-3">Example Commands</h4>
                  <div className="space-y-2 text-xs warmwind-body opacity-70">
                    <div>• "open Excel"</div>
                    <div>• "open browser and go to YouTube"</div>
                    <div>• "click on the save button"</div>
                    <div>• "type 'Hello World' in the input"</div>
                    <div>• "analyze the current screen"</div>
                    <div>• "open calculator"</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
