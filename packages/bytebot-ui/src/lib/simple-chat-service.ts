// Simple, reliable chat service without SSE complexity
class SimpleChatService {
  private listeners: Map<string, Set<Function>> = new Map()
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastSessionCount = 0

  startPolling(interval = 3000) {
    if (this.isPolling) return

    this.isPolling = true
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.sessions) {
            // Only emit if there are changes
            if (data.sessions.length !== this.lastSessionCount) {
              this.lastSessionCount = data.sessions.length
              this.emit('sessions_updated', { sessions: data.sessions })
            }
          }
        }
      } catch (error) {
        console.warn('Chat polling error:', error)
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

  async sendMessage(sessionId: string, text: string, sender: 'user' | 'admin') {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, text, sender })
      })

      if (response.ok) {
        const data = await response.json()
        this.emit('message_sent', data.message)
        return data
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      this.emit('error', error)
      throw error
    }
  }

  async createSession(userId: string, userName: string, userPlan: string = 'free', isLoggedIn: boolean = false) {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, userPlan, isLoggedIn })
      })

      if (response.ok) {
        const data = await response.json()
        return data.session
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
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

export const simpleChatService = new SimpleChatService()
