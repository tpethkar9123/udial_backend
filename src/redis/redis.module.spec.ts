import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

describe('RedisModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    module = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide RedisService', () => {
    const service = module.get<RedisService>(RedisService);
    expect(service).toBeDefined();
  });
});
