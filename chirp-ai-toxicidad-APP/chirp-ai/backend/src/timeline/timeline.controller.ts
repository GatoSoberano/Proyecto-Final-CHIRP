import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TimelineService } from './timeline.service';

@ApiTags('timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timeline: TimelineService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  home(@Req() req) {
    return this.timeline.forUser(req.user.userId);
  }

  @Get('explore')
  explore() {
    return this.timeline.explore();
  }
}
