import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn } from 'typeorm';

@Entity('follows')
@Unique(['followerId', 'followeeId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  followerId: string; // quien sigue

  @Column()
  followeeId: string; // a quien sigue

  @CreateDateColumn()
  createdAt: Date;
}
