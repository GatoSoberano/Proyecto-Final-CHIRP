import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private readonly repo: Repository<Follow>,
    private readonly users: UsersService,
  ) {}

  async follow(followerId: string, followeeId: string) {
    if (followerId === followeeId) throw new BadRequestException('No puedes seguirte a ti mismo');
    const existing = await this.repo.findOne({ where: { followerId, followeeId } });
    if (existing) return existing;
    const follow = await this.repo.save(this.repo.create({ followerId, followeeId }));
    const followee = await this.users.findById(followeeId);
    followee.followersCount += 1;
    await this.users.save(followee);
    return follow;
  }

  async unfollow(followerId: string, followeeId: string) {
    const existing = await this.repo.findOne({ where: { followerId, followeeId } });
    if (!existing) return { unfollowed: false };
    await this.repo.remove(existing);
    const followee = await this.users.findById(followeeId);
    followee.followersCount = Math.max(0, followee.followersCount - 1);
    await this.users.save(followee);
    return { unfollowed: true };
  }

  async followeeIds(followerId: string): Promise<string[]> {
    const rows = await this.repo.find({ where: { followerId } });
    return rows.map((r) => r.followeeId);
  }
}
