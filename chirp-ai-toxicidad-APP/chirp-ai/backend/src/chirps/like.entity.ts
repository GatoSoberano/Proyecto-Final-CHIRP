import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique, CreateDateColumn } from 'typeorm';
import { Chirp } from './chirp.entity';

@Entity('likes')
@Unique(['userId', 'chirpId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  chirpId: string;

  @ManyToOne(() => Chirp, (chirp) => chirp.likes, { onDelete: 'CASCADE' })
  chirp: Chirp;

  @CreateDateColumn()
  createdAt: Date;
}
