import { Task, Model } from '@/types';

export interface CreateTaskData {
  description: string;
  model: Model;
  files?: FileWithBase64[];
}

export interface FileWithBase64 {
  name: string;
  base64: string;
  type: string;
  size: number;
}

export async function startTask(taskData: CreateTaskData): Promise<Task | null> {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

export async function getTasks(page = 1, limit = 10, status?: string[]): Promise<{ tasks: Task[]; total: number; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status.length > 0) {
      params.append('statuses', status.join(','));
    }

    const response = await fetch(`/api/tasks?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { tasks: [], total: 0, totalPages: 0 };
  }
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    const response = await fetch(`/api/tasks/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
}

export async function cancelTask(id: string): Promise<Task | null> {
  try {
    const response = await fetch(`/api/tasks/${id}/cancel`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel task: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling task:', error);
    return null;
  }
}

export async function takeOverTask(id: string): Promise<Task | null> {
  try {
    const response = await fetch(`/api/tasks/${id}/takeover`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to take over task: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error taking over task:', error);
    return null;
  }
}

export async function resumeTask(id: string): Promise<Task | null> {
  try {
    const response = await fetch(`/api/tasks/${id}/resume`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to resume task: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resuming task:', error);
    return null;
  }
}
