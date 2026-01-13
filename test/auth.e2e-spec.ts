import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as clerk from './../src/auth/clerk';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from './../src/redis/redis.service';
import { UserProcessor } from './../src/worker/worker.processor';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('logs-queue'))
      .useValue({ add: jest.fn().mockResolvedValue({}) })
      .overrideProvider('BullQueue_default')
      .useValue({ add: jest.fn().mockResolvedValue({}) })
      .overrideProvider(RedisService)
      .useValue({ get: jest.fn(), set: jest.fn() })
      .overrideProvider(UserProcessor)
      .useValue({ process: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/leads (GET) - Unauthorized with no token', () => {
    return request(server).get('/api/leads').expect(401);
  });

  it('/api/leads (GET) - Authorized with valid token', async () => {
    const mockUser = {
      verifiedToken: { sub: 'user_123' },
      user: { id: 'user_123', email: 'test@test.com' },
    } as any;
    jest.spyOn(clerk, 'verifyJwt').mockResolvedValue(mockUser);

    return request(server)
      .get('/api/leads')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
  });
});
