import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CacheKey } from '../../common/decorators/cache-key.decorator';
import { HttpCacheInterceptor } from '../../common/interceptors/cache.interceptor';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('transactions')
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  list(
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('category') category?: string,
  ) {
    return this.service.list(userId, from, to, category);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTransactionDto) {
    return this.service.create(userId, dto);
  }
}
