'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { useFormHydration } from '@/hooks/use-hydration-safe'

interface HydrationSafeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const HydrationSafeInput = forwardRef<HTMLInputElement, HydrationSafeInputProps>(
  ({ className = '', ...props }, ref) => {
    const mounted = useFormHydration()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (mounted && inputRef.current) {
        // Clean up any extension-added attributes that might cause hydration issues
        const cleanup = () => {
          if (inputRef.current) {
            inputRef.current.removeAttribute('fdprocessedid')
            inputRef.current.removeAttribute('data-lastpass-icon-root')
            inputRef.current.removeAttribute('data-1password-ignore')
          }
        }

        // Run cleanup after a short delay to allow extensions to finish
        const timeoutId = setTimeout(cleanup, 100)
        
        return () => clearTimeout(timeoutId)
      }
    }, [mounted])

    // Use the forwarded ref or our internal ref
    const combinedRef = (ref || inputRef) as React.RefObject<HTMLInputElement>

    if (!mounted) {
      // Return a placeholder div during SSR to prevent hydration mismatch
      return (
        <div 
          className={`warmwind-input ${className}`}
          style={{ height: '48px' }}
        />
      )
    }

    return (
      <input
        ref={combinedRef}
        className={`warmwind-input ${className}`}
        suppressHydrationWarning
        {...props}
      />
    )
  }
)

HydrationSafeInput.displayName = 'HydrationSafeInput'
