'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Users, Clock, CheckCircle, X, Send, Bot, User, Crown, Star } from 'lucide-react'
import CountryFlag from '@/components/ui/country-flag'
import { simpleChatService } from '@/lib/simple-chat-service'

interface ChatSession {
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

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

export default function ChatManagement() {
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'waiting'>('all')
  const [isConnected, setIsConnected] = useState(false)

  // Connect to real-time updates
  useEffect(() => {
    simpleChatService.startPolling()
    
    const handleSessionsUpdate = (data: { sessions: ChatSession[] }) => {
      setActiveSessions(data.sessions)
    }

    const handleConnection = () => {
      setIsConnected(true)
    }

    const handleError = (error: any) => {
      console.error('Chat service error:', error)
      setIsConnected(false)
    }

    simpleChatService.on('sessions_updated', handleSessionsUpdate)
    simpleChatService.on('connected', handleConnection)
    simpleChatService.on('error', handleError)

    return () => {
      simpleChatService.off('sessions_updated', handleSessionsUpdate)
      simpleChatService.off('connected', handleConnection)
      simpleChatService.off('error', handleError)
    }
  }, [])

  const handleSendMessage = async (sessionId: string) => {
    if (!newMessage.trim() || !selectedSession) return

    // Send message to server
    try {
      await simpleChatService.sendMessage(sessionId, newMessage, 'admin')
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCloseSession = (sessionId: string) => {
    const updatedSessions = activeSessions.map(session => {
      if (session.id === sessionId) {
        return { ...session, status: 'closed' as const }
      }
      return session
    })
    setActiveSessions(updatedSessions)
    
    if (selectedSession?.id === sessionId) {
      setSelectedSession({ ...selectedSession, status: 'closed' })
    }
  }

  const handleReopenSession = (sessionId: string) => {
    const updatedSessions = activeSessions.map(session => {
      if (session.id === sessionId) {
        return { ...session, status: 'active' as const }
      }
      return session
    })
    setActiveSessions(updatedSessions)
    
    if (selectedSession?.id === sessionId) {
      setSelectedSession({ ...selectedSession, status: 'active' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'waiting':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return <Star className="w-4 h-4 text-blue-400" />
      case 'business':
        return <Crown className="w-4 h-4 text-purple-400" />
      case 'enterprise':
        return <Crown className="w-4 h-4 text-gold-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredSessions = activeSessions.filter(session => {
    if (filter === 'all') return true
    return session.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold warmwind-text mb-2">Live Chat Management</h2>
          <p className="warmwind-body">Manage customer support conversations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm warmwind-body">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm warmwind-body">
              {activeSessions.filter(s => s.status === 'active').length} Active
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-sm warmwind-body">
              {activeSessions.filter(s => s.status === 'waiting').length} Waiting
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', 'active', 'waiting', 'closed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === filterType
                ? 'warmwind-button'
                : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="ethereal-card p-6">
            <h3 className="text-lg font-bold warmwind-text mb-4">Chat Sessions</h3>
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-white/50 mx-auto mb-3" />
                  <p className="warmwind-body">No chat sessions found</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedSession?.id === session.id
                        ? 'bg-white/20 backdrop-blur-sm border border-white/30'
                        : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(session.userPlan)}
                        <span className="warmwind-text font-semibold">
                          {session.userName || `User ${session.userId.slice(-4)}`}
                        </span>
                        {session.countryCode && (
                          <CountryFlag countryCode={session.countryCode} size="sm" />
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="warmwind-body text-sm mb-2">
                      {session.messages[session.messages.length - 1]?.text.slice(0, 50)}...
                    </p>
                    <div className="flex items-center justify-between text-xs warmwind-body">
                      <span>{session.userPlan.toUpperCase()} Plan</span>
                      <span>{formatTime(session.lastActivity)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="ethereal-card p-6 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                    {getPlanIcon(selectedSession.userPlan)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="warmwind-text font-semibold">
                        {selectedSession.userName || `User ${selectedSession.userId.slice(-4)}`}
                      </h3>
                      {selectedSession.countryCode && (
                        <CountryFlag countryCode={selectedSession.countryCode} size="sm" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm warmwind-body">{selectedSession.userPlan.toUpperCase()} Plan</span>
                      <span className="text-sm warmwind-body">•</span>
                      <span className="text-sm warmwind-body">
                        {selectedSession.isLoggedIn ? 'Logged In' : 'Guest'}
                      </span>
                      {selectedSession.countryName && (
                        <>
                          <span className="text-sm warmwind-body">•</span>
                          <span className="text-sm warmwind-body">{selectedSession.countryName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSession.status === 'closed' ? (
                    <button
                      onClick={() => handleReopenSession(selectedSession.id)}
                      className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition-all duration-200"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCloseSession(selectedSession.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all duration-200"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-white/20 backdrop-blur-sm border border-white/20' 
                          : 'bg-white/20 backdrop-blur-sm border border-white/20'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-white/10 backdrop-blur-sm border border-white/10'
                          : 'bg-white/20 backdrop-blur-sm border border-white/20'
                      }`}>
                        <p className="warmwind-body text-sm">{message.text}</p>
                        <span className="text-xs warmwind-body opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedSession.status !== 'closed' && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage(selectedSession.id)
                      }
                    }}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                  <button
                    onClick={() => handleSendMessage(selectedSession.id)}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ethereal-card p-6 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-bold warmwind-text mb-2">Select a Chat Session</h3>
                <p className="warmwind-body">Choose a chat session from the list to start managing conversations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
