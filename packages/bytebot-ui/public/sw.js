// Service Worker for Background Agent Processing
// Enables true background processing even when browser is closed

const CACHE_NAME = 'background-agent-v1'
const TASK_QUEUE_KEY = 'background-task-queue'
const AGENT_STATE_KEY = 'background-agent-state'

// Install event
self.addEventListener('install', (event) => {
  console.log('🔄 Background Agent Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔄 Background Agent Service Worker activated')
  event.waitUntil(self.clients.claim())
})

// Message event handler
self.addEventListener('message', (event) => {
  const { type, data } = event.data

  switch (type) {
    case 'EXECUTE_TASK':
      handleTaskExecution(data.task)
      break
    case 'SCHEDULE_TASK':
      handleTaskScheduling(data.task, data.scheduledFor)
      break
    case 'GET_STATUS':
      handleStatusRequest(event.ports[0])
      break
    case 'GET_TASKS':
      handleGetTasks(event.ports[0])
      break
    case 'PERSIST_STATE':
      handlePersistState(data.state)
      break
    case 'LOAD_STATE':
      handleLoadState(event.ports[0])
      break
  }
})

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-agent-sync') {
    console.log('🔄 Background sync triggered')
    event.waitUntil(processBackgroundTasks())
  }
})

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-agent-periodic') {
    console.log('🔄 Periodic background sync triggered')
    event.waitUntil(processBackgroundTasks())
  }
})

// Handle task execution
async function handleTaskExecution(task) {
  try {
    console.log('🔄 Executing background task:', task.id)
    
    const result = await executeTask(task)
    
    // Store result
    await storeTaskResult(task.id, result)
    
    // Notify main thread
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'TASK_COMPLETED',
        taskId: task.id,
        result: result
      })
    })
    
  } catch (error) {
    console.error('🔄 Background task failed:', task.id, error)
    
    // Store error
    await storeTaskError(task.id, error.message)
    
    // Notify main thread
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'TASK_FAILED',
        taskId: task.id,
        error: error.message
      })
    })
  }
}

// Handle task scheduling
async function handleTaskScheduling(task, scheduledFor) {
  console.log('🔄 Scheduling background task:', task.id, 'for', scheduledFor)
  
  // Store scheduled task
  const scheduledTasks = await getScheduledTasks()
  scheduledTasks.push({
    ...task,
    scheduledFor: new Date(scheduledFor),
    status: 'scheduled'
  })
  await setScheduledTasks(scheduledTasks)
  
  // Set up notification for when it's time to execute
  const delay = new Date(scheduledFor).getTime() - Date.now()
  if (delay > 0) {
    setTimeout(() => {
      handleTaskExecution(task)
    }, delay)
  }
}

// Handle status request
async function handleStatusRequest(port) {
  const status = await getAgentStatus()
  port.postMessage({
    type: 'STATUS_RESPONSE',
    status: status
  })
}

// Handle get tasks request
async function handleGetTasks(port) {
  const tasks = await getAllTasks()
  port.postMessage({
    type: 'TASKS_RESPONSE',
    tasks: tasks
  })
}

// Handle persist state
async function handlePersistState(state) {
  try {
    await setAgentState(state)
    console.log('🔄 Agent state persisted')
  } catch (error) {
    console.error('🔄 Failed to persist state:', error)
  }
}

// Handle load state
async function handleLoadState(port) {
  try {
    const state = await getAgentState()
    port.postMessage({
      type: 'STATE_RESPONSE',
      state: state
    })
  } catch (error) {
    console.error('🔄 Failed to load state:', error)
    port.postMessage({
      type: 'STATE_RESPONSE',
      state: null
    })
  }
}

// Execute a task based on its type
async function executeTask(task) {
  const { type, payload } = task
  
  switch (type) {
    case 'visual_analysis':
      return await executeVisualAnalysis(payload)
    case 'web_automation':
      return await executeWebAutomation(payload)
    case 'data_extraction':
      return await executeDataExtraction(payload)
    case 'content_creation':
      return await executeContentCreation(payload)
    case 'scheduled_task':
      return await executeScheduledTask(payload)
    case 'monitoring':
      return await executeMonitoring(payload)
    default:
      throw new Error(`Unknown task type: ${type}`)
  }
}

