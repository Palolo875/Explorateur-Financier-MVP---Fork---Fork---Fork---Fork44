import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma.module';
import { AppCacheModule } from './common/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { GoalsModule } from './modules/goals/goals.module';
import { EmotionsModule } from './modules/emotions/emotions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { InsightsModule } from './modules/insights/insights.module';
import { JwtAuthGuard } from './modules/auth/jwt.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import databaseConfig from './common/config/database.config';
import jwtConfig from './common/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 seconde
        limit: 3, // 3 requêtes par seconde
      },
      {
        name: 'medium',
        ttl: 10000, // 10 secondes
        limit: 20, // 20 requêtes par 10 secondes
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
    ]),
    PrismaModule,
    AppCacheModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    GoalsModule,
    EmotionsModule,
    NotificationsModule,
    HealthModule,
    InsightsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
