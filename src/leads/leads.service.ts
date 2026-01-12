// leads.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lead.findMany();
  }

  async create(data: { name: string; email: string }) {
    return this.prisma.lead.create({
      data,
    });
  }

  async findOne(id: any) {
    return this.prisma.lead.findUnique({
      where: { id },
    });
  }
}
