import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeadsService, CreateLeadDto, UpdateLeadDto } from './leads.service';
import { AuthGuard } from '../auth/auth.guard';
import { LeadQueryDto } from './dto/lead-query.dto';

@Controller('leads')
@UseGuards(AuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Post()
  create(@Body() data: CreateLeadDto) {
    return this.leadsService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateLeadDto) {
    return this.leadsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.leadsService.delete(id);
  }
}
