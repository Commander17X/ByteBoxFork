'use client'

import { useEffect, useState } from 'react'

interface HydrationBoundaryProps {
  children: React.ReactNode
}

export function HydrationBoundary({ children }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after the first render
    setIsHydrated(true)

    // Clean up any extension-added attributes that might cause hydration issues
    const cleanupExtensionAttributes = () => {
      const inputs = document.querySelectorAll('input[fdprocessedid], input[data-lastpass-icon-root], input[data-1password-ignore]')
      inputs.forEach(input => {
        input.removeAttribute('fdprocessedid')
        input.removeAttribute('data-lastpass-icon-root')
        input.removeAttribute('data-1password-ignore')
      })
    }

    // Run cleanup after a short delay to allow extensions to finish
    const timeoutId = setTimeout(cleanupExtensionAttributes, 100)

    // Set up a mutation observer to clean up attributes as they're added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement
          if (target.tagName === 'INPUT') {
            if (target.hasAttribute('fdprocessedid') || 
                target.hasAttribute('data-lastpass-icon-root') || 
                target.hasAttribute('data-1password-ignore')) {
              target.removeAttribute('fdprocessedid')
              target.removeAttribute('data-lastpass-icon-root')
              target.removeAttribute('data-1password-ignore')
            }
          }
        }
      })
    })

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['fdprocessedid', 'data-lastpass-icon-root', 'data-1password-ignore']
    })

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  // Suppress hydration warnings for the entire app during development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('Warning: Extra attributes from the server') ||
           args[0].includes('Hydration failed') ||
           args[0].includes('fdprocessedid'))
        ) {
          // Suppress these specific hydration warnings
          return
        }
        originalError.apply(console, args)
      }

      return () => {
        console.error = originalError
      }
    }
  }, [])

  return <>{children}</>
}
