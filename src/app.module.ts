import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { UploadsModule } from './uploads/uploads.module';
import { RedisModule } from './redis/redis.module';
import { S3Module } from './s3/s3.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkerModule } from './worker/worker.module';
import { LogsModule } from './logs/logs.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_URL ? new URL(process.env.REDIS_URL).hostname : 'localhost',
        port: process.env.REDIS_URL ? parseInt(new URL(process.env.REDIS_URL).port) : 6379,
        password: process.env.REDIS_URL ? new URL(process.env.REDIS_URL).password : undefined,
      },
    }),
    HealthModule,
    AuthModule,
    LeadsModule,
    UploadsModule,
    RedisModule,
    S3Module,
    PrismaModule,
    WorkerModule,
    LogsModule,
  ],
})
export class AppModule {}
