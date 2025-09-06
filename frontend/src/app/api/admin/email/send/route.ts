import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { recipients, subject, content, templateType } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required' },
        { status: 400 }
      )
    }

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Test email connection first
    const connectionTest = await emailService.testConnection()
    if (!connectionTest) {
      return NextResponse.json(
        { error: 'Email service connection failed' },
        { status: 500 }
      )
    }

    // Send email
    const result = await emailService.sendEmail({
      to: recipients,
      subject,
      content,
      templateType: templateType || 'custom'
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        recipients: recipients.length
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Test email connection
    const connectionTest = await emailService.testConnection()
    
    return NextResponse.json({
      connected: connectionTest,
      message: connectionTest 
        ? 'Email service is connected and ready' 
        : 'Email service connection failed'
    })
  } catch (error) {
    console.error('Email connection test error:', error)
    return NextResponse.json(
      { error: 'Failed to test email connection' },
      { status: 500 }
    )
  }
}
