// Smooth Animation Presets and Utilities
export const animations = {
  // Page Transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeInOut" }
  },

  // Card Animations
  cardHover: {
    whileHover: { 
      scale: 1.02, 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },

  // Button Animations
  buttonPress: {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },

  // Modal Animations
  modal: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Slide Animations
  slideIn: {
    fromLeft: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
      transition: { duration: 0.4, ease: "easeOut" }
    },
    fromRight: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 },
      transition: { duration: 0.4, ease: "easeOut" }
    },
    fromTop: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 },
      transition: { duration: 0.4, ease: "easeOut" }
    },
    fromBottom: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
      transition: { duration: 0.4, ease: "easeOut" }
    }
  },

  // Stagger Animations
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: "easeOut" }
    }
  },

  // Loading Animations
  loading: {
    spin: {
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: "linear" }
    },
    pulse: {
      animate: { scale: [1, 1.1, 1] },
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    bounce: {
      animate: { y: [0, -10, 0] },
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
    }
  },

  // Particle Effects
  particles: {
    float: {
      animate: {
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.1, 1]
      },
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Success/Error States
  success: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { 
      duration: 0.6, 
      type: "spring", 
      stiffness: 200 
    }
  },

  error: {
    initial: { x: [-10, 10, -10, 10, 0] },
    animate: { x: 0 },
    transition: { duration: 0.5 }
  }
}

// Animation Variants for Framer Motion
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },

  rotateIn: {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 180, scale: 0.5 }
  }
}

// Utility function for creating custom animations
export const createAnimation = (config: {
  duration?: number
  delay?: number
  ease?: string
  type?: string
  stiffness?: number
  damping?: number
}) => ({
  transition: {
    duration: config.duration || 0.3,
    delay: config.delay || 0,
    ease: config.ease || "easeInOut",
    type: config.type || "tween",
    stiffness: config.stiffness || 100,
    damping: config.damping || 10
  }
})
