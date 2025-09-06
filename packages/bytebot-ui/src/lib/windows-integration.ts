/**
 * Windows Integration Service
 * Provides deep Windows OS integration for native app simulation
 */

export interface WindowsProcess {
  pid: number
  name: string
  executable: string
  windowTitle: string
  memoryUsage: number
  cpuUsage: number
  startTime: Date
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  icon: string
  hwnd?: number
}

export interface SystemTrayItem {
  id: string
  name: string
  icon: string
  tooltip: string
  isActive: boolean
  onClick: () => void
  contextMenu?: Array<{
    label?: string
    action?: () => void
    separator?: boolean
  }>
}

export interface WindowsNotification {
  id: string
  title: string
  message: string
  icon: string
  appName: string
  timestamp: Date
  isRead: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export interface FileSystemItem {
  name: string
  path: string
  type: 'file' | 'folder'
  size?: number
  modified: Date
  icon: string
  extension?: string
}

class WindowsIntegrationService {
  private processes: Map<number, WindowsProcess> = new Map()
  private systemTray: SystemTrayItem[] = []
  private notifications: WindowsNotification[] = []
  private fileSystem: Map<string, FileSystemItem[]> = new Map()
  private nextPid = 1000
  private nextHwnd = 10000

  constructor() {
    this.initializeSystemTray()
    this.initializeFileSystem()
    this.startSystemMonitoring()
  }

  private initializeSystemTray() {
    this.systemTray = [
      {
        id: 'spotify',
        name: 'Spotify',
        icon: '🎵',
        tooltip: 'Spotify - Music streaming',
        isActive: false,
        onClick: () => this.launchApp('spotify')
      },
      {
        id: 'discord',
        name: 'Discord',
        icon: '💬',
        tooltip: 'Discord - Voice and text communication',
        isActive: false,
        onClick: () => this.launchApp('discord')
      },
      {
        id: 'vscode',
        name: 'VS Code',
        icon: '💻',
        tooltip: 'Visual Studio Code - Code editor',
        isActive: false,
        onClick: () => this.launchApp('vscode')
      },
      {
        id: 'chrome',
        name: 'Chrome',
        icon: '🌐',
        tooltip: 'Google Chrome - Web browser',
        isActive: false,
        onClick: () => this.launchApp('chrome')
      },
      {
        id: 'system',
        name: 'System',
        icon: '⚙️',
        tooltip: 'System settings and information',
        isActive: true,
        onClick: () => this.showSystemInfo(),
        contextMenu: [
          { label: 'Task Manager', action: () => this.showTaskManager() },
          { label: 'System Properties', action: () => this.showSystemProperties() },
          { separator: true },
          { label: 'Shut Down', action: () => this.shutdown() }
        ]
      }
    ]
  }

  private initializeFileSystem() {
    // Simulate Windows file system structure
    this.fileSystem.set('C:\\', [
      { name: 'Users', path: 'C:\\Users', type: 'folder', modified: new Date(), icon: '👥' },
      { name: 'Program Files', path: 'C:\\Program Files', type: 'folder', modified: new Date(), icon: '📁' },
      { name: 'Windows', path: 'C:\\Windows', type: 'folder', modified: new Date(), icon: '🪟' },
      { name: 'Documents', path: 'C:\\Documents', type: 'folder', modified: new Date(), icon: '📄' }
    ])

    this.fileSystem.set('C:\\Users\\%USERNAME%\\Desktop', [
      { name: 'Spotify.lnk', path: 'C:\\Users\\%USERNAME%\\Desktop\\Spotify.lnk', type: 'file', size: 1024, modified: new Date(), icon: '🎵', extension: 'lnk' },
      { name: 'Cursor AI.lnk', path: 'C:\\Users\\%USERNAME%\\Desktop\\Cursor AI.lnk', type: 'file', size: 1024, modified: new Date(), icon: '🤖', extension: 'lnk' },
      { name: 'Excel.lnk', path: 'C:\\Users\\%USERNAME%\\Desktop\\Excel.lnk', type: 'file', size: 1024, modified: new Date(), icon: '📊', extension: 'lnk' },
      { name: 'Documents', path: 'C:\\Users\\%USERNAME%\\Documents', type: 'folder', modified: new Date(), icon: '📁' },
      { name: 'Downloads', path: 'C:\\Users\\%USERNAME%\\Downloads', type: 'folder', modified: new Date(), icon: '📥' }
    ])

    this.fileSystem.set('C:\\Users\\%USERNAME%\\Documents', [
      { name: 'My Document.docx', path: 'C:\\Users\\%USERNAME%\\Documents\\My Document.docx', type: 'file', size: 25600, modified: new Date(), icon: '📝', extension: 'docx' },
      { name: 'Budget 2024.xlsx', path: 'C:\\Users\\%USERNAME%\\Documents\\Budget 2024.xlsx', type: 'file', size: 51200, modified: new Date(), icon: '📊', extension: 'xlsx' },
      { name: 'Presentation.pptx', path: 'C:\\Users\\%USERNAME%\\Documents\\Presentation.pptx', type: 'file', size: 102400, modified: new Date(), icon: '📈', extension: 'pptx' }
    ])
  }

