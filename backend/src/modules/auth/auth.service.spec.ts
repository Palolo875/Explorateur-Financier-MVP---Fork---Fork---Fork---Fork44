import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma.module';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '1',
        email: registerData.email,
        name: registerData.name,
      };
      const mockToken = 'jwt_token';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.register(
        registerData.email,
        registerData.password,
        registerData.name,
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(argon2.hash).toHaveBeenCalledWith(registerData.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          passwordHash: hashedPassword,
          name: registerData.name,
        },
      });
      expect(result).toEqual({
        token: mockToken,
        user: mockUser,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = { id: '1', email: registerData.email };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.register(registerData.email, registerData.password),
      ).rejects.toThrow(ConflictException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: loginData.email,
        name: 'Test User',
        passwordHash: 'hashed_password',
      };
      const mockToken = 'jwt_token';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.login(loginData.email, loginData.password);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.passwordHash,
        loginData.password,
      );
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(loginData.email, loginData.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        id: '1',
        email: loginData.email,
        passwordHash: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(loginData.email, loginData.password),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});