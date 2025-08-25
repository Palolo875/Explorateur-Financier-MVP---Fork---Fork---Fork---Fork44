import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get()
  list(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string, @Query('category') category?: string) {
    const userId = req.user?.sub ?? 'demo-user'; // à remplacer par guard JWT
    return this.service.list(userId, from, to, category);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTransactionDto) {
    const userId = req.user?.sub ?? 'demo-user';
    return this.service.create(userId, dto);
  }
}
