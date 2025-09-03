import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly useFinGpt: boolean;
  private readonly useFinRobot: boolean;
  private readonly useTf: boolean;

  constructor(private readonly configService: ConfigService) {
    this.useFinGpt = this.parseBoolean(this.configService.get<string>('USE_FINGPT'));
    this.useFinRobot = this.parseBoolean(this.configService.get<string>('USE_FINROBOT'));
    this.useTf = this.parseBoolean(this.configService.get<string>('USE_TF'));
  }

  private parseBoolean(value?: string): boolean {
    return String(value).toLowerCase() === 'true';
  }

  async analyzeWithFinGPT(input: string): Promise<string> {
    if (!this.useFinGpt) {
      this.logger.warn('FinGPT module disabled. Returning fallback response.');
      return 'FinGPT disabled: no analysis performed.';
    }
    try {
      // Placeholder direct call stub; later: import from /modules/fingpt
      return `FinGPT analysis summary for: ${input.slice(0, 64)}...`;
    } catch (error) {
      this.logger.error('FinGPT analysis failed', error as Error);
      return 'FinGPT error: analysis unavailable.';
    }
  }

  async runFinRobotTask(query: string): Promise<string> {
    if (!this.useFinRobot) {
      this.logger.warn('FinRobot module disabled. Returning fallback response.');
      return 'FinRobot disabled: no agent action performed.';
    }
    try {
      // Placeholder: call agent pipeline (perception -> reflection -> action)
      return `FinRobot agent executed task for: ${query.slice(0, 64)}...`;
    } catch (error) {
      this.logger.error('FinRobot task failed', error as Error);
      return 'FinRobot error: task execution unavailable.';
    }
  }

  async runTFModel(input: unknown): Promise<string> {
    if (!this.useTf) {
      this.logger.warn('TensorFlow module disabled. Returning fallback response.');
      return 'TensorFlow disabled: no model execution performed.';
    }
    try {
      // Lazy import to keep startup fast if not used
      const tf = await import('@tensorflow/tfjs-node');
      // Minimal deterministic operation to validate runtime
      const tensor = tf.tensor([1, 2, 3, 4]);
      const result = tensor.sum().arraySync();
      return `TF model ran. Sanity sum=${result}`;
    } catch (error) {
      this.logger.error('TensorFlow execution failed', error as Error);
      return 'TensorFlow error: model execution unavailable.';
    }
  }
}

