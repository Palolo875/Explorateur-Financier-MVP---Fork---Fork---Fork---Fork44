#!/bin/bash

set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
NAMESPACE="finance-app-${ENVIRONMENT}"

echo "🚀 Déploiement de l'API Finance vers l'environnement: $ENVIRONMENT"
echo "📦 Image tag: $IMAGE_TAG"

# Vérifications préalables
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl n'est pas installé"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "❌ helm n'est pas installé"
    exit 1
fi

# Créer le namespace s'il n'existe pas
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Vérifier la connectivité au cluster
echo "🔍 Vérification de la connectivité au cluster Kubernetes..."
kubectl cluster-info

# Appliquer les secrets (à adapter selon votre gestionnaire de secrets)
echo "🔐 Application des secrets..."
if [ "$ENVIRONMENT" = "production" ]; then
    kubectl apply -f k8s/secrets/production.yaml -n $NAMESPACE
else
    kubectl apply -f k8s/secrets/staging.yaml -n $NAMESPACE
fi

# Mettre à jour l'image dans le deployment
echo "📝 Mise à jour de l'image du déploiement..."
sed -i "s|image: ghcr.io/.*|image: ghcr.io/your-org/finance-app/backend:$IMAGE_TAG|g" k8s/deployment.yaml

# Appliquer les manifestes Kubernetes
echo "🔄 Application des manifestes Kubernetes..."
kubectl apply -f k8s/ -n $NAMESPACE

# Attendre que le déploiement soit prêt
echo "⏳ Attente de la disponibilité du déploiement..."
kubectl rollout status deployment/finance-api -n $NAMESPACE --timeout=300s

# Exécuter les migrations de base de données
echo "🗄️ Exécution des migrations de base de données..."
kubectl run migration-job-$(date +%s) \
  --image=ghcr.io/your-org/finance-app/backend:$IMAGE_TAG \
  --restart=Never \
  --rm -i \
  --env="DATABASE_URL=$(kubectl get secret finance-api-secrets -n $NAMESPACE -o jsonpath='{.data.database-url}' | base64 -d)" \
  -- npm run migrate:deploy

# Vérifications post-déploiement
echo "🏥 Vérifications de santé..."
INGRESS_IP=$(kubectl get ingress finance-api-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z "$INGRESS_IP" ]; then
    INGRESS_IP=$(kubectl get service finance-api-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi

if [ ! -z "$INGRESS_IP" ]; then
    echo "🌐 Test de l'endpoint de santé..."
    for i in {1..30}; do
        if curl -f "http://$INGRESS_IP/health" > /dev/null 2>&1; then
            echo "✅ Endpoint de santé accessible"
            break
        fi
        echo "⏳ Tentative $i/30..."
        sleep 10
    done
else
    echo "⚠️ Impossible de récupérer l'IP d'ingress, test de santé ignoré"
fi

# Afficher les informations de déploiement
echo ""
echo "📊 Informations de déploiement:"
kubectl get pods -n $NAMESPACE -l app=finance-api
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo ""
echo "✅ Déploiement terminé avec succès!"
echo "🌐 URL de l'API: https://api-${ENVIRONMENT}.your-domain.com"
echo "📚 Documentation: https://api-${ENVIRONMENT}.your-domain.com/docs"

# Envoyer une notification (optionnel)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Déploiement réussi de l'API Finance vers $ENVIRONMENT avec l'image $IMAGE_TAG\"}" \
        $SLACK_WEBHOOK_URL
fi