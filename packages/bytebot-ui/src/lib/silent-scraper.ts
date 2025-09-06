// Silent scraper service that automatically runs in the background
// Monitors browser activity and scrapes data without user interaction

interface ScraperTarget {
  url: string
  instruction: string
  priority: 'low' | 'medium' | 'high'
  lastScraped?: Date
  enabled: boolean
}

interface AutoTrainConfig {
  enabled: boolean
  maxUrlsPerHour: number
  maxConcurrentVisits: number
  allowedDomains: string[]
  blockedDomains: string[]
  minWaitTime: number
  maxWaitTime: number
  userCanInterfere: boolean
  transparencyMode: boolean
}

interface ScraperResult {
  success: boolean
  data?: any
  error?: string
  url: string
  timestamp: Date
  duration: number
}

interface DiscoveredUrl {
  url: string
  source: string
  discoveredAt: Date
  priority: number
  visited: boolean
  scraped: boolean
}

class SilentScraperService {
  private static instance: SilentScraperService
  private isRunning = false
  private targets: ScraperTarget[] = []
  private results: ScraperResult[] = []
  private eventListeners: ((result: ScraperResult) => void)[] = []
  
  // Auto Train Mode properties
  private autoTrainConfig: AutoTrainConfig = {
    enabled: false,
    maxUrlsPerHour: 50,
    maxConcurrentVisits: 3,
    allowedDomains: [],
    blockedDomains: ['pornhub.com', 'xvideos.com', 'xhamster.com', 'adult', 'xxx'],
    minWaitTime: 2000,
    maxWaitTime: 10000,
    userCanInterfere: true,
    transparencyMode: true
  }
  private discoveredUrls: DiscoveredUrl[] = []
  private autoTrainInterval: NodeJS.Timeout | null = null
  private currentVisits: Set<string> = new Set()
  private urlsVisitedThisHour = 0
  private lastHourReset = Date.now()

  static getInstance(): SilentScraperService {
    if (!SilentScraperService.instance) {
      SilentScraperService.instance = new SilentScraperService()
    }
    return SilentScraperService.instance
  }

  // Initialize with default scraping targets
  initialize() {
    this.targets = [
      {
        url: 'https://httpbin.org/html',
        instruction: 'Extract all the table data into a JSON',
        priority: 'high',
        enabled: true
      },
      {
        url: 'https://example.com/products',
        instruction: 'Extract product names and prices',
        priority: 'medium',
        enabled: false
      },
      {
        url: 'https://news.ycombinator.com',
        instruction: 'Extract top stories and their scores',
        priority: 'low',
        enabled: false
      }
    ]
  }

  // Add event listener for scraper results
  onResult(callback: (result: ScraperResult) => void) {
    this.eventListeners.push(callback)
  }

  // Remove event listener
  offResult(callback: (result: ScraperResult) => void) {
    this.eventListeners = this.eventListeners.filter(listener => listener !== callback)
  }

  // Notify all listeners of a result
  private notifyResult(result: ScraperResult) {
    this.eventListeners.forEach(listener => {
      try {
        listener(result)
      } catch (error) {
        console.error('Error in scraper result listener:', error)
      }
    })
  }

  // Start the silent scraping service
  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.debug('Silent scraper service started')

    // Run initial scrape
    this.runScheduledScrapes()

    // Set up periodic scraping (every 5 minutes)
    setInterval(() => {
      this.runScheduledScrapes()
    }, 5 * 60 * 1000)

