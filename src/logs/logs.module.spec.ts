import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { LogsModule } from './logs.module';
import { LogsService } from './logs.service';

describe('LogsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LogsModule],
    })
      .overrideProvider(getQueueToken('logs-queue'))
      .useValue({
        add: jest.fn(),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide LogsService', () => {
    const service = module.get<LogsService>(LogsService);
    expect(service).toBeDefined();
  });

  it('should export LogsService', () => {
    const service = module.get<LogsService>(LogsService);
    expect(service).toBeInstanceOf(LogsService);
  });
});
