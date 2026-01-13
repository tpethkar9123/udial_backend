import { Test, TestingModule } from '@nestjs/testing';
import { S3Module } from './s3.module';
import { S3Service } from './s3.service';

// Mock AWS SDK before importing the module
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Module', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Set up environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    module = await Test.createTestingModule({
      imports: [S3Module],
    }).compile();
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

  it('should provide S3Service', () => {
    const service = module.get<S3Service>(S3Service);
    expect(service).toBeDefined();
  });

  it('should export S3Service', () => {
    const service = module.get<S3Service>(S3Service);
    expect(service).toBeInstanceOf(S3Service);
  });
});
