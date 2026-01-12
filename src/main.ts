import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loggerConfig } from './logger.config';
import { LoggingInterceptor } from './logs/logging.interceptor';
import { LogsService } from './logs/logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  const logsService = app.get(LogsService);
  app.useGlobalInterceptors(new LoggingInterceptor(logsService));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(3000);
}
bootstrap();
