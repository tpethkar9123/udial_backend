import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService, CreateLeadDto, UpdateLeadDto } from './leads.service';
import { AuthGuard } from '../auth/auth.guard';

describe('LeadsController', () => {
  let controller: LeadsController;
  let service: LeadsService;

  const mockLead = {
    id: 'test-uuid-123',
    leadName: 'Test Lead',
    institution: 'Test School',
    phoneNumber: '9876543210',
    city: 'Delhi',
    priority: 'HIGH',
    stage: 'CALL_DONE',
    owner: 'Test Owner',
    source: 'WEBSITE',
    status: 'NEW',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLeadsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        {
          provide: LeadsService,
          useValue: mockLeadsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LeadsController>(LeadsController);
    service = module.get<LeadsService>(LeadsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of leads', async () => {
      const leads = [mockLead, { ...mockLead, id: 'test-uuid-456' }];
      mockLeadsService.findAll.mockResolvedValue(leads);

      const result = await controller.findAll();

      expect(result).toEqual(leads);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no leads exist', async () => {
      mockLeadsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single lead by id', async () => {
      mockLeadsService.findOne.mockResolvedValue(mockLead);

      const result = await controller.findOne('test-uuid-123');

      expect(result).toEqual(mockLead);
      expect(service.findOne).toHaveBeenCalledWith('test-uuid-123');
    });
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createDto: CreateLeadDto = {
        leadName: 'New Lead',
        institution: 'New School',
        phoneNumber: '1234567890',
        city: 'Mumbai',
      };
      mockLeadsService.create.mockResolvedValue({ ...mockLead, ...createDto });

      const result = await controller.create(createDto);

      expect(result.leadName).toBe('New Lead');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should create a lead with minimal data', async () => {
      const createDto: CreateLeadDto = {
        leadName: 'Minimal Lead',
      };
      mockLeadsService.create.mockResolvedValue({ ...mockLead, leadName: 'Minimal Lead' });

      const result = await controller.create(createDto);

      expect(result.leadName).toBe('Minimal Lead');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing lead', async () => {
      const updateDto: UpdateLeadDto = {
        leadName: 'Updated Lead',
        city: 'Bangalore',
      };
      mockLeadsService.update.mockResolvedValue({ ...mockLead, ...updateDto });

      const result = await controller.update('test-uuid-123', updateDto);

      expect(result.leadName).toBe('Updated Lead');
      expect(result.city).toBe('Bangalore');
      expect(service.update).toHaveBeenCalledWith('test-uuid-123', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a lead', async () => {
      mockLeadsService.delete.mockResolvedValue(mockLead);

      const result = await controller.delete('test-uuid-123');

      expect(result).toEqual(mockLead);
      expect(service.delete).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});
