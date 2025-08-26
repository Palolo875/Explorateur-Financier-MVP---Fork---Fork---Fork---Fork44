# Multi-stage build pour optimiser la taille de l'image
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Installation des dépendances système
RUN apk add --no-cache libc6-compat

FROM base AS deps
# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copie du code source
COPY . .

# Génération du client Prisma et build
RUN npm run prisma:generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copie des dépendances et du build
COPY --from=deps --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/prisma ./prisma

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/main.js"]
