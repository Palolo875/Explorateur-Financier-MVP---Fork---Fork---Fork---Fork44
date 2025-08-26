import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EmotionsService } from './emotions.service';
import { CreateEmotionDto, UpdateEmotionDto } from './dto/emotion.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('Emotions')
@ApiBearerAuth()
@Controller('emotions')
export class EmotionsController {
  constructor(private emotionsService: EmotionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user emotion entries' })
  @ApiResponse({ status: 200, description: 'List of emotion entries' })
  async getAll(@CurrentUser('id') userId: string) {
    return this.emotionsService.getAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific emotion entry' })
  @ApiParam({ name: 'id', description: 'Emotion entry ID' })
  @ApiResponse({ status: 200, description: 'Emotion entry details' })
  @ApiResponse({ status: 404, description: 'Emotion entry not found' })
  async getById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.emotionsService.getById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new emotion entry' })
  @ApiResponse({ status: 201, description: 'Emotion entry created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateEmotionDto) {
    return this.emotionsService.create(userId, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an emotion entry' })
  @ApiParam({ name: 'id', description: 'Emotion entry ID' })
  @ApiResponse({ status: 200, description: 'Emotion entry updated successfully' })
  @ApiResponse({ status: 404, description: 'Emotion entry not found' })
  async update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateEmotionDto) {
    return this.emotionsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an emotion entry' })
  @ApiParam({ name: 'id', description: 'Emotion entry ID' })
  @ApiResponse({ status: 200, description: 'Emotion entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Emotion entry not found' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.emotionsService.delete(id, userId);
  }
}
