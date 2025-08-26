import { execSync } from 'child_process';

// Configuration globale pour les tests
beforeAll(async () => {
  // Définir les variables d'environnement pour les tests
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

  // Attendre que la base de données soit prête
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  // Nettoyage après tous les tests
  await new Promise(resolve => setTimeout(resolve, 1000));
});