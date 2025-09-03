import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface BackupOptions {
  outputDir?: string;
  compress?: boolean;
  includeData?: boolean;
}

class DatabaseBackup {
  private databaseUrl: string;
  private outputDir: string;

  constructor(databaseUrl?: string, outputDir = './backups') {
    this.databaseUrl = databaseUrl || process.env.DATABASE_URL || '';
    this.outputDir = outputDir;
    
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }
  }

  async createBackup(options: BackupOptions = {}) {
    const {
      outputDir = this.outputDir,
      compress = true,
      includeData = true,
    } = options;

    console.log('🔄 Démarrage de la sauvegarde de la base de données...');

    try {
      // Créer le répertoire de sauvegarde s'il n'existe pas
      await fs.mkdir(outputDir, { recursive: true });

      // Générer le nom du fichier de sauvegarde
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.sql`;
      const backupPath = path.join(outputDir, backupFileName);

      // Construire la commande pg_dump
      let command = `pg_dump "${this.databaseUrl}"`;
      
      if (!includeData) {
        command += ' --schema-only';
      }

      command += ` > "${backupPath}"`;

      // Exécuter la sauvegarde
      console.log(`📁 Création de la sauvegarde: ${backupPath}`);
      await execAsync(command);

      let finalPath = backupPath;

      // Compresser si demandé
      if (compress) {
        console.log('🗜️ Compression de la sauvegarde...');
        const compressedPath = `${backupPath}.gz`;
        await execAsync(`gzip "${backupPath}"`);
        finalPath = compressedPath;
      }

      // Vérifier la taille du fichier
      const stats = await fs.stat(finalPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ Sauvegarde créée avec succès !`);
      console.log(`📄 Fichier: ${finalPath}`);
      console.log(`📊 Taille: ${fileSizeMB} MB`);

      return {
        path: finalPath,
        size: stats.size,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  async listBackups(outputDir = this.outputDir) {
    try {
      const files = await fs.readdir(outputDir);
      const backupFiles = files.filter(file => 
        file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      );

      const backups = [];
      for (const file of backupFiles) {
        const filePath = path.join(outputDir, file);
        const stats = await fs.stat(filePath);
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
        });
      }

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('❌ Erreur lors de la liste des sauvegardes:', error);
      return [];
    }
  }

  async cleanupOldBackups(outputDir = this.outputDir, keepCount = 5) {
    console.log(`🧹 Nettoyage des anciennes sauvegardes (garder ${keepCount})...`);

    try {
      const backups = await this.listBackups(outputDir);
      
      if (backups.length <= keepCount) {
        console.log(`✅ Aucune sauvegarde à supprimer (${backups.length} sauvegardes)`);
        return;
      }

      const toDelete = backups.slice(keepCount);
      let deletedCount = 0;

      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.path);
          console.log(`🗑️ Supprimé: ${backup.name}`);
          deletedCount++;
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression de ${backup.name}:`, error);
        }
      }

      console.log(`✅ Nettoyage terminé: ${deletedCount} sauvegardes supprimées`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }

  async restoreBackup(backupPath: string) {
    console.log(`🔄 Restauration depuis: ${backupPath}`);

    try {
      // Vérifier que le fichier existe
      await fs.access(backupPath);

      let command: string;

      if (backupPath.endsWith('.gz')) {
        // Décompresser et restaurer
        command = `gunzip -c "${backupPath}" | psql "${this.databaseUrl}"`;
      } else {
        // Restaurer directement
        command = `psql "${this.databaseUrl}" < "${backupPath}"`;
      }

      console.log('⚠️ ATTENTION: Cette opération va écraser les données existantes !');
      console.log('🔄 Restauration en cours...');

      await execAsync(command);

      console.log('✅ Restauration terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      throw error;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const backup = new DatabaseBackup();

  try {
    switch (command) {
      case 'create':
        await backup.createBackup({
          compress: !args.includes('--no-compress'),
          includeData: !args.includes('--schema-only'),
        });
        break;

      case 'list': {
        const backups = await backup.listBackups();
        console.log('\n📋 Sauvegardes disponibles:');
        if (backups.length === 0) {
          console.log('Aucune sauvegarde trouvée');
        } else {
          backups.forEach((b, index) => {
            const sizeMB = (b.size / (1024 * 1024)).toFixed(2);
            console.log(`${index + 1}. ${b.name} (${sizeMB} MB) - ${b.created.toLocaleString()}`);
          });
        }
        break;
      }

      case 'cleanup': {
        const keepCount = parseInt(args[1]) || 5;
        await backup.cleanupOldBackups(undefined, keepCount);
        break;
      }

      case 'restore': {
        const backupPath = args[1];
        if (!backupPath) {
          console.error('❌ Chemin de sauvegarde requis pour la restauration');
          process.exit(1);
        }
        await backup.restoreBackup(backupPath);
        break;
      }

      default:
        console.log(`
🗄️ Script de sauvegarde de base de données

Usage:
  npm run backup create [--no-compress] [--schema-only]  # Créer une sauvegarde
  npm run backup list                                    # Lister les sauvegardes
  npm run backup cleanup [count]                         # Nettoyer (garder 5 par défaut)
  npm run backup restore <path>                          # Restaurer une sauvegarde

Exemples:
  npm run backup create                    # Sauvegarde complète compressée
  npm run backup create --no-compress      # Sauvegarde non compressée
  npm run backup create --schema-only      # Sauvegarde du schéma uniquement
  npm run backup cleanup 3                 # Garder seulement 3 sauvegardes
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DatabaseBackup };