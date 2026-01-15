import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { CallLogsService } from './../src/call-logs/call-logs.service';
import { CallType, SimProvider } from '@prisma/client';

/**
 * Call Logs Integration Tests
 *
 * These tests use REAL PostgreSQL database connections to verify:
 * - CRUD operations for call logs
 * - Filtering and pagination
 * - Search functionality
 * - Statistics calculation
 *
 * Prerequisites:
 * - DATABASE_URL set in .env
 * - REDIS_URL set in .env
 * - Database must be running and accessible
 */
describe('CallLogs Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let callLogsService: CallLogsService;
  const testPrefix = 'test-call-logs-e2e';
  let createdCallLogId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    callLogsService = app.get<CallLogsService>(CallLogsService);
  });

  afterAll(async () => {
    // Cleanup all test call logs
    if (prisma && prisma.callLog) {
      try {
        await prisma.callLog.deleteMany({
          where: { name: { contains: testPrefix } },
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

  describe('CallLogsService - Create Operations', () => {
    it('should create a call log with all fields', async () => {
      const callLogData = {
        name: `${testPrefix}-full`,
        phoneNumber: '+91 99999 11111',
        callType: CallType.INCOMING,
        duration: 300,
        simProvider: SimProvider.VI,
        userEmail: 'admin@unite.com',
        notes: 'Test incoming call',
      };

      const callLog = await callLogsService.create(callLogData);
      createdCallLogId = callLog.id;

      expect(callLog).toBeDefined();
      expect(callLog.id).toBeDefined();
      expect(callLog.name).toBe(callLogData.name);
      expect(callLog.callType).toBe(CallType.INCOMING);
      expect(callLog.duration).toBe(300);
      expect(callLog.simProvider).toBe(SimProvider.VI);
    });

    it('should create a call log with minimal fields', async () => {
      const callLog = await callLogsService.create({
        name: `${testPrefix}-minimal`,
        phoneNumber: '+91 88888 22222',
        callType: CallType.OUTGOING,
        userEmail: 'support@unite.com',
      });

      expect(callLog.duration).toBe(0);
      expect(callLog.simProvider).toBe(SimProvider.OTHER);
    });

    it('should create call logs with all CallType values', async () => {
      const callTypes = [
        CallType.INCOMING,
        CallType.OUTGOING,
        CallType.MISSED,
        CallType.UNANSWERED,
      ];

      for (const callType of callTypes) {
        const callLog = await callLogsService.create({
          name: `${testPrefix}-type-${callType}`,
          phoneNumber: '+91 77777 33333',
          callType,
          userEmail: 'test@unite.com',
        });
        expect(callLog.callType).toBe(callType);
      }
    });

    it('should create call logs with all SimProvider values', async () => {
      const providers = [
        SimProvider.VI,
        SimProvider.JIO,
        SimProvider.AIRTEL,
        SimProvider.BSNL,
        SimProvider.OTHER,
      ];

      for (const simProvider of providers) {
        const callLog = await callLogsService.create({
          name: `${testPrefix}-sim-${simProvider}`,
          phoneNumber: '+91 66666 44444',
          callType: CallType.INCOMING,
          simProvider,
          userEmail: 'test@unite.com',
        });
        expect(callLog.simProvider).toBe(simProvider);
      }
    });
  });

  describe('CallLogsService - Read Operations', () => {
    beforeAll(async () => {
      // Create additional test data for read operations
      for (let i = 0; i < 5; i++) {
        await callLogsService.create({
          name: `${testPrefix}-read-${i}`,
          phoneNumber: `+91 55555 ${10000 + i}`,
          callType: i % 2 === 0 ? CallType.INCOMING : CallType.OUTGOING,
          duration: i * 60,
          simProvider: SimProvider.JIO,
          userEmail: 'read-test@unite.com',
        });
      }
    });

    it('should find a call log by ID', async () => {
      const callLog = await callLogsService.findOne(createdCallLogId);

      expect(callLog).toBeDefined();
      expect(callLog.id).toBe(createdCallLogId);
    });

    it('should return paginated results', async () => {
      const result = await callLogsService.findAll({
        page: 1,
        limit: 5,
      });

      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should filter by callType', async () => {
      const result = await callLogsService.findAll({
        callType: CallType.INCOMING,
      });

      expect(result.data.every((log) => log.callType === CallType.INCOMING)).toBe(true);
    });

    it('should filter by simProvider', async () => {
      const result = await callLogsService.findAll({
        simProvider: SimProvider.JIO,
      });

      expect(result.data.every((log) => log.simProvider === SimProvider.JIO)).toBe(true);
    });

    it('should filter by userEmail', async () => {
      const result = await callLogsService.findAll({
        userEmail: 'read-test@unite.com',
      });

      expect(result.data.every((log) => log.userEmail === 'read-test@unite.com')).toBe(true);
    });

    it('should search by name', async () => {
      const result = await callLogsService.findAll({
        search: testPrefix,
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((log) => log.name.includes(testPrefix))).toBe(true);
    });

    it('should return stats with all call type counts', async () => {
      const result = await callLogsService.findAll({});

      expect(result.stats).toBeDefined();
      expect(result.stats.total).toBeGreaterThanOrEqual(0);
      expect(result.stats.incoming).toBeDefined();
      expect(result.stats.outgoing).toBeDefined();
      expect(result.stats.missed).toBeDefined();
      expect(result.stats.unanswered).toBeDefined();
    });

    it('should order by callTime descending by default', async () => {
      const result = await callLogsService.findAll({ limit: 10 });

      for (let i = 0; i < result.data.length - 1; i++) {
        const current = new Date(result.data[i].callTime).getTime();
        const next = new Date(result.data[i + 1].callTime).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('CallLogsService - Update Operations', () => {
    let updateTestId: string;

    beforeAll(async () => {
      const callLog = await callLogsService.create({
        name: `${testPrefix}-update-test`,
        phoneNumber: '+91 44444 55555',
        callType: CallType.MISSED,
        userEmail: 'update@unite.com',
      });
      updateTestId = callLog.id;
    });

    it('should update call log name', async () => {
      const updated = await callLogsService.update(updateTestId, {
        name: `${testPrefix}-updated-name`,
      });

      expect(updated.name).toBe(`${testPrefix}-updated-name`);
    });

    it('should update call log callType', async () => {
      const updated = await callLogsService.update(updateTestId, {
        callType: CallType.INCOMING,
      });

      expect(updated.callType).toBe(CallType.INCOMING);
    });

    it('should update call log duration', async () => {
      const updated = await callLogsService.update(updateTestId, {
        duration: 500,
      });

      expect(updated.duration).toBe(500);
    });

    it('should update multiple fields at once', async () => {
      const updated = await callLogsService.update(updateTestId, {
        simProvider: SimProvider.AIRTEL,
        notes: 'Updated notes',
      });

      expect(updated.simProvider).toBe(SimProvider.AIRTEL);
      expect(updated.notes).toBe('Updated notes');
    });
  });

  describe('CallLogsService - Delete Operations', () => {
    let deleteTestId: string;

    beforeEach(async () => {
      const callLog = await callLogsService.create({
        name: `${testPrefix}-delete-test`,
        phoneNumber: '+91 33333 66666',
        callType: CallType.UNANSWERED,
        userEmail: 'delete@unite.com',
      });
      deleteTestId = callLog.id;
    });

    it('should delete a call log', async () => {
      const deleted = await callLogsService.delete(deleteTestId);

      expect(deleted.id).toBe(deleteTestId);

      await expect(callLogsService.findOne(deleteTestId)).rejects.toThrow('not found');
    });

    it('should throw error when deleting non-existent call log', async () => {
      await expect(callLogsService.delete('non-existent-id')).rejects.toThrow('not found');
    });
  });

  describe('CallLogsService - Bulk Operations', () => {
    it('should bulk delete multiple call logs', async () => {
      // Create multiple call logs
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        const callLog = await callLogsService.create({
          name: `${testPrefix}-bulk-${i}`,
          phoneNumber: `+91 22222 ${70000 + i}`,
          callType: CallType.OUTGOING,
          userEmail: 'bulk@unite.com',
        });
        ids.push(callLog.id);
      }

      const result = await callLogsService.bulkDelete(ids);

      expect(result.deleted).toBe(3);
    });
  });

  describe('CallLogsService - findByUserEmail', () => {
    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        await callLogsService.create({
          name: `${testPrefix}-user-${i}`,
          phoneNumber: `+91 11111 ${80000 + i}`,
          callType: CallType.INCOMING,
          userEmail: 'specific-user@unite.com',
        });
      }
    });

    it('should return call logs for a specific user', async () => {
      const result = await callLogsService.findByUserEmail('specific-user@unite.com');

      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every((log) => log.userEmail === 'specific-user@unite.com')).toBe(true);
    });
  });

  describe('Prisma Direct Operations', () => {
    it('should perform complex queries on call logs', async () => {
      const longCalls = await prisma.callLog.findMany({
        where: {
          name: { contains: testPrefix },
          duration: { gte: 120 },
        },
      });

      expect(longCalls.every((log) => log.duration >= 120)).toBe(true);
    });

    it('should count call logs by callType', async () => {
      const incomingCount = await prisma.callLog.count({
        where: {
          name: { contains: testPrefix },
          callType: CallType.INCOMING,
        },
      });

      expect(incomingCount).toBeGreaterThanOrEqual(1);
    });

    it('should group call logs by simProvider', async () => {
      const grouped = await prisma.callLog.groupBy({
        by: ['simProvider'],
        where: { name: { contains: testPrefix } },
        _count: true,
      });

      expect(grouped.length).toBeGreaterThan(0);
    });
  });
});
