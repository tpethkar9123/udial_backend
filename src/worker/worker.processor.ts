import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AuditLogService } from '../logs/audit-log.service';

@Processor('logs-queue')
export class UserProcessor extends WorkerHost {
  private readonly logger = new Logger(UserProcessor.name);

  constructor(private readonly auditLogService: AuditLogService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Worker processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'log-action': {
        const { action, userId, details } = job.data;

        // Save log to the database
        const success = await this.auditLogService.createLog({
          action,
          method: details?.method,
          url: details?.url,
          statusCode: details?.statusCode,
          duration: details?.duration,
          ip: details?.ip,
          userAgent: details?.userAgent,
          details,
          userId: userId !== 'SYSTEM' ? userId : undefined,
        });

        if (success) {
          this.logger.log(
            `Audit log saved: User ${userId} performed ${action}. Details: ${JSON.stringify(details)}`,
          );
        }
        break;
      }
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }

    return { success: true };
  }
}
