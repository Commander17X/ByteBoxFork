import { NextRequest, NextResponse } from 'next/server'
import { waitlistStore } from '@/lib/waitlist-store'

export async function GET(request: NextRequest) {
  try {
    // In production, you would:
    // 1. Check admin authentication
    // 2. Fetch users from database
    // 3. Apply filters and pagination

    const users = waitlistStore.getAllUsers()
    
    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error('Failed to fetch waitlist users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    // Update user status
    const updatedUser = waitlistStore.updateUserStatus(
      userId, 
      action === 'approve' ? 'beta' : action === 'remove' ? 'removed' : 'waiting'
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Admin action: ${action} for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: `User ${action} successful`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
