import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as clerk from './../src/auth/clerk';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeEach(async () => {
    if (process.env.BASE_URL) {
      server = process.env.BASE_URL;
    } else {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.setGlobalPrefix('api');
      await app.init();
      server = app.getHttpServer();
    }
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/users (GET) - Unauthorized with no token', () => {
    return request(server).get('/api/users').expect(401).expect({
      statusCode: 401,
      message: 'Missing Authorization header',
      error: 'Unauthorized',
    });
  });

  it('/api/users (GET) - Unauthorized with invalid token', () => {
    if (!process.env.BASE_URL) {
      jest.spyOn(clerk, 'verifyJwt').mockResolvedValue(null);
    }

    return request(server)
      .get('/api/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Invalid token',
        error: 'Unauthorized',
      });
  });

  it('/api/users (GET) - Authorized with valid token', () => {
    if (process.env.BASE_URL) {
      // Skip this test for remote URLs since we can't easily mock Clerk on a remote server
      return;
    }
    const mockUser = {
      verifiedToken: { sub: 'user_123' },
      user: { id: 'user_123', email: 'test@test.com' },
    } as any;
    jest.spyOn(clerk, 'verifyJwt').mockResolvedValue(mockUser);

    return request(server)
      .get('/api/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
  });
});
