import { ToolUseContentBlock } from '@bytebot/shared';

export const localTools: Record<string, any> = {
  computer_use: {
    type: 'function',
    function: {
      name: 'computer_use',
      description: 'Execute a computer action like clicking, typing, or taking a screenshot',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: [
              'move_mouse',
              'trace_mouse', 
              'click_mouse',
              'press_mouse',
              'drag_mouse',
              'scroll',
              'type_keys',
              'press_keys',
              'type_text',
              'paste_text',
              'wait',
              'screenshot',
              'cursor_position',
              'application',
              'write_file',
              'read_file'
            ],
            description: 'The type of computer action to perform'
          },
          coordinates: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' }
            },
            description: 'Mouse coordinates for the action'
          },
          button: {
            type: 'string',
            enum: ['left', 'right', 'middle'],
            description: 'Mouse button to use'
          },
          text: {
            type: 'string',
            description: 'Text to type or paste'
          },
          keys: {
            type: 'array',
            items: { type: 'string' },
            description: 'Keys to press or type'
          },
          application: {
            type: 'string',
            enum: ['firefox', '1password', 'thunderbird', 'vscode', 'terminal', 'desktop', 'directory'],
            description: 'Application to launch or control'
          },
          path: {
            type: 'string',
            description: 'File path for read/write operations'
          },
          data: {
            type: 'string',
            description: 'Base64 encoded data for file write operations'
          },
          duration: {
            type: 'number',
            description: 'Duration in milliseconds for wait actions'
          },
          delay: {
            type: 'number',
            description: 'Delay in milliseconds between keystrokes'
          },
          scrollCount: {
            type: 'number',
            description: 'Number of scroll actions to perform'
          },
          direction: {
            type: 'string',
            enum: ['up', 'down', 'left', 'right'],
            description: 'Direction for scroll actions'
          },
          clickCount: {
            type: 'number',
            description: 'Number of clicks to perform'
          },
          press: {
            type: 'string',
            enum: ['up', 'down'],
            description: 'Whether to press or release a key/button'
          },
          holdKeys: {
            type: 'array',
            items: { type: 'string' },
            description: 'Keys to hold while performing the action'
          },
          sensitive: {
            type: 'boolean',
            description: 'Whether the text contains sensitive information'
          }
        },
        required: ['action']
      }
    }
  },
  set_task_status: {
    type: 'function',
    function: {
      name: 'set_task_status',
      description: 'Set the status of the current task',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['completed', 'needs_help', 'failed'],
            description: 'The new status for the task'
          },
          description: {
            type: 'string',
            description: 'Description of why the status is being set'
          }
        },
        required: ['status', 'description']
      }
    }
  },
  create_task: {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task',
      parameters: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Description of the task to create'
          },
          type: {
            type: 'string',
            enum: ['immediate', 'scheduled'],
            description: 'Type of task'
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority of the task'
          },
          scheduledFor: {
            type: 'string',
            format: 'date-time',
            description: 'When to schedule the task (ISO 8601 format)'
          }
        },
        required: ['description']
      }
    }
  }
};
