import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

class ModerateDto {
  text: string;
}

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // Chequeo de toxicidad en vivo (lo usa el composer mientras el usuario escribe).
  @Post('moderate')
  moderate(@Body() dto: ModerateDto) {
    return this.ai.moderate(dto.text ?? '');
  }
}
