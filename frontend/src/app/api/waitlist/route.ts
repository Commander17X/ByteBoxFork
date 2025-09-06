import { NextRequest, NextResponse } from 'next/server'
import { waitlistStore } from '@/lib/waitlist-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Add user to waitlist
    const newUser = waitlistStore.addUser(email)

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      position: newUser.position,
      email: newUser.email
    })

  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = waitlistStore.getAllUsers()
    const stats = waitlistStore.getStats()

    return NextResponse.json({
      success: true,
      users,
      ...stats
    })
  } catch (error) {
    console.error('Failed to fetch waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
