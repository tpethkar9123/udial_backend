import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService, AuditLogData } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create an audit log entry', async () => {
      const logData: AuditLogData = {
        action: 'HTTP_REQUEST',
        method: 'GET',
        url: '/api/health',
        statusCode: 200,
        duration: '50ms',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'test-id', ...logData });

      await service.createLog(logData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'HTTP_REQUEST',
          method: 'GET',
          url: '/api/health',
          statusCode: 200,
          duration: '50ms',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          details: undefined,
          userId: undefined,
        },
      });
    });

    it('should handle errors gracefully without throwing', async () => {
      mockPrismaService.auditLog.create.mockRejectedValue(new Error('Database error'));
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(service.createLog({ action: 'TEST_ACTION' })).resolves.not.toThrow();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create audit log: Database error'),
      );

      loggerSpy.mockRestore();
    });

    it('should create a log with details and userId', async () => {
      const logData: AuditLogData = {
        action: 'LEAD_CREATED',
        details: { leadId: 'lead-123', leadName: 'Test Lead' },
        userId: 'user-456',
      };

      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'test-id', ...logData });

      await service.createLog(logData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'LEAD_CREATED',
          details: { leadId: 'lead-123', leadName: 'Test Lead' },
          userId: 'user-456',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return audit logs with default pagination', async () => {
      const mockLogs = [
        { id: '1', action: 'HTTP_REQUEST', createdAt: new Date() },
        { id: '2', action: 'HTTP_REQUEST', createdAt: new Date() },
      ];

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.findAll();

      expect(result).toEqual(mockLogs);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
        skip: 0,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should filter by action when specified', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);

      await service.findAll({ action: 'HTTP_ERROR' });

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: 'HTTP_ERROR' },
        }),
      );
    });

    it('should respect custom limit and offset', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);

      await service.findAll({ limit: 50, offset: 100 });

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 100,
        }),
      );
    });
  });

  describe('findByUserId', () => {
    it('should return logs for a specific user', async () => {
      const mockLogs = [{ id: '1', action: 'HTTP_REQUEST', userId: 'user-123' }];
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.findByUserId('user-123');

      expect(result).toEqual(mockLogs);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should respect custom limit', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);

      await service.findByUserId('user-123', 25);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 25,
        }),
      );
    });
  });

  describe('countByAction', () => {
    it('should return count for a specific action', async () => {
      mockPrismaService.auditLog.count.mockResolvedValue(42);

      const result = await service.countByAction('HTTP_REQUEST');

      expect(result).toBe(42);
      expect(mockPrismaService.auditLog.count).toHaveBeenCalledWith({
        where: { action: 'HTTP_REQUEST' },
      });
    });
  });
});
