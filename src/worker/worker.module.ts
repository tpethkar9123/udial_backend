import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UserProcessor } from './worker.processor';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    LogsModule,
    BullModule.registerQueue({
      name: 'logs-queue',
    }),
  ],
  providers: [UserProcessor],
  exports: [BullModule],
})
export class WorkerModule {}
