import { Injectable } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UploadsService {
  constructor(private readonly s3Service: S3Service) {}

  getPresignedUrl(filename: string) {
    return this.s3Service.getPresignedUrl(filename);
  }
}
