import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Like } from './like.entity';

@Entity('chirps')
export class Chirp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 280 })
  text: string;

  @Column({ default: false })
  hasMedia: boolean;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ type: 'float', default: 0 })
  toxicityScore: number;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ type: 'jsonb', nullable: true })
  flaggedWords: { text: string; weight: number }[];

  @ManyToOne(() => User, (user) => user.chirps, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @OneToMany(() => Like, (like) => like.chirp)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;
}