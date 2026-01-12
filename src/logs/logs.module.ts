import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LogsService } from './logs.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'logs-queue',
    }),
  ],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
