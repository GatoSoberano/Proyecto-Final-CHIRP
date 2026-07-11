import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email ya registrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });
    return this.sign(user.id, user.username);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return this.sign(user.id, user.username);
  }

  private sign(sub: string, username: string) {
    const token = this.jwt.sign({ sub, username });
    return { accessToken: token, username };
  }
}
