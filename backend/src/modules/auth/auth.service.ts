import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma.module';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, name?: string) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hash = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hash, name },
    });
    return { 
      token: await this.sign(user.id, user.email),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    return { 
      token: await this.sign(user.id, user.email),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  private async sign(id: string, email: string) {
    return this.jwt.signAsync({ sub: id, email });
  }
}
