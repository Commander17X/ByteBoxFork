'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Download,
  Star,
  ExternalLink,
  X,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Zap,
  Brain,
  Calculator,
  MessageSquare,
  FileText,
  Music,
  Camera,
  Code,
  Gamepad2,
  ShoppingCart,
  Plus,
  Globe
} from 'lucide-react'

export interface WebApp {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'productivity' | 'ai' | 'entertainment' | 'development' | 'business' | 'creative'
  url: string
  rating: number
  downloads: string
  size: string
  developer: string
  screenshots: string[]
  features: string[]
  isInstalled?: boolean
}

const webApps: WebApp[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'AI-powered conversational assistant for writing, coding, and creative tasks',
    icon: Brain,
    category: 'ai',
    url: 'https://chat.openai.com',
    rating: 4.8,
    downloads: '100M+',
    size: 'Web App',
    developer: 'OpenAI',
    screenshots: [],
    features: ['AI Conversations', 'Code Generation', 'Writing Assistant', 'Creative Tasks']
  },
  {
    id: 'cursor',
    name: 'Cursor AI',
    description: 'AI-powered code editor with intelligent suggestions and pair programming',
    icon: Code,
    category: 'development',
    url: 'https://cursor.sh',
    rating: 4.9,
    downloads: '10M+',
    size: 'Web App',
    developer: 'Cursor',
    screenshots: [],
    features: ['AI Code Completion', 'Pair Programming', 'Smart Refactoring', 'Multi-language Support']
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    description: 'Microsoft Excel in your browser with full spreadsheet functionality',
    icon: Calculator,
    category: 'productivity',
    url: 'https://office.com/excel',
    rating: 4.6,
    downloads: '500M+',
    size: 'Web App',
    developer: 'Microsoft',
    screenshots: [],
    features: ['Spreadsheets', 'Formulas', 'Charts', 'Collaboration', 'Cloud Sync']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, docs, wikis, and project management',
    icon: FileText,
    category: 'productivity',
    url: 'https://notion.so',
    rating: 4.7,
    downloads: '50M+',
    size: 'Web App',
    developer: 'Notion Labs',
    screenshots: [],
    features: ['Note Taking', 'Database', 'Project Management', 'Team Collaboration']
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Collaborative design tool for UI/UX design and prototyping',
    icon: Sparkles,
    category: 'creative',
    url: 'https://figma.com',
    rating: 4.8,
    downloads: '25M+',
    size: 'Web App',
    developer: 'Figma',
    screenshots: [],
    features: ['UI Design', 'Prototyping', 'Real-time Collaboration', 'Design Systems']
  },
  {
    id: 'spotify',
    name: 'Spotify Web Player',
    description: 'Stream millions of songs and podcasts directly in your browser',
    icon: Music,
    category: 'entertainment',
    url: 'https://open.spotify.com',
    rating: 4.5,
    downloads: '1B+',
    size: 'Web App',
    developer: 'Spotify',
    screenshots: [],
    features: ['Music Streaming', 'Podcasts', 'Playlists', 'Social Features']
  },
  {
    id: 'photopea',
    name: 'Photopea',
    description: 'Advanced photo editor that works like Photoshop in your browser',
    icon: Camera,
    category: 'creative',
    url: 'https://photopea.com',
    rating: 4.6,
    downloads: '15M+',
    size: 'Web App',
    developer: 'Ivan Kutskir',
    screenshots: [],
    features: ['Photo Editing', 'Layer Support', 'PSD Files', 'Advanced Tools']
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Voice, video, and text communication for communities and friends',
    icon: MessageSquare,
    category: 'entertainment',
    url: 'https://discord.com/app',
    rating: 4.4,
    downloads: '300M+',
    size: 'Web App',
    developer: 'Discord Inc.',
    screenshots: [],
    features: ['Voice Chat', 'Text Messaging', 'Screen Share', 'Communities']
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    description: 'Fast, secure, and smart web browser with Google services',
    icon: Globe,
    category: 'productivity',
    url: 'https://google.com',
    rating: 4.5,
    downloads: '3B+',
    size: 'Web App',
    developer: 'Google',
    screenshots: [],
    features: ['Fast Browsing', 'Google Services', 'Sync', 'Extensions']
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    description: 'Free source-code editor with built-in Git support and debugging',
    icon: Code,
    category: 'development',
    url: 'https://vscode.dev',
    rating: 4.8,
    downloads: '50M+',
    size: 'Web App',
    developer: 'Microsoft',
    screenshots: [],
    features: ['Code Editor', 'Git Integration', 'Extensions', 'Debugging']
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    description: 'Professional image editing and digital art creation tool',
    icon: Camera,
    category: 'creative',
    url: 'https://photoshop.adobe.com',
    rating: 4.7,
    downloads: '100M+',
    size: 'Web App',
    developer: 'Adobe',
    screenshots: [],
    features: ['Photo Editing', 'Digital Art', 'Layers', 'Filters', 'Professional Tools']
  },
  {
    id: 'steam',
    name: 'Steam',
    description: 'Digital distribution platform for PC gaming and software',
    icon: Gamepad2,
    category: 'entertainment',
    url: 'https://store.steampowered.com',
    rating: 4.3,
    downloads: '120M+',
    size: 'Web App',
    developer: 'Valve Corporation',
    screenshots: [],
    features: ['Game Store', 'Community', 'Achievements', 'Cloud Saves']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Business communication platform for teams and organizations',
    icon: MessageSquare,
    category: 'business',
    url: 'https://slack.com',
    rating: 4.4,
    downloads: '20M+',
    size: 'Web App',
    developer: 'Slack Technologies',
    screenshots: [],
    features: ['Team Chat', 'File Sharing', 'Integrations', 'Video Calls']
  }
]

