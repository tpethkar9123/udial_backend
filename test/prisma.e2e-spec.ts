import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { RedisService } from './../src/redis/redis.service';
import { UserProcessor } from './../src/worker/worker.processor';
import { getQueueToken } from '@nestjs/bullmq';

describe('Lead CRUD Operations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testPrefix = 'test-prisma-e2e';
  let createdLeadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('logs-queue'))
      .useValue({ add: jest.fn().mockResolvedValue({}) })
      .overrideProvider('BullQueue_default')
      .useValue({ add: jest.fn().mockResolvedValue({}) })
      .overrideProvider(RedisService)
      .useValue({ get: jest.fn(), set: jest.fn() })
      .overrideProvider(UserProcessor)
      .useValue({ process: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (prisma && prisma.lead) {
      try {
        await (prisma.lead as any).deleteMany({
          where: { leadName: { contains: testPrefix } },
        });
      } catch (e) {}
    }
    if (app) {
      await app.close();
    }
  });

  describe('Comprehensive CRUD', () => {
    it('should create a lead with all fields and enums', async () => {
      const leadData = {
        leadName: `${testPrefix}-full-${Date.now()}`,
        institution: 'Delhi Public School',
        phoneNumber: '9876543210',
        city: 'Delhi',
        priority: 'HIGH',
        stage: 'DEMO_BOOKED',
        owner: 'Ananya Sharma',
        source: 'REFERRAL',
        status: 'CONNECTED',
      };

      const lead = await (prisma.lead as any).create({ data: leadData });
      createdLeadId = lead.id;

      expect(lead.leadName).toBe(leadData.leadName);
      expect(lead.priority).toBe('HIGH');
      expect(lead.stage).toBe('DEMO_BOOKED');
      expect(lead.status).toBe('CONNECTED');
    });

    it('should find the created lead', async () => {
      const lead = await (prisma.lead as any).findUnique({
        where: { id: createdLeadId },
      });
      expect(lead).toBeDefined();
      expect(lead.leadName).toContain(testPrefix);
    });

    it('should update multiple fields', async () => {
      const updated = await (prisma.lead as any).update({
        where: { id: createdLeadId },
        data: {
          city: 'Mumbai',
          priority: 'LOW',
          status: 'DEMO_DONE',
        },
      });
      expect(updated.city).toBe('Mumbai');
      expect(updated.priority).toBe('LOW');
      expect(updated.status).toBe('DEMO_DONE');
    });

    it('should list all test leads', async () => {
      const leads = await (prisma.lead as any).findMany({
        where: { leadName: { contains: testPrefix } },
      });
      expect(leads.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete the lead', async () => {
      const deleted = await (prisma.lead as any).delete({
        where: { id: createdLeadId },
      });
      expect(deleted.id).toBe(createdLeadId);

      const found = await (prisma.lead as any).findUnique({
        where: { id: createdLeadId },
      });
      expect(found).toBeNull();
    });
  });
});
