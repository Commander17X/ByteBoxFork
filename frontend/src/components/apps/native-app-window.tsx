'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, 
  Maximize2, 
  Minimize2, 
  X, 
  Square,
  Play,
  Pause,
  RotateCcw,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { NativeAppInfo, ProcessInfo } from '@/lib/native-app-service'

interface NativeAppWindowProps {
  app: NativeAppInfo
  processInfo?: ProcessInfo
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  isMaximized?: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
}

export function NativeAppWindow({
  app,
  processInfo,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  position,
  size,
  onPositionChange,
  onSizeChange
}: NativeAppWindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isFocused, setIsFocused] = useState(true)
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      onPositionChange({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      let newWidth = size.width
      let newHeight = size.height
      
      // Handle different resize directions
      if (resizeStart.x !== 0) { // Right resize
        newWidth = Math.max(300, resizeStart.width + deltaX)
      }
      if (resizeStart.y !== 0) { // Bottom resize
        newHeight = Math.max(200, resizeStart.height + deltaY)
      }
      
      onSizeChange({ width: newWidth, height: newHeight })
    }
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

  const getAppIcon = () => {
    if (app.icon.startsWith('🎵')) return '🎵'
    if (app.icon.startsWith('🤖')) return '🤖'
    if (app.icon.startsWith('📊')) return '📊'
    if (app.icon.startsWith('📝')) return '📝'
    if (app.icon.startsWith('🌐')) return '🌐'
    if (app.icon.startsWith('💻')) return '💻'
    if (app.icon.startsWith('💬')) return '💬'
    if (app.icon.startsWith('📚')) return '📚'
    return '🖥️'
  }

  const getStatusColor = () => {
    if (app.isRunning) return 'bg-green-400'
    return 'bg-gray-400'
  }

  return (
    <motion.div
      ref={windowRef}
      className={`fixed ethereal-card overflow-hidden select-none ${
        isFocused ? 'z-50' : 'z-40'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? '100vh' : size.height,
        borderColor: 'var(--theme-border)',
        backgroundColor: 'var(--theme-card-bg)'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseDown={handleMouseDown}
      onClick={() => setIsFocused(true)}
    >
      {/* Window Header */}
      <div 
        className="window-header flex items-center justify-between p-3 border-b cursor-move"
        style={{ 
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-accent)'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="text-xl">{getAppIcon()}</div>
          <div>
            <h3 className="warmwind-text font-medium">{app.name}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
              <span className="warmwind-body text-xs opacity-70">
                {app.isRunning ? 'Running' : 'Stopped'}
                {processInfo && ` • PID: ${processInfo.pid}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Window Controls */}
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onMaximize}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden">
        {app.isRunning ? (
          <div className="h-full flex flex-col">
            {/* Native App Content Area */}
            <div className="flex-1 bg-black/50 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">{getAppIcon()}</div>
                <h4 className="warmwind-text text-xl font-semibold">{app.name}</h4>
                <p className="warmwind-body text-sm opacity-70">
                  Native Windows application is running
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Monitor className="w-4 h-4" />
                    <span>Native Window</span>
                  </div>
                  {processInfo && (
                    <>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span>{processInfo.memoryUsage}MB RAM</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span>{processInfo.cpuUsage.toFixed(1)}% CPU</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* App Controls */}
            <div 
              className="p-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <Pause className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-50">{getAppIcon()}</div>
              <h4 className="warmwind-text text-xl font-semibold">{app.name}</h4>
              <p className="warmwind-body text-sm opacity-70">
                Application is not running
              </p>
              <button className="warmwind-button px-6 py-2">
                Launch Application
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {!isMaximized && (
        <>
          {/* Corner handles */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
          
          {/* Edge handles */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, 'left')}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
        </>
      )}
    </motion.div>
  )
}
