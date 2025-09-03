import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  describe('with all modules disabled', () => {
    beforeAll(async () => {
      process.env.USE_FINGPT = 'false';
      process.env.USE_FINROBOT = 'false';
      process.env.USE_TF = 'false';
      const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ isGlobal: true })],
        providers: [AiService],
      }).compile();
      service = module.get<AiService>(AiService);
    });

    it('returns disabled message for FinGPT', async () => {
      await expect(service.analyzeWithFinGPT('test')).resolves.toContain('disabled');
    });

    it('returns disabled message for FinRobot', async () => {
      await expect(service.runFinRobotTask('test')).resolves.toContain('disabled');
    });

    it('returns disabled message for TensorFlow', async () => {
      await expect(service.runTFModel({})).resolves.toContain('disabled');
    });
  });

  describe('with TF enabled only', () => {
    beforeAll(async () => {
      process.env.USE_FINGPT = 'false';
      process.env.USE_FINROBOT = 'false';
      process.env.USE_TF = 'true';
      const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ isGlobal: true })],
        providers: [AiService],
      }).compile();
      service = module.get<AiService>(AiService);
    });

    it('runs TF model stub successfully', async () => {
      const result = await service.runTFModel({});
      expect(result).toContain('TF model ran');
    });
  });
});

