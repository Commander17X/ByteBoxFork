export interface Model {
  provider: string;
  name: string;
  title: string;
  contextWindow?: number;
}

export interface Task {
  id: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'NEEDS_HELP' | 'NEEDS_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
  model: Model;
  messages?: Message[];
  files?: File[];
}

export interface Message {
  id: string;
  content: any;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
  updatedAt: string;
  taskId: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
}
