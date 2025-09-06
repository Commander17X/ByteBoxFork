# Task Scheduler System

A comprehensive task scheduling system that can handle long-term tasks with daily, weekly, monthly, and yearly execution patterns. Perfect for automating repetitive tasks like daily finance summaries, weekly reports, and monthly analyses.

## Features

### 🕒 Flexible Scheduling
- **Daily Tasks**: Execute every day at a specified time
- **Weekly Tasks**: Execute on specific days of the week
- **Monthly Tasks**: Execute on specific days of the month
- **Yearly Tasks**: Execute annually on a specific date
- **Custom Intervals**: Execute with custom time intervals

### 📊 Long-term Execution
- **Extended Duration**: Tasks can run for days, weeks, months, or years
- **Automatic Persistence**: Tasks are saved and restored across browser sessions
- **Background Processing**: Continues running even when the browser is closed (via Service Workers)

### 🎯 Smart Task Management
- **Priority System**: Low, Medium, High, Critical priorities
- **Retry Logic**: Automatic retry with exponential backoff
- **Dependency Management**: Tasks can depend on other tasks
- **Execution History**: Track all task executions and results

### 📧 Notifications
- **Success Notifications**: Get notified when tasks complete successfully
- **Failure Notifications**: Get alerted when tasks fail
- **Completion Notifications**: Get notified when long-term tasks finish

## Quick Start

### 1. Create a Daily Finance Summary Task

```typescript
import { taskScheduler } from '@/lib/task-scheduler'

// Create a 31-day finance summary task
const taskId = await taskScheduler.createFinanceSummaryTask(
  { days: 31 }, // Run for 31 days
  '09:00' // Every day at 9 AM
)
```

### 2. Create a Custom Daily Task

```typescript
const taskId = await taskScheduler.createDailyTask(
  'Daily Health Metrics',
  'Track and analyze daily health and wellness metrics',
  'data_extraction',
  {
    source: 'health_tracker',
    format: 'excel',
    includeCharts: true,
    instructions: 'Generate comprehensive daily health report...'
  },
  { days: 90 }, // Run for 90 days
  '06:00', // Every day at 6 AM
  {
    priority: 'high',
    notifications: {
      onSuccess: true,
      onFailure: true,
      onCompletion: true
    }
  }
)
```

### 3. Create a Weekly Report Task

```typescript
const taskId = await taskScheduler.createScheduledTask({
  name: 'Weekly Performance Report',
  description: 'Generate comprehensive weekly performance analysis',
  type: 'data_extraction',
  payload: {
    source: 'performance_metrics',
    format: 'excel',
    instructions: 'Generate weekly performance report...'
  },
  schedule: {
    frequency: 'weekly',
    interval: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + (52 * 7 * 24 * 60 * 60 * 1000)), // 52 weeks
    timeOfDay: '08:00',
    daysOfWeek: [1] // Monday
  },
  priority: 'high'
})
```

## API Reference

### TaskSchedulerService

#### Methods

##### `createScheduledTask(taskData)`
Creates a new scheduled task with custom configuration.

**Parameters:**
- `taskData.name`: Task name
- `taskData.description`: Task description
- `taskData.type`: Task type ('vision_analysis', 'web_automation', 'data_extraction', 'content_creation', 'monitoring', 'custom')
- `taskData.payload`: Task payload/configuration
- `taskData.schedule`: Schedule configuration
- `taskData.priority`: Priority level ('low', 'medium', 'high', 'critical')
- `taskData.maxRetries`: Maximum retry attempts (default: 3)
- `taskData.retryDelay`: Retry delay in minutes (default: 30)
- `taskData.notifications`: Notification preferences

##### `createDailyTask(name, description, type, payload, duration, timeOfDay, options)`
Creates a daily recurring task.

**Parameters:**
- `name`: Task name
- `description`: Task description
- `type`: Task type
- `payload`: Task payload
- `duration`: Duration object `{ days?, weeks?, months?, years? }`
- `timeOfDay`: Time in HH:MM format (default: '09:00')
- `options`: Additional options (priority, maxRetries, notifications)

##### `createFinanceSummaryTask(duration, timeOfDay)`
Creates a pre-configured finance summary task.

**Parameters:**
- `duration`: Duration object `{ days: number }`
- `timeOfDay`: Time in HH:MM format (default: '09:00')

##### `pauseTask(taskId)`
Pauses a scheduled task.

##### `resumeTask(taskId)`
Resumes a paused task.

##### `cancelTask(taskId)`
Cancels a scheduled task.

##### `getScheduledTasks()`
Returns all scheduled tasks.

##### `getScheduledTask(taskId)`
Returns a specific scheduled task.

##### `getStatus()`
Returns scheduler status and statistics.

### Schedule Configuration

```typescript
interface Schedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number // For custom frequency
  startDate: Date
  endDate?: Date // Optional end date
  timeOfDay: string // HH:MM format
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number // 1-31 for monthly
  timezone: string
}
```

