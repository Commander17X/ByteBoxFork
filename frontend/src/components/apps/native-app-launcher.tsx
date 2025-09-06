'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, 
  Search, 
  Play, 
  Pause, 
  Square, 
  Maximize2, 
  Minimize2, 
  X, 
  Settings,
  Zap,
  Star,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react'
import { nativeAppBridge } from '@/lib/native-app-bridge'
import { windowsIntegration } from '@/lib/windows-integration'

interface NativeApp {
  id: string
  name: string
  executable: string
  icon: string
  category: 'productivity' | 'entertainment' | 'development' | 'communication' | 'utilities'
  description: string
  version: string
  isInstalled: boolean
  isRunning: boolean
  pid?: number
  memoryUsage?: number
  cpuUsage?: number
}

interface NativeAppLauncherProps {
  onClose: () => void
}

const popularApps: NativeApp[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    executable: 'spotify.exe',
    icon: '🎵',
    category: 'entertainment',
    description: 'Music streaming and discovery',
    version: '1.2.15.1234',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'cursor',
    name: 'Cursor AI',
    executable: 'cursor.exe',
    icon: '🤖',
    category: 'development',
    description: 'AI-powered code editor',
    version: '0.42.0',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    executable: 'excel.exe',
    icon: '📊',
    category: 'productivity',
    description: 'Spreadsheet and data analysis',
    version: '16.0.14326.20404',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'word',
    name: 'Microsoft Word',
    executable: 'winword.exe',
    icon: '📝',
    category: 'productivity',
    description: 'Document creation and editing',
    version: '16.0.14326.20404',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'powerpoint',
    name: 'Microsoft PowerPoint',
    executable: 'powerpnt.exe',
    icon: '📈',
    category: 'productivity',
    description: 'Presentation creation',
    version: '16.0.14326.20404',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    executable: 'chrome.exe',
    icon: '🌐',
    category: 'utilities',
    description: 'Web browser',
    version: '120.0.6099.109',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    executable: 'code.exe',
    icon: '💻',
    category: 'development',
    description: 'Code editor and IDE',
    version: '1.85.1',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'discord',
    name: 'Discord',
    executable: 'discord.exe',
    icon: '💬',
    category: 'communication',
    description: 'Voice and text communication',
    version: '1.0.9017',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'slack',
    name: 'Slack',
    executable: 'slack.exe',
    icon: '💼',
    category: 'communication',
    description: 'Team collaboration platform',
    version: '4.36.137',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'notion',
    name: 'Notion',
    executable: 'notion.exe',
    icon: '📚',
    category: 'productivity',
    description: 'All-in-one workspace',
    version: '2.1.20',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'figma',
    name: 'Figma',
    executable: 'figma.exe',
    icon: '🎨',
    category: 'development',
    description: 'Design and prototyping tool',
    version: '116.3.0',
    isInstalled: false,
    isRunning: false
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    executable: 'photoshop.exe',
    icon: '🖼️',
    category: 'development',
    description: 'Image editing and design',
    version: '25.1.0',
    isInstalled: false,
    isRunning: false
  }
]

const categories = [
  { id: 'all', name: 'All Apps', icon: Monitor },
  { id: 'productivity', name: 'Productivity', icon: HardDrive },
  { id: 'entertainment', name: 'Entertainment', icon: Play },
  { id: 'development', name: 'Development', icon: Cpu },
  { id: 'communication', name: 'Communication', icon: MemoryStick },
  { id: 'utilities', name: 'Utilities', icon: Settings }
]

