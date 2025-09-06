'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Clock } from 'lucide-react'
import { simpleChatService } from '@/lib/simple-chat-service'
import { sseService } from '@/lib/sse-service'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

interface LiveChatBubbleProps {
  isLoggedIn?: boolean
  userPlan?: string
  userId?: string
}

export default function LiveChatBubble({ isLoggedIn = false, userPlan = 'free', userId }: LiveChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const session = await simpleChatService.createSession(
          userId || 'anonymous',
          isLoggedIn ? 'Logged In User' : 'Guest User',
          userPlan,
          isLoggedIn
        )
        setSessionId(session.id)
      } catch (error) {
        console.error('Failed to initialize chat session:', error)
      }
    }

    initializeSession()
  }, [userId, isLoggedIn, userPlan])

  // Connect to real-time updates
  useEffect(() => {
    simpleChatService.startPolling()
    
    const handleSessionsUpdate = (data: { sessions: any[] }) => {
      // Find our session and update messages
      const ourSession = data.sessions.find(s => s.id === sessionId)
      if (ourSession && ourSession.messages) {
        setMessages(ourSession.messages)
      }
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
  }, [sessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')

    // Send message to server
    try {
      await simpleChatService.sendMessage(sessionId, userMessage.text, 'user')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInitialMessage = () => {
    if (isLoggedIn) {
      return `Welcome back! You're on the ${userPlan.toUpperCase()} plan. How can we help you today?`
    }
    return "Hi! Welcome to H0L0Light-OS support. How can we help you today?"
  }

  // Add initial message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const initialMessage: ChatMessage = {
        id: 'initial',
        text: getInitialMessage(),
        sender: 'admin',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      }
      setMessages([initialMessage])
    }
  }, [isOpen, isLoggedIn, userPlan])

  return (
    <>
      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200 shadow-2xl group"
            >
              <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              {messages.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{messages.length}</span>
                </div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 w-96 h-[500px] z-50 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="warmwind-text font-semibold">Live Support</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span className="text-xs warmwind-body">
                        {isConnected ? 'Online' : 'Connecting...'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-200"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                          ? 'bg-white/20 backdrop-blur-sm border border-white/20'
                          : 'bg-white/10 backdrop-blur-sm border border-white/10'
                      }`}>
                        <p className="warmwind-body text-sm">{message.text}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs warmwind-body opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'user' && (
                            <div className="flex items-center space-x-1">
                              {message.status === 'sent' && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                              {message.status === 'delivered' && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                              {message.status === 'read' && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-white animate-pulse" />
                          <span className="text-xs warmwind-body">Support is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-xs warmwind-body mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
