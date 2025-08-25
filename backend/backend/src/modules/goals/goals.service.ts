import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class GoalsService {
  async getAll(userId: number) {
    return prisma.goal.findMany({ where: { userId } });
  }

  async create(userId: number, data: { title: string; targetAmount: number; deadline: Date }) {
    return prisma.goal.create({
      data: { ...data, currentAmount: 0, userId },
    });
  }

  async update(id: number, data: { title?: string; targetAmount?: number; currentAmount?: number; deadline?: Date }) {
    return prisma.goal.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.goal.delete({ where: { id } });
  }
}
