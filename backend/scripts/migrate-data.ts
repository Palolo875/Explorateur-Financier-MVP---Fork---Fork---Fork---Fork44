import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

interface LegacyUser {
  id: number;
  email: string;
  name?: string;
  password_hash?: string;
  created_at?: Date;
}

interface LegacyTransaction {
  id: number;
  user_id: number;
  date: Date;
  amount: number;
  category: string;
  description?: string;
  source?: string;
}

interface LegacyGoal {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount?: number;
  deadline?: Date;
}

async function migrateUsers() {
  console.log('🔄 Migration des utilisateurs...');
  
  // Simuler la récupération des données legacy
  // En production, vous récupéreriez depuis votre ancienne base de données
  const legacyUsers: LegacyUser[] = [
    {
      id: 1,
      email: 'demo@example.com',
      name: 'Utilisateur Demo',
      password_hash: await argon2.hash('demo123'),
      created_at: new Date('2024-01-01'),
    },
  ];

  let migratedCount = 0;

  for (const legacyUser of legacyUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: legacyUser.email },
      });

      if (existingUser) {
        console.log(`⚠️  Utilisateur ${legacyUser.email} existe déjà, ignoré`);
        continue;
      }

      // Créer le nouvel utilisateur
      await prisma.user.create({
        data: {
          email: legacyUser.email,
          name: legacyUser.name,
          passwordHash: legacyUser.password_hash || await argon2.hash('temporaryPassword123'),
          createdAt: legacyUser.created_at || new Date(),
        },
      });

      migratedCount++;
      console.log(`✅ Utilisateur ${legacyUser.email} migré`);
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de l'utilisateur ${legacyUser.email}:`, error);
    }
  }

  console.log(`✅ Migration terminée: ${migratedCount} utilisateurs migrés\n`);
}

async function migrateTransactions() {
  console.log('🔄 Migration des transactions...');

  // Récupérer les utilisateurs migrés
  const users = await prisma.user.findMany();
  const userMap = new Map(users.map(u => [u.email, u.id]));

  // Simuler les transactions legacy
  const legacyTransactions: LegacyTransaction[] = [
    {
      id: 1,
      user_id: 1, // Correspond à demo@example.com
      date: new Date('2024-01-15'),
      amount: -50.00,
      category: 'Alimentation',
      description: 'Courses supermarché',
      source: 'manual',
    },
    {
      id: 2,
      user_id: 1,
      date: new Date('2024-01-16'),
      amount: 2500.00,
      category: 'Salaire',
      description: 'Salaire janvier',
      source: 'manual',
    },
  ];

  let migratedCount = 0;

  for (const legacyTransaction of legacyTransactions) {
    try {
      // Trouver l'utilisateur correspondant
      const demoUser = users.find(u => u.email === 'demo@example.com');
      if (!demoUser) {
        console.log(`⚠️  Utilisateur non trouvé pour la transaction ${legacyTransaction.id}`);
        continue;
      }

      await prisma.transaction.create({
        data: {
          userId: demoUser.id,
          date: legacyTransaction.date,
          amount: legacyTransaction.amount,
          category: legacyTransaction.category,
          description: legacyTransaction.description,
          source: legacyTransaction.source || 'manual',
        },
      });

      migratedCount++;
      console.log(`✅ Transaction ${legacyTransaction.id} migrée`);
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de la transaction ${legacyTransaction.id}:`, error);
    }
  }

  console.log(`✅ Migration terminée: ${migratedCount} transactions migrées\n`);
}

async function migrateGoals() {
  console.log('🔄 Migration des objectifs...');

  const users = await prisma.user.findMany();
  
  const legacyGoals: LegacyGoal[] = [
    {
      id: 1,
      user_id: 1,
      title: 'Épargne de précaution',
      target_amount: 5000,
      current_amount: 1200,
      deadline: new Date('2024-12-31'),
    },
  ];

  let migratedCount = 0;

  for (const legacyGoal of legacyGoals) {
    try {
      const demoUser = users.find(u => u.email === 'demo@example.com');
      if (!demoUser) {
        console.log(`⚠️  Utilisateur non trouvé pour l'objectif ${legacyGoal.id}`);
        continue;
      }

      await prisma.goal.create({
        data: {
          userId: demoUser.id,
          title: legacyGoal.title,
          targetAmount: legacyGoal.target_amount,
          currentAmount: legacyGoal.current_amount || 0,
          deadline: legacyGoal.deadline,
          status: 'active',
        },
      });

      migratedCount++;
      console.log(`✅ Objectif ${legacyGoal.id} migré`);
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de l'objectif ${legacyGoal.id}:`, error);
    }
  }

  console.log(`✅ Migration terminée: ${migratedCount} objectifs migrés\n`);
}

async function seedNotifications() {
  console.log('🔄 Création des notifications de démonstration...');

  const users = await prisma.user.findMany();
  let createdCount = 0;

  for (const user of users) {
    try {
      // Créer quelques notifications de démonstration
      const notifications = [
        {
          type: 'insight',
          title: 'Conseil financier',
          message: 'Vous avez dépensé 15% de moins ce mois-ci dans la catégorie "Alimentation". Continuez ainsi !',
          data: { category: 'Alimentation', savings: 15 },
        },
        {
          type: 'reminder',
          title: 'Rappel objectif',
          message: 'Il vous reste 6 mois pour atteindre votre objectif d\'épargne de précaution.',
          data: { goalId: 'goal-1', monthsLeft: 6 },
        },
        {
          type: 'tip',
          title: 'Astuce',
          message: 'Pensez à réviser vos abonnements mensuels pour optimiser vos dépenses.',
        },
      ];

      for (const notificationData of notifications) {
        await prisma.notification.create({
          data: {
            ...notificationData,
            userId: user.id,
          },
        });
        createdCount++;
      }

      console.log(`✅ Notifications créées pour ${user.email}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création des notifications pour ${user.email}:`, error);
    }
  }

  console.log(`✅ Création terminée: ${createdCount} notifications créées\n`);
}

async function main() {
  console.log('🚀 Démarrage de la migration des données...\n');

  try {
    await migrateUsers();
    await migrateTransactions();
    await migrateGoals();
    await seedNotifications();

    console.log('🎉 Migration complète terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur durant la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  main();
}