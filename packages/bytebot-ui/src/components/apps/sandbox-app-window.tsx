'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Minus, Square, Maximize2, RotateCcw } from 'lucide-react'
import { SandboxApp } from '@/lib/sandbox-environment'

interface SandboxAppWindowProps {
  app: SandboxApp
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  isMaximized?: boolean
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
}

export function SandboxAppWindow({
  app,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  position = { x: 100, y: 100 },
  size = { width: 800, height: 600 },
  onPositionChange,
  onSizeChange
}: SandboxAppWindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [currentPosition, setCurrentPosition] = useState(position)
  const [currentSize, setCurrentSize] = useState(size)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const windowRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setCurrentPosition(position)
  }, [position])

  useEffect(() => {
    setCurrentSize(size)
  }, [size])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === windowRef.current || (e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
      setCurrentPosition(newPosition)
      onPositionChange?.(newPosition)
    }

    if (isResizing && resizeDirection) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = currentPosition.x
      let newY = currentPosition.y

      if (resizeDirection.includes('right')) {
        newWidth = Math.max(300, resizeStart.width + deltaX)
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(300, resizeStart.width - deltaX)
        newX = currentPosition.x + deltaX
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(200, resizeStart.height + deltaY)
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(200, resizeStart.height - deltaY)
        newY = currentPosition.y + deltaY
      }

      const newSize = { width: newWidth, height: newHeight }
      const newPosition = { x: newX, y: newY }

      setCurrentSize(newSize)
      setCurrentPosition(newPosition)
      onSizeChange?.(newSize)
      onPositionChange?.(newPosition)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }

  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: currentSize.width,
      height: currentSize.height
    })
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load application')
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getAppUrl = (app: SandboxApp) => {
    // For sandbox apps, we'll use a special protocol or local server
    // This would be replaced with actual sandbox app URLs
    switch (app.id) {
      // Web & Social
      case 'amazon':
        return 'https://amazon.com'
      case 'canva':
        return 'https://canva.com'
      case 'chatgpt':
        return 'https://chat.openai.com'
      case 'chrome':
        return 'https://google.com'
      case 'cryptoroll':
        return 'https://cryptoroll.com'
      case 'duckduckgo':
        return 'https://duckduckgo.com'
      case 'ebay':
        return 'https://ebay.com'
      case 'gmail':
        return 'https://gmail.com'
      case 'figma':
        return 'https://figma.com'
      case 'google-calendar':
        return 'https://calendar.google.com'
      case 'google-docs':
        return 'https://docs.google.com'
      case 'google-drive':
        return 'https://drive.google.com'
      case 'google-sheets':
        return 'https://sheets.google.com'
      case 'google-slides':
        return 'https://slides.google.com'
      
      // System Apps
      case 'file-manager':
        return '/sandbox/file-manager'
      case 'terminal':
        return '/sandbox/terminal'
      case 'package-manager':
        return '/sandbox/package-manager'
      
      // Legacy apps
      case 'vscode':
        return 'https://vscode.dev'
      case 'spotify':
        return 'https://open.spotify.com'
      case 'photoshop':
        return 'https://photoshop.adobe.com'
      
      default:
        return 'about:blank'
    }
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeDirection])

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        width: currentSize.width,
        height: currentSize.height,
        zIndex: 1000
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Window Header */}
      <div className="window-header flex items-center justify-between px-4 py-2 bg-white/10 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-sm">
            {app.icon}
          </div>
          <div>
            <h3 className="warmwind-text text-sm font-medium">{app.name}</h3>
            <p className="warmwind-body text-xs opacity-70">Sandbox Environment</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RotateCcw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onMaximize}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Square className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="relative w-full h-full bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full"
            />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 z-10">
            <div className="text-center max-w-md p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="warmwind-text text-sm mb-2">Unable to load {app.name}</h3>
              <p className="warmwind-body text-xs text-white/60 mb-4">
                {error}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors warmwind-body text-xs"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* App Content */}
        <iframe
          ref={iframeRef}
          src={getAppUrl(app)}
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
          title={app.name}
        />

        {/* Resize Handles */}
        <div className="resize-handles">
          {/* Corner handles */}
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={(e) => handleResizeStart('top-left', e)}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={(e) => handleResizeStart('top-right', e)}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={(e) => handleResizeStart('bottom-left', e)}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => handleResizeStart('bottom-right', e)}
          />
          
          {/* Edge handles */}
          <div
            className="resize-handle resize-handle-n"
            onMouseDown={(e) => handleResizeStart('top', e)}
          />
          <div
            className="resize-handle resize-handle-s"
            onMouseDown={(e) => handleResizeStart('bottom', e)}
          />
          <div
            className="resize-handle resize-handle-w"
            onMouseDown={(e) => handleResizeStart('left', e)}
          />
          <div
            className="resize-handle resize-handle-e"
            onMouseDown={(e) => handleResizeStart('right', e)}
          />
        </div>
      </div>
    </motion.div>
  )
}

// CSS for resize handles (should be in a CSS file)
const resizeHandleStyles = `
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  pointer-events: all;
  background: transparent;
}

.resize-handle-nw {
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  cursor: nw-resize;
}

.resize-handle-ne {
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  cursor: ne-resize;
}

.resize-handle-sw {
  bottom: 0;
  left: 0;
  width: 8px;
  height: 8px;
  cursor: sw-resize;
}

.resize-handle-se {
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  cursor: se-resize;
}

.resize-handle-n {
  top: 0;
  left: 8px;
  right: 8px;
  height: 8px;
  cursor: n-resize;
}

.resize-handle-s {
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 8px;
  cursor: s-resize;
}

.resize-handle-w {
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 8px;
  cursor: w-resize;
}

.resize-handle-e {
  top: 8px;
  bottom: 8px;
  right: 0;
  width: 8px;
  cursor: e-resize;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = resizeHandleStyles
  document.head.appendChild(style)
}
