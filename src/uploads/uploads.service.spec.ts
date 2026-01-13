import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { S3Service } from '../s3/s3.service';

describe('UploadsService', () => {
  let service: UploadsService;
  let s3Service: S3Service;

  const mockS3Service = {
    getPresignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    s3Service = module.get<S3Service>(S3Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresignedUrl', () => {
    it('should delegate to S3Service', async () => {
      const filename = 'test-file.pdf';
      const expectedUrl = 'https://presigned-url.example.com';
      mockS3Service.getPresignedUrl.mockResolvedValue(expectedUrl);

      const result = await service.getPresignedUrl(filename);

      expect(result).toBe(expectedUrl);
      expect(s3Service.getPresignedUrl).toHaveBeenCalledWith(filename);
    });

    it('should pass filename correctly to S3Service', async () => {
      const filename = 'uploads/user-123/document.pdf';
      mockS3Service.getPresignedUrl.mockResolvedValue('url');

      await service.getPresignedUrl(filename);

      expect(s3Service.getPresignedUrl).toHaveBeenCalledWith(filename);
    });
  });
});
