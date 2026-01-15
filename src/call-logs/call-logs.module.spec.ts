import { Test, TestingModule } from '@nestjs/testing';
import { CallLogsModule } from './call-logs.module';
import { CallLogsService } from './call-logs.service';
import { CallLogsController } from './call-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

describe('CallLogsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CallLogsModule, PrismaModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide CallLogsService', () => {
    const service = module.get<CallLogsService>(CallLogsService);
    expect(service).toBeDefined();
  });

  it('should provide CallLogsController', () => {
    const controller = module.get<CallLogsController>(CallLogsController);
    expect(controller).toBeDefined();
  });
});
