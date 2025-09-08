import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const VALID_MOODS = ['happy', 'sad', 'anxious', 'excited', 'stressed', 'calm', 'frustrated', 'optimistic', 'worried', 'content'] as const;

export class CreateEmotionDto {
  @ApiProperty({ 
    description: 'Current mood', 
    example: 'happy',
    enum: VALID_MOODS 
  })
  @IsString()
  @IsIn(VALID_MOODS)
  mood!: string;

  @ApiPropertyOptional({ description: 'Additional notes about the mood', example: 'Feeling great after a successful day' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Date of the emotion entry', example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateEmotionDto {
  @ApiPropertyOptional({ 
    description: 'Current mood',
    enum: VALID_MOODS 
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_MOODS)
  mood?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the mood' })
  @IsOptional()
  @IsString()
  note?: string;
}