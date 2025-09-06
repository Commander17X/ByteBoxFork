// Production-ready Server-Sent Events service for real-time chat
import { pollingService } from './polling-service'

class SSEService {
  private eventSource: EventSource | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  private isConnected = false
  private usePolling = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3

  connect() {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return
    }

    // Try SSE first
    this.trySSE()
  }

  private trySSE() {
    try {
      this.eventSource = new EventSource('/api/chat/events')

      this.eventSource.onopen = () => {
        console.log('SSE connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.usePolling = false
        this.emit('connected')
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit(data.type, data.payload)
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
        }
      }

      this.eventSource.addEventListener('chat_message', (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit('chat_message', data)
        } catch (error) {
          console.error('Failed to parse chat message:', error)
        }
      })

      this.eventSource.addEventListener('session_update', (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit('session_update', data)
        } catch (error) {
          console.error('Failed to parse session update:', error)
        }
      })

      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        this.isConnected = false
        this.emit('error', error)
        
        // Fallback to polling after max attempts
        this.reconnectAttempts++
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('SSE failed, falling back to polling')
          this.fallbackToPolling()
        } else {
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (!this.isConnected) {
              this.trySSE()
            }
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      this.fallbackToPolling()
    }
  }

  private fallbackToPolling() {
    this.usePolling = true
    this.isConnected = true
    this.emit('connected')
    
    // Set up polling listeners
    pollingService.on('sessions_updated', (data: any) => {
      this.emit('sessions_updated', data)
    })
    
    pollingService.on('error', (error: any) => {
      this.emit('error', error)
    })
    
    pollingService.startPolling()
  }

  on(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
  }

  off(type: string, callback: Function) {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private emit(type: string, payload?: any) {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.forEach(callback => callback(payload))
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    
    if (this.usePolling) {
      pollingService.stopPolling()
    }
    
    this.isConnected = false
  }

  isConnectedToSSE(): boolean {
    return this.isConnected && (this.eventSource?.readyState === EventSource.OPEN || this.usePolling)
  }
}

export const sseService = new SSEService()
