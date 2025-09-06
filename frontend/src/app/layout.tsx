import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Suspense } from 'react'
import LiveChatBubble from '@/components/ui/live-chat-bubble'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'H0l0Light-OS',
  description: 'AI-first cloud-native web platform with autonomous agents',
  keywords: ['AI', 'autonomous', 'cloud', 'operating system', 'agents'],
  authors: [{ name: 'H0L0 Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.svg', sizes: '32x32', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white text-gray-900`}>
        <Providers>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
                <p className="text-gray-600">Preparing your experience</p>
              </div>
            </div>
          }>
            {children}
            <LiveChatBubble />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
