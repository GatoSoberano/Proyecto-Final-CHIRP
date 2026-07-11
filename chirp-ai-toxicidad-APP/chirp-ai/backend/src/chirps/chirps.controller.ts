import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChirpsService } from './chirps.service';
import { CreateChirpDto } from './dto';

@ApiTags('chirps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chirps')
export class ChirpsController {
  constructor(private readonly chirps: ChirpsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateChirpDto) {
    return this.chirps.create(req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.chirps.remove(req.user.userId, id);
  }

  @Post(':id/like')
  like(@Req() req, @Param('id') id: string) {
    return this.chirps.like(req.user.userId, id);
  }

  @Delete(':id/like')
  unlike(@Req() req, @Param('id') id: string) {
    return this.chirps.unlike(req.user.userId, id);
  }
}
