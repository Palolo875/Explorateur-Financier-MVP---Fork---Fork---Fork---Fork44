import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class NotificationsService {
  async getAll(userId: number) {
    return prisma.notification.findMany({ where: { userId } });
  }

  async create(userId: number, data: { type: string; message: string }) {
    return prisma.notification.create({
      data: { ...data, userId },
    });
  }

  async delete(id: number) {
    return prisma.notification.delete({ where: { id } });
  }
}
