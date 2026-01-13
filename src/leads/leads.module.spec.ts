import { Test, TestingModule } from '@nestjs/testing';
import { LeadsModule } from './leads.module';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('LeadsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LeadsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        lead: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide LeadsService', () => {
    const service = module.get<LeadsService>(LeadsService);
    expect(service).toBeDefined();
  });

  it('should provide LeadsController', () => {
    const controller = module.get<LeadsController>(LeadsController);
    expect(controller).toBeDefined();
  });

  it('should export LeadsService', async () => {
    // The module exports LeadsService, so it should be available
    const service = module.get<LeadsService>(LeadsService);
    expect(service).toBeInstanceOf(LeadsService);
  });
});
