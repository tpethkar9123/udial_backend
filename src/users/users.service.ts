// users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
  async create(data: { name: string; email: string }) {
    const user = await this.prisma.user.create({
      data,
    });
    
    // Asynchronous fine logging via worker
    await this.logsService.logAction('USER_CREATED', user.id, { email: user.email });
    
    return user;
  }
}
