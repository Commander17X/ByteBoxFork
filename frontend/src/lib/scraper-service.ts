// Advanced scraper service integrating scraper-on-steroids functionality
// This service provides web scraping capabilities with anti-detection measures

export interface ScraperConfig {
  url: string
  proxyEnabled: boolean
  concurrentRequests: number
  extractionRules: string
  delayBetweenRequests: number
  userAgent?: string
  headless?: boolean
  requestId?: number
}

export interface ScraperResult {
  id: string
  url: string
  success: boolean
  data?: any
  error?: string
  timestamp: Date
  ip?: string
  country?: string
  responseTime: number
  userAgent?: string
}

// Proxy configuration for bypassing geo-restrictions
const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
]

class ScraperService {
  private static instance: ScraperService

  static getInstance(): ScraperService {
    if (!ScraperService.instance) {
      ScraperService.instance = new ScraperService()
    }
    return ScraperService.instance
  }

  // Get a proxy URL for a given target URL
  getProxyUrl(targetUrl: string, attempt: number = 0): string {
    const proxyService = PROXY_SERVICES[attempt % PROXY_SERVICES.length]
    return `${proxyService}${encodeURIComponent(targetUrl)}`
  }

  // Parse proxy configuration (similar to scraper-on-steroids)
  parseProxyUrl(proxyUrl: string) {
    try {
      const [protocol, rest] = proxyUrl.split('://')
      const [host, port, username, rawPassword] = rest.split(':')
      const [password, ...options] = rawPassword.split('_')

      const optionsMap: { [key: string]: string } = {}
      options.forEach((opt) => {
        const [key, value] = opt.split('-')
        optionsMap[key] = value
      })

      return {
        protocol,
        host,
        port: parseInt(port),
        username,
        password,
        country: optionsMap.country
      }
    } catch (error) {
      console.warn('Failed to parse proxy URL:', error)
      return null
    }
  }

  // Simulate scraping with anti-detection measures
  async scrapeWithConfig(config: ScraperConfig): Promise<ScraperResult> {
    const startTime = Date.now()

    try {
      // Simulate network request with realistic timing
      const responseTime = 500 + Math.random() * 2000
      await new Promise(resolve => setTimeout(resolve, responseTime))

      // Simulate success/failure based on URL patterns
      const isLikelyToFail = config.url.includes('protected') ||
                            config.url.includes('secure') ||
                            Math.random() < 0.15 // 15% random failure rate

      if (isLikelyToFail && !config.proxyEnabled) {
        return {
          id: `scrape-${Date.now()}-${Math.random()}`,
          url: config.url,
          success: false,
          error: 'Content protection detected. Try enabling proxy mode.',
          timestamp: new Date(),
          responseTime: Date.now() - startTime
        }
      }

      // Simulate successful scraping
      const mockData = await this.extractMockData(config.url, config.extractionRules)

      return {
        id: `scrape-${Date.now()}-${Math.random()}`,
        url: config.url,
        success: true,
        data: mockData,
        timestamp: new Date(),
        ip: config.proxyEnabled ?
          `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` :
          'direct',
        country: config.proxyEnabled ?
          ['US', 'UK', 'DE', 'FR', 'JP', 'CA', 'AU'][Math.floor(Math.random() * 7)] :
          'local',
        responseTime: Date.now() - startTime,
        userAgent: config.userAgent || 'Scraper-on-Steroids/1.0'
      }
    } catch (error) {
      return {
        id: `scrape-${Date.now()}-${Math.random()}`,
        url: config.url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error',
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      }
    }
  }

  // Run multiple scraping requests concurrently with progress tracking
  async scrapeConcurrent(
    config: ScraperConfig,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ScraperResult[]> {
    const results: ScraperResult[] = []
    const total = config.concurrentRequests
    let completed = 0

    // Process requests sequentially with delays to avoid overwhelming the target
    for (let i = 0; i < total; i++) {
      try {
        const result = await this.scrapeWithConfig({
          ...config,
          requestId: i + 1
        })
        results.push(result)
        completed++
        onProgress?.(completed, total)
      } catch (error) {
        // Add error result
        results.push({
          id: `scrape-error-${Date.now()}-${i}`,
          url: config.url,
          success: false,
          error: error instanceof Error ? error.message : 'Request failed',
          timestamp: new Date(),
          responseTime: 0
        })
        completed++
        onProgress?.(completed, total)
      }

      // Add delay between requests (except for the last one)
      if (i < total - 1) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests))
      }
    }

    return results
  }

  // Extract mock data based on extraction rules
  private async extractMockData(url: string, extractionRules: string): Promise<any> {
    const hostname = new URL(url).hostname

    // Simulate different types of extracted data
    if (extractionRules.toLowerCase().includes('table') || extractionRules.toLowerCase().includes('data')) {
      return {
        type: 'table_data',
        tables: [
          {
            headers: ['Name', 'Value', 'Status'],
            rows: [
              ['Item 1', '100', 'Active'],
              ['Item 2', '200', 'Inactive'],
              ['Item 3', '300', 'Active']
            ]
          }
        ],
        metadata: {
          source: hostname,
          extractedAt: new Date().toISOString(),
          totalRows: 3
        }
      }
    }

    if (extractionRules.toLowerCase().includes('link')) {
      return {
        type: 'links',
        links: Array.from({ length: 5 }, (_, i) => ({
          text: `Link ${i + 1}`,
          href: `${url}/page${i + 1}`,
          title: `Page ${i + 1} on ${hostname}`
        })),
        metadata: {
          source: hostname,
          totalLinks: 5,
          extractedAt: new Date().toISOString()
        }
      }
    }

    // Default text extraction
    return {
      type: 'text_content',
      title: `Content from ${hostname}`,
      text: `This is extracted content from ${url}. The extraction rules were: "${extractionRules}". In a real implementation, this would contain actual scraped text, images, and structured data from the target website.`,
      wordCount: 42,
      metadata: {
        source: hostname,
        extractedAt: new Date().toISOString(),
        contentType: 'text/html'
      }
    }
  }

  // Validate URL format
  validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Get scraping statistics
  getScrapingStats(results: ScraperResult[]) {
    const total = results.length
    const successful = results.filter(r => r.success).length
    const failed = total - successful
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total

    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      avgResponseTime: Math.round(avgResponseTime),
      countries: Array.from(new Set(results.map(r => r.country).filter(Boolean)))
    }
  }
}

export const scraperService = ScraperService.getInstance()
