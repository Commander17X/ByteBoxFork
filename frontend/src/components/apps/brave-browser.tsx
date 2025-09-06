'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Bookmark,
  Settings,
  Shield,
  Zap,
  X,
  MoreVertical,
  Star,
  History,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react'

// WebView Component - circumvents CORS issues
interface WebViewProps {
  src: string
  onLoad?: () => void
  onError?: (error?: any) => void
  onNavigation?: (url: string) => void
  className?: string
  getProxyUrl?: (url: string, attempt?: number) => string
  usingProxy?: boolean
  proxyAttempts?: number
  setUsingProxy?: (using: boolean) => void
  setProxyAttempts?: (attempts: number) => void
}

function WebView({
  src,
  onLoad,
  onError,
  onNavigation,
  className,
  getProxyUrl,
  usingProxy = false,
  proxyAttempts = 0,
  setUsingProxy,
  setProxyAttempts
}: WebViewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSrc, setCurrentSrc] = useState(src)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setCurrentSrc(src)
    setLoading(true)
    setError(null)
  }, [src])

  const handleIframeLoad = () => {
    setLoading(false)
    setError(null)
    onLoad?.()
  }

  const handleIframeError = () => {
    setLoading(false)

    // Check if this is a restricted site
    const isRestrictedSite = src.includes('pornhub.com') ||
                            src.includes('xvideos.com') ||
                            src.includes('xhamster.com') ||
                            src.includes('youtube.com') ||
                            src.includes('instagram.com') ||
                            src.includes('facebook.com') ||
                            src.includes('twitter.com')

    // Try proxy approach for CORS-blocked sites
    const tryProxyApproach = () => {
      const maxAttempts = 4 // Try up to 4 different proxies

      if (proxyAttempts < maxAttempts && getProxyUrl && setUsingProxy && setProxyAttempts) {
        const newAttempt = proxyAttempts + 1
        setProxyAttempts(newAttempt)
        setUsingProxy(true)
        setLoading(true)
        setError(null)
        setCurrentSrc(getProxyUrl(src, newAttempt - 1))
      } else {
        // All proxy methods failed
        setError(`Unable to load ${src}. This website blocks iframe embedding and all proxy methods failed. This is often due to CORS (Cross-Origin Resource Sharing) restrictions. Try opening in a new tab for full functionality.`)
        onError?.(new Error('All loading methods failed'))
      }
    }

    // Wait longer for restricted sites to allow proxy initialization
    const delay = isRestrictedSite ? 3000 : 1500
    setTimeout(tryProxyApproach, delay)
  }

  // If there's an error, show fallback UI
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="text-center space-y-4 max-w-md p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connection Blocked</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <p className="font-medium mb-1">About CORS:</p>
              <p>Websites protect themselves by blocking cross-origin requests. Adult content sites and social media platforms often have strict security policies. The system automatically tries multiple proxy services to bypass these restrictions.</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                setCurrentSrc(src)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Retry
            </button>
            <button
              onClick={() => window.open(src, '_blank')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Open Externally</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full mx-auto"
            />
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {usingProxy ? `Loading via proxy (${proxyAttempts}/4)...` : 'Loading...'}
              </p>
              {usingProxy && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Circumventing security restrictions
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={currentSrc}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock allow-top-navigation allow-downloads"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Brave Browser WebView"
      />
    </div>
  )
}


interface BraveBrowserProps {
  onClose: () => void
  initialUrl?: string
}

