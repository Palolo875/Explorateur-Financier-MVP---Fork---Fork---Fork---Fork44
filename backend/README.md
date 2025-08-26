# Finance & Insights API Backend

Un backend NestJS robuste et sécurisé pour une application de gestion financière et de suivi émotionnel.

## 🚀 Fonctionnalités

- **Authentification JWT sécurisée** avec stratégie Passport
- **Gestion des transactions financières** avec filtrage avancé
- **Suivi des objectifs financiers** avec statuts et progression
- **Journal émotionnel** avec validation des humeurs
- **Système de notifications** avec métadonnées JSON
- **API documentée** avec Swagger/OpenAPI
- **Gestion d'erreurs centralisée** avec filtres personnalisés
- **Logging structuré** avec intercepteurs
- **Health checks** pour monitoring
- **Base de données optimisée** avec index et contraintes

## 🛠 Technologies

- **Framework**: NestJS 10.x
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: JWT + Argon2 pour le hachage
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerisation**: Docker + Docker Compose
- **Cache**: Redis (optionnel)

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 13+
- Redis (optionnel)
- Docker & Docker Compose (pour développement)

## 🚀 Installation

### Avec Docker (Recommandé)

```bash
# Cloner le repository
git clone <repo-url>
cd backend

# Lancer avec Docker Compose
docker-compose up -d

# Appliquer les migrations
docker-compose exec app npm run migrate:dev
```

### Installation manuelle

```bash
# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run migrate:dev

# Lancer en développement
npm run start:dev
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finance_app"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise"

# Application
NODE_ENV="development"
PORT=3000
```

### Base de données

Le schéma Prisma inclut:

- **Users**: Gestion des utilisateurs avec sécurité
- **Transactions**: Transactions financières avec index optimisés
- **Goals**: Objectifs avec statuts et progression
- **Emotions**: Journal émotionnel avec intensité
- **Notifications**: Système de notifications flexible

## 📚 API Documentation

Une fois l'application lancée, accédez à:

- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

### Endpoints principaux

#### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

#### Transactions
- `GET /transactions` - Liste des transactions
- `POST /transactions` - Créer une transaction

#### Objectifs
- `GET /goals` - Liste des objectifs
- `POST /goals` - Créer un objectif
- `PUT /goals/:id` - Modifier un objectif

#### Émotions
- `GET /emotions` - Journal émotionnel
- `POST /emotions` - Ajouter une entrée

## 🔒 Sécurité

### Mesures implémentées

- **Authentification JWT** avec guards globaux
- **Validation des données** avec DTOs typés
- **Hachage des mots de passe** avec Argon2
- **CORS configuré** pour les domaines autorisés
- **Gestion d'erreurs** sans exposition d'informations sensibles
- **Utilisateur non-root** dans Docker

### Bonnes pratiques

- Tokens JWT avec expiration
- Validation stricte des entrées
- Logging des erreurs sans données sensibles
- Variables d'environnement pour les secrets

## 📊 Monitoring & Observabilité

### Health Checks

- `GET /health` - État général du service
- `GET /health/ready` - Prêt pour Kubernetes

### Logging

- Requêtes HTTP avec temps de réponse
- Erreurs avec stack traces (en développement)
- Requêtes base de données (en développement)

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Déploiement

### Docker Production

```bash
# Build de l'image
docker build -t finance-api .

# Lancer en production
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  finance-api
```

### Variables d'environnement de production

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="secret-super-securise-en-production"
LOG_LEVEL=info
```

## 🔄 Migrations

```bash
# Créer une migration
npm run migrate:dev

# Appliquer en production
npm run migrate:deploy

# Reset (développement uniquement)
npx prisma migrate reset
```

## 📈 Performance

### Optimisations implémentées

- **Index de base de données** sur les colonnes fréquemment requêtées
- **Pagination** pour les grandes listes
- **Validation côté serveur** pour réduire les erreurs
- **Cache Redis** (optionnel) pour les sessions
- **Multi-stage Docker build** pour des images légères

### Recommandations

- Utilisez la pagination pour les listes
- Implémentez le cache Redis pour la production
- Configurez les limites de taux (rate limiting)
- Surveillez les métriques de performance

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Changelog

### v2.0.0 - Refactoring majeur
- ✅ Authentification JWT sécurisée
- ✅ Guards et décorateurs personnalisés
- ✅ Gestion d'erreurs centralisée
- ✅ API documentée avec Swagger
- ✅ Base de données optimisée
- ✅ Docker multi-stage
- ✅ Health checks
- ✅ Configuration typée

### v1.0.0 - Version initiale
- Authentification basique
- CRUD des entités
- API simple

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- Créez une issue sur GitHub
- Consultez la documentation Swagger
- Vérifiez les logs de l'application