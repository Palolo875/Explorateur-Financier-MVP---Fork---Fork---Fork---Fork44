import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({ description: 'Goal title', example: 'Buy a new car' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Target amount in currency', example: 25000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetAmount: number;

  @ApiPropertyOptional({ description: 'Goal deadline', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({ description: 'Goal title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Target amount in currency' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetAmount?: number;

  @ApiPropertyOptional({ description: 'Current amount saved' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentAmount?: number;

  @ApiPropertyOptional({ description: 'Goal deadline' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}