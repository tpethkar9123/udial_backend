import { Test, TestingModule } from '@nestjs/testing';
import { UserProcessor } from './worker.processor';
import { AuditLogService } from '../logs/audit-log.service';
import { Job } from 'bullmq';

describe('UserProcessor', () => {
  let processor: UserProcessor;
  let auditLogService: AuditLogService;

  const mockAuditLogService = {
    createLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProcessor,
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    processor = module.get<UserProcessor>(UserProcessor);
    auditLogService = module.get<AuditLogService>(AuditLogService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process log-action job and save to database', async () => {
      const mockJob = {
        id: 'job-123',
        name: 'log-action',
        data: {
          action: 'HTTP_REQUEST',
          userId: 'user-456',
          details: {
            method: 'GET',
            url: '/api/health',
            statusCode: 200,
            duration: '50ms',
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          },
        },
      } as unknown as Job<any, any, string>;

      mockAuditLogService.createLog.mockResolvedValue(undefined);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
      expect(mockAuditLogService.createLog).toHaveBeenCalledWith({
        action: 'HTTP_REQUEST',
        method: 'GET',
        url: '/api/health',
        statusCode: 200,
        duration: '50ms',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: expect.objectContaining({
          method: 'GET',
          url: '/api/health',
        }),
        userId: 'user-456',
      });
    });

    it('should handle SYSTEM userId by setting userId to undefined', async () => {
      const mockJob = {
        id: 'job-123',
        name: 'log-action',
        data: {
          action: 'HTTP_REQUEST',
          userId: 'SYSTEM',
          details: { method: 'GET', url: '/api/health' },
        },
      } as unknown as Job<any, any, string>;

      mockAuditLogService.createLog.mockResolvedValue(undefined);

      await processor.process(mockJob);

      expect(mockAuditLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: undefined,
        }),
      );
    });

    it('should handle unknown job types gracefully', async () => {
      const mockJob = {
        id: 'job-789',
        name: 'unknown-job-type',
        data: {},
      } as unknown as Job<any, any, string>;

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
      expect(mockAuditLogService.createLog).not.toHaveBeenCalled();
    });

    it('should process job with complex details', async () => {
      const mockJob = {
        id: 'job-abc',
        name: 'log-action',
        data: {
          action: 'COMPLEX_ACTION',
          userId: 'user-xyz',
          details: {
            nested: { value: 123 },
            array: [1, 2, 3],
            flag: true,
          },
        },
      } as unknown as Job<any, any, string>;

      mockAuditLogService.createLog.mockResolvedValue(undefined);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
      expect(mockAuditLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'COMPLEX_ACTION',
          details: expect.objectContaining({
            nested: { value: 123 },
            array: [1, 2, 3],
          }),
        }),
      );
    });

    it('should handle job with missing details gracefully', async () => {
      const mockJob = {
        id: 'job-no-details',
        name: 'log-action',
        data: {
          action: 'SIMPLE_ACTION',
          userId: 'user-123',
          details: undefined,
        },
      } as unknown as Job<any, any, string>;

      mockAuditLogService.createLog.mockResolvedValue(undefined);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
      expect(mockAuditLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'SIMPLE_ACTION',
          method: undefined,
          url: undefined,
        }),
      );
    });
  });
});
