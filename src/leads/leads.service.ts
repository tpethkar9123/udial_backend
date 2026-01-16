// leads.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Priority, LeadStage, LeadStatus, LeadSource, Prisma } from '@prisma/client';
import { LeadQueryDto } from './dto/lead-query.dto';

export interface CreateLeadDto {
  leadName: string;
  institution?: string;
  phoneNumber?: string;
  city?: string;
  priority?: Priority;
  stage?: LeadStage;
  owner?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

export interface UpdateLeadDto {
  leadName?: string;
  institution?: string;
  phoneNumber?: string;
  city?: string;
  priority?: Priority;
  stage?: LeadStage;
  owner?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: LeadQueryDto = {}) {
    const {
      page = 1,
      limit = 10,
      priority,
      stage,
      status,
      source,
      city,
      owner,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.leadWhereInput = {};

    // Apply filters
    if (priority) where.priority = priority;
    if (stage) where.stage = stage;
    if (status) where.status = status;
    if (source) where.source = source;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (owner) where.owner = { contains: owner, mode: 'insensitive' };

    // Apply search across multiple fields
    if (search) {
      where.OR = [
        { leadName: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await this.prisma.lead.count({ where });

    // Get paginated data
    const data = await this.prisma.lead.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get stats by priority
    const stats = await this.getLeadStats(where);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  private async getLeadStats(where: Prisma.leadWhereInput) {
    const [all, high, medium, low] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, priority: 'HIGH' } }),
      this.prisma.lead.count({ where: { ...where, priority: 'MEDIUM' } }),
      this.prisma.lead.count({ where: { ...where, priority: 'LOW' } }),
    ]);

    return { all, high, medium, low };
  }

  async create(data: CreateLeadDto) {
    return this.prisma.lead.create({
      data,
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: string, data: UpdateLeadDto) {
    // Check if lead exists first
    await this.findOne(id);
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Check if lead exists first
    await this.findOne(id);
    return this.prisma.lead.delete({
      where: { id },
    });
  }
}
