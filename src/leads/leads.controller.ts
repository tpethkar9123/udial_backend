import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
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
  create(@Body() data: any) {
    return this.leadsService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: any) {
    return this.leadsService.findOne(id);
  }
}
