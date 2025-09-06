// Production-ready polling service for real-time chat updates
// Fallback when SSE is not available

class PollingService {
  private listeners: Map<string, Set<Function>> = new Map()
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastUpdate = Date.now()

  startPolling(interval = 2000) {
    if (this.isPolling) return

    this.isPolling = true
    this.pollingInterval = setInterval(async () => {
      try {
        // Poll for chat sessions updates
        const response = await fetch('/api/chat/sessions', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.sessions) {
            this.emit('sessions_updated', { sessions: data.sessions })
          }
        }
      } catch (error) {
        console.warn('Polling error:', error)
        this.emit('error', error)
      }
    }, interval)
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
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

  isConnected(): boolean {
    return this.isPolling
  }
}

export const pollingService = new PollingService()