### Task Types

- **`vision_analysis`**: Image and visual content analysis
- **`web_automation`**: Web scraping and automation tasks
- **`data_extraction`**: Data extraction and processing
- **`content_creation`**: Content generation and creation
- **`monitoring`**: System and service monitoring
- **`custom`**: Custom task implementations

## Examples

### Example 1: Daily Finance Summary for 31 Days

```typescript
// This will create a task that runs every day at 9 AM for 31 days
// Each day it will generate an Excel summary of your finances
const taskId = await taskScheduler.createFinanceSummaryTask(
  { days: 31 },
  '09:00'
)
```

### Example 2: Weekly Performance Reports for 1 Year

```typescript
const taskId = await taskScheduler.createScheduledTask({
  name: 'Weekly Performance Report',
  description: 'Generate weekly performance analysis',
  type: 'data_extraction',
  payload: {
    source: 'performance_data',
    format: 'excel',
    instructions: 'Analyze weekly performance metrics...'
  },
  schedule: {
    frequency: 'weekly',
    interval: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)), // 1 year
    timeOfDay: '08:00',
    daysOfWeek: [1] // Every Monday
  },
  priority: 'high'
})
```

### Example 3: Monthly Business Analysis for 2 Years

```typescript
const taskId = await taskScheduler.createScheduledTask({
  name: 'Monthly Business Analysis',
  description: 'Comprehensive monthly business analysis',
  type: 'data_extraction',
  payload: {
    source: 'business_metrics',
    format: 'excel',
    instructions: 'Generate monthly business analysis...'
  },
  schedule: {
    frequency: 'monthly',
    interval: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)), // 2 years
    timeOfDay: '07:00',
    dayOfMonth: 1 // First day of each month
  },
  priority: 'critical'
})
```

## Integration with Vision Agent

The task scheduler integrates seamlessly with the Vision Agent system:

```typescript
// Create a vision analysis task that runs daily
const taskId = await taskScheduler.createDailyTask(
  'Daily Website Analysis',
  'Analyze website screenshots and extract insights',
  'vision_analysis',
  {
    targetUrl: 'https://example.com',
    instructions: 'Analyze the website layout and extract key information',
    includeScreenshot: true
  },
  { days: 30 },
  '10:00'
)
```

## Background Processing

Tasks continue to run in the background using Service Workers:

- **Persistent Storage**: Tasks are saved to localStorage
- **Service Worker Integration**: Background processing continues when browser is closed
- **Automatic Recovery**: Tasks resume when the browser is reopened
- **Heartbeat Monitoring**: Agent health is monitored continuously

## Monitoring and Management

### Dashboard Integration

The task scheduler includes a comprehensive dashboard:

- **Task Overview**: View all scheduled tasks
- **Execution History**: Track task execution results
- **Status Monitoring**: Real-time task status updates
- **Performance Metrics**: Success rates and execution times

### API Endpoints

- `GET /api/task-scheduler?action=tasks` - Get all tasks
- `GET /api/task-scheduler?action=status` - Get scheduler status
- `POST /api/task-scheduler` - Create new tasks
- `PUT /api/task-scheduler` - Update task status
- `DELETE /api/task-scheduler` - Cancel tasks

## Best Practices

### 1. Task Design
- Keep tasks focused and specific
- Use descriptive names and descriptions
- Set appropriate priorities
- Configure retry logic for reliability

### 2. Scheduling
- Choose appropriate execution times
- Consider timezone implications
- Plan for long-term execution
- Set reasonable end dates

### 3. Monitoring
- Enable notifications for important tasks
- Monitor execution history regularly
- Review and adjust schedules as needed
- Clean up completed tasks periodically

### 4. Performance
- Use appropriate task priorities
- Avoid overlapping high-priority tasks
- Monitor system resources
- Optimize task payloads

## Troubleshooting

### Common Issues

1. **Tasks not executing**
   - Check if the scheduler is running
   - Verify task status is 'active'
   - Check execution time and timezone
   - Review browser console for errors

2. **Tasks failing repeatedly**
   - Check task payload configuration
   - Verify required services are available
   - Review retry settings
   - Check execution history for error details

3. **Background processing issues**
   - Ensure Service Worker is registered
   - Check browser permissions
   - Verify localStorage is available
   - Review network connectivity

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('task-scheduler-debug', 'true')
```

## Future Enhancements

- **Cron Expression Support**: Native cron syntax support
- **Task Templates**: Pre-built task templates
- **Advanced Dependencies**: Complex task dependency chains
- **Distributed Execution**: Multi-device task execution
- **Machine Learning**: Intelligent task scheduling optimization
- **Integration APIs**: Third-party service integrations

## Support

For issues, questions, or feature requests, please refer to the main project documentation or create an issue in the project repository.
