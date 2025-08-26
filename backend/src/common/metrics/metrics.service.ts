import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private activeConnections: Gauge<string>;
  private databaseConnections: Gauge<string>;
  private cacheHits: Counter<string>;
  private authAttempts: Counter<string>;

  constructor() {
    // Collecter les métriques par défaut (CPU, mémoire, etc.)
    collectDefaultMetrics({ register });

    // Métriques HTTP
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [register],
    });

    // Métriques de connexion
    this.activeConnections = new Gauge({
      name: 'websocket_connections_active',
      help: 'Number of active WebSocket connections',
      registers: [register],
    });

    this.databaseConnections = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [register],
    });

    // Métriques de cache
    this.cacheHits = new Counter({
      name: 'cache_operations_total',
      help: 'Total cache operations',
      labelNames: ['operation', 'result'],
      registers: [register],
    });

    // Métriques d'authentification
    this.authAttempts = new Counter({
      name: 'auth_attempts_total',
      help: 'Total authentication attempts',
      labelNames: ['type', 'result'],
      registers: [register],
    });
  }

  // Méthodes pour enregistrer les métriques
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route }, duration / 1000);
  }

  recordWebSocketConnection(change: number) {
    this.activeConnections.inc(change);
  }

  recordCacheOperation(operation: 'hit' | 'miss' | 'set', result: 'success' | 'error' = 'success') {
    this.cacheHits.inc({ operation, result });
  }

  recordAuthAttempt(type: 'login' | 'register', result: 'success' | 'failure') {
    this.authAttempts.inc({ type, result });
  }

  setDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  // Obtenir toutes les métriques au format Prometheus
  getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Réinitialiser toutes les métriques (utile pour les tests)
  resetMetrics() {
    register.resetMetrics();
  }
}