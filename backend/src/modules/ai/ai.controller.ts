import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('fingpt')
  analyze(@Query('q') q: string) {
    return this.aiService.analyzeWithFinGPT(q ?? '');
  }

  @Get('finrobot')
  runAgent(@Query('q') q: string) {
    return this.aiService.runFinRobotTask(q ?? '');
  }

  @Get('tf')
  runTF(@Query('q') q?: string) {
    return this.aiService.runTFModel(q ?? '');
  }
}

