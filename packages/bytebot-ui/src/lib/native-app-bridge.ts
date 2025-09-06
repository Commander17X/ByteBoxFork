/**
 * Virtual App Bridge - Completely Isolated Web OS
 * No access to user's PC - all apps run in virtual web environment
 */

export interface NativeAppInstance {
  id: string
  name: string
  executable: string
  processId: number
  windowHandle: number
  isRunning: boolean
  container: HTMLElement
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  webUrl?: string
  isVirtual?: boolean
}

export interface AppStreamConfig {
  width: number
  height: number
  frameRate: number
  quality: 'low' | 'medium' | 'high'
  audio: boolean
  cursor: boolean
}

class VirtualAppBridge {
  private appInstances: Map<string, NativeAppInstance> = new Map()
  private nextZIndex = 1000
  private isElectron = false

  constructor() {
    this.isElectron = typeof window !== 'undefined' && (window as any).electronAPI
    this.initialize()
  }

  private async initialize() {
    console.log('Initializing Virtual App Bridge - Completely Isolated Web OS')
    console.log('No access to user PC - all apps run in virtual environment')
  }

  async launchNativeApp(appId: string, config: AppStreamConfig = {
    width: 800,
    height: 600,
    frameRate: 30,
    quality: 'high',
    audio: true,
    cursor: true
  }): Promise<NativeAppInstance | null> {
    try {
      const appInfo = this.getAppInfo(appId)
      if (!appInfo) {
        throw new Error(`Virtual app ${appId} not found`)
      }

      // Create virtual app instance
      const instance = await this.launchVirtualWebApp(appId, appInfo, config)

      this.appInstances.set(instance.id, instance)
      this.nextZIndex++

      return instance
    } catch (error) {
      console.error(`Failed to launch virtual app ${appId}:`, error)
      return null
    }
  }

  private async launchVirtualWebApp(appId: string, appInfo: any, config: AppStreamConfig): Promise<NativeAppInstance> {
    // Create a virtual app instance that runs within the web OS
    const instance: NativeAppInstance = {
      id: `${appId}_${Date.now()}`,
      name: appInfo.name,
      executable: appInfo.executable,
      processId: Math.floor(Math.random() * 10000) + 1000, // Virtual PID
      windowHandle: Math.floor(Math.random() * 100000) + 10000, // Virtual HWND
      isRunning: true,
      container: this.createVirtualAppContainer(appInfo, config, appId),
      position: { x: 100 + (this.appInstances.size * 30), y: 100 + (this.appInstances.size * 30) },
      size: { width: config.width, height: config.height },
      isMinimized: false,
      isMaximized: false,
      zIndex: this.nextZIndex,
      webUrl: appInfo.webUrl,
      isVirtual: true
    }

    // Setup the virtual app interface
    await this.setupVirtualAppInterface(instance, appInfo, config)

    return instance
  }

