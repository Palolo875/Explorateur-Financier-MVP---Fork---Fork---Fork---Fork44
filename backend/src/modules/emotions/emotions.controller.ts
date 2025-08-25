import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmotionsService } from './emotions.service';

@Controller('emotions')
export class EmotionsController {
  constructor(private emotionsService: EmotionsService) {}

  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    return this.emotionsService.getAll(Number(userId));
  }

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() body: { mood: string; note?: string }) {
    return this.emotionsService.create(Number(userId), body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.emotionsService.update(Number(id), body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.emotionsService.delete(Number(id));
  }
}
