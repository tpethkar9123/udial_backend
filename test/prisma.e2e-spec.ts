import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Prisma Integration Tests - Lead CRUD Operations
 * 
 * These tests use a REAL PostgreSQL database connection to verify:
 * - Database connectivity
 * - Lead CRUD operations
 * - Enum value handling
 * - Prisma query operations
 * 
 * Prerequisites:
 * - DATABASE_URL set in .env
 * - Database must be running and accessible
 * - Prisma migrations must be applied
 */
describe('Lead CRUD Operations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testPrefix = 'test-prisma-e2e';
  let createdLeadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup all test leads
    if (prisma && prisma.lead) {
      try {
        await prisma.lead.deleteMany({
          where: { leadName: { contains: testPrefix } },
        });
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }
    if (app) {
      await app.close();
    }
  });

  describe('Database Connectivity', () => {
    it('should connect to the database', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });
  });

  describe('Comprehensive CRUD', () => {
    it('should create a lead with all fields and enums', async () => {
      const leadData = {
        leadName: `${testPrefix}-full-${Date.now()}`,
        institution: 'Delhi Public School',
        phoneNumber: '9876543210',
        city: 'Delhi',
        priority: 'HIGH' as const,
        stage: 'DEMO_BOOKED' as const,
        owner: 'Ananya Sharma',
        source: 'REFERRAL' as const,
        status: 'CONNECTED' as const,
      };

      const lead = await prisma.lead.create({ data: leadData });
      createdLeadId = lead.id;

      expect(lead.leadName).toBe(leadData.leadName);
      expect(lead.institution).toBe('Delhi Public School');
      expect(lead.priority).toBe('HIGH');
      expect(lead.stage).toBe('DEMO_BOOKED');
      expect(lead.status).toBe('CONNECTED');
      expect(lead.source).toBe('REFERRAL');
    });

    it('should find the created lead', async () => {
      const lead = await prisma.lead.findUnique({
        where: { id: createdLeadId },
      });
      expect(lead).toBeDefined();
      expect(lead?.leadName).toContain(testPrefix);
    });

    it('should update multiple fields', async () => {
      const updated = await prisma.lead.update({
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
      const leads = await prisma.lead.findMany({
        where: { leadName: { contains: testPrefix } },
      });
      expect(leads.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete the lead', async () => {
      const deleted = await prisma.lead.delete({
        where: { id: createdLeadId },
      });
      expect(deleted.id).toBe(createdLeadId);

      const found = await prisma.lead.findUnique({
        where: { id: createdLeadId },
      });
      expect(found).toBeNull();
    });
  });

  describe('Enum Values', () => {
    it('should accept all Priority enum values', async () => {
      const priorities = ['HIGH', 'MEDIUM', 'LOW'] as const;
      
      for (const priority of priorities) {
        const lead = await prisma.lead.create({
          data: {
            leadName: `${testPrefix}-priority-${priority}-${Date.now()}`,
            priority,
          },
        });
        expect(lead.priority).toBe(priority);
      }
    });

    it('should accept all LeadStage enum values', async () => {
      const stages = ['CALL_DONE', 'FOLLOWUP_DONE', 'DEMO_BOOKED', 'NEGOTIATION', 'FUTURE_CONNECT'] as const;
      
      for (const stage of stages) {
        const lead = await prisma.lead.create({
          data: {
            leadName: `${testPrefix}-stage-${stage}-${Date.now()}`,
            stage,
          },
        });
        expect(lead.stage).toBe(stage);
      }
    });

    it('should accept all LeadStatus enum values', async () => {
      const statuses = ['NEW', 'CONNECTED', 'DEMO_DONE', 'CLOSED_WON', 'LOST', 'FOLLOW_UP'] as const;
      
      for (const status of statuses) {
        const lead = await prisma.lead.create({
          data: {
            leadName: `${testPrefix}-status-${status}-${Date.now()}`,
            status,
          },
        });
        expect(lead.status).toBe(status);
      }
    });

    it('should accept all LeadSource enum values', async () => {
      const sources = ['WEBSITE', 'REFERRAL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA'] as const;
      
      for (const source of sources) {
        const lead = await prisma.lead.create({
          data: {
            leadName: `${testPrefix}-source-${source}-${Date.now()}`,
            source,
          },
        });
        expect(lead.source).toBe(source);
      }
    });
  });

  describe('Default Values', () => {
    it('should apply default enum values', async () => {
      const lead = await prisma.lead.create({
        data: {
          leadName: `${testPrefix}-defaults-${Date.now()}`,
        },
      });

      expect(lead.priority).toBe('MEDIUM');
      expect(lead.stage).toBe('CALL_DONE');
      expect(lead.status).toBe('NEW');
      expect(lead.source).toBe('WEBSITE');
    });
  });

  describe('Query Operations', () => {
    beforeAll(async () => {
      // Create test data for query operations
      await prisma.lead.createMany({
        data: [
          { leadName: `${testPrefix}-query-1`, city: 'Mumbai', priority: 'HIGH' },
          { leadName: `${testPrefix}-query-2`, city: 'Mumbai', priority: 'LOW' },
          { leadName: `${testPrefix}-query-3`, city: 'Delhi', priority: 'HIGH' },
        ],
      });
    });

    it('should filter by city', async () => {
      const leads = await prisma.lead.findMany({
        where: {
          leadName: { contains: `${testPrefix}-query` },
          city: 'Mumbai',
        },
      });
      expect(leads.length).toBe(2);
      expect(leads.every(l => l.city === 'Mumbai')).toBe(true);
    });

    it('should filter by priority', async () => {
      const leads = await prisma.lead.findMany({
        where: {
          leadName: { contains: `${testPrefix}-query` },
          priority: 'HIGH',
        },
      });
      expect(leads.length).toBe(2);
      expect(leads.every(l => l.priority === 'HIGH')).toBe(true);
    });

    it('should count leads by criteria', async () => {
      const count = await prisma.lead.count({
        where: {
          leadName: { contains: `${testPrefix}-query` },
        },
      });
      expect(count).toBe(3);
    });

    it('should order by createdAt', async () => {
      const leads = await prisma.lead.findMany({
        where: { leadName: { contains: testPrefix } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      
      for (let i = 0; i < leads.length - 1; i++) {
        expect(new Date(leads[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(leads[i + 1].createdAt).getTime()
        );
      }
    });
  });
});
