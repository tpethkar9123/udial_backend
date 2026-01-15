import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LogsService {
  constructor(@InjectQueue('logs-queue') private logsQueue: Queue) {}

  async logAction(action: string, userId: string, details: any) {
    return this.logsQueue.add('log-action', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
