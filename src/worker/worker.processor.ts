import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('logs-queue')
export class UserProcessor extends WorkerHost {
  private readonly logger = new Logger(UserProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Worker processing job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'log-action': {
        const { action, userId, details } = job.data;
        // Here you would do "really fine logging" - e.g. saving to a DB or external service
        this.logger.log(`FINE LOG: User ${userId} performed ${action}. Details: ${JSON.stringify(details)}`);
        break;
      }
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }

    return { success: true };
  }
}
