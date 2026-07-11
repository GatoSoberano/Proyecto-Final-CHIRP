import { Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowsService } from './follows.service';

@ApiTags('follows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(private readonly follows: FollowsService) {}

  @Post(':id')
  follow(@Req() req, @Param('id') id: string) {
    return this.follows.follow(req.user.userId, id);
  }

  @Delete(':id')
  unfollow(@Req() req, @Param('id') id: string) {
    return this.follows.unfollow(req.user.userId, id);
  }
}
