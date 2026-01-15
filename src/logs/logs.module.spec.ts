import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { LogsModule } from './logs.module';
import { LogsService } from './logs.service';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

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

  it('should provide LogsService', () => {
    const service = module.get<LogsService>(LogsService);
    expect(service).toBeDefined();
  });

  it('should export LogsService', () => {
    const service = module.get<LogsService>(LogsService);
    expect(service).toBeInstanceOf(LogsService);
  });

  it('should provide AuditLogService', () => {
    const service = module.get<AuditLogService>(AuditLogService);
    expect(service).toBeDefined();
  });

  it('should export AuditLogService', () => {
    const service = module.get<AuditLogService>(AuditLogService);
    expect(service).toBeInstanceOf(AuditLogService);
  });
});
