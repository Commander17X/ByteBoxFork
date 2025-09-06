// Notification System Manager
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actions?: NotificationAction[]
  timestamp: number
  read: boolean
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

export interface NotificationOptions {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actions?: NotificationAction[]
}

class NotificationManager {
  private static instance: NotificationManager
  private notifications: Notification[] = []
  private listeners: Set<(notifications: Notification[]) => void> = new Set()
  private maxNotifications: number = 5
  private defaultDuration: number = 5000

  private constructor() {
    // Only request notification permission on client side
    if (typeof window !== 'undefined') {
      this.requestPermission()
    }
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  private async requestPermission(): Promise<void> {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (error) {
        console.warn('Failed to request notification permission:', error)
      }
    }
  }

  public subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener)
    // Return unsubscribe function
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  public addNotification(options: NotificationOptions): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const notification: Notification = {
      id,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || this.defaultDuration,
      actions: options.actions || [],
      timestamp: Date.now(),
      read: false
    }

    // Add to beginning of array
    this.notifications.unshift(notification)

    // Limit number of notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }

    // Auto-remove after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id)
      }, notification.duration)
    }

    // Show browser notification if permission granted
    this.showBrowserNotification(notification)

    this.notifyListeners()
    return id
  }

  private showBrowserNotification(notification: Notification): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: this.getNotificationIcon(notification.type),
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: false,
          silent: false
        })

        browserNotification.onclick = () => {
          window.focus()
          browserNotification.close()
        }

        // Auto-close browser notification
        setTimeout(() => {
          browserNotification.close()
        }, notification.duration || this.defaultDuration)
      } catch (error) {
        console.warn('Failed to show browser notification:', error)
      }
    }
  }

  private getNotificationIcon(type: string): string {
    const icons = {
      info: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEzIDE3SDExVjExSDEzVjE3Wk0xMyA5SDExVjdIMTNWOVoiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+',
      success: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEwIDE3TDYgMTNMNy40MSAxMS41OUwxMCAxNC4xN0wxNi41OSA3LjU4TDE4IDlMMTAgMTdaIiBmaWxsPSIjMTBCOTgxIi8+Cjwvc3ZnPg==',
      warning: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEgMjFIMjNMMTIgMkwxIDIxWk0xMyAxOEgxMVYxNkgxM1YxOFpNMTMgMTRIMTFWMTBIMTNWMTRaIiBmaWxsPSIjRjU5RTBCIi8+Cjwvc3ZnPg==',
      error: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyUzYuNDcgMjIgMTIgMjJTMjIgMTcuNTMgMjIgMTJTMTcuNTMgMiAxMiAyWk0xNyAxNUg3VjEzSDE3VjE1Wk0xNyAxMUg3VjlIMTdWMTFaIiBmaWxsPSIjRjQ0NDQ0Ii8+Cjwvc3ZnPg=='
    }
    return icons[type as keyof typeof icons] || icons.info
  }

  public removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifyListeners()
  }

  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  public clearAll(): void {
    this.notifications = []
    this.notifyListeners()
  }

  public getNotifications(): Notification[] {
    return [...this.notifications]
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  public setMaxNotifications(max: number): void {
    this.maxNotifications = max
    if (this.notifications.length > max) {
      this.notifications = this.notifications.slice(0, max)
      this.notifyListeners()
    }
  }

  public setDefaultDuration(duration: number): void {
    this.defaultDuration = duration
  }

  // Convenience methods for different notification types
  public info(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.addNotification({ title, message, type: 'info', ...options })
  }

  public success(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.addNotification({ title, message, type: 'success', ...options })
  }

  public warning(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.addNotification({ title, message, type: 'warning', ...options })
  }

  public error(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.addNotification({ title, message, type: 'error', ...options })
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()

// React hook for using notifications
export const useNotifications = () => {
  // Return safe defaults during SSR
  if (typeof window === 'undefined') {
    return {
      addNotification: () => {},
      removeNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
      getNotifications: () => [],
      getUnreadCount: () => 0,
      info: () => {},
      success: () => {},
      warning: () => {},
      error: () => {}
    }
  }

  return {
    addNotification: (options: NotificationOptions) => notificationManager.addNotification(options),
    removeNotification: (id: string) => notificationManager.removeNotification(id),
    markAsRead: (id: string) => notificationManager.markAsRead(id),
    markAllAsRead: () => notificationManager.markAllAsRead(),
    clearAll: () => notificationManager.clearAll(),
    getNotifications: () => notificationManager.getNotifications(),
    getUnreadCount: () => notificationManager.getUnreadCount(),
    
    // Convenience methods
    info: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationManager.info(title, message, options),
    success: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationManager.success(title, message, options),
    warning: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationManager.warning(title, message, options),
    error: (title: string, message: string, options?: Partial<NotificationOptions>) => 
      notificationManager.error(title, message, options)
  }
}
