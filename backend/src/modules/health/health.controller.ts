import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/prisma.module';
import { MetricsService } from '../../common/metrics/metrics.service';
import fetch from 'node-fetch';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private metricsService: MetricsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    try {
      // Test de la connexion à la base de données
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch (error) {
      throw new Error('Database not ready');
    }
  }

  @Public()
  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  async metrics() {
    return this.metricsService.getMetrics();
  }

  @Public()
  @Get('external')
  @ApiOperation({ summary: 'External APIs connectivity check' })
  @ApiResponse({ status: 200, description: 'External APIs status' })
  async external() {
    const alphaKey = process.env.ALPHA_VANTAGE_KEY;
    const nlpKeyPresent = Boolean(process.env.NLP_CLOUD_API_KEY);

    let alphaStatus = 'not_configured';
    let alphaError: string | undefined;

    if (alphaKey) {
      try {
        const res = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${alphaKey}&limit=1`, { timeout: 8000 } as any);
        if (res.ok) {
          alphaStatus = 'ok';
        } else {
          alphaStatus = 'error';
          alphaError = `HTTP ${res.status}`;
        }
      } catch (e: any) {
        alphaStatus = 'error';
        alphaError = e.message;
      }
    }

    return {
      alphaVantage: { configured: Boolean(alphaKey), status: alphaStatus, error: alphaError },
      nlpCloud: { configured: nlpKeyPresent, note: 'No runtime call here; service checks handle this.' }
    };
  }
}