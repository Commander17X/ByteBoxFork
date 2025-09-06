'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Palette,
  Layout,
  Move,
  Maximize2,
  Minimize2,
  X,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { WebApp } from '@/components/apps/app-store'
import { AppLauncher } from '@/components/apps/app-launcher'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Window } from '@/components/ui/Window' // Import the new Window component
import { Header } from '@/components/layout/header'
import { persistentTabs } from '@/lib/persistent-tabs'
import { visionAgent } from '@/lib/vision-agent'
import { backgroundAgent } from '@/lib/background-agent'
import { NativeAppLauncher } from '@/components/apps/native-app-launcher'
import { SandboxAppLauncher } from '@/components/apps/sandbox-app-launcher'
import { SandboxAppWindow } from '@/components/apps/sandbox-app-window'
import { WindowsSystemTray } from '@/components/ui/windows-system-tray'

interface DesktopItem {
  id: string
  type: 'widget' | 'app' | 'folder'
  name: string
  icon: string
  x: number
  y: number
  size: 'small' | 'medium' | 'large'
  color?: string
  width?: 'normal' | 'wide'
}


interface OpenWindow {
  id: string
  title: string
  component: 'NativeAppLauncher' | 'SandboxAppLauncher'
}

// Client-side time component to avoid hydration issues
function ClientTime() {
  const [time, setTime] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return <div className="warmwind-body text-sm font-mono">--:--:--</div>
  }

  return <div className="warmwind-body text-sm font-mono">{time}</div>
}

// Client-side date component to avoid hydration issues
function ClientDate() {
  const [date, setDate] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDate(new Date().toLocaleDateString())
  }, [])

  if (!mounted) {
    return <div className="warmwind-body text-sm">--/--/----</div>
  }

  return <div className="warmwind-body text-sm">{date}</div>
}

// Grid system constants

