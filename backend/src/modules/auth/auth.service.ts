import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaClient, private jwt: JwtService) {}

  async register(email: string, password: string, name?: string) {
    const hash = await argon2.hash(password);
    const user = await this.prisma.user.create({ data: { email, passwordHash: hash, name }});
    return { token: await this.sign(user.id, user.email) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email }});
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException();
    }
    return { token: await this.sign(user.id, user.email) };
  }

  private async sign(id: string, email: string) {
    return this.jwt.signAsync({ sub: id, email });
  }
}