    // Start Auto Train Mode if enabled
    if (this.autoTrainConfig.enabled) {
      this.startAutoTrainMode()
    }
  }

  // Stop the silent scraping service
  stop() {
    this.isRunning = false
    console.debug('Silent scraper service stopped')
  }

  // Manually trigger scraping for a specific URL
  async scrapeUrl(url: string, instruction?: string): Promise<ScraperResult> {
    const startTime = Date.now()

    // Validate URL before making request
    if (!url || typeof url !== 'string' || url.trim() === '') {
      const result: ScraperResult = {
        success: false,
        error: 'Invalid URL: URL cannot be empty or null',
        url: url || 'undefined',
        timestamp: new Date(),
        duration: Date.now() - startTime
      }
      this.results.push(result)
      this.notifyResult(result)
      return result
    }

    try {
      const response = await fetch('/api/scrape-silent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          instruction: instruction || 'Extract all visible content',
          useProxy: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      const result: ScraperResult = {
        success: data.success,
        data: data.data,
        error: data.error,
        url: data.url || url,
        timestamp: new Date(),
        duration
      }

      this.results.push(result)
      this.notifyResult(result)

      // Save to database for persistence
      await this.saveResultToDatabase(result)

      // Keep only last 100 results in memory
      if (this.results.length > 100) {
        this.results = this.results.slice(-100)
      }

      return result

    } catch (error) {
      const duration = Date.now() - startTime
      const result: ScraperResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error',
        url,
        timestamp: new Date(),
        duration
      }

      this.results.push(result)
      this.notifyResult(result)

      // Save error result to database too
      await this.saveResultToDatabase(result)

      return result
    }
  }

  // Save scraping result to database for persistence
  private async saveResultToDatabase(result: ScraperResult): Promise<void> {
    try {
      // Save to orchestrator database via API
      await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: 'scraper-policy',
          agent_id: 'silent-scraper',
          action: 'scrape_url',
          reasoning: `Scraped URL: ${result.url}`,
          status: result.success ? 'completed' : 'failed',
          impact: result.success ? 'data_extracted' : 'extraction_failed',
          result: JSON.stringify({
            url: result.url,
            success: result.success,
            data: result.data,
            error: result.error,
            duration: result.duration,
            timestamp: result.timestamp
          })
        })
      })
    } catch (error) {
      console.warn('Failed to save scraping result to database:', error)
      // Don't throw - we don't want to break scraping if DB save fails
    }
  }

  // Run scheduled scrapes based on targets
  private async runScheduledScrapes() {
    if (!this.isRunning) return

    const enabledTargets = this.targets.filter(target => target.enabled)

    for (const target of enabledTargets) {
      // Skip if recently scraped (within last hour for high priority, 24 hours for others)
      const timeThreshold = target.priority === 'high' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      if (target.lastScraped && (Date.now() - target.lastScraped.getTime()) < timeThreshold) {
        continue
      }

      console.debug(`Silently scraping: ${target.url}`)

      try {
        await this.scrapeUrl(target.url, target.instruction)
        target.lastScraped = new Date()
      } catch (error) {
        console.debug(`Failed to scrape ${target.url}:`, error)
      }

      // Add delay between scrapes to avoid detection
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Add a new scraping target
  addTarget(target: Omit<ScraperTarget, 'lastScraped'>) {
    this.targets.push({
      ...target,
      lastScraped: undefined
    })
  }

  // Remove a scraping target
  removeTarget(url: string) {
    this.targets = this.targets.filter(target => target.url !== url)
  }

  // Update target configuration
  updateTarget(url: string, updates: Partial<ScraperTarget>) {
    const target = this.targets.find(t => t.url === url)
    if (target) {
      Object.assign(target, updates)
    }
  }

  // Get all targets
  getTargets(): ScraperTarget[] {
    return [...this.targets]
  }

  // Get recent results
  getRecentResults(limit = 10): ScraperResult[] {
    return this.results.slice(-limit)
  }

  // Get historical results from database
  async getHistoricalResults(limit = 50): Promise<ScraperResult[]> {
    try {
      const response = await fetch(`/api/decisions?agent_id=silent-scraper&limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.decisions?.map((decision: any) => {
        const result = JSON.parse(decision.result || '{}')
        return {
          success: result.success,
          data: result.data,
          error: result.error,
          url: result.url,
          timestamp: new Date(result.timestamp),
          duration: result.duration
        }
      }) || []
    } catch (error) {
      console.warn('Failed to fetch historical results:', error)
      return []
    }
  }

  // Get scraping statistics
  getStats() {
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    const avgDuration = total > 0
      ? this.results.reduce((sum, r) => sum + r.duration, 0) / total
      : 0

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDuration: Math.round(avgDuration),
      targetsCount: this.targets.filter(t => t.enabled).length,
      isRunning: this.isRunning
    }
  }

  // Export results to JSON
  exportResults(): string {
    return JSON.stringify(this.results, null, 2)
  }

  // Import targets from JSON
  importTargets(jsonString: string) {
    try {
      const importedTargets = JSON.parse(jsonString)
      if (Array.isArray(importedTargets)) {
        this.targets = importedTargets.map(target => ({
          ...target,
          lastScraped: target.lastScraped ? new Date(target.lastScraped) : undefined
        }))
      }
    } catch (error) {
      console.error('Failed to import targets:', error)
    }
  }

  // ===== AUTO TRAIN MODE METHODS =====

  // Start Auto Train Mode
  startAutoTrainMode() {
    // Safety check: only start if explicitly enabled
    if (!this.autoTrainConfig.enabled) {
      console.log('🤖 Auto Train: Cannot start - mode is disabled')
      return
    }

    if (this.autoTrainInterval) {
      clearInterval(this.autoTrainInterval)
    }

    console.log('🤖 Auto Train Mode started - Autonomous URL discovery and training')
    
    // Clean up any invalid URLs that might already exist
    this.cleanupInvalidUrls()
    
    // Run Auto Train every 30 seconds
    this.autoTrainInterval = setInterval(() => {
      // Double-check enabled status before each cycle
      if (!this.autoTrainConfig.enabled) {
        console.log('🤖 Auto Train: Cycle skipped - mode disabled during execution')
        return
      }
      this.runAutoTrainCycle()
    }, 30000)

    // Initial discovery from seed URLs (async)
    setTimeout(() => {
      // Check again before discovery
      if (this.autoTrainConfig.enabled) {
        this.discoverUrlsFromSeeds()
      }
    }, 1000)
  }

  // Stop Auto Train Mode
  stopAutoTrainMode() {
    if (this.autoTrainInterval) {
      clearInterval(this.autoTrainInterval)
      this.autoTrainInterval = null
    }
    console.log('🤖 Auto Train Mode stopped')
  }

  // Configure Auto Train Mode
  configureAutoTrain(config: Partial<AutoTrainConfig>) {
    const previousEnabled = this.autoTrainConfig.enabled
    this.autoTrainConfig = { ...this.autoTrainConfig, ...config }
    console.log('🤖 Auto Train Mode configured:', this.autoTrainConfig)
    
    // Safety checks for enabling/disabling
    if (this.autoTrainConfig.enabled && !previousEnabled && !this.autoTrainInterval) {
      console.log('🤖 Auto Train: Starting mode as it was just enabled')
      this.startAutoTrainMode()
    } else if (!this.autoTrainConfig.enabled && previousEnabled && this.autoTrainInterval) {
      console.log('🤖 Auto Train: Stopping mode as it was just disabled')
      this.stopAutoTrainMode()
    } else if (!this.autoTrainConfig.enabled && this.autoTrainInterval) {
      // Extra safety: if somehow the interval is still running but mode is disabled, stop it
      console.log('🤖 Auto Train: Safety stop - interval running but mode disabled')
      this.stopAutoTrainMode()
    }
  }

  // Get Auto Train Mode status
  getAutoTrainStatus() {
    return {
      enabled: this.autoTrainConfig.enabled,
      config: this.autoTrainConfig,
      discoveredUrls: this.discoveredUrls.length,
      visitedUrls: this.discoveredUrls.filter(u => u.visited).length,
      scrapedUrls: this.discoveredUrls.filter(u => u.scraped).length,
      currentVisits: this.currentVisits.size,
      urlsVisitedThisHour: this.urlsVisitedThisHour,
      maxUrlsPerHour: this.autoTrainConfig.maxUrlsPerHour
    }
  }

  // Run one cycle of Auto Train Mode
  private async runAutoTrainCycle() {
    // CRITICAL: Double-check that Auto Train is enabled before proceeding
    if (!this.autoTrainConfig.enabled) {
      console.log('🤖 Auto Train: Mode is disabled, skipping cycle')
      return
    }

    // Additional safety check - if the interval exists but mode is disabled, stop it
    if (this.autoTrainInterval && !this.autoTrainConfig.enabled) {
      console.log('🤖 Auto Train: Stopping interval as mode is disabled')
      this.stopAutoTrainMode()
      return
    }

    // Reset hourly counter
    if (Date.now() - this.lastHourReset > 3600000) {
      this.urlsVisitedThisHour = 0
      this.lastHourReset = Date.now()
    }

    // Check if we've hit the hourly limit
    if (this.urlsVisitedThisHour >= this.autoTrainConfig.maxUrlsPerHour) {
      console.log('🤖 Auto Train: Hourly limit reached, waiting for next hour')
      return
    }

    // Check concurrent visit limit
    if (this.currentVisits.size >= this.autoTrainConfig.maxConcurrentVisits) {
      console.log('🤖 Auto Train: Concurrent visit limit reached')
      return
    }

    // Find next URL to visit
    const nextUrl = this.getNextUrlToVisit()
    if (!nextUrl) {
      console.log('🤖 Auto Train: No URLs to visit, discovering more...')
      await this.discoverMoreUrls()
      return
    }

    // Visit and scrape the URL
    await this.visitAndScrapeUrl(nextUrl)
  }

  // Discover URLs from seed sources
  private async discoverUrlsFromSeeds() {
    const seedUrls = [
      'https://httpbin.org/html',
      'https://example.com',
      'https://jsonplaceholder.typicode.com',
      'https://httpbin.org/json',
      'https://httpbin.org/xml',
      'https://httpbin.org/robots.txt',
      'https://httpbin.org/links/10/0',
      'https://httpbin.org/redirect/1',
      'https://httpbin.org/status/200',
      'https://httpbin.org/user-agent'
    ]

    for (const seedUrl of seedUrls) {
      this.addDiscoveredUrl(seedUrl, 'seed', 10)
    }

    console.log(`🤖 Auto Train: Discovered ${seedUrls.length} seed URLs`)
  }

  // Discover more URLs from current discoveries
  private async discoverMoreUrls() {
    // Get URLs that have been scraped successfully
    const scrapedUrls = this.discoveredUrls.filter(u => u.scraped && u.url)
    
    for (const discoveredUrl of scrapedUrls.slice(0, 5)) { // Limit to 5 to avoid overwhelming
      try {
        // Try to extract links from the scraped content
        const result = this.results.find(r => r.url === discoveredUrl.url && r.success)
        if (result && result.data) {
          await this.extractLinksFromContent(result.data, discoveredUrl.url)
        }
      } catch (error) {
        console.warn('🤖 Auto Train: Failed to extract links from:', discoveredUrl.url)
      }
    }
  }

  // Extract links from scraped content
  private async extractLinksFromContent(content: any, sourceUrl: string) {
    try {
      let textContent = ''
      
      if (typeof content === 'string') {
        textContent = content
      } else if (content.extracted_data && Array.isArray(content.extracted_data)) {
        textContent = content.extracted_data.map((item: any) => 
          `${item.name || ''} ${item.price || ''} ${item.description || ''}`
        ).join(' ')
      } else if (content.content) {
        textContent = content.content
      }

      // Simple URL extraction regex
      const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
      const urls = textContent.match(urlRegex) || []

      // Add discovered URLs
      for (const url of urls.slice(0, 10)) { // Limit to 10 URLs per content
        // Additional validation: ensure URL is not empty and has proper format
        if (url && url.trim() && url.length > 10 && this.isValidUrl(url) && !this.isUrlBlocked(url)) {
          this.addDiscoveredUrl(url.trim(), sourceUrl, 5)
        }
      }
    } catch (error) {
      console.warn('🤖 Auto Train: Failed to extract links from content:', error)
    }
  }

  // Add a discovered URL
  private addDiscoveredUrl(url: string, source: string, priority: number) {
    // Validate URL before adding
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.warn(`🤖 Auto Train: Skipping invalid URL: "${url}" (from: ${source})`)
      return
    }

    // Check if URL is valid format
    if (!this.isValidUrl(url)) {
      console.warn(`🤖 Auto Train: Skipping malformed URL: "${url}" (from: ${source})`)
      return
    }

    // Check if URL already exists
    if (this.discoveredUrls.some(u => u.url === url)) {
      return
    }

    const discoveredUrl: DiscoveredUrl = {
      url,
      source,
      discoveredAt: new Date(),
      priority,
      visited: false,
      scraped: false
    }

    this.discoveredUrls.push(discoveredUrl)
    
    if (this.autoTrainConfig.transparencyMode) {
      console.log(`🤖 Auto Train: Discovered new URL: ${url} (from: ${source}, priority: ${priority})`)
    }
  }

  // Get next URL to visit
  private getNextUrlToVisit(): DiscoveredUrl | null {
    // Sort by priority and discovery time, filtering out invalid URLs
    const unvisitedUrls = this.discoveredUrls
      .filter(u => !u.visited && !this.currentVisits.has(u.url) && u.url && u.url.trim() && this.isValidUrl(u.url))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        return a.discoveredAt.getTime() - b.discoveredAt.getTime()
      })

    return unvisitedUrls[0] || null
  }

  // Visit and scrape a URL
  private async visitAndScrapeUrl(discoveredUrl: DiscoveredUrl) {
    // Validate URL before processing
    if (!discoveredUrl.url || typeof discoveredUrl.url !== 'string' || discoveredUrl.url.trim() === '') {
      console.warn(`🤖 Auto Train: Skipping invalid URL in visitAndScrapeUrl: "${discoveredUrl.url}"`)
      discoveredUrl.visited = true
      discoveredUrl.scraped = false
      return
    }

    this.currentVisits.add(discoveredUrl.url)
    this.urlsVisitedThisHour++

    if (this.autoTrainConfig.transparencyMode) {
      console.log(`🤖 Auto Train: Visiting URL: ${discoveredUrl.url} (${this.urlsVisitedThisHour}/${this.autoTrainConfig.maxUrlsPerHour} this hour)`)
    }

    try {
      // Random wait time between min and max
      const waitTime = Math.random() * (this.autoTrainConfig.maxWaitTime - this.autoTrainConfig.minWaitTime) + this.autoTrainConfig.minWaitTime
      await new Promise(resolve => setTimeout(resolve, waitTime))

      // Scrape the URL
      const result = await this.scrapeUrl(discoveredUrl.url, 'Extract all visible content and links')
      
      // Update discovered URL status
      discoveredUrl.visited = true
      discoveredUrl.scraped = result.success

      if (this.autoTrainConfig.transparencyMode) {
        console.log(`🤖 Auto Train: ${result.success ? 'Successfully scraped' : 'Failed to scrape'}: ${discoveredUrl.url}`)
      }

      // If successful, try to discover more URLs from this content
      if (result.success && result.data) {
        await this.extractLinksFromContent(result.data, discoveredUrl.url)
      }

    } catch (error) {
      discoveredUrl.visited = true
      discoveredUrl.scraped = false
      
      if (this.autoTrainConfig.transparencyMode) {
        console.error(`🤖 Auto Train: Error visiting ${discoveredUrl.url}:`, error)
      }
    } finally {
      this.currentVisits.delete(discoveredUrl.url)
    }
  }

  // Check if URL is valid
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Clean up invalid URLs from discovered URLs list
  private cleanupInvalidUrls() {
    const initialCount = this.discoveredUrls.length
    this.discoveredUrls = this.discoveredUrls.filter(url => 
      url.url && 
      typeof url.url === 'string' && 
      url.url.trim() !== '' && 
      this.isValidUrl(url.url)
    )
    const removedCount = initialCount - this.discoveredUrls.length
    if (removedCount > 0) {
      console.log(`🤖 Auto Train: Cleaned up ${removedCount} invalid URLs`)
    }
  }

  // Check if URL is blocked
  private isUrlBlocked(url: string): boolean {
    const urlLower = url.toLowerCase()
    
    // Check blocked domains
    for (const blockedDomain of this.autoTrainConfig.blockedDomains) {
      if (urlLower.includes(blockedDomain.toLowerCase())) {
        return true
      }
    }

    // Check allowed domains (if specified)
    if (this.autoTrainConfig.allowedDomains.length > 0) {
      const urlObj = new URL(url)
      const isAllowed = this.autoTrainConfig.allowedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      )
      if (!isAllowed) {
        return true
      }
    }

    return false
  }

  // Get discovered URLs for transparency
  getDiscoveredUrls(limit = 100): DiscoveredUrl[] {
    return this.discoveredUrls
      .sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime())
      .slice(0, limit)
  }

  // User intervention methods
  pauseAutoTrain() {
    this.autoTrainConfig.enabled = false
    this.stopAutoTrainMode()
    console.log('🤖 Auto Train: Paused by user')
  }

  resumeAutoTrain() {
    this.autoTrainConfig.enabled = true
    this.startAutoTrainMode()
    console.log('🤖 Auto Train: Resumed by user')
  }

  blockUrl(url: string) {
    this.autoTrainConfig.blockedDomains.push(url)
    console.log(`🤖 Auto Train: Blocked URL: ${url}`)
  }

  prioritizeUrl(url: string, priority: number) {
    const discoveredUrl = this.discoveredUrls.find(u => u.url === url)
    if (discoveredUrl) {
      discoveredUrl.priority = priority
      console.log(`🤖 Auto Train: Prioritized URL: ${url} (priority: ${priority})`)
    }
  }

  // Public method to clean up invalid URLs
  cleanupInvalidUrlsPublic() {
    this.cleanupInvalidUrls()
    return {
      message: 'Invalid URLs cleaned up',
      remainingUrls: this.discoveredUrls.length
    }
  }
}

export const silentScraper = SilentScraperService.getInstance()


