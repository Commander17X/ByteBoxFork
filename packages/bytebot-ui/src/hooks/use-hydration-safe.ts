'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to handle hydration-safe rendering
 * Prevents hydration mismatches by ensuring components only render on client
 */
export const useHydrationSafe = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

/**
 * Hook to handle form input hydration issues
 * Specifically addresses browser extension interference with form inputs
 */
export const useFormHydration = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Clean up any extension-added attributes that might cause hydration issues
    const cleanupExtensionAttributes = () => {
      const inputs = document.querySelectorAll('input[fdprocessedid]')
      inputs.forEach(input => {
        input.removeAttribute('fdprocessedid')
      })
    }

    // Run cleanup after a short delay to allow extensions to finish
    const timeoutId = setTimeout(cleanupExtensionAttributes, 100)
    
    return () => clearTimeout(timeoutId)
  }, [])

  return mounted
}
