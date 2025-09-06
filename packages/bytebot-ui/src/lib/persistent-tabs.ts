// Persistent Tab Management System
// Keeps tabs open until explicitly closed by user

interface Tab {
  id: string
  title: string
  url: string
  favicon?: string
  isActive: boolean
  isPinned: boolean
  createdAt: Date
  lastAccessed: Date
  component: string
  metadata?: {
    scrollPosition?: number
    formData?: any
    state?: any
  }
}

interface TabGroup {
  id: string
  name: string
  tabs: string[] // Tab IDs
  color?: string
  createdAt: Date
}

class PersistentTabManager {
  private static instance: PersistentTabManager
  private tabs: Map<string, Tab> = new Map()
  private tabGroups: Map<string, TabGroup> = new Map()
  private activeTabId: string | null = null
  private tabOrder: string[] = []
  private isInitialized = false

  static getInstance(): PersistentTabManager {
    if (!PersistentTabManager.instance) {
      PersistentTabManager.instance = new PersistentTabManager()
    }
    return PersistentTabManager.instance
  }

  // Initialize the tab manager
  initialize() {
    if (this.isInitialized) return

    // Load tabs from localStorage
    this.loadFromStorage()

    // Set up auto-save
    setInterval(() => {
      this.saveToStorage()
    }, 30000) // Save every 30 seconds

    // Set up beforeunload save
    window.addEventListener('beforeunload', () => {
      this.saveToStorage()
    })

    this.isInitialized = true
    console.log('📑 Persistent Tab Manager initialized')
  }

  // Create a new tab
  createTab(tabData: {
    title: string
    url: string
    component: string
    favicon?: string
    isPinned?: boolean
    metadata?: any
  }): string {
    const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const tab: Tab = {
      id: tabId,
      title: tabData.title,
      url: tabData.url,
      favicon: tabData.favicon,
      isActive: false,
      isPinned: tabData.isPinned || false,
      createdAt: now,
      lastAccessed: now,
      component: tabData.component,
      metadata: tabData.metadata || {}
    }

    this.tabs.set(tabId, tab)
    this.tabOrder.push(tabId)

    // If this is the first tab or no active tab, make it active
    if (this.tabs.size === 1 || !this.activeTabId) {
      this.setActiveTab(tabId)
    }

    console.log('📑 Tab created:', tabId, tabData.title)
    return tabId
  }

  // Close a tab (only when explicitly requested)
  closeTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    // Remove from tabs map
    this.tabs.delete(tabId)

    // Remove from tab order
    this.tabOrder = this.tabOrder.filter(id => id !== tabId)

    // If this was the active tab, switch to another tab
    if (this.activeTabId === tabId) {
      this.activeTabId = null
      
      // Find the next available tab
      const remainingTabs = this.tabOrder.filter(id => this.tabs.has(id))
      if (remainingTabs.length > 0) {
        // Prefer non-pinned tabs, then pinned tabs
        const nonPinnedTabs = remainingTabs.filter(id => !this.tabs.get(id)?.isPinned)
        const targetTabId = nonPinnedTabs.length > 0 ? nonPinnedTabs[0] : remainingTabs[0]
        this.setActiveTab(targetTabId)
      }
    }

