'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Palette,
  Layout,
  Settings,
  Zap,
  Check,
  ArrowRight,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ThemeOption {
  id: string
  name: string
  description: string
  preview: string
  colors: string[]
}

interface LayoutOption {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
}

const themes: ThemeOption[] = [
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Clean grays with subtle depth',
    preview: 'bg-gradient-to-br from-gray-100/20 to-gray-200/10',
    colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d']
  },
  {
    id: 'soft-cream',
    name: 'Soft Cream',
    description: 'Warm cream tones for comfort',
    preview: 'bg-gradient-to-br from-amber-50/20 to-orange-50/10',
    colors: ['#fefdf8', '#fdf6e3', '#f4e4bc', '#f0d68c', '#e6c865', '#d4b843']
  },
  {
    id: 'cool-blue',
    name: 'Cool Blue',
    description: 'Calming blues with crisp clarity',
    preview: 'bg-gradient-to-br from-blue-50/20 to-cyan-50/10',
    colors: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9']
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    description: 'Natural greens for a peaceful feel',
    preview: 'bg-gradient-to-br from-green-50/20 to-emerald-50/10',
    colors: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e']
  },
  {
    id: 'lavender-purple',
    name: 'Lavender Purple',
    description: 'Gentle purples for creativity',
    preview: 'bg-gradient-to-br from-purple-50/20 to-violet-50/10',
    colors: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#ddd6fe', '#c4b5fd', '#a78bfa']
  }
]

const layouts: LayoutOption[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    description: 'Full desktop experience',
    icon: Monitor
  },
  {
    id: 'tablet',
    name: 'Tablet',
    description: 'Touch-optimized layout',
    icon: Tablet
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: 'Compact mobile view',
    icon: Smartphone
  }
]

