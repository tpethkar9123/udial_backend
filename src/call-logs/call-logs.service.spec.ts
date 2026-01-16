import { Test, TestingModule } from '@nestjs/testing';
import { CallLogsService } from './call-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CallType, SimProvider } from '@prisma/client';
import { LogsService } from '../logs/logs.service';
import { UpdateCallLogDto } from './call-logs.dto';

describe('CallLogsService', () => {
  let service: CallLogsService;

  const mockCallLog = {
    id: 'test-id-1',
    name: 'Test User',
    phoneNumber: '+91 99999 99999',
    callType: CallType.INCOMING,
    duration: 120,
    simProvider: SimProvider.VI,
    userEmail: 'test@example.com',
    callTime: new Date(),
    notes: 'Test note',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLogsService = {
    logAction: jest.fn().mockResolvedValue(undefined),
  };

  const mockPrismaService = {
    callLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallLogsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LogsService, useValue: mockLogsService },
      ],
    }).compile();

    service = module.get<CallLogsService>(CallLogsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a call log successfully', async () => {
      mockPrismaService.callLog.create.mockResolvedValue(mockCallLog);

      const result = await service.create(
        {
          name: 'Test User',
          phoneNumber: '+91 99999 99999',
          callType: CallType.INCOMING,
          duration: 120,
          simProvider: SimProvider.VI,
          userEmail: 'test@example.com',
        },
        'test-user-id',
      );

      expect(result).toEqual(mockCallLog);
      expect(mockPrismaService.callLog.create).toHaveBeenCalledTimes(1);
      expect(mockLogsService.logAction).toHaveBeenCalledWith(
        'CALL_LOG_CREATED',
        'test-user-id',
        expect.any(Object),
      );
    });

    it('should create call log with default values', async () => {
      mockPrismaService.callLog.create.mockResolvedValue(mockCallLog);

      await service.create({
        name: 'Test User',
        phoneNumber: '+91 99999 99999',
        callType: CallType.OUTGOING,
        userEmail: 'test@example.com',
      });

      expect(mockPrismaService.callLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          duration: 0,
          simProvider: SimProvider.OTHER,
          callTime: expect.any(Date),
        }),
      });
    });

    it('should log error if logsService.logAction fails', async () => {
      mockPrismaService.callLog.create.mockResolvedValue(mockCallLog);
      mockLogsService.logAction.mockRejectedValueOnce(new Error('Log failed'));
      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      await service.create({
        name: 'Test',
        phoneNumber: '123',
        callType: CallType.INCOMING,
        userEmail: 'test@example.com',
      });

      // Wait for promise microtask since we don't await logAction
      await new Promise(process.nextTick);
      expect(loggerSpy).toHaveBeenCalledWith('Failed to log CALL_LOG_CREATED', expect.any(Error));
    });
  });

  describe('findAll', () => {
    it('should return paginated call logs', async () => {
      mockPrismaService.callLog.count.mockResolvedValue(50);
      mockPrismaService.callLog.findMany.mockResolvedValue([mockCallLog]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(50);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(5);
    });

    it('should filter by callType', async () => {
      mockPrismaService.callLog.count.mockResolvedValue(10);
      mockPrismaService.callLog.findMany.mockResolvedValue([mockCallLog]);

      await service.findAll({ callType: CallType.INCOMING });

      expect(mockPrismaService.callLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ callType: CallType.INCOMING }),
        }),
      );
    });

    it('should filter by search term', async () => {
      mockPrismaService.callLog.count.mockResolvedValue(5);
      mockPrismaService.callLog.findMany.mockResolvedValue([mockCallLog]);

      await service.findAll({ search: 'Test' });

      expect(mockPrismaService.callLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([{ name: { contains: 'Test', mode: 'insensitive' } }]),
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      mockPrismaService.callLog.count.mockResolvedValue(3);
      mockPrismaService.callLog.findMany.mockResolvedValue([mockCallLog]);

      await service.findAll({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(mockPrismaService.callLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            callTime: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a call log by ID', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(mockCallLog);

      const result = await service.findOne('test-id-1');

      expect(result).toEqual(mockCallLog);
      expect(mockPrismaService.callLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });

    it('should throw NotFoundException if call log not found', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a call log', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(mockCallLog);
      mockPrismaService.callLog.update.mockResolvedValue({
        ...mockCallLog,
        name: 'Updated Name',
      });

      const result = await service.update('test-id-1', { name: 'Updated Name' }, 'test-user-id');

      expect(result.name).toBe('Updated Name');
      expect(mockPrismaService.callLog.update).toHaveBeenCalledTimes(1);
      expect(mockLogsService.logAction).toHaveBeenCalledWith(
        'CALL_LOG_UPDATED',
        'test-user-id',
        expect.any(Object),
      );
    });

    it('should handle all updateable fields', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(mockCallLog);
      mockPrismaService.callLog.update.mockResolvedValue(mockCallLog);

      const updateDto: UpdateCallLogDto = {
        name: 'New Name',
        phoneNumber: '999',
        callType: CallType.OUTGOING,
        duration: 50,
        simProvider: SimProvider.AIRTEL,
        userEmail: 'new@example.com',
        callTime: new Date().toISOString(),
        notes: 'New notes',
      };

      await service.update('test-id-1', updateDto);

      expect(mockPrismaService.callLog.update).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        data: {
          name: updateDto.name,
          phoneNumber: updateDto.phoneNumber,
          callType: updateDto.callType,
          duration: updateDto.duration,
          simProvider: updateDto.simProvider,
          userEmail: updateDto.userEmail,
          callTime: expect.any(Date),
          notes: updateDto.notes,
        },
      });
    });

    it('should throw NotFoundException if updating non-existent call log', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a call log', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(mockCallLog);
      mockPrismaService.callLog.delete.mockResolvedValue(mockCallLog);

      const result = await service.delete('test-id-1', 'test-user-id');

      expect(result).toEqual(mockCallLog);
      expect(mockPrismaService.callLog.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
      expect(mockLogsService.logAction).toHaveBeenCalledWith(
        'CALL_LOG_DELETED',
        'test-user-id',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if deleting non-existent call log', async () => {
      mockPrismaService.callLog.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple call logs', async () => {
      mockPrismaService.callLog.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkDelete(['id1', 'id2', 'id3'], 'test-user-id');

      expect(result.deleted).toBe(3);
      expect(mockPrismaService.callLog.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['id1', 'id2', 'id3'] } },
      });
      expect(mockLogsService.logAction).toHaveBeenCalledWith(
        'CALL_LOG_BULK_DELETED',
        'test-user-id',
        expect.any(Object),
      );
    });
  });

  describe('findByUserEmail', () => {
    it('should return call logs for a specific user', async () => {
      mockPrismaService.callLog.findMany.mockResolvedValue([mockCallLog]);

      const result = await service.findByUserEmail('test@example.com');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.callLog.findMany).toHaveBeenCalledWith({
        where: { userEmail: 'test@example.com' },
        orderBy: { callTime: 'desc' },
        take: 100,
      });
    });
  });
});
