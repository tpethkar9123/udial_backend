import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LogsService } from './logs.service';
import { AuditLogService } from './audit-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'logs-queue',
    }),
  ],
  providers: [LogsService, AuditLogService],
  exports: [LogsService, AuditLogService],
})
export class LogsModule {}
