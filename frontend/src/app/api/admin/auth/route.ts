import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// In production, use environment variables
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
)

// Database connection for user authentication
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate against the orchestrator database
    try {
      const authResponse = await fetch(`${ORCHESTRATOR_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })

      if (!authResponse.ok) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const authData = await authResponse.json()
      const user = authData.user

      // Check if user is admin
      if (!user.is_admin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      // Create JWT token
      const token = await new SignJWT({ 
        userId: user.id,
        email: user.email,
        name: user.name,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .setIssuedAt()
        .sign(JWT_SECRET)

      // Set HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      })

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      })

      return response

    } catch (authError) {
      console.error('Orchestrator authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('Admin authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      username: payload.username
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })

  // Clear the admin token cookie
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })

  return response
}
