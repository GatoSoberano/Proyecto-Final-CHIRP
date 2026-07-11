import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Chirp } from '../chirps/chirp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ type: 'float', default: 0 })
  avgHistoricalLikes: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Chirp, (chirp) => chirp.author)
  chirps: Chirp[];
}