export function NativeAppLauncher({ onClose }: NativeAppLauncherProps) {
  const [apps, setApps] = useState<NativeApp[]>(popularApps)
  const [filteredApps, setFilteredApps] = useState<NativeApp[]>(popularApps)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isInstalling, setIsInstalling] = useState<string | null>(null)
  const [runningApps, setRunningApps] = useState<NativeApp[]>([])

  // Filter apps based on category and search
  useEffect(() => {
    let filtered = apps

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredApps(filtered)
  }, [apps, selectedCategory, searchQuery])

  // Check for running processes (simulated)
  useEffect(() => {
    const checkRunningApps = () => {
      // In a real implementation, this would check actual Windows processes
      const running = apps.filter(app => app.isRunning)
      setRunningApps(running)
    }

    checkRunningApps()
    const interval = setInterval(checkRunningApps, 5000)
    return () => clearInterval(interval)
  }, [apps])

  const handleInstallApp = async (appId: string) => {
    setIsInstalling(appId)
    
    try {
      // Check if app is already installed
      const isInstalled = await checkAppInstallation(appId)
      
      if (!isInstalled) {
        // Show notification about installation
        windowsIntegration.showNotification({
          title: 'App Installation',
          message: `${apps.find(a => a.id === appId)?.name} is being installed...`,
          icon: '📦',
          appName: 'App Store'
        })
        
        // Simulate installation process
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      setApps(prev => prev.map(app => 
        app.id === appId 
          ? { ...app, isInstalled: true }
          : app
      ))
      
    } catch (error) {
      console.error('Installation failed:', error)
      windowsIntegration.showNotification({
        title: 'Installation Failed',
        message: `Failed to install ${apps.find(a => a.id === appId)?.name}`,
        icon: '❌',
        appName: 'App Store'
      })
    } finally {
      setIsInstalling(null)
    }
  }

  const handleLaunchApp = async (appId: string) => {
    const app = apps.find(a => a.id === appId)
    if (!app) return

    try {
      if (!app.isInstalled) {
        await handleInstallApp(appId)
      }

      // Launch the actual native app
      const appConfig = {
        executable: app.executable,
        args: [],
        options: {
          detached: false,
          stdio: 'ignore'
        }
      }

      const result = await nativeAppBridge.launchNativeApp(appId, {
        width: 800,
        height: 600,
        frameRate: 30,
        quality: 'high',
        audio: true,
        cursor: true
      })

      if (result) {
        setApps(prev => prev.map(a => 
          a.id === appId 
            ? { ...a, isRunning: true, pid: result.processId }
            : a
        ))

        windowsIntegration.showNotification({
          title: 'App Launched',
          message: `${app.name} is now running`,
          icon: app.icon,
          appName: app.name
        })
      }
    } catch (error) {
      console.error('Failed to launch app:', error)
      windowsIntegration.showNotification({
        title: 'Launch Failed',
        message: `Failed to launch ${app.name}`,
        icon: '❌',
        appName: 'App Launcher'
      })
    }
  }

  const checkAppInstallation = async (appId: string): Promise<boolean> => {
    try {
      // Check if the app is installed on the system
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const installedApps = await (window as any).electronAPI.getInstalledApps()
        const app = apps.find(a => a.id === appId)
        return installedApps.some((installed: any) => 
          installed.name.toLowerCase().includes(app?.name.toLowerCase() || '')
        )
      }
      return Math.random() > 0.3 // 70% chance of being installed
    } catch (error) {
      console.error('Failed to check installation:', error)
      return false
    }
  }

  const handleStopApp = async (appId: string) => {
    const app = apps.find(a => a.id === appId)
    if (!app || !app.pid) return

    try {
      // Terminate the actual native app
      await nativeAppBridge.terminateApp(app.pid.toString())
      
      setApps(prev => prev.map(a => 
        a.id === appId 
          ? { ...a, isRunning: false, pid: undefined }
          : a
      ))

      windowsIntegration.showNotification({
        title: 'App Stopped',
        message: `${app.name} has been terminated`,
        icon: app.icon,
        appName: app.name
      })
    } catch (error) {
      console.error('Failed to stop app:', error)
      windowsIntegration.showNotification({
        title: 'Stop Failed',
        message: `Failed to stop ${app.name}`,
        icon: '❌',
        appName: 'App Launcher'
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.icon : Monitor
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-6xl mx-auto p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/20 rounded-xl">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="warmwind-text text-xl font-semibold">Virtual App Launcher</h2>
            <p className="warmwind-body text-sm opacity-70">Launch and manage virtual applications in isolated web environment</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-all duration-200 text-white"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/80" />
          <input
            type="text"
            placeholder="Search virtual applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-0 outline-none text-white placeholder-white/60"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-white font-medium"
                style={{
                  background: selectedCategory === category.id 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: selectedCategory === category.id 
                    ? '1px solid rgba(255, 255, 255, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  background: 'rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="warmwind-body text-sm">{category.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Running Apps Section */}
      {runningApps.length > 0 && (
        <div className="mb-6">
          <h3 className="warmwind-text text-lg font-semibold mb-3 flex items-center space-x-2">
            <Zap className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            <span>Running Applications</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {runningApps.map(app => (
              <motion.div
                key={app.id}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-accent)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{app.icon}</div>
                    <div>
                      <h4 className="warmwind-text font-medium">{app.name}</h4>
                      <p className="warmwind-body text-xs opacity-70">PID: {app.pid}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStopApp(app.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Square className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Apps Grid */}
      <div className="space-y-4">
        <h3 className="warmwind-text text-lg font-semibold flex items-center space-x-2">
          <Star className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          <span>Available Applications</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps.map(app => {
            const CategoryIcon = getCategoryIcon(app.category)
            return (
              <motion.div
                key={app.id}
                className="p-4 rounded-xl transition-all duration-200"
                style={{
                  background: app.isInstalled 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  background: 'rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-3">
                  {/* App Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{app.icon}</div>
                      <div>
                        <h4 className="warmwind-text font-medium">{app.name}</h4>
                        <p className="warmwind-body text-xs opacity-70">{app.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CategoryIcon className="w-4 h-4 opacity-60" />
                    </div>
                  </div>

                  {/* App Description */}
                  <p className="warmwind-body text-sm opacity-80">{app.description}</p>

                  {/* App Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {app.isRunning ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="warmwind-body text-xs">Running</span>
                        </div>
                      ) : app.isInstalled ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="warmwind-body text-xs">Installed</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="warmwind-body text-xs">Not Installed</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      onClick={() => app.isRunning ? handleStopApp(app.id) : handleLaunchApp(app.id)}
                      disabled={isInstalling === app.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white"
                      style={{
                        background: app.isRunning
                          ? 'rgba(239, 68, 68, 0.3)'
                          : app.isInstalled
                          ? 'rgba(34, 197, 94, 0.3)'
                          : 'rgba(59, 130, 246, 0.3)',
                        backdropFilter: 'blur(10px)',
                        border: app.isRunning
                          ? '1px solid rgba(239, 68, 68, 0.5)'
                          : app.isInstalled
                          ? '1px solid rgba(34, 197, 94, 0.5)'
                          : '1px solid rgba(59, 130, 246, 0.5)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        background: app.isRunning
                          ? 'rgba(239, 68, 68, 0.4)'
                          : app.isInstalled
                          ? 'rgba(34, 197, 94, 0.4)'
                          : 'rgba(59, 130, 246, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isInstalling === app.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Installing...</span>
                        </div>
                      ) : app.isRunning ? (
                        <div className="flex items-center space-x-2">
                          <Square className="w-4 h-4" />
                          <span>Stop</span>
                        </div>
                      ) : app.isInstalled ? (
                        <div className="flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Launch</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>Install & Launch</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--theme-muted)' }} />
              <span className="warmwind-body opacity-70">
                {runningApps.length} running, {apps.filter(a => a.isInstalled).length} installed
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="warmwind-body opacity-70">Native Windows Integration</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
