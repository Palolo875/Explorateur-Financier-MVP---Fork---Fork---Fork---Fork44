import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreateTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  list(userId: string, from?: string, to?: string, category?: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        category: category || undefined,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        date: new Date(dto.date),
        amount: dto.amount,
        category: dto.category,
        description: dto.description,
        source: dto.source,
      },
    });
  }
}
