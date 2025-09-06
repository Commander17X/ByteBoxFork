import { Module } from '@nestjs/common';
import { ModelManagementService } from './model-management.service';
import { ModelManagementController } from './model-management.controller';

@Module({
  controllers: [ModelManagementController],
  providers: [ModelManagementService],
  exports: [ModelManagementService],
})
export class ModelManagementModule {}
