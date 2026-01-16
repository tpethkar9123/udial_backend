import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadsService, CreateLeadDto, UpdateLeadDto } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeadQueryDto } from './dto/lead-query.dto';

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
      count: jest.fn(),
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
    it('should return paginated leads with default parameters', async () => {
      const leads = [mockLead, { ...mockLead, id: 'test-uuid-456' }];
      mockPrismaService.lead.findMany.mockResolvedValue(leads);
      mockPrismaService.lead.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(leads);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.stats).toBeDefined();
    });

    it('should apply pagination correctly', async () => {
      const query: LeadQueryDto = { page: 2, limit: 5 };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(20);

      const result = await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
      expect(result.meta.totalPages).toBe(4);
    });

    it('should filter by priority', async () => {
      const query: LeadQueryDto = { priority: 'HIGH' };
      mockPrismaService.lead.findMany.mockResolvedValue([mockLead]);
      mockPrismaService.lead.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ priority: 'HIGH' }),
        }),
      );
    });

    it('should filter by stage', async () => {
      const query: LeadQueryDto = { stage: 'DEMO_BOOKED' };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ stage: 'DEMO_BOOKED' }),
        }),
      );
    });

    it('should filter by status', async () => {
      const query: LeadQueryDto = { status: 'CLOSED_WON' };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'CLOSED_WON' }),
        }),
      );
    });

    it('should filter by source', async () => {
      const query: LeadQueryDto = { source: 'REFERRAL' };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ source: 'REFERRAL' }),
        }),
      );
    });

    it('should filter by city with case-insensitive search', async () => {
      const query: LeadQueryDto = { city: 'delhi' };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: { contains: 'delhi', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should apply search across multiple fields', async () => {
      const query: LeadQueryDto = { search: 'test' };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { leadName: { contains: 'test', mode: 'insensitive' } },
              { institution: { contains: 'test', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should apply custom sorting', async () => {
      const query: LeadQueryDto = { sortBy: 'leadName', sortOrder: 'asc' };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { leadName: 'asc' },
        }),
      );
    });

    it('should return correct stats by priority', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(10) // all (stats)
        .mockResolvedValueOnce(3) // high
        .mockResolvedValueOnce(5) // medium
        .mockResolvedValueOnce(2); // low

      const result = await service.findAll({});

      expect(result.stats).toEqual({
        all: 10,
        high: 3,
        medium: 5,
        low: 2,
      });
    });

    it('should return empty array when no leads exist', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should combine multiple filters', async () => {
      const query: LeadQueryDto = {
        priority: 'HIGH',
        stage: 'NEGOTIATION',
        city: 'Mumbai',
      };
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'HIGH',
            stage: 'NEGOTIATION',
            city: { contains: 'Mumbai', mode: 'insensitive' },
          }),
        }),
      );
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

      await expect(service.update('non-existent-id', { leadName: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
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
