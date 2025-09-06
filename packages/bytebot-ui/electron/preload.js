const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Native app management
  launchApp: (appConfig) => ipcRenderer.invoke('launch-app', appConfig),
  terminateApp: (pid) => ipcRenderer.invoke('terminate-app', pid),
  getRunningApps: () => ipcRenderer.invoke('get-running-apps'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
  
  // Window management
  updateAppWindow: (windowData) => ipcRenderer.invoke('update-app-window', windowData),
  
  // File operations
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  
  // Notifications
  showNotification: (notification) => ipcRenderer.invoke('show-notification', notification),
  
  // System tray
  createSystemTray: (trayItems) => ipcRenderer.invoke('create-system-tray', trayItems),
  
  // Event listeners
  onAppLaunched: (callback) => ipcRenderer.on('app-launched', callback),
  onAppClosed: (callback) => ipcRenderer.on('app-closed', callback),
  onAppWindowUpdate: (callback) => ipcRenderer.on('app-window-updated', callback),
  onTrayItemClicked: (callback) => ipcRenderer.on('tray-item-clicked', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})

// Expose system information
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  arch: process.arch,
  version: process.version,
  isElectron: true
})

// Expose native app bridge
contextBridge.exposeInMainWorld('nativeAppBridge', {
  // Check if we can launch native apps
  canLaunchNativeApps: () => true,
  
  // Get available native apps
  getAvailableApps: async () => {
    try {
      return await ipcRenderer.invoke('get-installed-apps')
    } catch (error) {
      console.error('Failed to get available apps:', error)
      return []
    }
  },
  
  // Launch a native app
  launchNativeApp: async (appConfig) => {
    try {
      const result = await ipcRenderer.invoke('launch-app', appConfig)
      return result
    } catch (error) {
      console.error('Failed to launch native app:', error)
      throw error
    }
  },
  
  // Terminate a native app
  terminateNativeApp: async (pid) => {
    try {
      return await ipcRenderer.invoke('terminate-app', pid)
    } catch (error) {
      console.error('Failed to terminate native app:', error)
      throw error
    }
  },
  
  // Get running native apps
  getRunningNativeApps: async () => {
    try {
      return await ipcRenderer.invoke('get-running-apps')
    } catch (error) {
      console.error('Failed to get running apps:', error)
      return []
    }
  },
  
  // Open a file with default application
  openFileWithDefaultApp: async (filePath) => {
    try {
      return await ipcRenderer.invoke('open-file', filePath)
    } catch (error) {
      console.error('Failed to open file:', error)
      throw error
    }
  },
  
  // Show system notification
  showSystemNotification: async (notification) => {
    try {
      return await ipcRenderer.invoke('show-notification', notification)
    } catch (error) {
      console.error('Failed to show notification:', error)
      throw error
    }
  }
})

// Handle app lifecycle events
window.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners for native app events
  ipcRenderer.on('app-launched', (event, data) => {
    console.log('Native app launched:', data)
    // Dispatch custom event to the web app
    window.dispatchEvent(new CustomEvent('nativeAppLaunched', { detail: data }))
  })
  
  ipcRenderer.on('app-closed', (event, data) => {
    console.log('Native app closed:', data)
    // Dispatch custom event to the web app
    window.dispatchEvent(new CustomEvent('nativeAppClosed', { detail: data }))
  })
  
  ipcRenderer.on('app-window-updated', (event, data) => {
    console.log('App window updated:', data)
    // Dispatch custom event to the web app
    window.dispatchEvent(new CustomEvent('nativeAppWindowUpdated', { detail: data }))
  })
  
  ipcRenderer.on('tray-item-clicked', (event, data) => {
    console.log('Tray item clicked:', data)
    // Dispatch custom event to the web app
    window.dispatchEvent(new CustomEvent('trayItemClicked', { detail: data }))
  })
})

// Expose file system operations
contextBridge.exposeInMainWorld('fileSystem', {
  // Read directory contents
  readDirectory: async (path) => {
    try {
      // This would need to be implemented in the main process
      return await ipcRenderer.invoke('read-directory', path)
    } catch (error) {
      console.error('Failed to read directory:', error)
      return []
    }
  },
  
  // Get file info
  getFileInfo: async (filePath) => {
    try {
      return await ipcRenderer.invoke('get-file-info', filePath)
    } catch (error) {
      console.error('Failed to get file info:', error)
      return null
    }
  },
  
  // Watch directory for changes
  watchDirectory: (path, callback) => {
    ipcRenderer.on('directory-changed', (event, data) => {
      if (data.path === path) {
        callback(data)
      }
    })
  },
  
  // Stop watching directory
  unwatchDirectory: (path) => {
    ipcRenderer.removeAllListeners('directory-changed')
  }
})

// Expose system monitoring
contextBridge.exposeInMainWorld('systemMonitor', {
  // Get real-time system metrics
  getSystemMetrics: async () => {
    try {
      return await ipcRenderer.invoke('get-system-info')
    } catch (error) {
      console.error('Failed to get system metrics:', error)
      return null
    }
  },
  
  // Start monitoring system metrics
  startMonitoring: (callback) => {
    const interval = setInterval(async () => {
      try {
        const metrics = await ipcRenderer.invoke('get-system-info')
        callback(metrics)
      } catch (error) {
        console.error('Failed to get system metrics:', error)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  },
  
  // Get process information
  getProcessInfo: async (pid) => {
    try {
      return await ipcRenderer.invoke('get-process-info', pid)
    } catch (error) {
      console.error('Failed to get process info:', error)
      return null
    }
  }
})

console.log('Electron preload script loaded successfully')
