import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Prisma Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api'); // Ensure prefix matches prod
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    server = process.env.BASE_URL || app.getHttpServer();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-prisma-e2e',
        },
      },
    });
    await prisma.lead.deleteMany({
      where: {
        email: {
          contains: 'test-prisma-e2e',
        },
      },
    });
    await app.close();
  });

  describe('User Operations', () => {
    const testUser = {
      name: 'Test Prisma User',
      email: `user-${Date.now()}@test-prisma-e2e.com`,
    };

    it('should create a new user', async () => {
      const user = await prisma.user.create({
        data: testUser,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(user.id).toBeDefined();
    });

    it('should find the created user', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(testUser.email);
    });
  });

  describe('Lead Operations', () => {
    const testLead = {
      name: 'Test Prisma Lead',
      email: `lead-${Date.now()}@test-prisma-e2e.com`,
    };

    it('should create a new lead', async () => {
      const lead = await prisma.lead.create({
        data: testLead,
      });

      expect(lead).toBeDefined();
      expect(lead.email).toBe(testLead.email);
      expect(lead.id).toBeDefined();
    });

    it('should find the created lead', async () => {
      const lead = await prisma.lead.findFirst({
        where: { email: testLead.email },
      });

      expect(lead).toBeDefined();
      expect(lead?.email).toBe(testLead.email);
    });
  });
});