    console.log('📑 Tab closed:', tabId, tab.title)
    return true
  }

  // Set active tab
  setActiveTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    // Deactivate current active tab
    if (this.activeTabId) {
      const currentTab = this.tabs.get(this.activeTabId)
      if (currentTab) {
        currentTab.isActive = false
      }
    }

    // Activate new tab
    tab.isActive = true
    tab.lastAccessed = new Date()
    this.activeTabId = tabId

    // Move to end of tab order (most recently accessed)
    this.tabOrder = this.tabOrder.filter(id => id !== tabId)
    this.tabOrder.push(tabId)

    console.log('📑 Active tab changed to:', tabId, tab.title)
    return true
  }

  // Update tab information
  updateTab(tabId: string, updates: Partial<Omit<Tab, 'id' | 'createdAt'>>): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    Object.assign(tab, updates)
    tab.lastAccessed = new Date()

    console.log('📑 Tab updated:', tabId, updates)
    return true
  }

  // Pin/unpin a tab
  togglePinTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    tab.isPinned = !tab.isPinned
    tab.lastAccessed = new Date()

    console.log('📑 Tab pin toggled:', tabId, tab.isPinned)
    return true
  }

  // Create a tab group
  createTabGroup(name: string, tabIds: string[], color?: string): string {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const group: TabGroup = {
      id: groupId,
      name,
      tabs: tabIds.filter(id => this.tabs.has(id)), // Only include existing tabs
      color,
      createdAt: new Date()
    }

    this.tabGroups.set(groupId, group)
    console.log('📑 Tab group created:', groupId, name)
    return groupId
  }

  // Add tab to group
  addTabToGroup(tabId: string, groupId: string): boolean {
    const tab = this.tabs.get(tabId)
    const group = this.tabGroups.get(groupId)
    
    if (!tab || !group) return false

    if (!group.tabs.includes(tabId)) {
      group.tabs.push(tabId)
      console.log('📑 Tab added to group:', tabId, groupId)
    }

    return true
  }

  // Remove tab from group
  removeTabFromGroup(tabId: string, groupId: string): boolean {
    const group = this.tabGroups.get(groupId)
    if (!group) return false

    group.tabs = group.tabs.filter(id => id !== tabId)
    console.log('📑 Tab removed from group:', tabId, groupId)
    return true
  }

  // Get all tabs
  getAllTabs(): Tab[] {
    return Array.from(this.tabs.values())
      .sort((a, b) => {
        // Pinned tabs first, then by last accessed
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return b.lastAccessed.getTime() - a.lastAccessed.getTime()
      })
  }

  // Get active tab
  getActiveTab(): Tab | null {
    return this.activeTabId ? this.tabs.get(this.activeTabId) || null : null
  }

  // Get tab by ID
  getTab(tabId: string): Tab | null {
    return this.tabs.get(tabId) || null
  }

  // Get tabs by component type
  getTabsByComponent(component: string): Tab[] {
    return Array.from(this.tabs.values())
      .filter(tab => tab.component === component)
  }

  // Get tab groups
  getAllTabGroups(): TabGroup[] {
    return Array.from(this.tabGroups.values())
  }

  // Get tab group
  getTabGroup(groupId: string): TabGroup | null {
    return this.tabGroups.get(groupId) || null
  }

  // Get tabs in a group
  getTabsInGroup(groupId: string): Tab[] {
    const group = this.tabGroups.get(groupId)
    if (!group) return []

    return group.tabs
      .map(tabId => this.tabs.get(tabId))
      .filter((tab): tab is Tab => tab !== undefined)
  }

  // Save tab state (for form data, scroll position, etc.)
  saveTabState(tabId: string, state: any): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    tab.metadata = { ...tab.metadata, ...state }
    tab.lastAccessed = new Date()

    return true
  }

  // Get tab state
  getTabState(tabId: string): any {
    const tab = this.tabs.get(tabId)
    return tab?.metadata || {}
  }

  // Duplicate a tab
  duplicateTab(tabId: string): string | null {
    const originalTab = this.tabs.get(tabId)
    if (!originalTab) return null

    const newTabId = this.createTab({
      title: `${originalTab.title} (Copy)`,
      url: originalTab.url,
      component: originalTab.component,
      favicon: originalTab.favicon,
      isPinned: false,
      metadata: { ...originalTab.metadata }
    })

    return newTabId
  }

  // Move tab to different position
  moveTab(tabId: string, newIndex: number): boolean {
    const currentIndex = this.tabOrder.indexOf(tabId)
    if (currentIndex === -1) return false

    // Remove from current position
    this.tabOrder.splice(currentIndex, 1)
    
    // Insert at new position
    this.tabOrder.splice(newIndex, 0, tabId)

    console.log('📑 Tab moved:', tabId, 'to position', newIndex)
    return true
  }

  // Get tab statistics
  getStats() {
    const tabs = Array.from(this.tabs.values())
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      totalTabs: tabs.length,
      activeTabs: tabs.filter(tab => tab.isActive).length,
      pinnedTabs: tabs.filter(tab => tab.isPinned).length,
      tabsCreatedToday: tabs.filter(tab => tab.createdAt > oneDayAgo).length,
      tabsCreatedThisWeek: tabs.filter(tab => tab.createdAt > oneWeekAgo).length,
      totalGroups: this.tabGroups.size,
      averageTabsPerGroup: this.tabGroups.size > 0 
        ? tabs.length / this.tabGroups.size 
        : 0
    }
  }

  // Clean up old tabs (optional - for maintenance)
  cleanupOldTabs(maxAge: number = 30 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = new Date(Date.now() - maxAge)
    let cleanedCount = 0

    for (const [tabId, tab] of Array.from(this.tabs.entries())) {
      // Don't clean up pinned tabs or active tab
      if (tab.isPinned || tab.isActive) continue
      
      // Don't clean up tabs that were accessed recently
      if (tab.lastAccessed > cutoffTime) continue

      this.tabs.delete(tabId)
      this.tabOrder = this.tabOrder.filter(id => id !== tabId)
      cleanedCount++
    }

    if (cleanedCount > 0) {
      console.log('📑 Cleaned up', cleanedCount, 'old tabs')
    }

    return cleanedCount
  }

  // Save to localStorage
  private saveToStorage() {
    try {
      const data = {
        tabs: Array.from(this.tabs.entries()),
        tabGroups: Array.from(this.tabGroups.entries()),
        activeTabId: this.activeTabId,
        tabOrder: this.tabOrder,
        lastSaved: new Date().toISOString()
      }

      localStorage.setItem('persistent-tabs', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save tabs to storage:', error)
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('persistent-tabs')
      if (!stored) return

      const data = JSON.parse(stored)
      
      // Restore tabs
      if (data.tabs) {
        this.tabs = new Map(data.tabs.map(([id, tab]: [string, any]) => [
          id,
          {
            ...tab,
            createdAt: new Date(tab.createdAt),
            lastAccessed: new Date(tab.lastAccessed)
          }
        ]))
      }

      // Restore tab groups
      if (data.tabGroups) {
        this.tabGroups = new Map(data.tabGroups.map(([id, group]: [string, any]) => [
          id,
          {
            ...group,
            createdAt: new Date(group.createdAt)
          }
        ]))
      }

      // Restore active tab and order
      this.activeTabId = data.activeTabId
      this.tabOrder = data.tabOrder || []

      console.log('📑 Loaded', this.tabs.size, 'tabs from storage')
    } catch (error) {
      console.warn('Failed to load tabs from storage:', error)
    }
  }

  // Export tabs data
  exportTabs(): string {
    const data = {
      tabs: Array.from(this.tabs.entries()),
      tabGroups: Array.from(this.tabGroups.entries()),
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(data, null, 2)
  }

  // Import tabs data
  importTabs(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.tabs) {
        this.tabs = new Map(data.tabs.map(([id, tab]: [string, any]) => [
          id,
          {
            ...tab,
            createdAt: new Date(tab.createdAt),
            lastAccessed: new Date(tab.lastAccessed)
          }
        ]))
      }

      if (data.tabGroups) {
        this.tabGroups = new Map(data.tabGroups.map(([id, group]: [string, any]) => [
          id,
          {
            ...group,
            createdAt: new Date(group.createdAt)
          }
        ]))
      }

      console.log('📑 Imported', this.tabs.size, 'tabs')
      return true
    } catch (error) {
      console.error('Failed to import tabs:', error)
      return false
    }
  }
}

export const persistentTabs = PersistentTabManager.getInstance()
export type { Tab, TabGroup }
