'use client'

import { useState, useEffect } from 'react'

interface CountryFlagProps {
  countryCode?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  autoDetect?: boolean
}

interface GeoLocation {
  country: string
  countryCode: string
  city: string
  region: string
}

export default function CountryFlag({ 
  countryCode, 
  size = 'md', 
  className = '',
  autoDetect = true 
}: CountryFlagProps) {
  const [detectedCountry, setDetectedCountry] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6'
  }

  useEffect(() => {
    if (autoDetect && !countryCode) {
      detectUserCountry()
    }
  }, [autoDetect, countryCode])

  const detectUserCountry = async () => {
    setIsLoading(true)
    try {
      // Try multiple IP geolocation services for better reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://api.country.is/'
      ]

      for (const service of services) {
        try {
          const response = await fetch(service, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            let countryCode = ''
            
            // Handle different API response formats
            if (data.country_code) {
              countryCode = data.country_code
            } else if (data.countryCode) {
              countryCode = data.countryCode
            } else if (data.country) {
              countryCode = data.country
            }
            
            if (countryCode) {
              setDetectedCountry(countryCode.toUpperCase())
              break
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${service}:`, error)
          continue
        }
      }
    } catch (error) {
      console.error('Failed to detect country:', error)
      // Fallback to a default country code
      setDetectedCountry('US')
    } finally {
      setIsLoading(false)
    }
  }

  const displayCountryCode = countryCode || detectedCountry

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-sm overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center`}>
        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!displayCountryCode) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-sm overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center`}>
        <span className="text-xs text-white/50">?</span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-sm overflow-hidden border border-white/20`}>
      <img
        src={`https://flagcdn.com/${displayCountryCode.toLowerCase()}.svg`}
        alt={`${displayCountryCode} flag`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to a simple colored div if flag fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">${displayCountryCode}</div>`
          }
        }}
      />
    </div>
  )
}
