const { app, BrowserWindow, ipcMain, child_process, screen } = require('electron')
const path = require('path')
const fs = require('fs')

class NativeAppManager {
  constructor() {
    this.runningApps = new Map()
    this.nextPid = 1000
    this.nextHwnd = 10000
  }

  async launchApp(appConfig) {
    return new Promise((resolve, reject) => {
      const { executable, args = [], options = {} } = appConfig
      
      // Default options for launching native Windows apps
      const defaultOptions = {
        detached: false,
        stdio: 'ignore',
        windowsHide: false
      }

      const finalOptions = { ...defaultOptions, ...options }

      console.log(`Launching native app: ${executable}`)
      
      const child = child_process.spawn(executable, args, finalOptions)
      
      const appInstance = {
        pid: child.pid,
        hwnd: this.nextHwnd++,
        process: child,
        executable,
        startTime: new Date(),
        isRunning: true
      }

      this.runningApps.set(child.pid, appInstance)

      // Handle process events
      child.on('error', (error) => {
        console.error(`Failed to launch ${executable}:`, error)
        this.runningApps.delete(child.pid)
        reject(error)
      })

      child.on('exit', (code, signal) => {
        console.log(`App ${executable} exited with code ${code}`)
        this.runningApps.delete(child.pid)
        
        // Notify renderer process
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('app-closed', {
            pid: child.pid,
            code,
            signal
          })
        }
      })

      // Wait a moment for the app to start
      setTimeout(() => {
        if (child.pid) {
          resolve({
            pid: child.pid,
            hwnd: appInstance.hwnd,
            success: true
          })
        } else {
          reject(new Error('Failed to get process ID'))
        }
      }, 1000)
    })
  }

  async terminateApp(pid) {
    const appInstance = this.runningApps.get(pid)
    if (!appInstance) {
      throw new Error(`App with PID ${pid} not found`)
    }

    try {
      // Try graceful termination first
      appInstance.process.kill('SIGTERM')
      
      // Wait a bit for graceful shutdown
      setTimeout(() => {
        if (this.runningApps.has(pid)) {
          // Force kill if still running
          appInstance.process.kill('SIGKILL')
        }
      }, 5000)

      return true
    } catch (error) {
      console.error(`Failed to terminate app ${pid}:`, error)
      return false
    }
  }

  getRunningApps() {
    return Array.from(this.runningApps.values()).map(app => ({
      pid: app.pid,
      hwnd: app.hwnd,
      executable: app.executable,
      startTime: app.startTime,
      isRunning: app.isRunning
    }))
  }

  async getSystemInfo() {
    const os = require('os')
    const { exec } = require('child_process')
    
    return new Promise((resolve) => {
      exec('wmic cpu get loadpercentage /value', (error, stdout) => {
        const cpuUsage = stdout.match(/LoadPercentage=(\d+)/)?.[1] || '0'
        
        resolve({
          totalMemory: os.totalmem(),
          usedMemory: os.totalmem() - os.freemem(),
          cpuUsage: parseInt(cpuUsage),
          platform: os.platform(),
          arch: os.arch(),
          uptime: os.uptime()
        })
      })
    })
  }

  async getInstalledApps() {
    // Scan common installation directories for Windows apps
    const commonPaths = [
      'C:\\Program Files',
      'C:\\Program Files (x86)',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs',
      'C:\\Users\\%USERNAME%\\AppData\\Roaming'
    ]

    const installedApps = []
    
    for (const basePath of commonPaths) {
      const expandedPath = basePath.replace('%USERNAME%', os.userInfo().username)
      
      try {
        if (fs.existsSync(expandedPath)) {
          const items = fs.readdirSync(expandedPath, { withFileTypes: true })
          
          for (const item of items) {
            if (item.isDirectory()) {
              const appPath = path.join(expandedPath, item.name)
              const exePath = this.findExecutable(appPath)
              
              if (exePath) {
                installedApps.push({
                  name: item.name,
                  path: exePath,
                  directory: appPath,
                  icon: this.getAppIcon(item.name)
                })
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning ${expandedPath}:`, error)
      }
    }

    return installedApps
  }

  findExecutable(directory) {
    const exeFiles = ['exe', 'cmd', 'bat']
    
    for (const ext of exeFiles) {
      const exePath = path.join(directory, `*.${ext}`)
      try {
        const files = fs.readdirSync(directory).filter(file => 
          file.toLowerCase().endsWith(`.${ext}`)
        )
        
        if (files.length > 0) {
          return path.join(directory, files[0])
        }
      } catch (error) {
        // Continue searching
      }
    }
    
    return null
  }

  getAppIcon(appName) {
    const iconMap = {
      'Spotify': '🎵',
      'Google Chrome': '🌐',
      'Microsoft Office': '📊',
      'Visual Studio Code': '💻',
      'Discord': '💬',
      'Notion': '📚',
      'Adobe': '🎨',
      'Steam': '🎮'
    }
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (appName.includes(key)) {
        return icon
      }
    }
    
    return '🖥️'
  }
}

// Create native app manager instance
const nativeAppManager = new NativeAppManager()

let mainWindow

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('dist/index.html')
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  // Terminate all running native apps
  for (const [pid, appInstance] of nativeAppManager.runningApps) {
    try {
      appInstance.process.kill()
    } catch (error) {
      console.error(`Error terminating app ${pid}:`, error)
    }
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for native app management
ipcMain.handle('launch-app', async (event, appConfig) => {
  try {
    const result = await nativeAppManager.launchApp(appConfig)
    return result
  } catch (error) {
    console.error('Failed to launch app:', error)
    throw error
  }
})

ipcMain.handle('terminate-app', async (event, pid) => {
  try {
    const result = await nativeAppManager.terminateApp(pid)
    return result
  } catch (error) {
    console.error('Failed to terminate app:', error)
    throw error
  }
})

ipcMain.handle('get-running-apps', async (event) => {
  return nativeAppManager.getRunningApps()
})

ipcMain.handle('get-system-info', async (event) => {
  return await nativeAppManager.getSystemInfo()
})

ipcMain.handle('get-installed-apps', async (event) => {
  return await nativeAppManager.getInstalledApps()
})

// Handle app window updates
ipcMain.handle('update-app-window', async (event, { pid, position, size, isMinimized, isMaximized }) => {
  const appInstance = nativeAppManager.runningApps.get(pid)
  if (appInstance) {
    // Update window properties
    appInstance.position = position
    appInstance.size = size
    appInstance.isMinimized = isMinimized
    appInstance.isMaximized = isMaximized
    
    // Notify renderer process
    mainWindow.webContents.send('app-window-updated', {
      pid,
      position,
      size,
      isMinimized,
      isMaximized
    })
  }
})

// Handle file operations
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    const { exec } = require('child_process')
    
    return new Promise((resolve, reject) => {
      exec(`start "" "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({ success: true })
        }
      })
    })
  } catch (error) {
    console.error('Failed to open file:', error)
    throw error
  }
})

// Handle system notifications
ipcMain.handle('show-notification', async (event, notification) => {
  const { Notification } = require('electron')
  
  const electronNotification = new Notification({
    title: notification.title,
    body: notification.message,
    icon: notification.icon
  })
  
  electronNotification.show()
  
  return { success: true }
})

// Handle system tray
ipcMain.handle('create-system-tray', async (event, trayItems) => {
  const { Tray, Menu } = require('electron')
  const path = require('path')
  
  const tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'))
  
  const contextMenu = Menu.buildFromTemplate(trayItems.map(item => ({
    label: item.label,
    type: item.type || 'normal',
    click: () => {
      mainWindow.webContents.send('tray-item-clicked', item.id)
    }
  })))
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('H0L0 Web OS')
  
  return { success: true }
})

module.exports = { nativeAppManager }
