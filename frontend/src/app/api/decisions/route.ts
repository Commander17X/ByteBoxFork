import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple in-memory store for decisions (in production, use a database)
const decisions: any[] = []

export async function POST(request: NextRequest) {
  try {
    const decisionData = await request.json()

    if (!decisionData) {
      return NextResponse.json(
        { error: 'Decision data is required' },
        { status: 400 }
      )
    }

    // Add timestamp and ID to the decision
    const decision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...decisionData,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    decisions.push(decision)

    return NextResponse.json({
      success: true,
      decision
    })
  } catch (error) {
    console.error('Failed to save decision:', error)
    return NextResponse.json(
      { error: 'Failed to save decision' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const paginatedDecisions = decisions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      decisions: paginatedDecisions,
      total: decisions.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch decisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decisions' },
      { status: 500 }
    )
  }
}
