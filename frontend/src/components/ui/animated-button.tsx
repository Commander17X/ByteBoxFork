'use client'

import { motion } from 'framer-motion'
import { useSounds } from '@/lib/sounds'
import { ReactNode } from 'react'

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  sound?: boolean
  animation?: 'bounce' | 'scale' | 'rotate' | 'none'
}

export function AnimatedButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  sound = true,
  animation = 'scale'
}: AnimatedButtonProps) {
  const { playClick, playHover } = useSounds()

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'warmwind-button'
      case 'secondary':
        return 'px-6 py-3 border border-white border-opacity-20 hover:border-opacity-30 rounded-lg transition-all duration-300 font-display bg-white/5 hover:bg-white/10 text-white/90 hover:text-white'
      case 'ghost':
        return 'px-6 py-3 rounded-lg transition-all duration-300 font-display text-white/70 hover:text-white hover:bg-white/5'
      case 'danger':
        return 'px-6 py-3 border border-white border-opacity-30 hover:border-opacity-50 rounded-lg transition-all duration-300 font-display bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
      default:
        return 'warmwind-button'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'md':
        return 'px-6 py-3 text-base'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  const getAnimationProps = () => {
    switch (animation) {
      case 'bounce':
        return {
          whileHover: { y: -2 },
          whileTap: { y: 0 },
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }
      case 'scale':
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { duration: 0.2 }
        }
      case 'rotate':
        return {
          whileHover: { rotate: 5 },
          whileTap: { rotate: -5 },
          transition: { duration: 0.2 }
        }
      case 'none':
        return {}
      default:
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { duration: 0.2 }
        }
    }
  }

  const handleClick = () => {
    if (sound && !disabled) {
      playClick()
    }
    onClick?.()
  }

  const handleHover = () => {
    if (sound && !disabled) {
      playHover()
    }
  }

  return (
    <motion.button
      {...getAnimationProps()}
      onClick={handleClick}
      onHoverStart={handleHover}
      disabled={disabled}
      type={type}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
