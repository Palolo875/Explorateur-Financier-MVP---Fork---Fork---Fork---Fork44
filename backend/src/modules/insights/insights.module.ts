import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { ExternalApisService } from './external-apis.service';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, ExternalApisService],
  exports: [InsightsService, ExternalApisService],
})
export class InsightsModule {}