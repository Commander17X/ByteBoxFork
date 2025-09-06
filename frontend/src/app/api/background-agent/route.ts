import { NextRequest, NextResponse } from 'next/server'

// Background Agent API endpoint
// Handles background processing requests

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Import the background agent service
    const { backgroundAgent } = await import('../../../lib/background-agent')

    switch (action) {
      case 'get_status':
        const status = backgroundAgent.getStatus()
        return NextResponse.json({
          success: true,
          data: status
        })

      case 'get_tasks':
        const limit = parseInt(searchParams.get('limit') || '50')
        const tasks = backgroundAgent.getTasks(limit)
        return NextResponse.json({
          success: true,
          data: tasks
        })

      case 'get_agents':
        const agents = backgroundAgent.getAgents()
        return NextResponse.json({
          success: true,
          data: agents
        })

      case 'get_task':
        const taskId = searchParams.get('taskId')
        if (!taskId) {
          return NextResponse.json({
            success: false,
            error: 'Task ID is required'
          }, { status: 400 })
        }

        const task = backgroundAgent.getTask(taskId)
        if (!task) {
          return NextResponse.json({
            success: false,
            error: 'Task not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: task
        })

      case 'get_agent':
        const agentId = searchParams.get('agentId')
        if (!agentId) {
          return NextResponse.json({
            success: false,
            error: 'Agent ID is required'
          }, { status: 400 })
        }

        const agent = backgroundAgent.getAgent(agentId)
        if (!agent) {
          return NextResponse.json({
            success: false,
            error: 'Agent not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: agent
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Background agent GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    // Import the background agent service
    const { backgroundAgent } = await import('../../../lib/background-agent')

    switch (action) {
      case 'create_task':
        const { type, description, payload, priority, scheduledFor, dependencies, maxRetries } = data

        if (!type || !description || !payload) {
          return NextResponse.json({
            success: false,
            error: 'Type, description, and payload are required'
          }, { status: 400 })
        }

        const taskId = await backgroundAgent.createBackgroundTask({
          type,
          description,
          payload,
          priority,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          dependencies,
          maxRetries
        })

        return NextResponse.json({
          success: true,
          data: { taskId }
        })

      case 'create_simple_task':
        const { description: simpleDescription, instructions, imageUrl } = data

        if (!simpleDescription || !instructions) {
          return NextResponse.json({
            success: false,
            error: 'Description and instructions are required'
          }, { status: 400 })
        }

        const simpleTaskId = await backgroundAgent.createSimpleBackgroundTask(
          simpleDescription,
          instructions,
          imageUrl
        )

        return NextResponse.json({
          success: true,
          data: { taskId: simpleTaskId }
        })

      case 'schedule_task':
        const { taskData, scheduledFor: scheduleTime } = data

        if (!taskData || !scheduleTime) {
          return NextResponse.json({
            success: false,
            error: 'Task data and scheduled time are required'
          }, { status: 400 })
        }

        const scheduledTaskId = await backgroundAgent.scheduleTask(
          taskData,
          new Date(scheduleTime)
        )

        return NextResponse.json({
          success: true,
          data: { taskId: scheduledTaskId }
        })

      case 'start_service':
        backgroundAgent.start()
        return NextResponse.json({
          success: true,
          message: 'Background agent service started'
        })

      case 'stop_service':
        backgroundAgent.stop()
        return NextResponse.json({
          success: true,
          message: 'Background agent service stopped'
        })

      case 'initialize':
        await backgroundAgent.initialize()
        return NextResponse.json({
          success: true,
          message: 'Background agent service initialized'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Background agent POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
