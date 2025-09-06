'use client'

import React from 'react'
import { Header } from '@/components/layout/header'
import { DesktopContainer } from '@/components/ui/desktop-container'
import { ModelManagement } from '@/components/models/ModelManagement'
import { Button } from '@/components/ui/button'
import { BlankDesktop } from '@/components/os/blank-desktop'

export const dynamic = 'force-dynamic'

export default function DesktopPage() {
  return (
    <DesktopContainer>
      <Header />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/5 border-r border-white/10 p-4">
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <span>Desktop</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <span>Models</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <span>Tasks</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <span>Settings</span>
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <BlankDesktop />
        </div>
      </div>
    </DesktopContainer>
  )
}