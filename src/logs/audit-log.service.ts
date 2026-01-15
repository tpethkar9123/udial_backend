import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  action: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  userId?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: AuditLogData): Promise<boolean> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          method: data.method,
          url: data.url,
          statusCode: data.statusCode,
          duration: data.duration,
          ip: data.ip,
          userAgent: data.userAgent,
          details: data.details,
          userId: data.userId,
        },
      });
      this.logger.debug(`Audit log created: ${data.action}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create audit log: ${errorMessage}`);
      return false;
      // Don't throw - logging should not break the application
    }
  }

  async findAll(options?: { limit?: number; offset?: number; action?: string }) {
    const { limit = 100, offset = 0, action } = options || {};

    return this.prisma.auditLog.findMany({
      where: action ? { action } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async countByAction(action: string): Promise<number> {
    return this.prisma.auditLog.count({
      where: { action },
    });
  }
}
