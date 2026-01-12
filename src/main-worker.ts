import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('WorkerBootstrap');
  
  logger.log('Worker is running and listening for jobs...');
  
  // This process will stay alive as long as the BullMQ workers are active
}
bootstrap();
