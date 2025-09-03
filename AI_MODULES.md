## Modules IA pour Rivela

Ce document explique l’intégration modulaire de FinGPT, FinRobot et TensorFlow dans le backend NestJS.

### Flags d’activation

Définir ces variables d’environnement (ex: `.env`)

- `USE_FINGPT=true|false`
- `USE_FINROBOT=true|false`
- `USE_TF=true|false`

L’application démarre même si tous les modules sont désactivés.

### Dossiers

- `/modules/fingpt` : dépôt officiel cloné de FinGPT
- `/modules/finrobot` : dépôt officiel cloné de FinRobot
- `/modules/tensorflow_models` : modèles TensorFlow (placeholder)

### Dépendances

- Backend: `@tensorflow/tfjs-node` (CPU). Installé dans `backend`.
- FinGPT et FinRobot gardent leurs dépendances isolées dans leurs dossiers respectifs.

### API backend exposée (NestJS)

Service: `AiService` (`backend/src/modules/ai/ai.service.ts`)

Exemples d’appel (TypeScript):

```ts
// analyzeWithFinGPT
const summary = await aiService.analyzeWithFinGPT("Analyse d’un ticker");

// runFinRobotTask
const result = await aiService.runFinRobotTask("Détecte opportunités marché");

// runTFModel
const output = await aiService.runTFModel({ features: [1,2,3] });
```

Remarque: Par défaut, ces fonctions retournent un résultat de validation léger. L’intégration profonde avec FinGPT/FinRobot sera branchée ultérieurement (LoRA/QLoRA possible).

### Activation et installation

1. Clonage (déjà automatisé) :
   - `/modules/fingpt` ← `https://github.com/AI4Finance-Foundation/FinGPT`
   - `/modules/finrobot` ← `https://github.com/AI4Finance-Foundation/FinRobot`

2. Installer dépendances backend:
   - `cd backend && npm install`

3. (Optionnel) Installer dépendances propres aux modules:
   - `cd /modules/fingpt && pip install -r requirements.txt` (si usage Python)
   - `cd /modules/finrobot && pip install -r requirements.txt`

### Fine-tuning (préparation)

Structure prévue pour ajouter des scripts LoRA/QLoRA dans `/modules/fingpt` plus tard, sans impacter le démarrage.

### Tests

Des tests unitaires valident que chaque fonction renvoie un message cohérent selon l’état des flags. Voir `backend/src/modules/ai/ai.service.spec.ts`.

