import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ModerationResult {
  toxicity_score: number;
  is_toxic: boolean;
  tokens: { text: string; weight: number }[];
  flagged_words: { text: string; weight: number }[];
  model_version: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  async moderate(text: string): Promise<ModerationResult> {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/moderate`,
        { text },
        { timeout: 4000 },
      );
      return data;
    } catch (err) {
      this.logger.warn(`IA no disponible, toxicity=0. ${err?.message}`);
      return {
        toxicity_score: 0,
        is_toxic: false,
        tokens: [],
        flagged_words: [],
        model_version: 'unavailable',
      };
    }
  }
}