'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Grid3X3, 
  Settings,
  Zap
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'decisions', label: 'Decision Log', icon: FileText },
  { id: 'apps', label: 'Apps & Services', icon: Grid3X3 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const { currentView, setCurrentView } = useAppStore()

  return (
    <div className="w-72 heavenly-glass h-full flex flex-col">
      {/* Logo */}
      <div className="p-8 border-b border-white/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center space-x-4"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center border border-white/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl warmwind-text">H0L0</h1>
            <p className="text-sm warmwind-body">Light-OS</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                "hover:scale-[1.02]",
                isActive 
                  ? "divine-glow" 
                  : ""
              )}
              style={{
                backgroundColor: isActive ? 'var(--theme-hover)' : 'transparent',
                border: isActive ? '1px solid var(--theme-border)' : '1px solid transparent',
                color: isActive ? 'var(--theme-primary)' : 'var(--theme-secondary)'
              }}
            >
              <Icon 
                className="w-5 h-5 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--theme-primary)' : 'var(--theme-muted)'
                }}
              />
              <span className="font-display font-medium text-base">{item.label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* Status */}
      <div 
        className="p-6 border-t"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="flex items-center space-x-3 text-sm">
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />
          <span className="warmwind-body">System Online</span>
        </div>
        <p 
          className="text-xs warmwind-body mt-2"
          style={{ color: 'var(--theme-muted)' }}
        >
          H0L0 Core Active
        </p>
      </div>
    </div>
  )
}
