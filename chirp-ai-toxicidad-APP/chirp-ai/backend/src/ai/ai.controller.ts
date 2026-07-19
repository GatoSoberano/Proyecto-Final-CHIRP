import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AiService } from './ai.service';

class ModerateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
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
