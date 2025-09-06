'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trash2, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNotifications, Notification, notificationManager } from '@/lib/notifications'
import { useSounds } from '@/lib/sounds'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isClient, setIsClient] = useState(false)
  const { getNotifications, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications()
  const { playClick, playNotification } = useSounds()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Subscribe to notification updates only on client
  useEffect(() => {
    if (!isClient) return

    // Initial load of notifications using notificationManager directly
    setNotifications(notificationManager.getNotifications())

    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications)
    })

    return unsubscribe
  }, [isClient])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleToggle = () => {
    setIsOpen(!isOpen)
    playClick()
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
    playClick()
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    playClick()
  }

  const handleClearAll = () => {
    clearAll()
    playClick()
  }

  const handleRemove = (id: string) => {
    removeNotification(id)
    playClick()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-400/30 bg-green-400/5'
      case 'error':
        return 'border-red-400/30 bg-red-400/5'
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-400/5'
      default:
        return 'border-blue-400/30 bg-blue-400/5'
    }
  }

  if (!isClient) {
    return (
      <div className="relative">
        <div className="relative p-2 rounded-lg bg-white/10">
          <Bell className="w-5 h-5 text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[45]"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-12 right-0 w-80 max-h-96 overflow-hidden ethereal-card z-[55]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display warmwind-text">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMarkAllAsRead}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        title="Mark all as read"
                      >
                        <Check className="w-4 h-4 text-white/70" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearAll}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-white/70" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="warmwind-body text-white/60">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 mb-2 rounded-lg border ${getNotificationColor(notification.type)} ${
                          !notification.read ? 'bg-white/5' : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'warmwind-text' : 'text-white/70'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="w-2 h-2 bg-blue-400 rounded-full"
                                    title="Mark as read"
                                  />
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleRemove(notification.id)}
                                  className="text-white/40 hover:text-white/60 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </motion.button>
                              </div>
                            </div>
                            
                            <p className="text-xs warmwind-body opacity-80 mt-1">
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-white/50 mt-2">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