  private startSystemMonitoring() {
    // Simulate Windows system monitoring
    setInterval(() => {
      this.updateProcessMetrics()
      this.checkSystemHealth()
    }, 2000)
  }

  private updateProcessMetrics() {
    this.processes.forEach(process => {
      // Simulate realistic CPU and memory usage
      process.cpuUsage = Math.max(0, process.cpuUsage + (Math.random() - 0.5) * 10)
      process.memoryUsage = Math.max(50, process.memoryUsage + (Math.random() - 0.5) * 20)
    })
  }

  private checkSystemHealth() {
    // Simulate system health checks
    const totalMemory = this.processes.size * 200 + Math.random() * 1000
    const totalCpu = Array.from(this.processes.values()).reduce((sum, p) => sum + p.cpuUsage, 0)
    
    if (totalCpu > 80) {
      this.showNotification({
        title: 'High CPU Usage',
        message: 'CPU usage is above 80%. Consider closing some applications.',
        icon: '⚠️',
        appName: 'System Monitor'
      })
    }
  }

  async launchApp(appId: string): Promise<WindowsProcess | null> {
    const pid = this.nextPid++
    const hwnd = this.nextHwnd++
    
    const process: WindowsProcess = {
      pid,
      name: this.getAppName(appId),
      executable: this.getAppExecutable(appId),
      windowTitle: this.getAppName(appId),
      memoryUsage: Math.floor(Math.random() * 500) + 100,
      cpuUsage: Math.random() * 20,
      startTime: new Date(),
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + (pid % 5) * 50, y: 100 + (pid % 5) * 50 },
      size: { width: 800, height: 600 },
      icon: this.getAppIcon(appId),
      hwnd
    }

    this.processes.set(pid, process)
    this.updateSystemTray(appId, true)
    
