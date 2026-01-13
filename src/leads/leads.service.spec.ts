import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadsService, CreateLeadDto, UpdateLeadDto } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: PrismaService;

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

  const mockPrismaService = {
    lead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of leads ordered by createdAt desc', async () => {
      const leads = [mockLead, { ...mockLead, id: 'test-uuid-456' }];
      mockPrismaService.lead.findMany.mockResolvedValue(leads);

      const result = await service.findAll();

      expect(result).toEqual(leads);
      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no leads exist', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a lead with all fields', async () => {
      const createData: CreateLeadDto = {
        leadName: 'New Lead',
        institution: 'Test Institution',
        phoneNumber: '1234567890',
        city: 'Mumbai',
      };
      mockPrismaService.lead.create.mockResolvedValue({ ...mockLead, ...createData });

      const result = await service.create(createData);

      expect(result.leadName).toBe(createData.leadName);
      expect(prisma.lead.create).toHaveBeenCalledWith({ data: createData });
    });

    it('should create a lead with only required field', async () => {
      const createData: CreateLeadDto = {
        leadName: 'Minimal Lead',
      };
      mockPrismaService.lead.create.mockResolvedValue({ ...mockLead, leadName: 'Minimal Lead' });

      const result = await service.create(createData);

      expect(result.leadName).toBe('Minimal Lead');
      expect(prisma.lead.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('findOne', () => {
    it('should return a lead when found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);

      const result = await service.findOne('test-uuid-123');

      expect(result).toEqual(mockLead);
      expect(prisma.lead.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
    });

    it('should throw NotFoundException when lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Lead with ID non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update a lead when it exists', async () => {
      const updateData: UpdateLeadDto = {
        leadName: 'Updated Lead Name',
        city: 'Bangalore',
      };
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      mockPrismaService.lead.update.mockResolvedValue({ ...mockLead, ...updateData });

      const result = await service.update('test-uuid-123', updateData);

      expect(result.leadName).toBe('Updated Lead Name');
      expect(result.city).toBe('Bangalore');
      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
        data: updateData,
      });
    });

    it('should throw NotFoundException when updating non-existent lead', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { leadName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a lead when it exists', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      mockPrismaService.lead.delete.mockResolvedValue(mockLead);

      const result = await service.delete('test-uuid-123');

      expect(result).toEqual(mockLead);
      expect(prisma.lead.delete).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
    });

    it('should throw NotFoundException when deleting non-existent lead', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
