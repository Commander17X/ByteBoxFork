import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { preferences } = body
    const { id } = params

    if (!id || !preferences) {
      return NextResponse.json(
        { message: 'User ID and preferences are required' },
        { status: 400 }
      )
    }

    // This will be proxied to the orchestrator via Next.js rewrites
    const response = await fetch(`/api/auth/users/${id}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to update preferences' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
