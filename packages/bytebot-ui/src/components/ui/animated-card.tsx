'use client'

import { motion } from 'framer-motion'
import { useSounds } from '@/lib/sounds'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'glass' | 'ethereal' | 'heavenly' | 'solid'
  hover?: boolean
  className?: string
  sound?: boolean
  animation?: 'lift' | 'glow' | 'tilt' | 'none'
}

export function AnimatedCard({
  children,
  onClick,
  variant = 'ethereal',
  hover = true,
  className = '',
  sound = true,
  animation = 'lift'
}: AnimatedCardProps) {
  const { playHover } = useSounds()

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'glass-panel'
      case 'ethereal':
        return 'ethereal-card'
      case 'heavenly':
        return 'heavenly-glass'
      case 'solid':
        return 'bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm'
      default:
        return 'ethereal-card'
    }
  }

  const getAnimationProps = () => {
    if (!hover) return {}

    switch (animation) {
      case 'lift':
        return {
          whileHover: { 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeOut" }
          },
          whileTap: { 
            scale: 0.98,
            transition: { duration: 0.1 }
          }
        }
      case 'glow':
        return {
          whileHover: { 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)",
            transition: { duration: 0.3 }
          }
        }
      case 'tilt':
        return {
          whileHover: { 
            rotateY: 5,
            rotateX: 5,
            scale: 1.02,
            transition: { duration: 0.3 }
          }
        }
      case 'none':
        return {}
      default:
        return {
          whileHover: { 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeOut" }
          },
          whileTap: { 
            scale: 0.98,
            transition: { duration: 0.1 }
          }
        }
    }
  }

  const handleHover = () => {
    if (sound && hover) {
      playHover()
    }
  }

  const CardComponent = onClick ? motion.button : motion.div

  return (
    <CardComponent
      {...getAnimationProps()}
      onClick={onClick}
      onHoverStart={handleHover}
      className={`
        ${getVariantStyles()}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </CardComponent>
  )
}
