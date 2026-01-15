import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CallLogsService } from './call-logs.service';
import { CreateCallLogDto, UpdateCallLogDto, CallLogQueryDto } from './call-logs.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('call-logs')
@UseGuards(AuthGuard)
export class CallLogsController {
  private readonly logger = new Logger(CallLogsController.name);

  constructor(private readonly callLogsService: CallLogsService) {}

  /**
   * GET /api/call-logs
   * Get all call logs with filtering, pagination, and search
   */
  @Get()
  async findAll(@Query() query: CallLogQueryDto) {
    this.logger.log(`GET /call-logs with query: ${JSON.stringify(query)}`);
    return this.callLogsService.findAll(query);
  }

  /**
   * GET /api/call-logs/:id
   * Get a single call log by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /call-logs/${id}`);
    return this.callLogsService.findOne(id);
  }

  /**
   * POST /api/call-logs
   * Create a new call log
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateCallLogDto) {
    this.logger.log(`POST /call-logs - Creating call log`);
    return this.callLogsService.create(data);
  }

  /**
   * PUT /api/call-logs/:id
   * Update an existing call log
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateCallLogDto) {
    this.logger.log(`PUT /call-logs/${id} - Updating call log`);
    return this.callLogsService.update(id, data);
  }

  /**
   * DELETE /api/call-logs/:id
   * Delete a call log
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    this.logger.log(`DELETE /call-logs/${id}`);
    return this.callLogsService.delete(id);
  }

  /**
   * POST /api/call-logs/bulk-delete
   * Bulk delete multiple call logs
   */
  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() body: { ids: string[] }) {
    this.logger.log(`POST /call-logs/bulk-delete - ${body.ids.length} items`);
    return this.callLogsService.bulkDelete(body.ids);
  }

  /**
   * GET /api/call-logs/user/:email
   * Get all call logs for a specific user
   */
  @Get('user/:email')
  async findByUser(@Param('email') email: string) {
    this.logger.log(`GET /call-logs/user/${email}`);
    return this.callLogsService.findByUserEmail(email);
  }
}
