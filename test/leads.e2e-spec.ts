import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { LeadsService } from './../src/leads/leads.service';

describe('Leads Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let leadsService: LeadsService;
  const testPrefix = 'test-leads-e2e';
  let createdLeadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    leadsService = app.get<LeadsService>(LeadsService);
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

  describe('LeadsService - Direct Database Operations', () => {
    it('should create a lead with all fields', async () => {
      const leadData = {
        leadName: `${testPrefix}-full-${Date.now()}`,
        institution: 'Test School',
        phoneNumber: '9876543210',
        city: 'Mumbai',
        priority: 'HIGH' as const,
        stage: 'DEMO_BOOKED' as const,
        owner: 'Test Owner',
        source: 'REFERRAL' as const,
        status: 'CONNECTED' as const,
      };

      const lead = await leadsService.create(leadData);
      createdLeadId = lead.id;

      expect(lead).toBeDefined();
      expect(lead.id).toBeDefined();
      expect(lead.leadName).toBe(leadData.leadName);
      expect(lead.institution).toBe('Test School');
      expect(lead.priority).toBe('HIGH');
      expect(lead.stage).toBe('DEMO_BOOKED');
      expect(lead.status).toBe('CONNECTED');
      expect(lead.source).toBe('REFERRAL');
    });

    it('should find a lead by ID', async () => {
      const lead = await leadsService.findOne(createdLeadId);

      expect(lead).toBeDefined();
      expect(lead.id).toBe(createdLeadId);
      expect(lead.leadName).toContain(testPrefix);
    });

    it('should update a lead', async () => {
      const updateData = {
        city: 'Delhi',
        priority: 'LOW' as const,
        status: 'DEMO_DONE' as const,
      };

      const updated = await leadsService.update(createdLeadId, updateData);

      expect(updated.city).toBe('Delhi');
      expect(updated.priority).toBe('LOW');
      expect(updated.status).toBe('DEMO_DONE');
    });

    it('should find all leads', async () => {
      const result = await leadsService.findAll();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete a lead', async () => {
      const deleted = await leadsService.delete(createdLeadId);

      expect(deleted.id).toBe(createdLeadId);

      // Verify lead is deleted
      await expect(leadsService.findOne(createdLeadId)).rejects.toThrow('not found');
    });

    it('should throw NotFoundException for non-existent lead', async () => {
      await expect(leadsService.findOne('non-existent-id')).rejects.toThrow('not found');
    });
  });

  describe('LeadsService - Enum Validation', () => {
    it('should create leads with all Priority values', async () => {
      const priorities = ['HIGH', 'MEDIUM', 'LOW'] as const;

      for (const priority of priorities) {
        const lead = await leadsService.create({
          leadName: `${testPrefix}-priority-${priority}-${Date.now()}`,
          priority,
        });
        expect(lead.priority).toBe(priority);
      }
    });

    it('should create leads with all LeadStage values', async () => {
      const stages = [
        'CALL_DONE',
        'FOLLOWUP_DONE',
        'DEMO_BOOKED',
        'NEGOTIATION',
        'FUTURE_CONNECT',
      ] as const;

      for (const stage of stages) {
        const lead = await leadsService.create({
          leadName: `${testPrefix}-stage-${stage}-${Date.now()}`,
          stage,
        });
        expect(lead.stage).toBe(stage);
      }
    });

    it('should create leads with all LeadStatus values', async () => {
      const statuses = [
        'NEW',
        'CONNECTED',
        'DEMO_DONE',
        'CLOSED_WON',
        'LOST',
        'FOLLOW_UP',
      ] as const;

      for (const status of statuses) {
        const lead = await leadsService.create({
          leadName: `${testPrefix}-status-${status}-${Date.now()}`,
          status,
        });
        expect(lead.status).toBe(status);
      }
    });

    it('should create leads with all LeadSource values', async () => {
      const sources = ['WEBSITE', 'REFERRAL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA'] as const;

      for (const source of sources) {
        const lead = await leadsService.create({
          leadName: `${testPrefix}-source-${source}-${Date.now()}`,
          source,
        });
        expect(lead.source).toBe(source);
      }
    });
  });

  describe('LeadsService - Default Values', () => {
    it('should apply default values when creating a lead with minimal data', async () => {
      const lead = await leadsService.create({
        leadName: `${testPrefix}-defaults-${Date.now()}`,
      });

      expect(lead.priority).toBe('MEDIUM');
      expect(lead.stage).toBe('CALL_DONE');
      expect(lead.status).toBe('NEW');
      expect(lead.source).toBe('WEBSITE');
    });
  });

  describe('LeadsService - Bulk Operations', () => {
    it('should create and list multiple leads', async () => {
      const count = 5;
      const createdIds: string[] = [];

      for (let i = 0; i < count; i++) {
        const lead = await leadsService.create({
          leadName: `${testPrefix}-bulk-${i}-${Date.now()}`,
          city: `City${i}`,
        });
        createdIds.push(lead.id);
      }

      const result = await leadsService.findAll();
      const testLeads = result.data.filter((l: any) => l.leadName.includes(`${testPrefix}-bulk`));

      expect(testLeads.length).toBeGreaterThanOrEqual(count);
    });
  });

  describe('LeadsService - Update Partial Fields', () => {
    let updateTestLeadId: string;

    beforeAll(async () => {
      const lead = await leadsService.create({
        leadName: `${testPrefix}-update-test-${Date.now()}`,
        city: 'Original City',
        institution: 'Original Institution',
        phoneNumber: '1234567890',
      });
      updateTestLeadId = lead.id;
    });

    it('should update only the leadName', async () => {
      const newName = `${testPrefix}-updated-name-${Date.now()}`;
      const updated = await leadsService.update(updateTestLeadId, { leadName: newName });

      expect(updated.leadName).toBe(newName);
      expect(updated.city).toBe('Original City'); // Unchanged
      expect(updated.institution).toBe('Original Institution'); // Unchanged
    });

    it('should update multiple fields at once', async () => {
      const updated = await leadsService.update(updateTestLeadId, {
        city: 'Updated City',
        institution: 'Updated Institution',
        priority: 'HIGH',
      });

      expect(updated.city).toBe('Updated City');
      expect(updated.institution).toBe('Updated Institution');
      expect(updated.priority).toBe('HIGH');
    });
  });

  describe('Prisma Direct Operations', () => {
    it('should perform complex queries using Prisma directly', async () => {
      // Create test data
      await leadsService.create({
        leadName: `${testPrefix}-query-high-${Date.now()}`,
        priority: 'HIGH',
        city: 'TestCity',
      });

      await leadsService.create({
        leadName: `${testPrefix}-query-low-${Date.now()}`,
        priority: 'LOW',
        city: 'TestCity',
      });

      // Direct Prisma query
      const highPriorityLeads = await prisma.lead.findMany({
        where: {
          leadName: { contains: testPrefix },
          priority: 'HIGH',
        },
      });

      expect(highPriorityLeads.length).toBeGreaterThanOrEqual(1);
      expect(highPriorityLeads.every((l) => l.priority === 'HIGH')).toBe(true);
    });

    it('should count leads by city', async () => {
      const count = await prisma.lead.count({
        where: {
          leadName: { contains: testPrefix },
          city: 'TestCity',
        },
      });

      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
