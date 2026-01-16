import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { LogsService } from './logs.service';
import { AuditLogService } from './audit-log.service';
import { LogCleanupService } from './log-cleanup.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'logs-queue',
    }),
  ],
  providers: [LogsService, AuditLogService, LogCleanupService],
  exports: [LogsService, AuditLogService],
})
export class LogsModule {}
