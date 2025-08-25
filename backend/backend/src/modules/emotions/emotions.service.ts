import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class EmotionsService {
  async getAll(userId: number) {
    return prisma.emotion.findMany({ where: { userId } });
  }

  async create(userId: number, data: { mood: string; note?: string }) {
    return prisma.emotion.create({
      data: { ...data, userId },
    });
  }

  async update(id: number, data: { mood?: string; note?: string }) {
    return prisma.emotion.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.emotion.delete({ where: { id } });
  }
}
