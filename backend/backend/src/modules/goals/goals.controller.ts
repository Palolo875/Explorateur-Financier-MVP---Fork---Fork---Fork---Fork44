import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { GoalsService } from './goals.service';

@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    return this.goalsService.getAll(Number(userId));
  }

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() body: { title: string; targetAmount: number; deadline: Date }) {
    return this.goalsService.create(Number(userId), body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.goalsService.update(Number(id), body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.goalsService.delete(Number(id));
  }
}
