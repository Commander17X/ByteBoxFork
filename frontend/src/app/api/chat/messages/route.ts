import { NextRequest, NextResponse } from 'next/server'
import { chatStore } from '@/lib/chat-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, text, sender } = await request.json()

    if (!sessionId || !text || !sender) {
      return NextResponse.json(
        { error: 'Session ID, text, and sender are required' },
        { status: 400 }
      )
    }

    if (!['user', 'admin'].includes(sender)) {
      return NextResponse.json(
        { error: 'Sender must be either "user" or "admin"' },
        { status: 400 }
      )
    }

    const message = chatStore.addMessage(sessionId, {
      text,
      sender: sender as 'user' | 'admin',
      status: 'delivered'
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message
    })
  } catch (error) {
    console.error('Failed to add message:', error)
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = chatStore.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: session.messages
    })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
