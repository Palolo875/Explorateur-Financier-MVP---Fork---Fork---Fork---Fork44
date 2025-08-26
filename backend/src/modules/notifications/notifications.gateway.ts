import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.module';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [/^http:\/\/localhost:\d+$/, /\.bolt\.new$/, /^https:\/\/.*\.vercel\.app$/],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extraire le token JWT du handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Vérifier le token JWT
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Vérifier que l'utilisateur existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        this.logger.warn(`Client ${client.id} rejected: User not found`);
        client.disconnect();
        return;
      }

      // Authentifier le socket
      client.userId = userId;
      this.connectedUsers.set(userId, client.id);

      this.logger.log(`User ${user.email} connected with socket ${client.id}`);

      // Envoyer les notifications non lues
      await this.sendUnreadNotifications(client);

    } catch (error) {
      this.logger.error(`Authentication failed for socket ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.userId) return;

    try {
      await this.prisma.notification.update({
        where: {
          id: data.notificationId,
          userId: client.userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      client.emit('notification_read', { notificationId: data.notificationId });
    } catch (error) {
      this.logger.error(`Error marking notification as read:`, error);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      const count = await this.prisma.notification.count({
        where: {
          userId: client.userId,
          read: false,
        },
      });

      client.emit('unread_count', { count });
    } catch (error) {
      this.logger.error(`Error getting unread count:`, error);
    }
  }

  // Méthode pour envoyer une notification à un utilisateur spécifique
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new_notification', notification);
      this.logger.log(`Notification sent to user ${userId}`);
    }
  }

  // Méthode pour diffuser une notification à tous les utilisateurs connectés
  broadcastNotification(notification: any) {
    this.server.emit('broadcast_notification', notification);
    this.logger.log(`Broadcast notification sent to all users`);
  }

  private async sendUnreadNotifications(client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId: client.userId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      client.emit('unread_notifications', notifications);
    } catch (error) {
      this.logger.error(`Error sending unread notifications:`, error);
    }
  }
}