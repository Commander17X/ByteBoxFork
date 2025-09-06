import { NextRequest, NextResponse } from 'next/server'
import { taskScheduler } from '@/lib/task-scheduler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'tasks':
        const tasks = taskScheduler.getScheduledTasks()
        return NextResponse.json({ success: true, data: tasks })

      case 'status':
        const status = taskScheduler.getStatus()
        return NextResponse.json({ success: true, data: status })

      case 'task':
        const taskId = searchParams.get('taskId')
        if (!taskId) {
          return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 })
        }
        const task = taskScheduler.getScheduledTask(taskId)
        if (!task) {
          return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: task })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Task scheduler API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create':
        const {
          name,
          description,
          type,
          payload,
          schedule,
          priority = 'medium',
          maxRetries = 3,
          retryDelay = 30,
          notifications = {}
        } = data

        if (!name || !description || !type || !payload || !schedule) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const taskId = await taskScheduler.createScheduledTask({
          name,
          description,
          type,
          payload,
          schedule,
          priority,
          maxRetries,
          retryDelay,
          notifications
        })

        return NextResponse.json({ success: true, data: { taskId } })

      case 'createDaily':
        const {
          name: dailyName,
          description: dailyDescription,
          type: dailyType,
          payload: dailyPayload,
          duration,
          timeOfDay = '09:00',
          priority: dailyPriority = 'medium',
          maxRetries: dailyMaxRetries = 3,
          notifications: dailyNotifications = {}
        } = data

        if (!dailyName || !dailyDescription || !dailyType || !dailyPayload || !duration) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for daily task' },
            { status: 400 }
          )
        }

        const dailyTaskId = await taskScheduler.createDailyTask(
          dailyName,
          dailyDescription,
          dailyType,
          dailyPayload,
          duration,
          timeOfDay,
          {
            priority: dailyPriority,
            maxRetries: dailyMaxRetries,
            notifications: dailyNotifications
          }
        )

        return NextResponse.json({ success: true, data: { taskId: dailyTaskId } })

      case 'createFinanceSummary':
        const {
          days = 31,
          timeOfDay: financeTimeOfDay = '09:00',
          priority: financePriority = 'high'
        } = data

        const financeTaskId = await taskScheduler.createFinanceSummaryTask(
          { days },
          financeTimeOfDay
        )

        return NextResponse.json({ success: true, data: { taskId: financeTaskId } })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Task scheduler POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskId, ...data } = body

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'pause':
        const pauseResult = await taskScheduler.pauseTask(taskId)
        return NextResponse.json({ success: pauseResult, data: { taskId } })

      case 'resume':
        const resumeResult = await taskScheduler.resumeTask(taskId)
        return NextResponse.json({ success: resumeResult, data: { taskId } })

      case 'cancel':
        const cancelResult = await taskScheduler.cancelTask(taskId)
        return NextResponse.json({ success: cancelResult, data: { taskId } })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Task scheduler PUT API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const result = await taskScheduler.cancelTask(taskId)
    return NextResponse.json({ success: result, data: { taskId } })
  } catch (error) {
    console.error('Task scheduler DELETE API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
