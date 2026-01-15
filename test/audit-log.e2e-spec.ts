import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuditLogService } from './../src/logs/audit-log.service';
import { RedisService } from './../src/redis/redis.service';

/**
 * Audit Log Integration Tests
 * 
 * These tests use REAL connections to:
 * - PostgreSQL database (via Prisma)
 * - Redis (for connectivity verification)
 * 
 * Prerequisites:
 * - DATABASE_URL set in .env
 * - REDIS_URL set in .env
 * - Database must be running and accessible
 */
describe('AuditLog Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auditLogService: AuditLogService;
  let redisService: RedisService;
  const testPrefix = 'test-audit-e2e';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    auditLogService = app.get<AuditLogService>(AuditLogService);
    redisService = app.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    // Cleanup test audit logs
    if (prisma && prisma.auditLog) {
      try {
        await prisma.auditLog.deleteMany({
          where: { action: { contains: testPrefix } },
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
    it('should connect to PostgreSQL database', async () => {
      // Verify Prisma can query the database
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });
  });

  describe('Redis Connectivity', () => {
    it('should connect to Redis and perform operations', async () => {
      const key = `${testPrefix}:ping`;
      const val = 'pong';
      await redisService.set(key, val, 10);
      const result = await redisService.get(key);
      expect(result).toBe(val);
    });
  });

  describe('AuditLogService - Create Operations', () => {
    it('should create an audit log with all fields', async () => {
      const action = `${testPrefix}-FULL`;
      const logData = {
        action,
        method: 'POST',
        url: '/api/test',
        statusCode: 201,
        duration: '100ms',
        ip: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
        details: { foo: 'bar', nested: { key: 'value' } },
      };

      await auditLogService.createLog(logData);

      const logs = await auditLogService.findAll({ action });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].action).toBe(action);
      expect(logs[0].method).toBe('POST');
      expect(logs[0].url).toBe('/api/test');
      expect(logs[0].statusCode).toBe(201);
      expect(logs[0].duration).toBe('100ms');
      expect(logs[0].ip).toBe('192.168.1.1');
      expect(logs[0].userAgent).toBe('TestAgent/1.0');
      expect(logs[0].details).toEqual({ foo: 'bar', nested: { key: 'value' } });
    });

    it('should create an audit log with minimal fields', async () => {
      const action = `${testPrefix}-MINIMAL`;

      await auditLogService.createLog({ action });

      const logs = await auditLogService.findAll({ action });
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe(action);
      expect(logs[0].method).toBeNull();
      expect(logs[0].url).toBeNull();
    });

    it('should handle JSON details correctly', async () => {
      const action = `${testPrefix}-JSON`;
      const complexDetails = {
        array: [1, 2, 3],
        object: { nested: { deep: true } },
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
      };

      await auditLogService.createLog({ action, details: complexDetails });

      const logs = await auditLogService.findAll({ action });
      expect(logs[0].details).toEqual(complexDetails);
    });
  });

  describe('AuditLogService - Read Operations', () => {
    beforeAll(async () => {
      // Create test data for read operations
      for (let i = 0; i < 15; i++) {
        await auditLogService.createLog({
          action: `${testPrefix}-READ`,
          details: { index: i },
        });
      }
    });

    it('should find all audit logs with default pagination', async () => {
      const logs = await auditLogService.findAll({ action: `${testPrefix}-READ` });
      expect(logs.length).toBe(15);
    });

    it('should respect limit parameter', async () => {
      const logs = await auditLogService.findAll({
        action: `${testPrefix}-READ`,
        limit: 5,
      });
      expect(logs.length).toBe(5);
    });

    it('should respect offset parameter', async () => {
      const logs = await auditLogService.findAll({
        action: `${testPrefix}-READ`,
        limit: 10,
        offset: 10,
      });
      expect(logs.length).toBe(5);
    });

    it('should filter by action', async () => {
      const logs = await auditLogService.findAll({
        action: `${testPrefix}-MINIMAL`,
      });
      expect(logs.every(l => l.action === `${testPrefix}-MINIMAL`)).toBe(true);
    });

    it('should order by createdAt descending', async () => {
      const logs = await auditLogService.findAll({ action: `${testPrefix}-READ` });
      for (let i = 0; i < logs.length - 1; i++) {
        expect(new Date(logs[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(logs[i + 1].createdAt).getTime()
        );
      }
    });
  });

  describe('AuditLogService - Count Operations', () => {
    beforeAll(async () => {
      // Create test data for count operations
      for (let i = 0; i < 5; i++) {
        await auditLogService.createLog({
          action: `${testPrefix}-COUNT`,
        });
      }
    });

    it('should count logs by action', async () => {
      const count = await auditLogService.countByAction(`${testPrefix}-COUNT`);
      expect(count).toBe(5);
    });

    it('should return 0 for non-existent action', async () => {
      const count = await auditLogService.countByAction('non-existent-action');
      expect(count).toBe(0);
    });
  });

  describe('Prisma Direct Operations', () => {
    it('should perform complex queries on audit logs', async () => {
      const action = `${testPrefix}-COMPLEX`;
      
      // Create audit logs with different status codes
      await auditLogService.createLog({ action, statusCode: 200 });
      await auditLogService.createLog({ action, statusCode: 404 });
      await auditLogService.createLog({ action, statusCode: 500 });

      const errorLogs = await prisma.auditLog.findMany({
        where: {
          action,
          statusCode: { gte: 400 },
        },
      });

      expect(errorLogs.length).toBe(2);
      expect(errorLogs.every(l => l.statusCode !== null && l.statusCode >= 400)).toBe(true);
    });

    it('should group audit logs by action', async () => {
      const grouped = await prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          action: { contains: testPrefix },
        },
        _count: true,
      });

      expect(grouped.length).toBeGreaterThan(0);
    });
  });
});
