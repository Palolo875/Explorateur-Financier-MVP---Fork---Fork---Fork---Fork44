import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

interface NlpCloudSentimentResponse {
  status?: string;
  score?: number;
  label?: string;
  error?: string;
}

@Injectable()
export class NlpCloudService {
  private readonly logger = new Logger(NlpCloudService.name);
  private readonly baseUrl = 'https://api.nlpcloud.io/v1';

  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; confidence: number } | null> {
    const apiKey = process.env.NLP_CLOUD_API_KEY;
    if (!apiKey) {
      this.logger.warn('NLP Cloud API key not configured.');
      return null;
    }

    try {
      // Using a general sentiment model endpoint (adjust model if needed)
      // Example model: bart-large-mnli or distilbert-base-uncased-finetuned-sst-2-english depending on NLP Cloud availability
      const model = 'distilbert-base-uncased-finetuned-sst-2-english';
      const response = await fetch(`${this.baseUrl}/${model}/sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      const data = await response.json() as NlpCloudSentimentResponse;

      if (data && (data.label || typeof data.score === 'number')) {
        const label = (data.label || '').toLowerCase();
        const score = Math.max(0, Math.min(1, data.score ?? 0.5));
        if (label.includes('pos')) return { sentiment: 'positive', confidence: score };
        if (label.includes('neg')) return { sentiment: 'negative', confidence: score };
        return { sentiment: 'neutral', confidence: score };
      }

      return null;
    } catch (error: any) {
      this.logger.warn(`Failed NLP Cloud sentiment: ${error.message}`);
      return null;
    }
  }
}