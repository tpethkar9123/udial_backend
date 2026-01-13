import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../auth/auth.guard';

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: UploadsService;

  const mockUploadsService = {
    getPresignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPresignedUrl', () => {
    it('should return presigned URL for given filename', async () => {
      const filename = 'test-document.pdf';
      const expectedUrl = 'https://presigned-url.example.com/test-document.pdf';
      mockUploadsService.getPresignedUrl.mockResolvedValue(expectedUrl);

      const result = await controller.getPresignedUrl(filename);

      expect(result).toBe(expectedUrl);
      expect(service.getPresignedUrl).toHaveBeenCalledWith(filename);
    });
  });
});
