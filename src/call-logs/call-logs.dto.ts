import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsInt,
  Min,
  IsDateString,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CallType, SimProvider } from '@prisma/client';

/**
 * DTO for creating a new call log
 */
export class CreateCallLogDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(/^\+?[0-9\s-]+$/, { message: 'Invalid phone number format' })
  phoneNumber!: string;

  @IsEnum(CallType)
  callType!: CallType;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  duration?: number = 0;

  @IsEnum(SimProvider)
  @IsOptional()
  simProvider?: SimProvider = SimProvider.OTHER;

  @IsEmail()
  userEmail!: string;

  @IsDateString()
  @IsOptional()
  callTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for updating an existing call log
 */
export class UpdateCallLogDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @Matches(/^\+?[0-9\s-]+$/, { message: 'Invalid phone number format' })
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(CallType)
  @IsOptional()
  callType?: CallType;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @IsEnum(SimProvider)
  @IsOptional()
  simProvider?: SimProvider;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsDateString()
  @IsOptional()
  callTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for filtering and querying call logs
 */
export class CallLogQueryDto {
  @IsEnum(CallType)
  @IsOptional()
  callType?: CallType;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsEnum(SimProvider)
  @IsOptional()
  simProvider?: SimProvider;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string = 'callTime';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
