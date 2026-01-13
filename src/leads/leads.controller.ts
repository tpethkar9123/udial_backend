import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LeadsService, CreateLeadDto, UpdateLeadDto } from './leads.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('leads')
@UseGuards(AuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll() {
    return this.leadsService.findAll();
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
