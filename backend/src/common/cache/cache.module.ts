import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          return {
            store: redisStore,
            url: redisUrl,
            ttl: 300, // 5 minutes par défaut
            max: 100, // maximum 100 items en cache
            keyPrefix: 'finance-app:',
          };
        }

        // Fallback vers le cache en mémoire si Redis n'est pas disponible
        return {
          ttl: 300,
          max: 100,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}