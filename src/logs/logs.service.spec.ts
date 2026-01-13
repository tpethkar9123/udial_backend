import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { LogsService } from './logs.service';

describe('LogsService', () => {
  let service: LogsService;
  let mockQueue: any;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        {
          provide: getQueueToken('logs-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('should add a log action to the queue', async () => {
      const action = 'USER_LOGIN';
      const userId = 'user-123';
      const details = { ip: '192.168.1.1' };

      await service.logAction(action, userId, details);

      expect(mockQueue.add).toHaveBeenCalledWith('log-action', {
        action,
        userId,
        details,
        timestamp: expect.any(String),
      });
    });

    it('should include timestamp in ISO format', async () => {
      await service.logAction('TEST_ACTION', 'user-456', {});

      const callArgs = mockQueue.add.mock.calls[0][1];
      expect(new Date(callArgs.timestamp).toISOString()).toBe(callArgs.timestamp);
    });

    it('should handle complex details object', async () => {
      const complexDetails = {
        nested: {
          value: 123,
          array: [1, 2, 3],
        },
        flag: true,
      };

      await service.logAction('COMPLEX_ACTION', 'user-789', complexDetails);

      expect(mockQueue.add).toHaveBeenCalledWith('log-action', {
        action: 'COMPLEX_ACTION',
        userId: 'user-789',
        details: complexDetails,
        timestamp: expect.any(String),
      });
    });
  });
});
