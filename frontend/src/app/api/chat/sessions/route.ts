import { NextRequest, NextResponse } from 'next/server'
import { chatStore } from '@/lib/chat-store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'active' | 'closed' | 'waiting' | 'all' || 'all'
    
    const sessions = chatStore.getSessionsByStatus(status)
    const stats = chatStore.getStats()

    return NextResponse.json({
      success: true,
      sessions,
      stats
    })
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, userPlan, isLoggedIn, countryCode, countryName } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const session = chatStore.createSession(
      userId,
      userName || `User ${userId.slice(-4)}`,
      userPlan || 'free',
      isLoggedIn || false
    )

    // Update with country info if provided
    if (countryCode || countryName) {
      chatStore.updateSessionInfo(session.id, { countryCode, countryName })
    }

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('Failed to create chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}