const categories = [
  { id: 'all', name: 'All Apps', icon: Grid3X3 },
  { id: 'ai', name: 'AI & ML', icon: Brain },
  { id: 'productivity', name: 'Productivity', icon: Zap },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'creative', name: 'Creative', icon: Sparkles },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2 },
  { id: 'business', name: 'Business', icon: ShoppingCart }
]

interface AppStoreProps {
  onClose: () => void
  onInstallApp: (app: WebApp) => void
  installedApps: string[]
}

export function AppStore({ onClose, onInstallApp, installedApps }: AppStoreProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedApp, setSelectedApp] = useState<WebApp | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [appRequest, setAppRequest] = useState({
    name: '',
    description: '',
    category: 'productivity',
    useCase: '',
    urgency: 'medium'
  })

  const filteredApps = webApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInstallApp = (app: WebApp) => {
    // Handle regular web apps
    onInstallApp(app)
    setSelectedApp(null)
  }

  const handleAppRequest = async () => {
    try {
      // Simulate API call to submit app request
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Here you would typically send the request to your backend
      console.log('App request submitted:', appRequest)

      // Create and launch Brave Browser as a thank you
      const browserApp: WebApp = {
        id: 'brave-browser',
        name: 'Brave Browser',
        description: 'Custom Brave browser with built-in ad blocking and privacy protection',
        icon: Globe,
        category: 'productivity' as const,
        url: 'https://search.brave.com',
        rating: 4.9,
        downloads: 'Built-in',
        size: 'Web App',
        developer: 'H0L0Light-OS',
        screenshots: [],
        features: ['Ad blocking', 'Privacy protection', 'Fast browsing', 'Built-in search', 'Crypto wallet']
      }

      // Add to installed apps and launch immediately
      onInstallApp(browserApp)

      // Reset form and show success
      setAppRequest({
        name: '',
        description: '',
        category: 'productivity',
        useCase: '',
        urgency: 'medium'
      })
      setShowRequestForm(false)

      // Show success message
      alert('App request submitted successfully! As a thank you, we\'ve opened our custom Brave Browser for you.')
    } catch (error) {
      console.error('Failed to submit app request:', error)
      alert('Failed to submit app request. Please try again.')
    }
  }

  return (
    <div className="w-full h-full ethereal-card overflow-hidden flex flex-col" style={{ userSelect: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl warmwind-text font-display">App Store</h1>
              <p className="warmwind-body text-sm">Discover and install web applications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors warmwind-body text-sm"
            >
              Request New App
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4">
            <div className="space-y-2">
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-white/15 border border-white/20'
                        : 'hover:bg-white/8'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-white/80" />
                    <span className="warmwind-body text-sm">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Controls */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/8 border border-white/20 rounded-lg warmwind-body text-sm placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white/15' : 'hover:bg-white/8'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4 text-white/80" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white/15' : 'hover:bg-white/8'
                    }`}
                  >
                    <List className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              </div>
            </div>

            {/* Apps Grid/List */}
            <div className="flex-1 overflow-y-auto p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredApps.map(app => {
                    const Icon = app.icon
                    const isInstalled = installedApps.includes(app.id)
                    return (
                      <motion.div
                        key={app.id}
                        layout
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer"
                        onClick={() => setSelectedApp(app)}
                      >
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white/80" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="warmwind-text text-sm font-medium truncate">{app.name}</h3>
                            <p className="warmwind-body text-xs text-white/60">{app.developer}</p>
                          </div>
                        </div>
                        <p className="warmwind-body text-xs text-white/70 mb-3 line-clamp-2">{app.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="warmwind-body text-xs">{app.rating}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isInstalled) {
                                handleInstallApp(app)
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                              isInstalled
                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            }`}
                          >
                            {isInstalled ? 'Installed' : 'Install'}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredApps.map(app => {
                    const Icon = app.icon
                    const isInstalled = installedApps.includes(app.id)
                    return (
                      <motion.div
                        key={app.id}
                        layout
                        className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer"
                        onClick={() => setSelectedApp(app)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="warmwind-text text-sm font-medium">{app.name}</h3>
                          <p className="warmwind-body text-xs text-white/70">{app.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="warmwind-body text-xs">{app.rating}</span>
                            </div>
                            <span className="warmwind-body text-xs text-white/60">{app.downloads}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isInstalled) {
                              handleInstallApp(app)
                            }
                          }}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            isInstalled
                              ? 'bg-green-500/20 text-green-400 cursor-default'
                              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          }`}
                        >
                          {isInstalled ? 'Installed' : 'Install'}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request New App Modal */}
        <AnimatePresence>
          {showRequestForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md ethereal-card p-6"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl warmwind-text font-display mb-1">Request New App</h2>
                    <p className="warmwind-body text-sm text-white/70">Tell us about the app you need</p>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">App Name</label>
                    <input
                      type="text"
                      value={appRequest.name}
                      onChange={(e) => setAppRequest({...appRequest, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40"
                      placeholder="e.g., Advanced Task Manager"
                    />
                  </div>

                  <div>
                    <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">Category</label>
                    <select
                      value={appRequest.category}
                      onChange={(e) => setAppRequest({...appRequest, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40"
                    >
                      <option value="productivity" className="bg-slate-800/90 text-white">Productivity</option>
                      <option value="ai" className="bg-slate-800/90 text-white">AI & ML</option>
                      <option value="entertainment" className="bg-slate-800/90 text-white">Entertainment</option>
                      <option value="development" className="bg-slate-800/90 text-white">Development</option>
                      <option value="creative" className="bg-slate-800/90 text-white">Creative</option>
                      <option value="business" className="bg-slate-800/90 text-white">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">Use Case</label>
                    <textarea
                      value={appRequest.useCase}
                      onChange={(e) => setAppRequest({...appRequest, useCase: e.target.value})}
                      className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40 resize-none"
                      placeholder="Describe how you'd use this app..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block warmwind-body text-sm mb-2 text-white/90 font-medium">Urgency</label>
                    <select
                      value={appRequest.urgency}
                      onChange={(e) => setAppRequest({...appRequest, urgency: e.target.value})}
                      className="w-full px-4 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl warmwind-body text-sm text-white/90 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg hover:bg-white/18 hover:border-white/40"
                    >
                      <option value="low" className="bg-slate-800/90 text-white">Low - Nice to have</option>
                      <option value="medium" className="bg-slate-800/90 text-white">Medium - Would improve workflow</option>
                      <option value="high" className="bg-slate-800/90 text-white">High - Critical for work</option>
                      <option value="urgent" className="bg-slate-800/90 text-white">Urgent - Can't work without it</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors warmwind-body text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAppRequest}
                    disabled={!appRequest.name || !appRequest.useCase}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors warmwind-body text-sm ${
                      appRequest.name && appRequest.useCase
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    Submit Request
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Detail Modal */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl ethereal-card p-6"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <selectedApp.icon className="w-8 h-8 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl warmwind-text font-display mb-1">{selectedApp.name}</h2>
                    <p className="warmwind-body text-sm text-white/70 mb-2">{selectedApp.developer}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="warmwind-body text-sm">{selectedApp.rating}</span>
                      </div>
                      <span className="warmwind-body text-sm text-white/60">{selectedApp.downloads}</span>
                      <span className="warmwind-body text-sm text-white/60">{selectedApp.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <p className="warmwind-body text-sm text-white/80 mb-6">{selectedApp.description}</p>

                <div className="mb-6">
                  <h3 className="warmwind-text text-sm font-medium mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApp.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        <span className="warmwind-body text-xs text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleInstallApp(selectedApp)}
                    disabled={installedApps.includes(selectedApp.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
                      installedApps.includes(selectedApp.id)
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{installedApps.includes(selectedApp.id) ? 'Installed' : 'Install App'}</span>
                  </button>
                  <button
                    onClick={() => window.open(selectedApp.url, '_blank')}
                    className="px-4 py-3 rounded-lg bg-white/8 hover:bg-white/12 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}