export function GettingStarted() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState('minimal-gray')
  const [selectedLayout, setSelectedLayout] = useState('desktop')
  const [customizations, setCustomizations] = useState({
    sidebarWidth: 'normal',
    animations: true,
    sounds: false,
    notifications: true
  })

  const { completeOnboarding, user, updateUserPreferences } = useAuth()

  // Track onboarding progress for analytics/feedback
  useEffect(() => {
    // Could send progress tracking to analytics here
    console.log(`Onboarding Step: ${currentStep + 1}/${steps.length}`)
  }, [currentStep])

  // Apply theme immediately when selected
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', selectedTheme)
    }
  }, [selectedTheme])

  const steps = [
    {
      title: 'Welcome to H0L0Light-OS',
      subtitle: `Hi ${user?.name}! 👋 Let's personalize your experience`,
      content: 'WelcomeStep'
    },
    {
      title: 'Choose Your Theme',
      subtitle: 'Select a color scheme that feels right for you',
      content: 'ThemeStep'
    },
    {
      title: 'Pick Your Layout',
      subtitle: 'Choose how you want to interact with your OS',
      content: 'LayoutStep'
    },
    {
      title: 'Customize Settings',
      subtitle: 'Fine-tune your experience',
      content: 'SettingsStep'
    },
    {
      title: 'You\'re All Set!',
      subtitle: 'Your personalized H0L0Light-OS is ready',
      content: 'CompleteStep'
    }
  ]

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save user preferences before completing onboarding
      try {
        await updateUserPreferences({
          theme: selectedTheme,
          layout: selectedLayout,
          customizations: customizations,
          desktopSettings: {
            wallpaper: 'default',
            gridSize: 20,
            showGrid: true
          }
        })
        // Add a small delay for smooth transition
        setTimeout(() => {
          completeOnboarding()
        }, 800)
      } catch (error) {
        console.error('Failed to save preferences:', error)
        // Still complete onboarding even if preferences fail to save
        completeOnboarding()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case 'WelcomeStep':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
                         <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-white/20 to-white/8 border border-white/20 flex items-center justify-center">
               <span className="text-3xl">👋</span>
             </div>
            <div className="space-y-4">
              <h3 className="text-xl warmwind-text">Hello there! 👋</h3>
              <p className="warmwind-body max-w-md mx-auto">
                Welcome to your personal OS! We're excited to help you create 
                a workspace that feels uniquely yours.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: Palette, title: 'Custom Themes', desc: 'Choose your perfect color palette' },
                { icon: Layout, title: 'Flexible Layout', desc: 'Arrange your workspace as you like' },
                { icon: Settings, title: 'Personal Settings', desc: 'Fine-tune every detail' }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-4 rounded-xl bg-white/10 border border-white/20"
                >
                  <item.icon className="w-8 h-8 text-white/80 mx-auto mb-3" />
                  <h4 className="warmwind-text text-sm mb-1">{item.title}</h4>
                  <p className="warmwind-body text-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )

      case 'ThemeStep':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    selectedTheme === theme.id
                      ? 'border-white/40 bg-white/15'
                      : 'border-white/20 bg-white/8 hover:bg-white/12'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Color Stripes Preview */}
                  <div className="w-full h-16 rounded-lg mb-3 border border-white/20 overflow-hidden">
                    {/* 6 Color Stripes */}
                    <div className="flex h-full">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Theme Info */}
                  <div className="text-left">
                    <h4 className="warmwind-text text-sm mb-1">{theme.name}</h4>
                    <p className="warmwind-body text-xs mb-2">{theme.description}</p>
                    
                    {/* Color Palette Bar - 6 stripes */}
                    <div className="flex h-2 rounded-full overflow-hidden border border-white/20">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {selectedTheme === theme.id && (
                    <div className="mt-3 flex justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case 'LayoutStep':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {layouts.map((layout) => {
                const Icon = layout.icon
                return (
                  <motion.button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout.id)}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      selectedLayout === layout.id
                        ? 'border-white/40 bg-white/15'
                        : 'border-white/20 bg-white/8 hover:bg-white/12'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-12 h-12 text-white/80 mx-auto mb-4" />
                    <h4 className="warmwind-text text-sm mb-2">{layout.name}</h4>
                    <p className="warmwind-body text-xs">{layout.description}</p>
                    {selectedLayout === layout.id && (
                      <div className="mt-3 flex justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )

      case 'SettingsStep':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {[
                { key: 'animations', label: 'Smooth Animations', desc: 'Enable fluid transitions and effects' },
                { key: 'sounds', label: 'System Sounds', desc: 'Play audio feedback for interactions' },
                { key: 'notifications', label: 'Notifications', desc: 'Receive system and app notifications' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 rounded-xl bg-white/8 border border-white/20">
                  <div>
                    <h4 className="warmwind-text text-sm">{setting.label}</h4>
                    <p className="warmwind-body text-xs">{setting.desc}</p>
                  </div>
                  <button
                    onClick={() => setCustomizations(prev => ({
                      ...prev,
                      [setting.key]: !prev[setting.key as keyof typeof prev]
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      customizations[setting.key as keyof typeof customizations]
                        ? 'bg-white/30'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                      customizations[setting.key as keyof typeof customizations]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )

      case 'CompleteStep':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
                         <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-white/20 to-white/8 border border-white/20 flex items-center justify-center">
               <Check className="w-10 h-10 text-white" />
             </div>
            <div className="space-y-4">
              <h3 className="text-xl warmwind-text">Perfect! 🎉</h3>
              <p className="warmwind-body max-w-md mx-auto">
                Your H0L0Light-OS is now personalized and ready to use! 
                You can always change these settings later.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 max-w-md mx-auto">
              <h4 className="warmwind-text text-sm mb-2">Your Preferences</h4>
              <div className="space-y-1 text-xs warmwind-body">
                <p>Theme: {themes.find(t => t.id === selectedTheme)?.name}</p>
                <p>Layout: {layouts.find(l => l.id === selectedLayout)?.name}</p>
                <p>Animations: {customizations.animations ? 'On' : 'Off'}</p>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      className="min-h-screen wallpaper-bg relative flex items-center justify-center p-6"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-white/15 to-white/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 5}px`,
              height: `${Math.random() * 8 + 5}px`,
            }}
            animate={{
              y: [0, -250, 0],
              x: [0, Math.random() * 80 - 40, 0],
              opacity: [0, 0.9, 0],
              scale: [0.3, 1.8, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 8 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="ethereal-card p-8"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl warmwind-text">{steps[currentStep].title}</h1>
              <span className="warmwind-body text-sm">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-white/30 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="warmwind-body text-sm mt-2">{steps[currentStep].subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] flex items-center justify-center">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="warmwind-button disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Back
            </button>

            <button
              onClick={handleNext}
              className="warmwind-button flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
