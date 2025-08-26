import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';

@Injectable()
export class EmotionsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    return this.prisma.emotion.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getById(id: string, userId: string) {
    const emotion = await this.prisma.emotion.findUnique({
      where: { id },
    });

    if (!emotion) {
      throw new NotFoundException('Emotion entry not found');
    }

    if (emotion.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return emotion;
  }

  async create(userId: string, data: { mood: string; note?: string; date?: Date }) {
    return this.prisma.emotion.create({
      data: {
        ...data,
        userId,
        date: data.date || new Date(),
      },
    });
  }

  async update(id: string, userId: string, data: { mood?: string; note?: string }) {
    await this.getById(id, userId); // Vérifie l'existence et les permissions

    return this.prisma.emotion.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId); // Vérifie l'existence et les permissions

    return this.prisma.emotion.delete({ where: { id } });
  }
}
