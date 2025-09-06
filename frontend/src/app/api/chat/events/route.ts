import { NextRequest } from 'next/server'
import { chatStore } from '@/lib/chat-store'

export const dynamic = 'force-dynamic'

// Server-Sent Events endpoint for real-time chat updates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        try {
          // Send initial connection message
          const data = JSON.stringify({
            type: 'connected',
            payload: { message: 'Connected to chat events' }
          })
          controller.enqueue(`data: ${data}\n\n`)

          // Set up listener for chat store updates
          const unsubscribe = chatStore.subscribe((sessions) => {
            try {
              const data = JSON.stringify({
                type: 'sessions_updated',
                payload: { sessions }
              })
              controller.enqueue(`data: ${data}\n\n`)
            } catch (error) {
              console.error('Error sending session update:', error)
            }
          })

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            try {
              const data = JSON.stringify({
                type: 'heartbeat',
                payload: { timestamp: new Date().toISOString() }
              })
              controller.enqueue(`data: ${data}\n\n`)
            } catch (error) {
              console.error('Error sending heartbeat:', error)
            }
          }, 30000) // Send heartbeat every 30 seconds

          // Cleanup function
          const cleanup = () => {
            try {
              clearInterval(heartbeat)
              unsubscribe()
              controller.close()
            } catch (error) {
              console.error('Error during cleanup:', error)
            }
          }

          // Handle client disconnect
          request.signal.addEventListener('abort', cleanup)
        } catch (error) {
          console.error('Error in SSE stream start:', error)
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            payload: { message: 'Stream initialization failed' }
          })}\n\n`)
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })
  } catch (error) {
    console.error('SSE endpoint error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to establish SSE connection',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