    // Simulate app launch delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.showNotification({
      title: `${process.name} started`,
      message: `${process.name} has been launched successfully.`,
      icon: process.icon,
      appName: process.name
    })

    return process
  }

  async terminateProcess(pid: number): Promise<boolean> {
    const process = this.processes.get(pid)
    if (!process) return false

    this.processes.delete(pid)
    this.updateSystemTray(process.name.toLowerCase().replace(/\s+/g, ''), false)
    
    this.showNotification({
      title: `${process.name} closed`,
      message: `${process.name} has been terminated.`,
      icon: process.icon,
      appName: process.name
    })

    return true
  }

  private getAppName(appId: string): string {
    const names: Record<string, string> = {
      'spotify': 'Spotify',
      'cursor': 'Cursor AI',
      'excel': 'Microsoft Excel',
      'word': 'Microsoft Word',
      'chrome': 'Google Chrome',
      'vscode': 'Visual Studio Code',
      'discord': 'Discord',
      'notion': 'Notion'
    }
    return names[appId] || appId
  }

  private getAppExecutable(appId: string): string {
    const executables: Record<string, string> = {
      'spotify': 'spotify.exe',
      'cursor': 'cursor.exe',
      'excel': 'excel.exe',
      'word': 'winword.exe',
      'chrome': 'chrome.exe',
      'vscode': 'code.exe',
      'discord': 'discord.exe',
      'notion': 'notion.exe'
    }
    return executables[appId] || `${appId}.exe`
  }

  private getAppIcon(appId: string): string {
    const icons: Record<string, string> = {
      'spotify': '🎵',
      'cursor': '🤖',
      'excel': '📊',
      'word': '📝',
      'chrome': '🌐',
      'vscode': '💻',
      'discord': '💬',
      'notion': '📚'
    }
    return icons[appId] || '🖥️'
  }

  private updateSystemTray(appId: string, isActive: boolean) {
    const item = this.systemTray.find(t => t.id === appId)
    if (item) {
      item.isActive = isActive
    }
  }

  showNotification(notification: Omit<WindowsNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: WindowsNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      isRead: false
    }
    
    this.notifications.unshift(newNotification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Show native-like notification
    this.showNativeNotification(newNotification)
  }

  private showNativeNotification(notification: WindowsNotification) {
    // Create native-like notification element
    const notificationEl = document.createElement('div')
    notificationEl.className = 'windows-notification'
    notificationEl.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${notification.icon}</div>
        <div class="notification-text">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
        </div>
        <button class="notification-close">&times;</button>
      </div>
    `

    // Add styles
    notificationEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `

    document.body.appendChild(notificationEl)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notificationEl.style.animation = 'slideOutRight 0.3s ease-in'
      setTimeout(() => {
        if (notificationEl.parentNode) {
          notificationEl.parentNode.removeChild(notificationEl)
        }
      }, 300)
    }, 5000)

    // Close button
    notificationEl.querySelector('.notification-close')?.addEventListener('click', () => {
      notificationEl.style.animation = 'slideOutRight 0.3s ease-in'
      setTimeout(() => {
        if (notificationEl.parentNode) {
          notificationEl.parentNode.removeChild(notificationEl)
        }
      }, 300)
    })
  }

  getRunningProcesses(): WindowsProcess[] {
    return Array.from(this.processes.values())
  }

  getSystemTray(): SystemTrayItem[] {
    return this.systemTray
  }

  getNotifications(): WindowsNotification[] {
    return this.notifications
  }

  getFileSystem(path: string): FileSystemItem[] {
    return this.fileSystem.get(path) || []
  }

  async openFile(path: string): Promise<boolean> {
    const extension = path.split('.').pop()?.toLowerCase()
    
    // Simulate file opening with appropriate app
    switch (extension) {
      case 'docx':
        await this.launchApp('word')
        break
      case 'xlsx':
        await this.launchApp('excel')
        break
      case 'pptx':
        await this.launchApp('powerpoint')
        break
      case 'lnk':
        // Handle shortcuts
        const shortcutTarget = this.getShortcutTarget(path)
        if (shortcutTarget) {
          await this.launchApp(shortcutTarget)
        }
        break
      default:
        // Open with default app
        await this.launchApp('chrome')
    }

    this.showNotification({
      title: 'File opened',
      message: `Opening ${path.split('\\').pop()}`,
      icon: '📄',
      appName: 'File Explorer'
    })

    return true
  }

  private getShortcutTarget(path: string): string | null {
    const shortcuts: Record<string, string> = {
      'Spotify.lnk': 'spotify',
      'Cursor AI.lnk': 'cursor',
      'Excel.lnk': 'excel'
    }
    return shortcuts[path.split('\\').pop() || ''] || null
  }

  private showSystemInfo() {
    this.showNotification({
      title: 'System Information',
      message: `Windows 11 Pro - ${this.processes.size} processes running`,
      icon: '🖥️',
      appName: 'System'
    })
  }

  private showTaskManager() {
    this.showNotification({
      title: 'Task Manager',
      message: 'Opening Task Manager...',
      icon: '📊',
      appName: 'System'
    })
  }

  private showSystemProperties() {
    this.showNotification({
      title: 'System Properties',
      message: 'Opening System Properties...',
      icon: '⚙️',
      appName: 'System'
    })
  }

  private shutdown() {
    this.showNotification({
      title: 'Shutting down',
      message: 'Windows is shutting down...',
      icon: '🔌',
      appName: 'System'
    })
  }

  // Add CSS for notifications
  static addNotificationStyles() {
    if (document.getElementById('windows-notification-styles')) return

    const style = document.createElement('style')
    style.id = 'windows-notification-styles'
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .windows-notification .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      
      .windows-notification .notification-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .windows-notification .notification-text {
        flex: 1;
      }
      
      .windows-notification .notification-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: white;
      }
      
      .windows-notification .notification-message {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        line-height: 1.4;
      }
      
      .windows-notification .notification-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .windows-notification .notification-close:hover {
        color: white;
      }
    `
    document.head.appendChild(style)
  }
}

// Export singleton instance
export const windowsIntegration = new WindowsIntegrationService()

// Initialize notification styles
WindowsIntegrationService.addNotificationStyles()
