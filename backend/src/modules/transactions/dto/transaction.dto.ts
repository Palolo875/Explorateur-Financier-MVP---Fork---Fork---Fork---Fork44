import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsDateString() date: string;
  @IsNumber() amount: number;
  @IsString() category: string;
  @IsOptional() @IsString() description?: string;
  @IsString() source: string;
}
