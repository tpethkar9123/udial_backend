import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CallType, SimProvider, Prisma } from '@prisma/client';
import { CreateCallLogDto, UpdateCallLogDto, CallLogQueryDto } from './call-logs.dto';
import { LogsService } from '../logs/logs.service';

export interface CallLogStats {
  total: number;
  incoming: number;
  outgoing: number;
  missed: number;
  unanswered: number;
}

export interface PaginatedCallLogs {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: CallLogStats;
}

@Injectable()
export class CallLogsService {
  private readonly logger = new Logger(CallLogsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * Create a new call log
   */
  async create(data: CreateCallLogDto, userId: string = 'SYSTEM') {
    this.logger.log(`Creating call log for ${data.phoneNumber}`);

    const callLog = await this.prisma.callLog.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        callType: data.callType,
        duration: data.duration || 0,
        simProvider: data.simProvider || SimProvider.OTHER,
        userEmail: data.userEmail,
        callTime: data.callTime ? new Date(data.callTime) : new Date(),
        notes: data.notes,
      },
    });

    // Audit Log
    this.logsService
      .logAction('CALL_LOG_CREATED', userId, {
        callLogId: callLog.id,
        phoneNumber: data.phoneNumber,
        name: data.name,
        callType: data.callType,
        userEmail: data.userEmail,
      })
      .catch((err) => this.logger.error('Failed to log CALL_LOG_CREATED', err));

    this.logger.log(`Call log created with ID: ${callLog.id}`);
    return callLog;
  }

  /**
   * Find all call logs with filtering, pagination, and search
   */
  async findAll(query: CallLogQueryDto): Promise<PaginatedCallLogs> {
    const {
      callType,
      search,
      userEmail,
      simProvider,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'callTime',
      sortOrder = 'desc',
    } = query;

    this.logger.log(`Fetching call logs with filters: ${JSON.stringify(query)}`);

    // Build where clause
    const where: Prisma.CallLogWhereInput = {};

    if (callType) {
      where.callType = callType;
    }

    if (userEmail) {
      where.userEmail = userEmail;
    }

    if (simProvider) {
      where.simProvider = simProvider;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { userEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.callTime = {};
      if (startDate) {
        where.callTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.callTime.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await this.prisma.callLog.count({ where });

    // Get stats for all call types
    const stats = await this.getStats(where);

    // Get paginated data
    const skip = (page - 1) * limit;
    const data = await this.prisma.callLog.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    this.logger.log(`Found ${data.length} call logs out of ${total} total`);

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

  /**
   * Get statistics for call types
   */
  private async getStats(baseWhere: Prisma.CallLogWhereInput = {}): Promise<CallLogStats> {
    // Remove callType from base where for stats calculation
    const { ...statsWhere } = baseWhere;
    delete (statsWhere as any).callType;

    const [total, incoming, outgoing, missed, unanswered] = await Promise.all([
      this.prisma.callLog.count({ where: statsWhere }),
      this.prisma.callLog.count({
        where: { ...statsWhere, callType: CallType.INCOMING },
      }),
      this.prisma.callLog.count({
        where: { ...statsWhere, callType: CallType.OUTGOING },
      }),
      this.prisma.callLog.count({
        where: { ...statsWhere, callType: CallType.MISSED },
      }),
      this.prisma.callLog.count({
        where: { ...statsWhere, callType: CallType.UNANSWERED },
      }),
    ]);

    return { total, incoming, outgoing, missed, unanswered };
  }

  /**
   * Find a single call log by ID
   */
  async findOne(id: string) {
    this.logger.log(`Fetching call log with ID: ${id}`);

    const callLog = await this.prisma.callLog.findUnique({
      where: { id },
    });

    if (!callLog) {
      this.logger.warn(`Call log with ID ${id} not found`);
      throw new NotFoundException(`Call log with ID ${id} not found`);
    }

    return callLog;
  }

  /**
   * Update a call log
   */
  async update(id: string, data: UpdateCallLogDto, userId: string = 'SYSTEM') {
    this.logger.log(`Updating call log with ID: ${id}`);

    // Check if exists
    await this.findOne(id);

    const updateData: Prisma.CallLogUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.callType !== undefined) updateData.callType = data.callType;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.simProvider !== undefined) updateData.simProvider = data.simProvider;
    if (data.userEmail !== undefined) updateData.userEmail = data.userEmail;
    if (data.callTime !== undefined) updateData.callTime = new Date(data.callTime);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await this.prisma.callLog.update({
      where: { id },
      data: updateData,
    });

    // Audit Log
    this.logsService
      .logAction('CALL_LOG_UPDATED', userId, {
        callLogId: id,
        updatedFields: Object.keys(data),
      })
      .catch((err) => this.logger.error('Failed to log CALL_LOG_UPDATED', err));

    this.logger.log(`Call log ${id} updated successfully`);
    return updated;
  }

  /**
   * Delete a call log
   */
  async delete(id: string, userId: string = 'SYSTEM') {
    this.logger.log(`Deleting call log with ID: ${id}`);

    // Check if exists
    const callLog = await this.findOne(id);

    const deleted = await this.prisma.callLog.delete({
      where: { id },
    });

    // Audit Log
    this.logsService
      .logAction('CALL_LOG_DELETED', userId, {
        callLogId: id,
        phoneNumber: callLog.phoneNumber,
        name: callLog.name,
      })
      .catch((err) => this.logger.error('Failed to log CALL_LOG_DELETED', err));

    this.logger.log(`Call log ${id} deleted successfully`);
    return deleted;
  }

  /**
   * Bulk delete call logs
   */
  async bulkDelete(ids: string[], userId: string = 'SYSTEM') {
    this.logger.log(`Bulk deleting ${ids.length} call logs`);

    const result = await this.prisma.callLog.deleteMany({
      where: { id: { in: ids } },
    });

    // Audit Log
    this.logsService
      .logAction('CALL_LOG_BULK_DELETED', userId, {
        count: result.count,
        ids,
      })
      .catch((err) => this.logger.error('Failed to log CALL_LOG_BULK_DELETED', err));

    this.logger.log(`Deleted ${result.count} call logs`);
    return { deleted: result.count };
  }

  /**
   * Get call logs by user email
   */
  async findByUserEmail(userEmail: string, limit = 100) {
    this.logger.log(`Fetching call logs for user: ${userEmail}`);

    return this.prisma.callLog.findMany({
      where: { userEmail },
      orderBy: { callTime: 'desc' },
      take: limit,
    });
  }
}
