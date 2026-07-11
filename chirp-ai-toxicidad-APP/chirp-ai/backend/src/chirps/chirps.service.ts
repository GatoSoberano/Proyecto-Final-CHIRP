import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chirp } from './chirp.entity';
import { Like } from './like.entity';
import { CreateChirpDto } from './dto';
import { UsersService } from '../users/users.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChirpsService {
  constructor(
    @InjectRepository(Chirp) private readonly chirps: Repository<Chirp>,
    @InjectRepository(Like) private readonly likes: Repository<Like>,
    private readonly users: UsersService,
    private readonly ai: AiService,
  ) {}

  async create(userId: string, dto: CreateChirpDto) {
    const user = await this.users.findById(userId);
    // Llamada al microservicio de IA para moderar el contenido.
    const moderation = await this.ai.moderate(dto.text);
    const chirp = this.chirps.create({
      text: dto.text,
      hasMedia: dto.hasMedia ?? false,
      author: user,
      authorId: user.id,
      toxicityScore: moderation.toxicity_score,
      isFlagged: moderation.is_toxic,
      flaggedWords: moderation.flagged_words,
    });
    return this.chirps.save(chirp);
  }

  async remove(userId: string, chirpId: string) {
    const chirp = await this.chirps.findOne({ where: { id: chirpId } });
    if (!chirp) throw new NotFoundException('Chirp no encontrado');
    if (chirp.authorId !== userId) throw new ForbiddenException('No es tu chirp');
    await this.chirps.remove(chirp);
    return { deleted: true };
  }

  async like(userId: string, chirpId: string) {
    const chirp = await this.chirps.findOne({ where: { id: chirpId } });
    if (!chirp) throw new NotFoundException('Chirp no encontrado');
    const existing = await this.likes.findOne({ where: { userId, chirpId } });
    if (existing) return chirp; // idempotente
    await this.likes.save(this.likes.create({ userId, chirpId }));
    chirp.likesCount += 1;
    return this.chirps.save(chirp);
  }

  async unlike(userId: string, chirpId: string) {
    const existing = await this.likes.findOne({ where: { userId, chirpId } });
    if (!existing) return { unliked: false };
    await this.likes.remove(existing);
    await this.chirps.decrement({ id: chirpId }, 'likesCount', 1);
    return { unliked: true };
  }
}
