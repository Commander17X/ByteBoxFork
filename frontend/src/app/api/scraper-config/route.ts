import { NextRequest, NextResponse } from 'next/server'

// API endpoint for managing silent scraper configuration
// This allows remote configuration without UI exposure

export async function GET() {
  try {
    // Import the silent scraper service
    const { silentScraper } = await import('../../../lib/silent-scraper')

    const targets = silentScraper.getTargets()
    const stats = silentScraper.getStats()
    const recentResults = silentScraper.getRecentResults(5)

    return NextResponse.json({
      success: true,
      data: {
        targets,
        stats,
        recentResults
      }
    })
  } catch (error) {
    console.error('Scraper config GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get scraper configuration'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, target, url, instruction, priority, enabled } = body

    // Import the silent scraper service
    const { silentScraper } = await import('../../../lib/silent-scraper')

    switch (action) {
      case 'add_target':
        if (!url || !instruction) {
          return NextResponse.json({
            success: false,
            error: 'URL and instruction are required'
          }, { status: 400 })
        }

        silentScraper.addTarget({
          url,
          instruction,
          priority: priority || 'medium',
          enabled: enabled !== false
        })
        break

      case 'remove_target':
        if (!url) {
          return NextResponse.json({
            success: false,
            error: 'URL is required'
          }, { status: 400 })
        }

        silentScraper.removeTarget(url)
        break

      case 'update_target':
        if (!url || !target) {
          return NextResponse.json({
            success: false,
            error: 'URL and target data are required'
          }, { status: 400 })
        }

        silentScraper.updateTarget(url, target)
        break

      case 'scrape_now':
        if (!url) {
          return NextResponse.json({
            success: false,
            error: 'URL is required'
          }, { status: 400 })
        }

        // Trigger immediate scrape
        const result = await silentScraper.scrapeUrl(url, instruction)
        return NextResponse.json({
          success: true,
          data: result
        })

      case 'export_results':
        const exportData = silentScraper.exportResults()
        return NextResponse.json({
          success: true,
          data: exportData
        })

      case 'get_historical_results':
        const limit = body.limit || 50
        const historicalResults = await silentScraper.getHistoricalResults(limit)
        return NextResponse.json({
          success: true,
          data: historicalResults
        })

      // Auto Train Mode endpoints
      case 'configure_auto_train':
        silentScraper.configureAutoTrain(body.config || {})
        return NextResponse.json({
          success: true,
          message: 'Auto Train Mode configured'
        })

      case 'get_auto_train_status':
        const status = silentScraper.getAutoTrainStatus()
        return NextResponse.json({
          success: true,
          data: status
        })

      case 'start_auto_train':
        silentScraper.configureAutoTrain({ enabled: true })
        return NextResponse.json({
          success: true,
          message: 'Auto Train Mode started'
        })

      case 'stop_auto_train':
        silentScraper.configureAutoTrain({ enabled: false })
        return NextResponse.json({
          success: true,
          message: 'Auto Train Mode stopped'
        })

      case 'pause_auto_train':
        silentScraper.pauseAutoTrain()
        return NextResponse.json({
          success: true,
          message: 'Auto Train Mode paused'
        })

      case 'resume_auto_train':
        silentScraper.resumeAutoTrain()
        return NextResponse.json({
          success: true,
          message: 'Auto Train Mode resumed'
        })

      case 'get_discovered_urls':
        const discoveredLimit = body.limit || 100
        const discoveredUrls = silentScraper.getDiscoveredUrls(discoveredLimit)
        return NextResponse.json({
          success: true,
          data: discoveredUrls
        })

      case 'block_url':
        if (!body.url) {
          return NextResponse.json({
            success: false,
            error: 'URL is required'
          }, { status: 400 })
        }
        silentScraper.blockUrl(body.url)
        return NextResponse.json({
          success: true,
          message: `URL blocked: ${body.url}`
        })

      case 'prioritize_url':
        if (!body.url || body.priority === undefined) {
          return NextResponse.json({
            success: false,
            error: 'URL and priority are required'
          }, { status: 400 })
        }
        silentScraper.prioritizeUrl(body.url, body.priority)
        return NextResponse.json({
          success: true,
          message: `URL prioritized: ${body.url} (priority: ${body.priority})`
        })

      case 'import_targets':
        if (!body.targets) {
          return NextResponse.json({
            success: false,
            error: 'Targets data is required'
          }, { status: 400 })
        }

        silentScraper.importTargets(JSON.stringify(body.targets))
        break

      case 'cleanup_invalid_urls':
        const cleanupResult = silentScraper.cleanupInvalidUrlsPublic()
        return NextResponse.json({
          success: true,
          data: cleanupResult
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Action '${action}' completed successfully`
    })

  } catch (error) {
    console.error('Scraper config POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


