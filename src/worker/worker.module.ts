import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UserProcessor } from './worker.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'logs-queue',
    }),
  ],
  providers: [UserProcessor],
  exports: [BullModule],
})
export class WorkerModule {}
