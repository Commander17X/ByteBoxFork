'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Volume2, VolumeX, Bell, BellOff, X, Save } from 'lucide-react'
import { useState } from 'react'
import { useSounds } from '@/lib/sounds'
import { useNotifications } from '@/lib/notifications'
import { AnimatedButton } from './animated-button'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { isEnabled: soundEnabled, volume, setEnabled: setSoundEnabled, setVolume, playClick } = useSounds()
  const [localVolume, setLocalVolume] = useState(volume)
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled)

  const handleSave = () => {
    setVolume(localVolume)
    setSoundEnabled(localSoundEnabled)
    playClick()
    onClose()
  }

  const handleVolumeChange = (newVolume: number) => {
    setLocalVolume(newVolume)
    // Play a test sound
    if (localSoundEnabled) {
      playClick()
    }
  }

  const handleSoundToggle = () => {
    setLocalSoundEnabled(!localSoundEnabled)
    if (!localSoundEnabled) {
      playClick()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-[80vh] overflow-hidden ethereal-card z-50"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-display warmwind-text">Settings</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Sound Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-display warmwind-text">Audio</h3>
                
                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {localSoundEnabled ? (
                      <Volume2 className="w-5 h-5 text-white/80" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white/40" />
                    )}
                    <span className="warmwind-body">Enable Sounds</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSoundToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      localSoundEnabled ? 'bg-green-400/30' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: localSoundEnabled ? 24 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    />
                  </motion.button>
                </div>

                {/* Volume Slider */}
                {localSoundEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="warmwind-body text-sm">Volume</span>
                      <span className="warmwind-body text-sm">{Math.round(localVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </motion.div>
                )}
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-display warmwind-text">Notifications</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-white/80" />
                      <span className="warmwind-body">System Notifications</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-12 h-6 rounded-full bg-green-400/30"
                    >
                      <motion.div
                        animate={{ x: 24 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BellOff className="w-5 h-5 text-white/80" />
                      <span className="warmwind-body">Browser Notifications</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-12 h-6 rounded-full bg-green-400/30"
                    >
                      <motion.div
                        animate={{ x: 24 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Animation Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-display warmwind-text">Animations</h3>
                
                <div className="flex items-center justify-between">
                  <span className="warmwind-body">Enable Animations</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-12 h-6 rounded-full bg-green-400/30"
                  >
                    <motion.div
                      animate={{ x: 24 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="warmwind-body">Particle Effects</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-12 h-6 rounded-full bg-green-400/30"
                  >
                    <motion.div
                      animate={{ x: 24 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-end space-x-3">
                <AnimatedButton
                  variant="secondary"
                  onClick={onClose}
                  animation="scale"
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={handleSave}
                  animation="bounce"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
