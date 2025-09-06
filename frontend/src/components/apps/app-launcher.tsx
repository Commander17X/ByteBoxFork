'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Minimize2, RotateCcw, ExternalLink } from 'lucide-react'
import { WebApp } from './app-store'
import { BraveBrowser } from './brave-browser'

interface AppLauncherProps {
  app: WebApp
  onClose: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  isMaximized?: boolean
}

export function AppLauncher({ app, onClose, onMinimize, onMaximize, isMaximized = false }: AppLauncherProps) {
  const [isLoading, setIsLoading] = useState(app.id !== 'brave-browser') // Don't show loading for Brave Browser
  const [error, setError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError(true)
  }

  const refreshApp = () => {
    if (app.id === 'brave-browser') {
      // Brave Browser handles its own refresh
      return
    }
    if (iframeRef.current) {
      setIsLoading(true)
      setError(false)
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const openInNewTab = () => {
    window.open(app.url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed bg-black/20 backdrop-blur-sm z-40 ${
        isMaximized 
          ? 'inset-0' 
          : 'inset-4 md:inset-8 lg:inset-16'
      }`}
    >
      <div className="w-full h-full ethereal-card overflow-hidden flex flex-col">
        {/* App Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex items-center justify-center">
              <app.icon className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <h3 className="warmwind-text text-sm font-medium">{app.name}</h3>
              <p className="warmwind-body text-xs text-white/60">{app.developer}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={refreshApp}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={openInNewTab}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-white/60" />
            </button>
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-white/60" />
              </button>
            )}
            {onMaximize && (
              <button
                onClick={onMaximize}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <Maximize2 className="w-4 h-4 text-white/60" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 relative">
          {isLoading && app.id !== 'brave-browser' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/40 animate-pulse" />
                </div>
                <h3 className="warmwind-text text-sm mb-1">Loading {app.name}...</h3>
                <p className="warmwind-body text-xs text-white/60">Please wait while the app loads</p>
              </div>
            </div>
          )}

          {error && app.id !== 'brave-browser' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="warmwind-text text-sm mb-2">Unable to load {app.name}</h3>
                <p className="warmwind-body text-xs text-white/60 mb-4">
                  This app may not support embedding or requires additional permissions.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={refreshApp}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors warmwind-body text-xs"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors warmwind-body text-xs"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>
          )}

          {app.id === 'brave-browser' ? (
            <BraveBrowser onClose={onClose} initialUrl={app.url} />
          ) : (
            <iframe
              ref={iframeRef}
              src={app.url}
              className="w-full h-full border-none"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={app.name}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
