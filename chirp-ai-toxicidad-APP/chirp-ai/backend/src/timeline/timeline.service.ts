import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Chirp } from '../chirps/chirp.entity';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Chirp) private readonly chirps: Repository<Chirp>,
    private readonly follows: FollowsService,
  ) {}

  // Timeline: chirps propios + de los seguidos, más recientes primero.
  async forUser(userId: string) {
    const ids = await this.follows.followeeIds(userId);
    const authorIds = [...ids, userId];
    return this.chirps.find({
      where: { authorId: In(authorIds) },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  // Timeline público (explorar) para usuarios sin follows.
  async explore() {
    return this.chirps.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
