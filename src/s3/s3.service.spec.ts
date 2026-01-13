import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock the AWS SDK modules
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

  beforeEach(async () => {
    // Set up environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    // Reset mocks
    jest.clearAllMocks();
    mockGetSignedUrl.mockResolvedValue('https://signed-url.example.com');

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_S3_BUCKET;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresignedUrl', () => {
    it('should return a presigned URL for the given filename', async () => {
      const filename = 'test-file.pdf';

      const result = await service.getPresignedUrl(filename);

      expect(result).toBe('https://signed-url.example.com');
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(PutObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should handle different file types', async () => {
      const filenames = ['image.png', 'document.pdf', 'data.json'];

      for (const filename of filenames) {
        await service.getPresignedUrl(filename);
      }

      expect(mockGetSignedUrl).toHaveBeenCalledTimes(3);
    });

    it('should use correct expiry time of 1 hour', async () => {
      await service.getPresignedUrl('test.txt');

      expect(mockGetSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
        expiresIn: 3600,
      });
    });
  });
});
