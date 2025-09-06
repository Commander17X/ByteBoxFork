'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Play,
  Square,
  Download,
  Settings,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  X,
  Filter,
  Grid3X3,
  List,
  Package,
  Terminal,
  Folder,
  Zap,
  Shield,
  Activity,
  Brain
} from 'lucide-react'
import { sandboxManager, SandboxApp, SandboxEnvironment, SandboxProcess } from '@/lib/sandbox-environment'

interface SandboxAppLauncherProps {
  onClose: () => void
  onLaunchApp: (app: SandboxApp) => void
}

export function SandboxAppLauncher({ onClose, onLaunchApp }: SandboxAppLauncherProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedApp, setSelectedApp] = useState<SandboxApp | null>(null)
  const [environment, setEnvironment] = useState<SandboxEnvironment | null>(null)
  const [runningProcesses, setRunningProcesses] = useState<SandboxProcess[]>([])
  const [resourceUsage, setResourceUsage] = useState<any>(null)
  const [isInstalling, setIsInstalling] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Apps', icon: Grid3X3 },
    { id: 'system', name: 'System', icon: Settings },
    { id: 'productivity', name: 'Productivity', icon: Zap },
    { id: 'development', name: 'Development', icon: Terminal },
    { id: 'creative', name: 'Creative', icon: Package },
    { id: 'entertainment', name: 'Entertainment', icon: Monitor },
    { id: 'business', name: 'Business', icon: Shield },
    { id: 'ai', name: 'AI & Agents', icon: Brain }
  ]

  useEffect(() => {
    // Load environment data
    const env = sandboxManager.getEnvironment('default')
    setEnvironment(env)
    
    if (env) {
      setRunningProcesses(sandboxManager.getRunningProcesses('default'))
      setResourceUsage(sandboxManager.getResourceUsage('default'))
    }
  }, [])

  const allApps = sandboxManager.getAllApps()
  const installedApps = environment?.installedApps || []

  const filteredApps = allApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInstallApp = async (app: SandboxApp) => {
    if (app.isInstalled) return

    setIsInstalling(app.id)
    try {
      const success = await sandboxManager.installApp(app.id, 'default')
      if (success) {
        // Refresh environment data
        const env = sandboxManager.getEnvironment('default')
        setEnvironment(env)
        setResourceUsage(sandboxManager.getResourceUsage('default'))
      }
    } catch (error) {
      console.error('Failed to install app:', error)
    } finally {
      setIsInstalling(null)
    }
  }

  const handleLaunchApp = async (app: SandboxApp) => {
    if (!app.isInstalled) {
      await handleInstallApp(app)
      return
    }

    try {
      const process = await sandboxManager.launchApp(app.id, 'default')
      if (process) {
        onLaunchApp(app)
        // Refresh running processes
        setRunningProcesses(sandboxManager.getRunningProcesses('default'))
        setResourceUsage(sandboxManager.getResourceUsage('default'))
      }
    } catch (error) {
      console.error('Failed to launch app:', error)
    }
  }

  const handleStopApp = async (app: SandboxApp) => {
    try {
      await sandboxManager.stopApp(app.id, 'default')
      // Refresh running processes
      setRunningProcesses(sandboxManager.getRunningProcesses('default'))
      setResourceUsage(sandboxManager.getResourceUsage('default'))
    } catch (error) {
      console.error('Failed to stop app:', error)
    }
  }

  const getAppStatus = (app: SandboxApp) => {
    if (app.isRunning) return 'running'
    if (app.isInstalled) return 'installed'
    return 'not-installed'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400'
      case 'installed': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />
      case 'installed': return <Package className="w-4 h-4" />
      default: return <Download className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full ethereal-card overflow-hidden flex flex-col"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/20 rounded-xl">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="warmwind-text text-xl font-semibold">Sandbox Environment</h2>
            <p className="warmwind-body text-sm opacity-70">Install and run applications in isolated sandbox</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Resource Usage */}
      {resourceUsage && (
        <div className="p-4 border-b border-white/10">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MemoryStick className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <div className="text-xs text-white/70">Memory</div>
                <div className="text-sm font-medium">
                  {Math.round(resourceUsage.memory.used / 1024)}GB / {Math.round(resourceUsage.memory.total / 1024)}GB
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${resourceUsage.memory.percentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-green-400" />
              <div className="flex-1">
                <div className="text-xs text-white/70">Storage</div>
                <div className="text-sm font-medium">
                  {Math.round(resourceUsage.storage.used / 1024)}GB / {Math.round(resourceUsage.storage.total / 1024)}GB
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${resourceUsage.storage.percentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div className="flex-1">
                <div className="text-xs text-white/70">CPU</div>
                <div className="text-sm font-medium">
                  {resourceUsage.cpu.used.toFixed(1)} / {resourceUsage.cpu.total} cores
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                  <div 
                    className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${resourceUsage.cpu.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search sandbox applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredApps.map((app) => {
              const status = getAppStatus(app)
              const isRunning = app.isRunning
              const isAppInstalling = isInstalling === app.id

              return (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                      {app.icon}
                    </div>
                    <div>
                      <h3 className="warmwind-text font-medium text-sm">{app.name}</h3>
                      <p className="warmwind-body text-xs opacity-70 mt-1">{app.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">{app.size}</span>
                      <span className={`${getStatusColor(status)} flex items-center space-x-1`}>
                        {getStatusIcon(status)}
                        <span className="capitalize">{status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {isAppInstalling ? (
                        <div className="flex-1 flex items-center justify-center space-x-2 py-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs">Installing...</span>
                        </div>
                      ) : isRunning ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStopApp(app)
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                          <Square className="w-4 h-4" />
                          <span className="text-xs">Stop</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLaunchApp(app)
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span className="text-xs">{app.isInstalled ? 'Launch' : 'Install'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredApps.map((app) => {
              const status = getAppStatus(app)
              const isRunning = app.isRunning
              const isAppInstalling = isInstalling === app.id

              return (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center space-x-4 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="warmwind-text font-medium text-sm">{app.name}</h3>
                    <p className="warmwind-body text-xs opacity-70 truncate">{app.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-white/50">{app.size}</span>
                      <span className="text-xs text-white/50">{app.developer}</span>
                      <span className={`text-xs ${getStatusColor(status)} flex items-center space-x-1`}>
                        {getStatusIcon(status)}
                        <span className="capitalize">{status.replace('-', ' ')}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isInstalling ? (
                      <div className="flex items-center space-x-2 px-3 py-1">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-xs">Installing...</span>
                      </div>
                    ) : isRunning ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStopApp(app)
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        <span className="text-xs">Stop</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLaunchApp(app)
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-xs">{app.isInstalled ? 'Launch' : 'Install'}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Running Processes */}
      {runningProcesses.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <h3 className="warmwind-text font-medium text-sm mb-3">Running Processes</h3>
          <div className="space-y-2">
            {runningProcesses.map((process) => (
              <div key={process.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="warmwind-body text-sm">{process.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-white/50">
                  <span>{process.memory}MB RAM</span>
                  <span>{process.cpu} CPU</span>
                  <span>{Math.floor((Date.now() - process.startTime.getTime()) / 1000)}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
