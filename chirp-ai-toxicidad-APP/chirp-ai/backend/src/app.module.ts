import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChirpsModule } from './chirps/chirps.module';
import { FollowsModule } from './follows/follows.module';
import { TimelineModule } from './timeline/timeline.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'chirp',
      password: process.env.DB_PASSWORD || 'chirp',
      database: process.env.DB_NAME || 'chirp',
      autoLoadEntities: true,
      synchronize: true, // solo para desarrollo; en prod usar migraciones
    }),
    AuthModule,
    UsersModule,
    ChirpsModule,
    FollowsModule,
    TimelineModule,
    AiModule,
  ],
})
export class AppModule {}
