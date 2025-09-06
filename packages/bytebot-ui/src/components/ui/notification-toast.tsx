'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Notification, NotificationAction } from '@/lib/notifications'
import { useSounds } from '@/lib/sounds'

interface NotificationToastProps {
  notification: Notification
  onRemove: (id: string) => void
  onAction: (action: NotificationAction) => void
}

export function NotificationToast({ notification, onRemove, onAction }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { playNotification } = useSounds()

  useEffect(() => {
    // Play notification sound when toast appears
    playNotification()
  }, [playNotification])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-400/30'
      case 'error':
        return 'border-red-400/30'
      case 'warning':
        return 'border-yellow-400/30'
      default:
        return 'border-blue-400/30'
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-400/10'
      case 'error':
        return 'bg-red-400/10'
      case 'warning':
        return 'bg-yellow-400/10'
      default:
        return 'bg-blue-400/10'
    }
  }

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(notification.id), 300)
  }

  const handleAction = (action: NotificationAction) => {
    onAction(action)
    handleRemove()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`ethereal-card p-4 mb-3 border-l-4 ${getBorderColor()} ${getBackgroundColor()} max-w-sm w-full`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium warmwind-text">
                {notification.title}
              </h4>
              <p className="mt-1 text-sm warmwind-body opacity-90">
                {notification.message}
              </p>
              
              {/* Action Buttons */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {notification.actions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(action)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        action.style === 'primary' 
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : action.style === 'danger'
                          ? 'bg-red-400/20 text-red-300 hover:bg-red-400/30'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-white/60 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  onAction: (action: NotificationAction) => void
}

export function NotificationContainer({ notifications, onRemove, onAction }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            onAction={onAction}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
