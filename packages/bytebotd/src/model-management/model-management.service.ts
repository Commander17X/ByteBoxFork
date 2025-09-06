import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ModelManagementService {
  private readonly logger = new Logger(ModelManagementService.name);
  private readonly ollamaUrl = 'http://localhost:11434';

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

  async deleteModel(modelName: string): Promise<void> {
    try {
      this.logger.log(`Deleting model: ${modelName}`);
      
      const response = await fetch(`${this.ollamaUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete model: ${response.status}`);
      }

      this.logger.log(`Successfully deleted model: ${modelName}`);
    } catch (error) {
      this.logger.error(`Error deleting model ${modelName}: ${error.message}`);
      throw error;
    }
  }

  async getModelInfo(modelName: string): Promise<any> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get model info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error getting model info for ${modelName}: ${error.message}`);
      throw error;
    }
  }

  async isOllamaRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async restartOllama(): Promise<void> {
    try {
      this.logger.log('Restarting Ollama service');
      await execAsync('sudo systemctl restart ollama');
      this.logger.log('Ollama service restarted');
    } catch (error) {
      this.logger.error(`Error restarting Ollama: ${error.message}`);
      throw error;
    }
  }
}
