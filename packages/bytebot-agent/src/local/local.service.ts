import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageContentBlock,
  MessageContentType,
  TextContentBlock,
  ToolUseContentBlock,
  ThinkingContentBlock,
  RedactedThinkingContentBlock,
  isUserActionContentBlock,
  isComputerToolUseContentBlock,
} from '@bytebot/shared';
import { Message, Role } from '@prisma/client';
import { localTools } from './local.tools';
import {
  BytebotAgentService,
  BytebotAgentInterrupt,
  BytebotAgentResponse,
} from '../agent/agent.types';

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

@Injectable()
export class LocalService implements BytebotAgentService {
  private readonly logger = new Logger(LocalService.name);
  private readonly ollamaUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
  }

  async generateMessage(
    systemPrompt: string,
    messages: Message[],
    model: string = 'llama3.2:latest',
    useTools: boolean = true,
    signal?: AbortSignal,
  ): Promise<BytebotAgentResponse> {
    try {
      const maxTokens = 8192;
      const tools = useTools ? localTools : undefined;

      // Convert messages to Ollama format
      const ollamaMessages = this.convertMessagesToOllamaFormat(messages, systemPrompt);

      const requestBody = {
        model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: maxTokens,
        },
        tools: tools ? Object.keys(tools).map(key => tools[key]) : undefined,
      };

      this.logger.debug(`Sending request to Ollama: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      
      this.logger.debug(`Received response from Ollama: ${JSON.stringify(data, null, 2)}`);

      // Parse the response content
      const contentBlocks = this.parseOllamaResponse(data.message.content, tools);

      // Calculate token usage (approximate)
      const tokenUsage = {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      };

      return {
        contentBlocks,
        tokenUsage,
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || signal?.aborted) {
        throw new BytebotAgentInterrupt('Request was aborted');
      }

      this.logger.error(`Error generating message with Ollama: ${error.message}`, error.stack);
      throw error;
    }
  }

  private convertMessagesToOllamaFormat(messages: Message[], systemPrompt: string): any[] {
    const ollamaMessages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    for (const message of messages) {
      const content = message.content as MessageContentBlock[];
      
      // Convert content blocks to text
      const textContent = content
        .map(block => {
          if (block.type === MessageContentType.Text) {
            return (block as TextContentBlock).text;
          } else if (block.type === MessageContentType.ToolResult) {
            return `[Tool Result: ${JSON.stringify(block)}]`;
          } else if (block.type === MessageContentType.ToolUse) {
            return `[Tool Use: ${JSON.stringify(block)}]`;
          }
          return '';
        })
        .join('\n');

      ollamaMessages.push({
        role: message.role === Role.USER ? 'user' : 'assistant',
        content: textContent,
      });
    }

    return ollamaMessages;
  }

  private parseOllamaResponse(content: string, tools?: Record<string, any>): MessageContentBlock[] {
    const blocks: MessageContentBlock[] = [];

    // Try to parse tool use from the content
    const toolUseRegex = /<tool_use id="([^"]+)" name="([^"]+)" input="([^"]+)"><\/tool_use>/g;
    let lastIndex = 0;
    let match;

    while ((match = toolUseRegex.exec(content)) !== null) {
      // Add text before tool use
      if (match.index > lastIndex) {
        const textContent = content.substring(lastIndex, match.index).trim();
        if (textContent) {
          blocks.push({
            type: MessageContentType.Text,
            text: textContent,
          });
        }
      }

      // Add tool use
      try {
        const toolInput = JSON.parse(match[3]);
        blocks.push({
          type: MessageContentType.ToolUse,
          id: match[1],
          name: match[2],
          input: toolInput,
        } as ToolUseContentBlock);
      } catch (error) {
        this.logger.warn(`Failed to parse tool input: ${match[3]}`);
        // Add as text if parsing fails
        blocks.push({
          type: MessageContentType.Text,
          text: `<tool_use id="${match[1]}" name="${match[2]}" input="${match[3]}"></tool_use>`,
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.substring(lastIndex).trim();
      if (textContent) {
        blocks.push({
          type: MessageContentType.Text,
          text: textContent,
        });
      }
    }

    // If no blocks were created, add the entire content as text
    if (blocks.length === 0) {
      blocks.push({
        type: MessageContentType.Text,
        text: content,
      });
    }

    return blocks;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      this.logger.error(`Error fetching available models: ${error.message}`);
      return [];
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      this.logger.log(`Pulling model: ${modelName}`);
      
      const response = await fetch(`${this.ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      // Stream the response to show progress
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data.status) {
                    this.logger.log(`Model pull status: ${data.status}`);
                  }
                } catch (e) {
                  // Ignore non-JSON lines
                }
              }
            }
          }
        }
      }

      this.logger.log(`Successfully pulled model: ${modelName}`);
    } catch (error) {
      this.logger.error(`Error pulling model ${modelName}: ${error.message}`);
      throw error;
    }
  }
}