  private createVirtualAppContainer(appInfo: any, config: AppStreamConfig, appId?: string): HTMLElement {
    // Create a virtual window container
    const windowContainer = document.createElement('div')
    windowContainer.className = 'virtual-app-window'
    windowContainer.style.cssText = `
      position: fixed;
      left: ${100 + (this.appInstances.size * 30)}px;
      top: ${100 + (this.appInstances.size * 30)}px;
      width: ${config.width}px;
      height: ${config.height}px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: ${this.nextZIndex};
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `
    
    // Add title bar
    const titleBar = document.createElement('div')
    titleBar.className = 'window-header'
    titleBar.style.cssText = `
      height: 30px;
      background: #0078d4;
      color: white;
      display: flex;
      align-items: center;
      padding: 0 10px;
      font-size: 14px;
      font-family: 'Segoe UI', sans-serif;
      cursor: move;
      user-select: none;
    `
    titleBar.textContent = appInfo.name
    
    // Add window controls
    const controls = document.createElement('div')
    controls.style.cssText = `
      margin-left: auto;
      display: flex;
      gap: 5px;
    `
    
    const minimizeBtn = document.createElement('button')
    minimizeBtn.textContent = '−'
    minimizeBtn.style.cssText = `
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: white;
      cursor: pointer;
      border-radius: 2px;
    `
    if (appId) {
      minimizeBtn.onclick = () => this.minimizeApp(appId)
    }
    
    const closeBtn = document.createElement('button')
    closeBtn.textContent = '×'
    closeBtn.style.cssText = `
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: white;
      cursor: pointer;
      border-radius: 2px;
    `
    if (appId) {
      closeBtn.onclick = () => this.terminateApp(appId)
    }
    
    controls.appendChild(minimizeBtn)
    controls.appendChild(closeBtn)
    titleBar.appendChild(controls)
    
    // Add content area
    const contentArea = document.createElement('div')
    contentArea.style.cssText = `
      flex: 1;
      overflow: hidden;
      position: relative;
    `
    
    // Create iframe for web app
    if (appInfo.webUrl) {
      const iframe = document.createElement('iframe')
      iframe.src = appInfo.webUrl
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      `
      iframe.allow = 'camera; microphone; fullscreen'
      iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation'
      contentArea.appendChild(iframe)
    } else {
      // Create virtual app interface
      const virtualContent = document.createElement('div')
      virtualContent.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        font-family: 'Segoe UI', sans-serif;
      `
      
      const icon = document.createElement('div')
      icon.textContent = appInfo.icon
      icon.style.cssText = `
        font-size: 48px;
        margin-bottom: 20px;
      `
      
      const name = document.createElement('div')
      name.textContent = appInfo.name
      name.style.cssText = `
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
      `
      
      const status = document.createElement('div')
      status.textContent = 'Virtual App - Running in Web OS'
      status.style.cssText = `
        font-size: 14px;
        color: #666;
        margin-bottom: 20px;
      `
      
      const button = document.createElement('button')
      button.textContent = 'Open App'
      button.style.cssText = `
        padding: 10px 20px;
        background: #0078d4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      `
      button.onclick = () => {
        if (appInfo.webUrl) {
          window.open(appInfo.webUrl, '_blank')
        }
      }
      
      virtualContent.appendChild(icon)
      virtualContent.appendChild(name)
      virtualContent.appendChild(status)
      virtualContent.appendChild(button)
      contentArea.appendChild(virtualContent)
    }
    
    windowContainer.appendChild(titleBar)
    windowContainer.appendChild(contentArea)
    
    return windowContainer
  }

  private async setupVirtualAppInterface(instance: NativeAppInstance, appInfo: any, config: AppStreamConfig) {
    // Add to DOM for rendering
    document.body.appendChild(instance.container)
    
    // Make it draggable
    this.makeDraggable(instance.container, instance)
    
    // Make it resizable
    this.makeResizable(instance.container, instance)
    
    console.log(`Virtual app ${appInfo.name} launched successfully`)
  }

