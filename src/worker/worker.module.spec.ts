import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { WorkerModule } from './worker.module';
import { UserProcessor } from './worker.processor';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [WorkerModule],
    })
      .overrideProvider(getQueueToken('logs-queue'))
      .useValue({
        add: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        auditLog: {
          create: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      })
      .compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UserProcessor', () => {
    const processor = module.get<UserProcessor>(UserProcessor);
    expect(processor).toBeDefined();
  });

  it('should have LogsModule imported for AuditLogService', () => {
    const processor = module.get<UserProcessor>(UserProcessor);
    expect(processor).toBeInstanceOf(UserProcessor);
  });
});
