import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ModelManagementService } from './model-management.service';

@Controller('models')
export class ModelManagementController {
  constructor(private readonly modelManagementService: ModelManagementService) {}

  @Get()
  async getAvailableModels() {
    return await this.modelManagementService.getAvailableModels();
  }

  @Post('pull')
  async pullModel(@Body() body: { name: string }) {
    await this.modelManagementService.pullModel(body.name);
    return { message: `Model ${body.name} pulled successfully` };
  }

  @Delete(':name')
  async deleteModel(@Param('name') name: string) {
    await this.modelManagementService.deleteModel(name);
    return { message: `Model ${name} deleted successfully` };
  }

  @Get(':name')
  async getModelInfo(@Param('name') name: string) {
    return await this.modelManagementService.getModelInfo(name);
  }

  @Get('status/ollama')
  async isOllamaRunning() {
    const isRunning = await this.modelManagementService.isOllamaRunning();
    return { running: isRunning };
  }

  @Post('restart')
  async restartOllama() {
    await this.modelManagementService.restartOllama();
    return { message: 'Ollama restarted successfully' };
  }
}
