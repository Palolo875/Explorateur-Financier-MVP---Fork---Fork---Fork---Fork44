import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationDto {
  type: 'insight' | 'warning' | 'tip' | 'reminder';
  title?: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        userId,
      },
    });

    // Envoyer la notification en temps réel via WebSocket
    await this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { 
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { 
        read: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  // Méthodes utilitaires pour créer des notifications spécifiques
  async createInsight(userId: string, message: string, data?: any) {
    return this.create(userId, {
      type: 'insight',
      title: 'Nouveau conseil financier',
      message,
      data,
    });
  }

  async createWarning(userId: string, message: string, data?: any) {
    return this.create(userId, {
      type: 'warning',
      title: 'Attention',
      message,
      data,
    });
  }

  async createReminder(userId: string, message: string, data?: any) {
    return this.create(userId, {
      type: 'reminder',
      title: 'Rappel',
      message,
      data,
    });
  }
}