export function BlankDesktop() {
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showNativeAppLauncher, setShowNativeAppLauncher] = useState(false)
  const [showSandboxAppLauncher, setShowSandboxAppLauncher] = useState(false)
  const [installedApps, setInstalledApps] = useState<WebApp[]>([])
  const [runningApps, setRunningApps] = useState<WebApp[]>([])
  const [mounted, setMounted] = useState(false)
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([])
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null)
  
  // Get user preferences from auth store
  const { user, updateUserPreferences, logout } = useAuth()
  const userPreferences = user?.preferences
  
  const [desktopSettings, setDesktopSettings] = useState<{
    wallpaper: string
    gridSize: number
    showGrid: boolean
    showGridOverlay: boolean
    theme: string
  }>({
    wallpaper: userPreferences?.desktopSettings?.wallpaper || 'default',
    gridSize: userPreferences?.desktopSettings?.gridSize || 20,
    showGrid: userPreferences?.desktopSettings?.showGrid ?? true,
    showGridOverlay: userPreferences?.desktopSettings?.showGridOverlay ?? false,
    theme: userPreferences?.theme || 'minimal-gray'
  })

  const desktopRef = useRef<HTMLDivElement>(null)

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle native app launches
  useEffect(() => {
    const handleLaunchApp = (event: CustomEvent) => {
      const { component } = event.detail
      if (component === 'NativeAppLauncher') {
        setShowNativeAppLauncher(true)
      }
    }

    window.addEventListener('launchApp', handleLaunchApp as EventListener)
    return () => {
      window.removeEventListener('launchApp', handleLaunchApp as EventListener)
    }
  }, [])

  // Initialize default desktop apps
  useEffect(() => {
    if (mounted) {
      // Create default desktop apps
      const defaultApps: WebApp[] = []

      // Set default installed apps
      setInstalledApps(defaultApps)

      // Create desktop icons for default apps
      const defaultDesktopItems: DesktopItem[] = []

      setDesktopItems(defaultDesktopItems)

      // Initialize persistent tabs and vision agent
      persistentTabs.initialize()
      visionAgent.initialize()
      visionAgent.start()

      // Initialize background agent service
      backgroundAgent.initialize()

      console.log('🚀 Desktop initialized with persistent tabs, vision agents, and background processing')
    }
  }, [mounted])

  // Update desktop settings and save to user preferences
  const updateDesktopSettings = (newSettings: Partial<typeof desktopSettings>) => {
    const updatedSettings = { ...desktopSettings, ...newSettings }
    setDesktopSettings(updatedSettings)
    
    // Save to user preferences
    updateUserPreferences({
      desktopSettings: {
        wallpaper: updatedSettings.wallpaper,
        gridSize: updatedSettings.gridSize,
        showGrid: updatedSettings.showGrid,
        showGridOverlay: updatedSettings.showGridOverlay
      },
      theme: updatedSettings.theme
    })
  }

  const handleOpenWindow = (id: string, title: string, component: 'NativeAppLauncher' | 'SandboxAppLauncher') => {
    // Check if tab already exists in persistent tabs
    const existingTab = persistentTabs.getTab(id)
    
    if (!existingTab) {
      // Create new persistent tab
      const tabId = persistentTabs.createTab({
        title,
        url: '',
        component,
        favicon: component === 'NativeAppLauncher' ? '🖥️' : component === 'SandboxAppLauncher' ? '📦' : '🤖',
        isPinned: false
      })

      // Add to open windows for rendering
      setOpenWindows(prev => [...prev, { id: tabId, title, component }])
      
      // Calculate position to avoid overlap with better viewport awareness
      const windowCount = openWindows.length
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight - 40 // Account for header
      
      // Use a more intelligent positioning system
      const baseX = 80 + (windowCount * 60)
      const baseY = 120 + (windowCount * 40)
      const x = Math.min(baseX, viewportWidth - 500) // Ensure window fits with margin
      const y = Math.min(baseY, viewportHeight - 400) // Ensure window fits with margin
      
      localStorage.setItem(`window-${tabId}-pos`, JSON.stringify({ x, y }))
      setFocusedWindow(tabId)
    } else {
      // Tab exists, just focus it
      persistentTabs.setActiveTab(id)
      setFocusedWindow(id)
    }
  }

  const handleCloseWindow = (id: string) => {
    // Close the persistent tab (this will only close when explicitly requested)
    persistentTabs.closeTab(id)
    
    // Remove from open windows for rendering
    setOpenWindows(prev => prev.filter(win => win.id !== id))
    
    // Set focus to the new active tab
    const activeTab = persistentTabs.getActiveTab()
    setFocusedWindow(activeTab?.id || null)
  }

  const bringWindowToFront = (id: string) => {
    setFocusedWindow(id)
    setOpenWindows(prev => [
      ...prev.filter(win => win.id !== id),
      prev.find(win => win.id === id) as OpenWindow,
    ])
  }

  // App management functions
  const handleInstallApp = (app: WebApp) => {
    setInstalledApps(prev => [...prev, app])
    // Add app icon to desktop
    const newDesktopItem: DesktopItem = {
      id: app.id,
      type: 'app',
      name: app.name,
      icon: app.name,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      size: 'medium'
    }
    setDesktopItems(prev => [...prev, newDesktopItem])
  }

  const handleLaunchApp = (app: WebApp) => {
    if (!runningApps.find(runningApp => runningApp.id === app.id)) {
      setRunningApps(prev => [...prev, app])
    }
  }

  const handleCloseApp = (appId: string) => {
    setRunningApps(prev => prev.filter(app => app.id !== appId))
  }

  const handleDesktopItemClick = (item: DesktopItem) => {
    if (item.type === 'app') {
      // No apps to handle
    }
  }

  // Show loading state during hydration
  if (!mounted) {
    return (
      <LoadingScreen
        minimumDuration={4000}
        onComplete={() => {
          // Additional setup can be done here when loading completes
          console.log('H0L0Light-OS loading complete!')
        }}
      />
    )
  }

  
  



  return (
    <motion.div
      className="h-screen flex flex-col wallpaper-bg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Header */}
      <Header />

      {/* Desktop Area */}
      <div className="flex-1 relative overflow-hidden">

        <div
          ref={desktopRef}
          className="w-full h-full relative desktop-area"
          style={{
            backgroundImage: desktopSettings.showGrid
              ? `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${desktopSettings.gridSize}px ${desktopSettings.gridSize}px`
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/45 rounded-full pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 5 + 3}px`,
                height: `${Math.random() * 5 + 3}px`,
              }}
              animate={{
                y: [0, -180, 0],
                x: [0, Math.random() * 60 - 30, 0],
                opacity: [0, 0.8, 0],
                scale: [0.4, 1.4, 0.4],
                rotate: [0, 270, 0],
              }}
              transition={{
                duration: Math.random() * 6 + 8,
                repeat: Infinity,
                delay: Math.random() * 6,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Grid Overlay */}
          {desktopSettings.showGridOverlay && (
            <div className="grid-overlay" />
          )}


           {/* Desktop App Icons */}
           <AnimatePresence>
             {desktopItems.filter(item => item.type === 'app').map(item => {
               const app = installedApps.find(app => app.id === item.id)
               if (!app) return null

               // Determine icon size based on item size
               const iconSize = item.size === 'large' ? 'w-16 h-16' : item.size === 'medium' ? 'w-14 h-14' : 'w-12 h-12'
               const iconInnerSize = item.size === 'large' ? 'w-8 h-8' : item.size === 'medium' ? 'w-7 h-7' : 'w-6 h-6'
               const containerPadding = item.size === 'large' ? 'p-4' : item.size === 'medium' ? 'p-3' : 'p-2'
               const textSize = item.size === 'large' ? 'text-sm' : 'text-xs'
               const maxWidth = item.size === 'large' ? 'max-w-20' : 'max-w-16'
               
               // Determine if app should be wide
               const isWide = item.width === 'wide'
               const containerWidth = isWide ? 'w-32' : 'w-auto'
               const containerLayout = isWide ? 'flex-row items-center space-x-3' : 'flex-col items-center space-y-2'
               const textAlignment = isWide ? 'text-left' : 'text-center'

               // Determine colors based on item color
               const isRed = item.color === 'red'
               const bgGradient = isRed 
                 ? 'bg-gradient-to-br from-red-500/30 to-red-600/20' 
                 : 'bg-gradient-to-br from-white/20 to-white/10'
               const borderColor = isRed 
                 ? 'border-red-500/40' 
                 : 'border-white/20'
               const iconColor = isRed 
                 ? 'text-red-300' 
                 : 'text-white/80'
               const textColor = isRed 
                 ? 'text-red-200' 
                 : 'text-white/80'
               const hoverBg = isRed 
                 ? 'hover:bg-red-500/20' 
                 : 'hover:bg-white/8'

               return (
                 <motion.div
                   key={item.id}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="absolute cursor-pointer"
                   style={{ left: item.x, top: item.y }}
                   onClick={() => handleDesktopItemClick(item)}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <div className={`flex ${containerLayout} ${containerPadding} ${containerWidth} rounded-xl ${hoverBg} transition-colors`}>
                     <div className={`${iconSize} rounded-xl ${bgGradient} border ${borderColor} flex items-center justify-center flex-shrink-0`}>
                       <app.icon className={`${iconInnerSize} ${iconColor}`} />
                     </div>
                     <span className={`warmwind-body ${textSize} ${textColor} ${textAlignment} ${maxWidth} truncate`}>
                       {app.name}
                     </span>
                   </div>
                 </motion.div>
               )
             })}
           </AnimatePresence>



         </div>
       </div>

             {/* Open Windows */}
           <AnimatePresence>
             {openWindows.map((win, index) => {
               // Get stored position or use default with viewport awareness
               const storedPos = localStorage.getItem(`window-${win.id}-pos`)
               const viewportWidth = window.innerWidth
               const viewportHeight = window.innerHeight - 40
               const defaultPos = { 
                 x: Math.min(80 + (index * 60), viewportWidth - 500), 
                 y: Math.min(120 + (index * 40), viewportHeight - 400) 
               }
               const position = storedPos ? JSON.parse(storedPos) : defaultPos

               // Set appropriate sizing for different app types
               const appSizing = {}

               return (
                 <Window
                   key={win.id}
                   id={win.id}
                   title={win.title}
                   initialPosition={position}
                   onClose={handleCloseWindow}
                   bringToFront={bringWindowToFront}
                   isFocused={focusedWindow === win.id}
                   {...appSizing}
                 >
                   <>
                     {/* No apps to render */}
                   </>
                 </Window>
               )
             })}
           </AnimatePresence>

       {/* Running Apps */}
       <AnimatePresence>
         {runningApps.map(app => (
           <AppLauncher
             key={app.id}
             app={app}
             onClose={() => handleCloseApp(app.id)}
           />
         ))}
       </AnimatePresence>

       {/* Native App Launcher */}
       {showNativeAppLauncher && (
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
           onClick={() => setShowNativeAppLauncher(false)}
         >
           <div onClick={(e) => e.stopPropagation()}>
             <NativeAppLauncher onClose={() => setShowNativeAppLauncher(false)} />
           </div>
         </motion.div>
       )}

       {showSandboxAppLauncher && (
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
           onClick={() => setShowSandboxAppLauncher(false)}
         >
           <div onClick={(e) => e.stopPropagation()}>
             <SandboxAppLauncher 
               onClose={() => setShowSandboxAppLauncher(false)} 
               onLaunchApp={(app) => {
                 // Handle sandbox app launch
                 console.log('Launching sandbox app:', app)
                 setShowSandboxAppLauncher(false)
               }} 
             />
           </div>
         </motion.div>
       )}


       {/* Windows System Tray */}
       <WindowsSystemTray />
    </motion.div>
   )
 }
