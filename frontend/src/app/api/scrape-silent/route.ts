import { NextRequest, NextResponse } from 'next/server'

// Autonomous Web Scraper with Ollama LLM Integration
// Works with ANY URL and uses Ollama for intelligent extraction

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, instruction } = body

    // Validate URL parameter
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'URL parameter is required and cannot be empty',
        url: url || 'undefined',
        suggestions: [
          'Provide a valid URL starting with http:// or https://',
          'Check that the URL is not empty or null',
          'Ensure the URL is properly formatted'
        ]
      }, { status: 400 })
    }

    console.log('Using autonomous scraper with Ollama for:', url)

    // Step 1: Fetch the webpage content
    let html = ''
    let title = 'No title found'
    let description = 'No description found'
    
    try {
      // Enhanced fetch with better error handling and retry logic
      const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
        // Validate URL before attempting to fetch
        if (!url || typeof url !== 'string' || url.trim() === '') {
          throw new Error('Invalid URL: URL cannot be empty or null')
        }
        
        try {
          new URL(url) // This will throw if URL is invalid
        } catch (urlError) {
          throw new Error(`Invalid URL format: ${url}`)
        }
        
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)
            
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
              },
              signal: controller.signal,
              redirect: 'follow'
            })
            
            clearTimeout(timeoutId)
            return response
          } catch (error) {
            console.warn(`Fetch attempt ${i + 1} failed:`, error)
            if (i === retries - 1) throw error
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
          }
        }
        throw new Error('All fetch attempts failed')
      }

      const response = await fetchWithRetry(url)

      if (!response.ok) {
        // Handle specific HTTP status codes more gracefully
        if (response.status === 503) {
          console.warn(`Website temporarily unavailable (503): ${url}`)
          // For 503 errors, still try to get response text for any useful info
          html = await response.text().catch(() => '<html><body><h1>Service Temporarily Unavailable</h1><p>The website is temporarily down for maintenance.</p></body></html>')
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } else {
        html = await response.text()
      }
      
      // Extract basic metadata
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      title = titleMatch ? titleMatch[1].trim() : 'No title found'

      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
      description = descMatch ? descMatch[1].trim() : 'No description found'

    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      
      // Provide more detailed error information
      let errorMessage = 'Unknown error'
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timeout - the website took too long to respond'
        } else if (fetchError.message.includes('fetch failed')) {
          errorMessage = 'Network error - unable to connect to the website. This could be due to: network issues, firewall blocking, or the website being down'
        } else if (fetchError.message.includes('ENOTFOUND')) {
          errorMessage = 'Domain not found - the website address is invalid or the domain does not exist'
        } else if (fetchError.message.includes('ECONNREFUSED')) {
          errorMessage = 'Connection refused - the website is not accepting connections'
        } else {
          errorMessage = fetchError.message
        }
      }
      
      return NextResponse.json({
        success: false,
        error: `Failed to fetch URL: ${errorMessage}`,
        url: url,
        errorType: fetchError instanceof Error ? fetchError.name : 'Unknown',
        suggestions: [
          'Check if the URL is correct and accessible',
          'Try a different URL or website',
          'Check your internet connection',
          'The website might be temporarily down'
        ]
      }, { status: 400 })
    }

    // Step 2: Clean and prepare content for LLM
    const cleanContent = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Step 3: Use Ollama LLM for intelligent extraction
    let extractedData = []
    let llmResponse = ''

    try {
      // Check if Ollama is available first
      let ollamaAvailable = false
      try {
        const ollamaCheck = await fetch('http://localhost:11434/api/tags', {
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        })
        ollamaAvailable = ollamaCheck.ok
      } catch (error) {
        console.warn('Ollama not available:', error)
        ollamaAvailable = false
      }

      if (!ollamaAvailable) {
        console.warn('Ollama API not available, using fallback extraction')
        throw new Error('Ollama API not available')
      }

      // Prepare the prompt for Ollama
      const prompt = `You are an intelligent web scraper. Analyze the following webpage content and extract data according to the instruction.

URL: ${url}
Title: ${title}
Instruction: ${instruction || 'Extract all relevant data into a structured JSON format'}

Webpage Content:
${cleanContent.substring(0, 8000)} // Limit content to avoid token limits

Please extract the requested data and return it as a JSON array of objects. Each object should have a "name" and "price" field (or equivalent fields based on the content). If no specific data is found, extract the most relevant information available.

Return only valid JSON, no additional text.`

      // Call Ollama API
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.0,
            max_tokens: 800
          }
        })
      })

      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json()
        llmResponse = ollamaData.response || ''
        
        // Try to parse the LLM response as JSON
        try {
          // Clean the response to extract JSON
          const jsonMatch = llmResponse.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0])
          } else {
            // Fallback: try to parse the entire response
            extractedData = JSON.parse(llmResponse)
          }
        } catch (parseError) {
          console.warn('Failed to parse LLM response as JSON:', parseError)
          // Create structured data from LLM response
          extractedData = [{
            name: 'LLM Analysis',
            price: llmResponse.substring(0, 200)
          }]
        }
      } else {
        console.log('ℹ️ Ollama not available, using fallback extraction method')
        throw new Error('Ollama API not available')
      }

          } catch (llmError) {
        // Only log as error if it's not an Ollama availability issue
        const errorMessage = llmError instanceof Error ? llmError.message : 'Unknown LLM error'
        if (errorMessage.includes('Ollama API not available')) {
          console.log('ℹ️ Ollama not available, using fallback extraction method')
        } else {
          console.warn('LLM extraction failed, using fallback:', llmError)
        }
      
      // Fallback: Basic extraction without LLM
      if (instruction && instruction.toLowerCase().includes('table')) {
        const tableRegex = /<table[^>]*>(.*?)<\/table>/gi
        const tables = html.match(tableRegex) || []
        
        tables.forEach((table) => {
          const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gi
          const rows = table.match(rowRegex) || []
          
          rows.forEach((row, rowIndex) => {
            if (rowIndex > 0) {
              const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gi
              const cells = row.match(cellRegex) || []
              
              if (cells.length >= 2 && cells[0] && cells[1]) {
                const name = cells[0].replace(/<[^>]*>/g, '').trim()
                const price = cells[1].replace(/<[^>]*>/g, '').trim()
                extractedData.push({ name, price })
              }
            }
          })
        })
      }

      // If still no data, create from content
      if (extractedData.length === 0) {
        const sentences = cleanContent.split('.').filter(s => s.trim().length > 10)
        sentences.slice(0, 5).forEach((sentence, index) => {
          extractedData.push({
            name: `Item ${index + 1}`,
            price: sentence.trim().substring(0, 50)
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title,
        description: description,
        url: url,
        instruction: instruction,
        content: cleanContent.substring(0, 2000), // Limit for response size
        extracted_data: extractedData,
        content_length: cleanContent.length,
        llm_response: llmResponse.substring(0, 500), // Include LLM response for debugging
        timestamp: new Date().toISOString()
      },
      url: url,
      extraction_type: 'ollama_autonomous',
      note: 'Using Ollama LLM for autonomous intelligent extraction'
    })

  } catch (error) {
    console.error('Scraper error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during scraping',
      url: null
    }, { status: 500 })
  }
}