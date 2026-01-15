import { Test, TestingModule } from '@nestjs/testing';
import { UploadsModule } from './uploads.module';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('UploadsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Set up environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    module = await Test.createTestingModule({
      imports: [UploadsModule],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_S3_BUCKET;
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UploadsService', () => {
    const service = module.get<UploadsService>(UploadsService);
    expect(service).toBeDefined();
  });

  it('should provide UploadsController', () => {
    const controller = module.get<UploadsController>(UploadsController);
    expect(controller).toBeDefined();
  });
});
