import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return goal;
  }

  async create(userId: string, data: { title: string; targetAmount: number; deadline?: Date }) {
    return this.prisma.goal.create({
      data: {
        ...data,
        currentAmount: 0,
        userId,
      },
    });
  }

  async update(id: string, userId: string, data: { title?: string; targetAmount?: number; currentAmount?: number; deadline?: Date }) {
    await this.getById(id, userId); // Vérifie l'existence et les permissions

    return this.prisma.goal.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId); // Vérifie l'existence et les permissions

    return this.prisma.goal.delete({ where: { id } });
  }
}
