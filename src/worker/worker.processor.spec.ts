import { Test, TestingModule } from '@nestjs/testing';
import { UserProcessor } from './worker.processor';
import { Job } from 'bullmq';

describe('UserProcessor', () => {
  let processor: UserProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProcessor],
    }).compile();

    processor = module.get<UserProcessor>(UserProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process log-action job successfully', async () => {
      const mockJob = {
        id: 'job-123',
        name: 'log-action',
        data: {
          action: 'USER_LOGIN',
          userId: 'user-456',
          details: { ip: '192.168.1.1' },
        },
      } as unknown as Job<any, any, string>;

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
    });

    it('should handle unknown job types gracefully', async () => {
      const mockJob = {
        id: 'job-789',
        name: 'unknown-job-type',
        data: {},
      } as unknown as Job<any, any, string>;

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
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

      const result = await processor.process(mockJob);

      expect(result).toEqual({ success: true });
    });
  });
});
