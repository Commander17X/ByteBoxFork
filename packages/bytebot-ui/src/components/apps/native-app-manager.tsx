'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NativeAppWindow } from './native-app-window'
import { NativeAppInfo, ProcessInfo, nativeAppService } from '@/lib/native-app-service'

interface NativeAppManagerProps {
  onClose: () => void
}

interface WindowState {
  id: string
  app: NativeAppInfo
  processInfo?: ProcessInfo
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMaximized: boolean
  isMinimized: boolean
  zIndex: number
}

export function NativeAppManager({ onClose }: NativeAppManagerProps) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(1000)
  const [systemInfo, setSystemInfo] = useState({
    totalMemory: 0,
    usedMemory: 0,
    totalCpu: 0,
    usedCpu: 0,
    runningProcesses: 0
  })

  // Load system info
  useEffect(() => {
    const loadSystemInfo = async () => {
      const info = await nativeAppService.getSystemInfo()
      setSystemInfo(info)
    }
    
    loadSystemInfo()
    const interval = setInterval(loadSystemInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  // Monitor running apps
  useEffect(() => {
    const monitorApps = () => {
      const runningApps = nativeAppService.getRunningApps()
      const allApps = nativeAppService.getAllApps()
      
      // Update existing windows
      setWindows(prev => prev.map(window => {
        const app = allApps.find(a => a.id === window.app.id)
        if (app) {
          const processInfo = runningApps.find(p => p.name.includes(app.executable))
          return {
            ...window,
            app,
            processInfo
          }
        }
        return window
      }))
    }

    monitorApps()
    const interval = setInterval(monitorApps, 2000)
    return () => clearInterval(interval)
  }, [])

  const launchApp = useCallback(async (appId: string) => {
    const success = await nativeAppService.launchApp(appId)
    if (success) {
      const app = nativeAppService.getApp(appId)
      if (app) {
        const newWindow: WindowState = {
          id: `${appId}-${Date.now()}`,
          app,
          position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
          size: { width: 800, height: 600 },
          isMaximized: false,
          isMinimized: false,
          zIndex: nextZIndex
        }
        
        setWindows(prev => [...prev, newWindow])
        setNextZIndex(prev => prev + 1)
      }
    }
  }, [windows.length, nextZIndex])

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId))
  }, [])

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ))
  }, [])

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ))
  }, [])

  const updateWindowPosition = useCallback((windowId: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ))
  }, [])

  const updateWindowSize = useCallback((windowId: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, size } : w
    ))
  }, [])

  const bringToFront = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: nextZIndex } : w
    ))
    setNextZIndex(prev => prev + 1)
  }, [nextZIndex])

  const stopApp = useCallback(async (appId: string) => {
    await nativeAppService.stopApp(appId)
  }, [])

  // Auto-launch some popular apps for demo
  useEffect(() => {
    const autoLaunchApps = ['chrome', 'spotify', 'vscode']
    const timer = setTimeout(() => {
      autoLaunchApps.forEach((appId, index) => {
        setTimeout(() => {
          launchApp(appId)
        }, index * 2000)
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [launchApp])

  return (
    <div className="fixed inset-0 z-40">
      {/* System Info Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 z-50"
      >
        <div 
          className="p-4 rounded-lg border"
          style={{
            borderColor: 'var(--theme-border)',
            backgroundColor: 'var(--theme-accent)'
          }}
        >
          <h3 className="warmwind-text font-semibold mb-2">System Status</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="warmwind-body">Memory:</span>
              <span className="warmwind-body">
                {systemInfo.usedMemory}MB / {systemInfo.totalMemory}MB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="warmwind-body">CPU:</span>
              <span className="warmwind-body">{systemInfo.usedCpu.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="warmwind-body">Processes:</span>
              <span className="warmwind-body">{systemInfo.runningProcesses}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Native App Windows */}
      <AnimatePresence>
        {windows.map(window => (
          <NativeAppWindow
            key={window.id}
            app={window.app}
            processInfo={window.processInfo}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            isMaximized={window.isMaximized}
            position={window.position}
            size={window.size}
            onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
            onSizeChange={(size) => updateWindowSize(window.id, size)}
          />
        ))}
      </AnimatePresence>

      {/* Taskbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div 
          className="flex items-center space-x-2 p-3 rounded-lg border backdrop-blur-xl"
          style={{
            borderColor: 'var(--theme-border)',
            backgroundColor: 'var(--theme-accent)'
          }}
        >
          {windows.map(window => (
            <motion.button
              key={window.id}
              onClick={() => bringToFront(window.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                window.isMinimized 
                  ? 'opacity-50' 
                  : 'opacity-100'
              }`}
              style={{
                backgroundColor: window.isMinimized ? 'transparent' : 'var(--theme-hover)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg">{window.app.icon}</div>
              <span className="warmwind-body text-sm">{window.app.name}</span>
              {window.app.isRunning && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-lg border transition-all duration-200"
        style={{
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-accent)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/60 rounded-full" />
        </div>
      </motion.button>
    </div>
  )
}
