'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, ArrowLeft, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Send, Heart, Users } from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  category: string
  userEmail?: string
}

export default function SupportPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'Technical Issue',
    priority: 'medium',
    userEmail: ''
  })

  // Load tickets from localStorage on component mount
  useEffect(() => {
    const savedTickets = localStorage.getItem('supportTickets')
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets))
    }
  }, [])

  // Save tickets to localStorage whenever tickets change
  useEffect(() => {
    localStorage.setItem('supportTickets', JSON.stringify(tickets))
  }, [tickets])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const ticket: Ticket = {
      id: `TICKET-${Date.now()}`,
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority as Ticket['priority'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      category: newTicket.category,
      userEmail: newTicket.userEmail
    }
    
    setTickets([ticket, ...tickets])
    setNewTicket({ title: '', description: '', category: 'Technical Issue', priority: 'medium', userEmail: '' })
    setShowCreateForm(false)
    setIsSubmitting(false)
    setSubmitMessage('Ticket created successfully! Our team will respond within 24 hours.')
    
    // Clear success message after 5 seconds
    setTimeout(() => setSubmitMessage(''), 5000)
  }

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-400" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'text-yellow-400'
      case 'in-progress':
        return 'text-blue-400'
      case 'resolved':
        return 'text-green-400'
      case 'closed':
        return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  }

  return (
    <div className="min-h-screen wallpaper-bg relative">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </Link>
          <Link 
            href="/landing" 
            className="warmwind-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold warmwind-text mb-6">
              Support Center
            </h1>
            <p className="text-xl warmwind-body max-w-3xl mx-auto mb-6">
              Get help with your H0L0Light-OS experience. Create tickets, track issues, and get support from our team.
            </p>
            
            {/* Friendly Message */}
            <div className="ethereal-card p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Heart className="w-5 h-5 text-white" />
                <span className="warmwind-text font-semibold">A Friendly Reminder</span>
              </div>
              <p className="warmwind-body text-sm">
                Our support team consists of real humans who care about helping you succeed. 
                Please be kind and patient - we're here to help make your experience amazing! 
                <span className="block mt-2 text-xs warmwind-text">
                  💙 We appreciate your understanding and respect
                </span>
              </p>
            </div>
          </motion.div>

          {/* Success Message */}
          {submitMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ethereal-card p-4 mb-8 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="warmwind-text font-semibold">{submitMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="ethereal-card p-6 text-center"
            >
              <MessageSquare className="w-8 h-8 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold warmwind-text mb-2">Live Chat</h3>
              <p className="warmwind-body mb-4">Get instant help from our friendly support team</p>
              <button className="warmwind-button w-full">
                Start Chat
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="ethereal-card p-6 text-center"
            >
              <Plus className="w-8 h-8 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold warmwind-text mb-2">Create Ticket</h3>
              <p className="warmwind-body mb-4">Submit a detailed support request</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="warmwind-button w-full"
              >
                New Ticket
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ethereal-card p-6 text-center"
            >
              <Users className="w-8 h-8 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold warmwind-text mb-2">Response Time</h3>
              <p className="warmwind-body mb-4">We respond within 24 hours</p>
              <div className="warmwind-text font-semibold">
                ⚡ Fast & Friendly
              </div>
            </motion.div>
          </div>

          {/* Create Ticket Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-8 mb-12"
            >
              <h2 className="text-2xl font-bold warmwind-text mb-6">Create New Support Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold warmwind-text mb-2">Title</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold warmwind-text mb-2">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 h-32 resize-none"
                    placeholder="Please provide detailed information about your issue. The more details you provide, the better we can help you!"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold warmwind-text mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={newTicket.userEmail}
                    onChange={(e) => setNewTicket({ ...newTicket, userEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="your@email.com (so we can follow up if needed)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold warmwind-text mb-2">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Account Issue">Account Issue</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold warmwind-text mb-2">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Minor issue</option>
                      <option value="high">High - Important issue</option>
                      <option value="urgent">Urgent - Critical issue</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="warmwind-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Creating Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Tickets List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-panel p-8"
          >
            <h2 className="text-2xl font-bold warmwind-text mb-6">Your Support Tickets</h2>
            
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="warmwind-body text-lg">No tickets yet. Create your first support ticket above.</p>
                <p className="warmwind-body text-sm mt-2">We're here to help make your experience amazing!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold warmwind-text mb-2">{ticket.title}</h3>
                        <p className="warmwind-body text-sm mb-3">{ticket.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="warmwind-body">#{ticket.id}</span>
                          <span className="warmwind-body">{ticket.category}</span>
                          <span className="warmwind-body">{ticket.createdAt}</span>
                          {ticket.userEmail && (
                            <span className="warmwind-body">📧 {ticket.userEmail}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <div className={`flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="text-sm font-semibold capitalize">{ticket.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </div>
          <p className="warmwind-body mb-4">
            The future of productivity is here. Transform your digital life today.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm warmwind-body">
            <Link href="/privacy" className="hover:warmwind-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:warmwind-text transition-colors">Terms</Link>
            <Link href="/services" className="hover:warmwind-text transition-colors">Services</Link>
            <Link href="/support" className="hover:warmwind-text transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}