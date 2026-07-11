import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chirp } from '../chirps/chirp.entity';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chirp]), FollowsModule],
  providers: [TimelineService],
  controllers: [TimelineController],
})
export class TimelineModule {}
