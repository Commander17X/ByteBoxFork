'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Minimize2, Grip } from 'lucide-react'

interface WindowProps {
  id: string
  title: string
  children: ReactNode
  onClose: (id: string) => void
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  bringToFront: (id: string) => void
  isFocused: boolean
}

export function Window({
  id,
  title,
  children,
  onClose,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: 800, height: 600 },
  minWidth = 400,
  minHeight = 300,
  maxWidth = 1400,
  maxHeight = 1000,
  bringToFront,
  isFocused,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isMaximised, setIsMaximised] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false) // Add resizing state
  const windowRef = useRef<HTMLDivElement>(null)

  // Calculate viewport-aware sizing
  const getViewportAwareSize = () => {
    const viewportWidth = Math.max(window.innerWidth, 800) // Minimum viewport width
    const viewportHeight = Math.max(window.innerHeight - 40, 600) // Minimum viewport height, account for header
    
    // Calculate optimal size based on viewport with better proportions
    const optimalWidth = Math.min(Math.max(viewportWidth * 0.75, minWidth), maxWidth)
    const optimalHeight = Math.min(Math.max(viewportHeight * 0.85, minHeight), maxHeight)
    
    return { width: optimalWidth, height: optimalHeight }
  }

  // Calculate viewport-aware positioning
  const getViewportAwarePosition = (windowSize: { width: number; height: number }) => {
    const viewportWidth = Math.max(window.innerWidth, 800) // Minimum viewport width
    const viewportHeight = Math.max(window.innerHeight - 40, 600) // Minimum viewport height, account for header
    
    // Center the window if it would go off-screen
    const x = Math.max(20, Math.min(initialPosition.x, viewportWidth - windowSize.width - 20))
    const y = Math.max(60, Math.min(initialPosition.y, viewportHeight - windowSize.height - 20))
    
    return { x, y }
  }

  const headerHeight = 40 // px
  const resizeHandleSize = 12 // px - Increased for better usability

  // Load saved size from localStorage and apply viewport-aware sizing
  useEffect(() => {
    const savedSize = localStorage.getItem(`window-${id}-size`)
    if (savedSize) {
      try {
        const parsedSize = JSON.parse(savedSize)
        // Ensure saved size is within current viewport constraints
        const viewportAwareSize = getViewportAwareSize()
        const constrainedSize = {
          width: Math.min(Math.max(parsedSize.width, minWidth), Math.min(maxWidth, viewportAwareSize.width)),
          height: Math.min(Math.max(parsedSize.height, minHeight), Math.min(maxHeight, viewportAwareSize.height))
        }
        setSize(constrainedSize)
      } catch (error) {
        console.warn('Failed to parse saved window size:', error)
        // Use viewport-aware size as fallback
        setSize(getViewportAwareSize())
      }
    } else {
      // Use viewport-aware size for new windows
      setSize(getViewportAwareSize())
    }
  }, [id, minWidth, minHeight, maxWidth, maxHeight])

  // Update drag constraints on window resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout
    
    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (!isMaximised) {
          // Keep window within bounds when browser window resizes
          const newPosition = getViewportAwarePosition(size)
          setPosition(newPosition)
          
          // Also adjust size if needed
          const newSize = getViewportAwareSize()
          if (size.width > newSize.width || size.height > newSize.height) {
            setSize(newSize)
          }
        }
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [isMaximised, size, id])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false)
    if (!isMaximised) {
      const newX = Math.max(20, Math.min(info.offset.x + position.x, window.innerWidth - size.width - 20))
      const newY = Math.max(60, Math.min(info.offset.y + position.y, window.innerHeight - size.height - 20))
      const newPosition = { x: newX, y: newY }
      setPosition(newPosition)
      // Save position and size to localStorage
      localStorage.setItem(`window-${id}-pos`, JSON.stringify(newPosition))
      localStorage.setItem(`window-${id}-size`, JSON.stringify(size))
    }
  }

  const handleResize = (e: MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation() // Prevent dragging from affecting resize

    setIsResizing(true) // Start resizing

    let startX = e.clientX
    let startY = e.clientY
    let startWidth = size.width
    let startHeight = size.height
    let startPositionX = position.x
    let startPositionY = position.y

    const doResize = (moveEvent: MouseEvent) => {
      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startPositionX
      let newY = startPositionY

      // Get viewport-aware constraints
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight - 40 // Account for header
      const effectiveMaxWidth = Math.min(maxWidth, viewportWidth - 40) // Leave 20px margin on each side
      const effectiveMaxHeight = Math.min(maxHeight, viewportHeight - 40) // Leave 20px margin on each side

      // Prevent resize beyond screen bounds
      if (direction.includes('right')) {
        newWidth = Math.min(effectiveMaxWidth, Math.max(minWidth, startWidth + (moveEvent.clientX - startX)))
      }
      if (direction.includes('left')) {
        const deltaX = moveEvent.clientX - startX
        newWidth = Math.min(effectiveMaxWidth, Math.max(minWidth, startWidth - deltaX))
        newX = Math.max(20, startPositionX + deltaX) // Don't go beyond left edge with margin
      }
      if (direction.includes('bottom')) {
        newHeight = Math.min(effectiveMaxHeight, Math.max(minHeight, startHeight + (moveEvent.clientY - startY)))
      }
      if (direction.includes('top')) {
        const deltaY = moveEvent.clientY - startY
        newHeight = Math.min(effectiveMaxHeight, Math.max(minHeight, startHeight - deltaY))
        newY = Math.max(60, startPositionY + deltaY) // Don't go beyond top edge with margin
      }

      // Ensure window stays within viewport bounds during diagonal resize
      if (direction.includes('right') && direction.includes('bottom')) {
        // Bottom-right corner: ensure window doesn't go beyond viewport
        newX = Math.min(newX, viewportWidth - newWidth - 20)
        newY = Math.min(newY, viewportHeight - newHeight - 20)
      }
      if (direction.includes('left') && direction.includes('top')) {
        // Top-left corner: ensure window doesn't go beyond viewport
        newX = Math.max(20, Math.min(newX, viewportWidth - newWidth - 20))
        newY = Math.max(60, Math.min(newY, viewportHeight - newHeight - 20))
      }

      // Update size and position
      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })

      // Prevent default browser behavior
      moveEvent.preventDefault()
    }

    const stopResize = () => {
      setIsResizing(false) // Stop resizing

      window.removeEventListener('mousemove', doResize)
      window.removeEventListener('mouseup', stopResize)

      // Save the final position to localStorage
      localStorage.setItem(`window-${id}-pos`, JSON.stringify(position))
      localStorage.setItem(`window-${id}-size`, JSON.stringify(size))

      // Clean up any text selection that might have occurred during resize
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges()
      }
    }

    window.addEventListener('mousemove', doResize)
    window.addEventListener('mouseup', stopResize)
  }

  const toggleMaximise = () => {
    setIsMaximised(!isMaximised)
  }

  return (
    <AnimatePresence>
      <motion.div
        id={id}
        ref={windowRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: isMaximised ? 0 : position.x,
          y: isMaximised ? 40 : position.y, // Start below top bar
          width: isMaximised ? '100vw' : size.width,
          height: isMaximised ? 'calc(100vh - 40px)' : size.height,
          zIndex: isFocused ? 10 : 5,
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.15
        }}
        drag={!isMaximised}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: 20,
          top: 60, // Below top bar with margin
          right: isDragging ? window.innerWidth - size.width - 20 : window.innerWidth - size.width - 20,
          bottom: isDragging ? window.innerHeight - size.height - 20 : window.innerHeight - size.height - 20
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseDown={() => bringToFront(id)}
        className={`fixed rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 flex flex-col cursor-move ${isFocused ? 'ring-2 ring-white/50' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing ring-2 ring-blue-400/60' : ''}`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          willChange: isDragging ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        {/* Window Header */}
        <motion.div
          className="flex items-center justify-between p-2 cursor-grab bg-white/10 border-b border-white/20"
          onDoubleClick={toggleMaximise}
          dragListener={false}
        >
          <div className="flex items-center space-x-2">
            <Grip className="w-4 h-4 text-white/60" />
            <span className="text-sm font-semibold text-white/90 warmwind-text">{title}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleMaximise}
              className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              {isMaximised ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onClose(id)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden p-4 warmwind-body window-content">
          {children}
        </div>

        {/* Size Indicator (shown on hover) */}
        <div className="window-size-indicator">
          {Math.round(size.width)} × {Math.round(size.height)}
        </div>

        {/* Resize Handles (only if not maximised) */}
        {!isMaximised && (
          <>
            {/* Right handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'right')}
              className="window-resize-handle window-resize-handle-right"
              style={{ width: resizeHandleSize }}
            />
            {/* Bottom handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'bottom')}
              className="window-resize-handle window-resize-handle-bottom"
              style={{ height: resizeHandleSize }}
            />
            {/* Bottom-right handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'bottom-right')}
              className="window-resize-handle window-resize-handle-corner window-resize-handle-se"
              style={{
                width: resizeHandleSize,
                height: resizeHandleSize,
                bottom: -8,
                right: -8
              }}
            />
            {/* Left handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'left')}
              className="window-resize-handle window-resize-handle-left"
              style={{ width: resizeHandleSize }}
            />
            {/* Top handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'top')}
              className="window-resize-handle window-resize-handle-top"
              style={{ height: resizeHandleSize }}
            />
            {/* Top-left handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'top-left')}
              className="window-resize-handle window-resize-handle-corner window-resize-handle-nw"
              style={{
                width: resizeHandleSize,
                height: resizeHandleSize,
                top: -8,
                left: -8
              }}
            />
            {/* Top-right handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'top-right')}
              className="window-resize-handle window-resize-handle-corner window-resize-handle-ne"
              style={{
                width: resizeHandleSize,
                height: resizeHandleSize,
                top: -8,
                right: -8
              }}
            />
            {/* Bottom-left handle */}
            <div
              onMouseDown={(e) => handleResize(e.nativeEvent, 'bottom-left')}
              className="window-resize-handle window-resize-handle-corner window-resize-handle-sw"
              style={{
                width: resizeHandleSize,
                height: resizeHandleSize,
                bottom: -8,
                left: -8
              }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
