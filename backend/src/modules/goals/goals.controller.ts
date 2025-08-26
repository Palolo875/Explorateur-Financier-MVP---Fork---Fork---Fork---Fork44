import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user goals' })
  @ApiResponse({ status: 200, description: 'List of user goals' })
  async getAll(@CurrentUser('id') userId: string) {
    return this.goalsService.getAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal details' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async getById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.goalsService.getById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(userId, {
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateGoalDto) {
    return this.goalsService.update(id, userId, {
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.goalsService.delete(id, userId);
  }
}
