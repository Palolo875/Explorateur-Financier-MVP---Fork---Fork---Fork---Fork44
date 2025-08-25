import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    return this.notificationsService.getAll(Number(userId));
  }

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() body: { type: string; message: string }) {
    return this.notificationsService.create(Number(userId), body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notificationsService.delete(Number(id));
  }
}
