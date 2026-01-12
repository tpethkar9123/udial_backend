import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('uploads')
@UseGuards(AuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned')
  getPresignedUrl(@Body('filename') filename: string) {
    return this.uploadsService.getPresignedUrl(filename);
  }
}