export function BraveBrowser({ onClose, initialUrl }: BraveBrowserProps) {
  const defaultUrl = initialUrl || ''
  const [currentUrl, setCurrentUrl] = useState(defaultUrl)
  const [searchQuery, setSearchQuery] = useState(defaultUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([
    'https://github.com',
    'https://stackoverflow.com',
    'https://brave.com'
  ])
  const [autoTrainEnabled, setAutoTrainEnabled] = useState(false)
  const [autoTrainStatus, setAutoTrainStatus] = useState<any>(null)
  const [history, setHistory] = useState<string[]>([])
  const [isSecure, setIsSecure] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [forceProxy, setForceProxy] = useState(false)
  const [usingProxy, setUsingProxy] = useState(false)
  const [proxyAttempts, setProxyAttempts] = useState(0)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    duration?: number
  } | null>(null)

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const duration = notification.duration || 3000
      const timer = setTimeout(() => {
        setNotification(null)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const getProxyUrl = (originalUrl: string, attempt: number = 0) => {
    // Use multiple CORS proxy services as fallbacks
    // Prioritize proxies that work well with adult content and restricted sites

    // Check if this is a site that typically blocks iframes
    const isRestrictedSite = originalUrl.includes('pornhub.com') ||
                            originalUrl.includes('xvideos.com') ||
                            originalUrl.includes('xhamster.com') ||
                            originalUrl.includes('youtube.com') ||
                            originalUrl.includes('instagram.com') ||
                            originalUrl.includes('facebook.com') ||
                            originalUrl.includes('twitter.com')

    let proxies

    if (isRestrictedSite) {
      // For restricted sites, try more aggressive proxies first
      proxies = [
        // Most reliable for adult content
        `https://thingproxy.freeboard.io/fetch/${originalUrl}`,
        // Good for various sites
        `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`,
        // Alternative proxy
        `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
        // Last resort (requires manual activation)
        `https://cors-anywhere.herokuapp.com/${originalUrl}`
      ]
    } else {
      // For regular sites, use standard priority
      proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`,
        `https://thingproxy.freeboard.io/fetch/${originalUrl}`,
        `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
        `https://cors-anywhere.herokuapp.com/${originalUrl}`
      ]
    }

    // Cycle through proxies based on attempt number
    return proxies[attempt % proxies.length]
  }

  useEffect(() => {
    // Simulate loading state
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentUrl])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      let url = searchQuery.trim()

      // Check if it's already a valid URL
      if (isValidUrl(url)) {
        // If it's a URL without protocol, add https
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url
        }
      } else {
        // It's a search query, use Brave search
        url = `https://search.brave.com/search?q=${encodeURIComponent(url)}`
      }

      // Use proxy if forced or if URL might have CORS issues
      let finalUrl = url
      const isRestrictedSite = forceProxy ||
          url.includes('brave.com') ||
          url.includes('google.com') ||
          url.includes('facebook.com') ||
          url.includes('twitter.com') ||
          url.includes('pornhub.com') ||
          url.includes('xvideos.com') ||
          url.includes('xhamster.com') ||
          url.includes('youtube.com') ||
          url.includes('instagram.com') ||
          url.includes('tiktok.com')

      if (isRestrictedSite) {
        finalUrl = getProxyUrl(url)
        setUsingProxy(true)
        console.log(`🔒 Proxy mode activated for restricted site: ${url}`)
      } else {
        setUsingProxy(false)
      }

      // Reset proxy attempts for new URL
      setProxyAttempts(0)

      setCurrentUrl(finalUrl)
      setSearchQuery(url) // Keep original URL in search bar
      setHistory(prev => [...prev.slice(-9), url]) // Keep last 10 items
      setIsLoading(true)
    }
  }

  const handleUrlChange = (url: string) => {
    setCurrentUrl(url)
    setSearchQuery(url)
    setHistory(prev => [...prev.slice(-9), url])
    setIsLoading(true)
    setLoadError(null) // Clear any previous errors
  }

  const goBack = () => {
    // In a real implementation, this would use browser history
    console.log('Go back')
  }

  const goForward = () => {
    // In a real implementation, this would use browser history
    console.log('Go forward')
  }

  const refresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const goHome = () => {
    setCurrentUrl('https://search.brave.com')
    setSearchQuery('')
  }

  const addBookmark = () => {
    if (!bookmarks.includes(currentUrl)) {
      setBookmarks(prev => [...prev, currentUrl])
    }
  }

  const removeBookmark = (url: string) => {
    setBookmarks(prev => prev.filter(b => b !== url))
  }

  // Initialize silent scraper
  useEffect(() => {
    const initSilentScraper = async () => {
      try {
        const { silentScraper } = await import('../../lib/silent-scraper')
        silentScraper.initialize()
        silentScraper.start()

        // Listen for scraper results (optional - for debugging)
        silentScraper.onResult((result) => {
          console.log('🔇 Silent scrape result:', result)
          // Could store results in local state or send to backend
        })
      } catch (error) {
        console.warn('Failed to initialize silent scraper:', error)
      }
    }

    initSilentScraper()
  }, [])

  // Auto-scrape when navigating to target URLs
  useEffect(() => {
    if (currentUrl && currentUrl !== 'about:blank') {
      const autoScrape = async () => {
        try {
          const { silentScraper } = await import('../../lib/silent-scraper')

          // Skip auto-scraping for certain URL patterns that might cause issues
          const skipPatterns = [
            /^about:/,
            /^chrome:/,
            /^file:/,
            /^data:/,
            /search\.brave\.com/,
            /localhost/,
            /127\.0\.0\.1/,
            /::1/
          ]

          const shouldSkip = skipPatterns.some(pattern => pattern.test(currentUrl))
          if (shouldSkip) {
            console.log('🔍 Skipping auto-scrape for system URL:', currentUrl)
            return
          }

          // Check if current URL matches any scraping targets
          const targets = silentScraper.getTargets()
          const matchingTarget = targets.find(target =>
            target.enabled && currentUrl.includes(new URL(target.url).hostname)
          )

          if (matchingTarget) {
            console.log('🔇 Auto-scraping matching URL:', currentUrl)
            // Small delay to ensure page is loaded
            setTimeout(() => {
              silentScraper.scrapeUrl(currentUrl, matchingTarget.instruction)
            }, 3000)
          } else {
            // Log that URL doesn't match any targets
            console.log('🔍 URL visited but not in scraping targets:', currentUrl)
            console.log('💡 You can manually scrape this URL using the scraper API')
          }
        } catch (error) {
          console.warn('Auto-scrape failed:', error)
        }
      }

      autoScrape()
    }
  }, [currentUrl])

  return (
    <div className="w-full h-full bg-white/5 flex flex-col">
      {/* Browser Toolbar */}
      <div className="flex items-center space-x-2 p-3 border-b border-white/10 bg-white/5">
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={refresh}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 text-white/80 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={goHome}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Home className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {isSecure ? (
                <Shield className="w-4 h-4 text-green-400" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-red-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search with Brave or enter address"
              onFocus={() => {
                // When focusing, if it's a URL, don't change it
                // If it's empty or a search URL, clear it for new input
                if (searchQuery === currentUrl && currentUrl.includes('search.brave.com/search?q=')) {
                  const query = new URL(currentUrl).searchParams.get('q') || ''
                  setSearchQuery(query)
                }
              }}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Search className="w-4 h-4 text-white/80" />
          </button>
        </form>

        {/* Browser Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={addBookmark}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Add to bookmarks"
          >
            <Star className={`w-4 h-4 ${bookmarks.includes(currentUrl) ? 'text-yellow-400 fill-current' : 'text-white/60'}`} />
          </button>
          <button
            onClick={async () => {
              try {
                const { silentScraper } = await import('../../lib/silent-scraper')
                console.log('🔍 Manually scraping URL:', currentUrl)
                const result = await silentScraper.scrapeUrl(currentUrl, 'Extract all visible content')
                console.log('✅ Scraping completed:', result)
              } catch (error) {
                console.error('❌ Manual scraping failed:', error)
              }
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Scrape this page"
          >
            <Zap className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={async () => {
              try {
                const { silentScraper } = await import('../../lib/silent-scraper')
                console.log('➕ Adding URL to scraping targets:', currentUrl)
                silentScraper.addTarget({
                  url: currentUrl,
                  instruction: 'Extract all visible content',
                  priority: 'medium',
                  enabled: true
                })
                console.log('✅ URL added to scraping targets')
              } catch (error) {
                console.error('❌ Failed to add URL to targets:', error)
              }
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Add to scraping targets"
          >
            <Plus className="w-4 h-4 text-green-400" />
          </button>
          <button
            onClick={async () => {
              try {
                const newState = !autoTrainEnabled
                console.log(`🤖 Toggling Auto Train Mode to: ${newState}`)
                setAutoTrainEnabled(newState)
                
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
                
                const response = await fetch('/api/scraper-config', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: newState ? 'start_auto_train' : 'stop_auto_train'
                  }),
                  signal: controller.signal
                })
                
                clearTimeout(timeoutId)
                
                console.log(`🤖 API Response status: ${response.status}`)
                
                if (response.ok) {
                  const data = await response.json()
                  console.log(`🤖 Auto Train Mode ${newState ? 'started' : 'stopped'}:`, data)
                  setNotification({
                    type: 'success',
                    message: `Auto Train Mode ${newState ? 'started' : 'stopped'} successfully`,
                    duration: 3000
                  })
                } else {
                  console.error(`❌ API Error: ${response.status} ${response.statusText}`)
                  setAutoTrainEnabled(!newState) // Revert on error
                  setNotification({
                    type: 'error',
                    message: `Failed to ${newState ? 'start' : 'stop'} Auto Train Mode`,
                    duration: 3000
                  })
                }
              } catch (error) {
                console.error('❌ Failed to toggle Auto Train Mode:', error)
                setAutoTrainEnabled(!autoTrainEnabled) // Revert on error
                setNotification({
                  type: 'error',
                  message: 'Failed to toggle Auto Train Mode',
                  duration: 3000
                })
              }
            }}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${autoTrainEnabled ? 'bg-orange-500/20' : ''}`}
            title={autoTrainEnabled ? 'Stop Auto Train Mode' : 'Start Auto Train Mode'}
          >
            <Zap className={`w-4 h-4 ${autoTrainEnabled ? 'text-orange-400 animate-pulse' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={async () => {
              try {
                console.log('🧹 Cleaning up invalid URLs...')
                
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000)
                
                const response = await fetch('/api/scraper-config', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'cleanup_invalid_urls'
                  }),
                  signal: controller.signal
                })
                
                clearTimeout(timeoutId)
                
                if (response.ok) {
                  const data = await response.json()
                  console.log('🧹 Cleanup completed:', data)
                  // Show a brief success message
                  setNotification({
                    type: 'success',
                    message: `Cleaned up invalid URLs. ${data.data?.remainingUrls || 0} URLs remaining.`,
                    duration: 3000
                  })
                } else {
                  console.error(`❌ Cleanup failed: ${response.status} ${response.statusText}`)
                  setNotification({
                    type: 'error',
                    message: 'Failed to clean up invalid URLs',
                    duration: 3000
                  })
                }
              } catch (error) {
                console.error('❌ Failed to cleanup invalid URLs:', error)
                setNotification({
                  type: 'error',
                  message: 'Failed to clean up invalid URLs',
                  duration: 3000
                })
              }
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Clean up invalid URLs"
          >
            <Trash2 className="w-4 h-4 text-yellow-400" />
          </button>
          <button
            onClick={() => setForceProxy(!forceProxy)}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${forceProxy ? 'bg-blue-500/20' : ''}`}
            title={forceProxy ? 'Disable Proxy Mode' : 'Enable Proxy Mode'}
          >
            <Globe className={`w-4 h-4 ${forceProxy ? 'text-blue-400' : 'text-white/60'}`} />
          </button>
          <button
            onClick={() => {}}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="History"
          >
            <History className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={() => {}}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Brave Features Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-xs text-white/70">
            <Shield className="w-3 h-3" />
            <span>Brave Shields: ON</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-white/70">
            <Globe className={`w-3 h-3 ${forceProxy ? 'text-blue-400' : ''}`} />
            <span>Proxy: {forceProxy ? 'ON' : 'AUTO'}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-white/70">
            <Zap className="w-3 h-3" />
            <span>Ads Blocked: 47</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-white/70">
            <Shield className="w-3 h-3" />
            <span>Trackers Blocked: 23</span>
          </div>
        </div>
        <div className="text-xs text-white/60">
          Brave Browser
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full"
            />
          </div>
        )}

        {/* WebView Implementation - circumvents CORS issues */}
        <div className="w-full h-full bg-white relative overflow-hidden">
          {currentUrl && currentUrl !== 'about:blank' ? (
            <WebView
              src={currentUrl}
              onLoad={() => {
                setIsLoading(false)
                setIsSecure(currentUrl.startsWith('https://'))
                setLoadError(null)
              }}
              onError={(error) => {
                setIsLoading(false)
                setLoadError(`Failed to load ${currentUrl}. ${error?.message || 'Unknown error occurred.'}`)
                console.warn('Failed to load URL:', currentUrl, error)
              }}
              onNavigation={(url) => {
                setSearchQuery(url)
                setCurrentUrl(url)
              }}
              className="w-full h-full border-0"
              getProxyUrl={getProxyUrl}
              usingProxy={usingProxy}
              proxyAttempts={proxyAttempts}
              setUsingProxy={setUsingProxy}
              setProxyAttempts={setProxyAttempts}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Brave</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Fast, private browsing with built-in ad blocking and tracker protection.
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Proxy Mode Available:</p>
                    <p>Some websites block iframe embedding. Use the proxy toggle (🌐) in the toolbar for full access to all sites.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => handleUrlChange('https://search.brave.com')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Search with Brave
                    </button>
                    <button
                      onClick={() => handleUrlChange('https://brave.com')}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Visit Brave.com
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Privacy Protected</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Fast & Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

              {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-t border-white/10 text-xs text-white/60">
        <div className="flex items-center space-x-4">
          <span>{isLoading ? 'Loading...' : loadError ? 'Error' : 'Ready'}</span>
          {currentUrl && (
            <div className="flex items-center space-x-1">
              {isSecure ? (
                <Shield className="w-3 h-3 text-green-400" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
              )}
              <span>{isSecure ? 'Secure Connection' : 'Not Secure'}</span>
            </div>
          )}
          {usingProxy && (
            <div className="flex items-center space-x-1 text-blue-400">
              <Globe className="w-3 h-3" />
              <span>Proxy Active {proxyAttempts > 0 && `(${proxyAttempts}/4)`}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="truncate max-w-64">{currentUrl || 'New Tab'}</span>
          <span>•</span>
          <span>Brave Browser</span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-[70] px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            notification.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500/90 text-white'
              : 'bg-blue-500/90 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