// Execute visual analysis task
async function executeVisualAnalysis(payload) {
  const { imageUrl, instructions, context } = payload
  
  // Simulate visual analysis (in production, this would call Ollama API)
  const result = {
    analysis: `Visual analysis of ${imageUrl}: ${instructions}`,
    context: context,
    timestamp: new Date().toISOString(),
    backgroundExecution: true
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return result
}

// Execute web automation task
async function executeWebAutomation(payload) {
  const { targetUrl, instructions, context } = payload
  
  // Simulate web automation
  const result = {
    url: targetUrl,
    actions: [
      { type: 'navigate', target: targetUrl, status: 'completed' },
      { type: 'analyze', result: 'Page analyzed successfully', status: 'completed' },
      { type: 'execute', instructions, status: 'completed' }
    ],
    timestamp: new Date().toISOString(),
    backgroundExecution: true
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return result
}

// Execute data extraction task
async function executeDataExtraction(payload) {
  const { source, instructions, context } = payload
  
  // Simulate data extraction
  const result = {
    source,
    extractedData: {
      items: [
        { id: 1, name: 'Background Item 1', value: '100' },
        { id: 2, name: 'Background Item 2', value: '200' }
      ],
      metadata: {
        extractedAt: new Date().toISOString(),
        source: source,
        instructions: instructions
      }
    },
    timestamp: new Date().toISOString(),
    backgroundExecution: true
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return result
}

// Execute content creation task
async function executeContentCreation(payload) {
  const { instructions, context, contentType } = payload
  
  // Simulate content creation
  const result = {
    content: `Background generated content based on: ${instructions}`,
    contentType: contentType || 'text',
    context: context,
    timestamp: new Date().toISOString(),
    backgroundExecution: true
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2500))
  
  return result
}

// Execute scheduled task
async function executeScheduledTask(payload) {
  const { taskType, parameters } = payload
  
  // Simulate scheduled task execution
  const result = {
    taskType,
    parameters,
    executedAt: new Date().toISOString(),
    status: 'completed',
    backgroundExecution: true
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return result
}

// Execute monitoring task
async function executeMonitoring(payload) {
  const { targetUrl, checkType, parameters } = payload
  
  // Simulate monitoring check
  const result = {
    targetUrl,
    checkType,
    status: 'healthy',
    metrics: {
      responseTime: Math.random() * 1000,
      uptime: '99.9%',
      lastCheck: new Date().toISOString()
    },
    backgroundExecution: true
  }
  
  // Simulate monitoring time
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return result
}

// Process background tasks
async function processBackgroundTasks() {
  console.log('🔄 Processing background tasks...')
  
  try {
    const scheduledTasks = await getScheduledTasks()
    const now = new Date()
    
    // Find tasks that are ready to execute
    const readyTasks = scheduledTasks.filter(task => 
      new Date(task.scheduledFor) <= now && task.status === 'scheduled'
    )
    
    // Execute ready tasks
    for (const task of readyTasks) {
      await handleTaskExecution(task)
      
      // Remove from scheduled tasks
      const updatedTasks = scheduledTasks.filter(t => t.id !== task.id)
      await setScheduledTasks(updatedTasks)
    }
    
    console.log(`🔄 Processed ${readyTasks.length} background tasks`)
    
  } catch (error) {
    console.error('🔄 Error processing background tasks:', error)
  }
}

// Storage helpers
async function storeTaskResult(taskId, result) {
  const results = await getTaskResults()
  results[taskId] = {
    result,
    completedAt: new Date().toISOString()
  }
  await setTaskResults(results)
}

async function storeTaskError(taskId, error) {
  const errors = await getTaskErrors()
  errors[taskId] = {
    error,
    failedAt: new Date().toISOString()
  }
  await setTaskErrors(errors)
}

async function getScheduledTasks() {
  try {
    const data = await getFromStorage(TASK_QUEUE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

async function setScheduledTasks(tasks) {
  await setToStorage(TASK_QUEUE_KEY, JSON.stringify(tasks))
}

async function getTaskResults() {
  try {
    const data = await getFromStorage('task-results')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

async function setTaskResults(results) {
  await setToStorage('task-results', JSON.stringify(results))
}

async function getTaskErrors() {
  try {
    const data = await getFromStorage('task-errors')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

async function setTaskErrors(errors) {
  await setToStorage('task-errors', JSON.stringify(errors))
}

async function getAgentStatus() {
  try {
    const data = await getFromStorage(AGENT_STATE_KEY)
    return data ? JSON.parse(data) : { isRunning: false, tasksProcessed: 0 }
  } catch {
    return { isRunning: false, tasksProcessed: 0 }
  }
}

async function setAgentState(state) {
  await setToStorage(AGENT_STATE_KEY, JSON.stringify(state))
}

async function getAgentState() {
  try {
    const data = await getFromStorage(AGENT_STATE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

async function getAllTasks() {
  const scheduled = await getScheduledTasks()
  const results = await getTaskResults()
  const errors = await getTaskErrors()
  
  return {
    scheduled,
    results,
    errors
  }
}

// Generic storage helpers
async function getFromStorage(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('BackgroundAgentDB', 1)
    
    request.onerror = () => resolve(null)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['storage'], 'readonly')
      const store = transaction.objectStore('storage')
      const getRequest = store.get(key)
      
      getRequest.onsuccess = () => resolve(getRequest.result?.value || null)
      getRequest.onerror = () => resolve(null)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('storage')) {
        db.createObjectStore('storage', { keyPath: 'key' })
      }
    }
  })
}

async function setToStorage(key, value) {
  return new Promise((resolve) => {
    const request = indexedDB.open('BackgroundAgentDB', 1)
    
    request.onerror = () => resolve(false)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const putRequest = store.put({ key, value })
      
      putRequest.onsuccess = () => resolve(true)
      putRequest.onerror = () => resolve(false)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('storage')) {
        db.createObjectStore('storage', { keyPath: 'key' })
      }
    }
  })
}

console.log('🔄 Background Agent Service Worker loaded')