  private makeDraggable(element: HTMLElement, instance: NativeAppInstance) {
    let isDragging = false
    let startX = 0
    let startY = 0

    const header = element.querySelector('.window-header') as HTMLElement
    if (!header) return

    header.addEventListener('mousedown', (e) => {
      isDragging = true
      startX = e.clientX - instance.position.x
      startY = e.clientY - instance.position.y
      element.style.cursor = 'grabbing'
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        instance.position.x = e.clientX - startX
        instance.position.y = e.clientY - startY
        element.style.left = `${instance.position.x}px`
        element.style.top = `${instance.position.y}px`
      }
    })

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false
        element.style.cursor = 'move'
      }
    })
  }

  private makeResizable(element: HTMLElement, instance: NativeAppInstance) {
    let isResizing = false
    let startX = 0
    let startY = 0
    let startWidth = 0
    let startHeight = 0

    const resizeHandle = document.createElement('div')
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background: #0078d4;
      cursor: se-resize;
    `
    element.appendChild(resizeHandle)

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true
      startX = e.clientX
      startY = e.clientY
      startWidth = instance.size.width
      startHeight = instance.size.height
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (isResizing) {
        const newWidth = Math.max(300, startWidth + (e.clientX - startX))
        const newHeight = Math.max(200, startHeight + (e.clientY - startY))
        
        instance.size.width = newWidth
        instance.size.height = newHeight
        element.style.width = `${newWidth}px`
        element.style.height = `${newHeight}px`
      }
    })

    document.addEventListener('mouseup', () => {
      isResizing = false
    })
  }

  private getAppInfo(appId: string): any {
    // Virtual app configurations - these are web-based simulations, not actual PC apps
    const apps: Record<string, any> = {
      'spotify': {
        name: 'Spotify',
        executable: 'web-app',
        icon: '🎵',
        args: [],
        webUrl: 'https://open.spotify.com',
        isVirtual: true
      },
      'cursor': {
        name: 'Cursor AI',
        executable: 'web-app',
        icon: '🤖',
        args: [],
        webUrl: 'https://cursor.sh',
        isVirtual: true
      },
      'excel': {
        name: 'Microsoft Excel',
        executable: 'web-app',
        icon: '📊',
        args: [],
        webUrl: 'https://office.com/excel',
        isVirtual: true
      },
      'word': {
        name: 'Microsoft Word',
        executable: 'web-app',
        icon: '📝',
        args: [],
        webUrl: 'https://office.com/word',
        isVirtual: true
      },
      'chrome': {
        name: 'Google Chrome',
        executable: 'web-app',
        icon: '🌐',
        args: [],
        webUrl: 'https://google.com',
        isVirtual: true
      },
      'vscode': {
        name: 'Visual Studio Code',
        executable: 'web-app',
        icon: '💻',
        args: [],
        webUrl: 'https://vscode.dev',
        isVirtual: true
      },
      'discord': {
        name: 'Discord',
        executable: 'web-app',
        icon: '💬',
        args: [],
        webUrl: 'https://discord.com/app',
        isVirtual: true
      },
      'notion': {
        name: 'Notion',
        executable: 'web-app',
        icon: '📚',
        args: [],
        webUrl: 'https://notion.so',
        isVirtual: true
      },
      'figma': {
        name: 'Figma',
        executable: 'web-app',
        icon: '🎨',
        args: [],
        webUrl: 'https://figma.com',
        isVirtual: true
      },
      'photoshop': {
        name: 'Adobe Photoshop',
        executable: 'web-app',
        icon: '🖼️',
        args: [],
        webUrl: 'https://photoshop.adobe.com',
        isVirtual: true
      },
      'steam': {
        name: 'Steam',
        executable: 'web-app',
        icon: '🎮',
        args: [],
        webUrl: 'https://store.steampowered.com',
        isVirtual: true
      },
      'slack': {
        name: 'Slack',
        executable: 'web-app',
        icon: '💼',
        args: [],
        webUrl: 'https://slack.com',
        isVirtual: true
      }
    }
    return apps[appId]
  }

  async terminateApp(appId: string): Promise<boolean> {
    const instance = this.appInstances.get(appId)
    if (!instance) return false

    try {
      // Remove from DOM
      if (instance.container && instance.container.parentNode) {
        instance.container.parentNode.removeChild(instance.container)
      }
      
      // Update instance state
      instance.isRunning = false
      this.appInstances.delete(appId)
      
      console.log(`Virtual app ${instance.name} terminated`)
      return true
    } catch (error) {
      console.error(`Failed to terminate virtual app ${appId}:`, error)
      return false
    }
  }

  async minimizeApp(appId: string): Promise<boolean> {
    const instance = this.appInstances.get(appId)
    if (!instance) return false

    instance.isMinimized = !instance.isMinimized
    instance.container.style.display = instance.isMinimized ? 'none' : 'flex'
    
    return true
  }

  async maximizeApp(appId: string): Promise<boolean> {
    const instance = this.appInstances.get(appId)
    if (!instance) return false

    instance.isMaximized = !instance.isMaximized
    
    if (instance.isMaximized) {
      instance.container.style.left = '0px'
      instance.container.style.top = '0px'
      instance.container.style.width = '100vw'
      instance.container.style.height = '100vh'
    } else {
      instance.container.style.left = `${instance.position.x}px`
      instance.container.style.top = `${instance.position.y}px`
      instance.container.style.width = `${instance.size.width}px`
      instance.container.style.height = `${instance.size.height}px`
    }
    
    return true
  }

  getRunningApps(): NativeAppInstance[] {
    return Array.from(this.appInstances.values()).filter(app => app.isRunning)
  }

  getAllApps(): any[] {
    const appIds = ['spotify', 'cursor', 'excel', 'word', 'chrome', 'vscode', 'discord', 'notion', 'figma', 'photoshop', 'steam', 'slack']
    return appIds.map(id => this.getAppInfo(id))
  }

  // Public method to request screen sharing when explicitly needed (not used in virtual mode)
  async requestScreenSharing(): Promise<MediaStream | null> {
    console.log('Screen sharing not available in virtual mode - apps run in isolated web environment')
    return null
  }
}

// Export singleton instance
export const nativeAppBridge = new VirtualAppBridge()