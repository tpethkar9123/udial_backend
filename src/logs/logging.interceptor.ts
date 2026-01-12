import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: (_data: any) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - start;

          // Push fine-grained log to worker
          this.logsService.logAction('HTTP_REQUEST', 'SYSTEM', {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            // Don't log sensitive body data, but you could log specific fields here
          }).catch(err => this.logger.error('Failed to queue log action', err));

          this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
        },
        error: (error: Error) => {
          const duration = Date.now() - start;
          this.logsService.logAction('HTTP_ERROR', 'SYSTEM', {
            method,
            url,
            error: error.message,
            duration: `${duration}ms`,
            ip,
          }).catch(err => this.logger.error('Failed to queue error log action', err));
        }
      }),
    );
  }
}
