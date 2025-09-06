import { NextRequest, NextResponse } from 'next/server'
import { waitlistStore } from '@/lib/waitlist-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('userIds')
    const status = searchParams.get('status')

    // Get user emails from the store
    const userIdsArray = userIds ? userIds.split(',') : undefined
    const emailList = waitlistStore.getUserEmails(userIdsArray, status || undefined)

    return NextResponse.json({
      success: true,
      emails: emailList,
      total: emailList.length
    })

  } catch (error) {
    console.error('Failed to fetch user emails:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}
