import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    const isConnected = await emailService.testConnection()
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected 
        ? 'Email service is connected and ready' 
        : 'Email service connection failed'
    })
  } catch (error) {
    console.error('Email connection test error:', error)
    return NextResponse.json(
      { 
        success: false,
        connected: false,
        error: 'Failed to test email connection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
