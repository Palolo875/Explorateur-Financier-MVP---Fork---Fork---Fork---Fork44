import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (minimum 6 characters)', example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'User full name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'securePassword123' })
  @IsString()
  password: string;
}
