import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY_METADATA } from '../decorators/cache-key.decorator';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    
    if (!userId) {
      return next.handle();
    }

    // Construire la clé de cache avec l'ID utilisateur
    const fullCacheKey = `${cacheKey}:${userId}`;

    // Vérifier le cache
    const cachedResult = await this.cacheManager.get(fullCacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // Exécuter et mettre en cache
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(fullCacheKey, response, 300000); // 5 minutes
      }),
    );
  }
}