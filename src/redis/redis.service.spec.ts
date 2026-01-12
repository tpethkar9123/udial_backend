import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis');

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisInstance: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.REDIS_URL = 'redis://localhost:6379';

    mockRedisInstance = {
      get: jest.fn(),
      set: jest.fn(),
      quit: jest.fn(),
    };

    (Redis as unknown as jest.Mock).mockReturnValue(mockRedisInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if REDIS_URL is not set', () => {
    const originalUrl = process.env.REDIS_URL;
    delete process.env.REDIS_URL;
    expect(() => new RedisService()).toThrow('REDIS_URL environment variable is not set');
    process.env.REDIS_URL = originalUrl;
  });

  it('should call redis.get', async () => {
    mockRedisInstance.get.mockResolvedValue('mockValue');
    const result = await service.get('key');
    expect(mockRedisInstance.get).toHaveBeenCalledWith('key');
    expect(result).toBe('mockValue');
  });

  it('should call redis.set without ttl', async () => {
    mockRedisInstance.set.mockResolvedValue('OK');
    await service.set('key', 'value');
    expect(mockRedisInstance.set).toHaveBeenCalledWith('key', 'value');
  });

  it('should call redis.set with ttl', async () => {
    mockRedisInstance.set.mockResolvedValue('OK');
    await service.set('key', 'value', 100);
    expect(mockRedisInstance.set).toHaveBeenCalledWith('key', 'value', 'EX', 100);
  });
});
