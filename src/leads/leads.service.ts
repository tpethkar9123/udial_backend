// leads.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Priority, LeadStage, LeadStatus, LeadSource } from '@prisma/client';

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

  async findAll() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
