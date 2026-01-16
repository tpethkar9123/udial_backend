import { Test, TestingModule } from '@nestjs/testing';
import { CallLogsController } from './call-logs.controller';
import { CallLogsService } from './call-logs.service';
import { CallType, SimProvider } from '@prisma/client';

describe('CallLogsController', () => {
  let controller: CallLogsController;
  let service: CallLogsService;

  const mockCallLog = {
    id: 'test-id-1',
    name: 'Test User',
    phoneNumber: '+91 99999 99999',
    callType: CallType.INCOMING,
    duration: 120,
    simProvider: SimProvider.VI,
    userEmail: 'test@example.com',
    callTime: new Date(),
    notes: 'Test note',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse = {
    data: [mockCallLog],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    stats: {
      total: 10,
      incoming: 3,
      outgoing: 4,
      missed: 2,
      unanswered: 1,
    },
  };

  const mockCallLogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
    findByUserEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallLogsController],
      providers: [{ provide: CallLogsService, useValue: mockCallLogsService }],
    }).compile();

    controller = module.get<CallLogsController>(CallLogsController);
    service = module.get<CallLogsService>(CallLogsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated call logs', async () => {
      mockCallLogsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should pass query filters to service', async () => {
      mockCallLogsService.findAll.mockResolvedValue(mockPaginatedResponse);

      await controller.findAll({
        callType: CallType.MISSED,
        search: 'test',
      });

      expect(service.findAll).toHaveBeenCalledWith({
        callType: CallType.MISSED,
        search: 'test',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single call log', async () => {
      mockCallLogsService.findOne.mockResolvedValue(mockCallLog);

      const result = await controller.findOne('test-id-1');

      expect(result).toEqual(mockCallLog);
      expect(service.findOne).toHaveBeenCalledWith('test-id-1');
    });
  });

  describe('create', () => {
    it('should create a new call log', async () => {
      mockCallLogsService.create.mockResolvedValue(mockCallLog);

      const createDto = {
        name: 'Test User',
        phoneNumber: '+91 99999 99999',
        callType: CallType.INCOMING,
        userEmail: 'test@example.com',
      };

      const mockReq = { user: { id: 'user-id-1' } };
      const result = await controller.create(createDto, mockReq as any);

      expect(result).toEqual(mockCallLog);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-id-1');
    });

    it('should use req.user.sub as userId if req.user.id is missing', async () => {
      mockCallLogsService.create.mockResolvedValue(mockCallLog);
      const createDto = {
        name: 'Test',
        phoneNumber: '+91 999 999',
        callType: CallType.INCOMING,
        userEmail: 'test@example.com',
      };
      const mockReq = { user: { sub: 'sub-id-1' } };

      await controller.create(createDto, mockReq as any);
      expect(service.create).toHaveBeenCalledWith(createDto, 'sub-id-1');
    });

    it('should use SYSTEM as userId if req.user is missing', async () => {
      mockCallLogsService.create.mockResolvedValue(mockCallLog);
      const createDto = {
        name: 'Test',
        phoneNumber: '+91 999 999',
        callType: CallType.INCOMING,
        userEmail: 'test@example.com',
      };
      const mockReq = {};

      await controller.create(createDto, mockReq as any);
      expect(service.create).toHaveBeenCalledWith(createDto, 'SYSTEM');
    });
  });

  describe('update', () => {
    it('should update a call log', async () => {
      const updatedCallLog = { ...mockCallLog, name: 'Updated Name' };
      mockCallLogsService.update.mockResolvedValue(updatedCallLog);

      const mockReq = { user: { id: 'user-id-1' } };
      const result = await controller.update('test-id-1', { name: 'Updated Name' }, mockReq as any);

      expect(result.name).toBe('Updated Name');
      expect(service.update).toHaveBeenCalledWith(
        'test-id-1',
        { name: 'Updated Name' },
        'user-id-1',
      );
    });
  });

  describe('delete', () => {
    it('should delete a call log', async () => {
      mockCallLogsService.delete.mockResolvedValue(mockCallLog);

      const mockReq = { user: { id: 'user-id-1' } };
      const result = await controller.delete('test-id-1', mockReq as any);

      expect(result).toEqual(mockCallLog);
      expect(service.delete).toHaveBeenCalledWith('test-id-1', 'user-id-1');
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete call logs', async () => {
      mockCallLogsService.bulkDelete.mockResolvedValue({ deleted: 3 });

      const mockReq = { user: { id: 'user-id-1' } };
      const result = await controller.bulkDelete({ ids: ['id1', 'id2', 'id3'] }, mockReq as any);

      expect(result.deleted).toBe(3);
      expect(service.bulkDelete).toHaveBeenCalledWith(['id1', 'id2', 'id3'], 'user-id-1');
    });
  });

  describe('findByUser', () => {
    it('should return call logs for a specific user', async () => {
      mockCallLogsService.findByUserEmail.mockResolvedValue([mockCallLog]);

      const result = await controller.findByUser('test@example.com');

      expect(result).toHaveLength(1);
      expect(service.findByUserEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
