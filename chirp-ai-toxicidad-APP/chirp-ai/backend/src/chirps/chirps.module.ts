import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chirp } from './chirp.entity';
import { Like } from './like.entity';
import { ChirpsService } from './chirps.service';
import { ChirpsController } from './chirps.controller';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chirp, Like]), UsersModule, AiModule],
  providers: [ChirpsService],
  controllers: [ChirpsController],
  exports: [TypeOrmModule],
})
export class ChirpsModule {}
