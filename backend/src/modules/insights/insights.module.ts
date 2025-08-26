import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { ExternalApisService } from './external-apis.service';
import { NlpCloudService } from './nlp-cloud.service';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, ExternalApisService, NlpCloudService],
  exports: [InsightsService, ExternalApisService, NlpCloudService],
})
export class InsightsModule {}