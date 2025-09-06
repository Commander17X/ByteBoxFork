// Shared chat data store for real-time communication
// In production, this would be replaced with WebSocket or Server-Sent Events

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

export interface ChatSession {
  id: string
  userId: string
  userName: string
  userPlan: string
  isLoggedIn: boolean
  messages: ChatMessage[]
  status: 'active' | 'closed' | 'waiting'
  lastActivity: string
  createdAt: string
  countryCode?: string
  countryName?: string
}

class ChatStore {
  private sessions: ChatSession[] = []
  private listeners: Array<(sessions: ChatSession[]) => void> = []

  // Subscribe to session updates
  subscribe(listener: (sessions: ChatSession[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of changes
  private notify() {
    this.listeners.forEach(listener => listener([...this.sessions]))
  }

  // Get all sessions
  getAllSessions(): ChatSession[] {
    return [...this.sessions]
  }

  // Get session by ID
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.find(session => session.id === sessionId)
  }

  // Create new session
  createSession(userId: string, userName: string, userPlan: string = 'free', isLoggedIn: boolean = false): ChatSession {
    const existingSession = this.sessions.find(session => session.userId === userId)
    if (existingSession) {
      return existingSession
    }

    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      userPlan,
      isLoggedIn,
      messages: [],
      status: 'waiting',
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    this.sessions.push(newSession)
    this.notify()
    return newSession
  }

  // Add message to session
  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage | null {
    const session = this.sessions.find(s => s.id === sessionId)
    if (!session) {
      return null
    }

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    session.messages.push(newMessage)
    session.lastActivity = new Date().toISOString()
    
    // Update status based on message sender
    if (message.sender === 'user' && session.status === 'waiting') {
      session.status = 'active'
    }

    this.notify()
    return newMessage
  }

  // Update session status
  updateSessionStatus(sessionId: string, status: 'active' | 'closed' | 'waiting'): boolean {
    const session = this.sessions.find(s => s.id === sessionId)
    if (!session) {
      return false
    }

    session.status = status
    session.lastActivity = new Date().toISOString()
    this.notify()
    return true
  }

  // Update session info
  updateSessionInfo(sessionId: string, updates: Partial<Pick<ChatSession, 'userName' | 'userPlan' | 'isLoggedIn' | 'countryCode' | 'countryName'>>): boolean {
    const session = this.sessions.find(s => s.id === sessionId)
    if (!session) {
      return false
    }

    Object.assign(session, updates)
    session.lastActivity = new Date().toISOString()
    this.notify()
    return true
  }

  // Get sessions by status
  getSessionsByStatus(status: 'active' | 'closed' | 'waiting' | 'all'): ChatSession[] {
    if (status === 'all') {
      return [...this.sessions]
    }
    return this.sessions.filter(session => session.status === status)
  }

  // Get statistics
  getStats() {
    return {
      total: this.sessions.length,
      active: this.sessions.filter(s => s.status === 'active').length,
      waiting: this.sessions.filter(s => s.status === 'waiting').length,
      closed: this.sessions.filter(s => s.status === 'closed').length
    }
  }
}

// Export singleton instance
export const chatStore = new ChatStore()
