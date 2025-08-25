import { Module } from '@nestjs/common';
import { EmotionsService } from './emotions.service';
import { EmotionsController } from './emotions.controller';

@Module({
  providers: [EmotionsService],
  controllers: [EmotionsController],
})
export class EmotionsModule {}
