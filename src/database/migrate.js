const fs = require('fs').promises;
const path = require('path');
const { pool, createDatabase, testConnection } = require('./connection');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../../migrations');
    this.migrationsTable = 'migrations';
  }

  // Create migrations tracking table
  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        batch INT NOT NULL DEFAULT 1,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      // Check if table exists and has the right structure
      const [tables] = await pool.execute(
        `SHOW TABLES LIKE '${this.migrationsTable}'`
      );

      if (tables.length > 0) {
        // Table exists, check its structure
        const [columns] = await pool.execute(
          `SHOW COLUMNS FROM ${this.migrationsTable}`
        );
        const columnNames = columns.map((col) => col.Field);

        // If it has the old structure (name, run_on), migrate it
        if (
          columnNames.includes('name') &&
          columnNames.includes('run_on') &&
          !columnNames.includes('migration_name')
        ) {
          console.log('🔄 Migrating old migrations table structure...');

          // Rename columns to match new structure
          await pool.execute(
            `ALTER TABLE ${this.migrationsTable} CHANGE name migration_name VARCHAR(255)`
          );
          await pool.execute(
            `ALTER TABLE ${this.migrationsTable} CHANGE run_on executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
          );
          await pool.execute(
            `ALTER TABLE ${this.migrationsTable} ADD COLUMN batch INT NOT NULL DEFAULT 1`
          );

          console.log('✅ Migrations table structure updated');
        }
      } else {
        // Create new table
        await pool.execute(query);
        console.log('✅ Migrations table created');
      }
    } catch (error) {
      console.error('❌ Error creating migrations table:', error.message);
      throw error;
    }
  }

  // Get current batch number
  async getCurrentBatch() {
    try {
      // First check if batch column exists
      const [columns] = await pool.execute(
        `SHOW COLUMNS FROM ${this.migrationsTable} LIKE 'batch'`
      );

      if (columns.length === 0) {
        return 1; // Old format, use batch 1
      }

      const [rows] = await pool.execute(
        `SELECT MAX(batch) as max_batch FROM ${this.migrationsTable}`
      );
      return (rows[0].max_batch || 0) + 1;
    } catch (error) {
      return 1;
    }
  }

  // Get list of executed migrations
  async getExecutedMigrations() {
    try {
      // First check if batch column exists
      const [columns] = await pool.execute(
        `SHOW COLUMNS FROM ${this.migrationsTable} LIKE 'batch'`
      );

      if (columns.length === 0) {
        // Old format without batch column
        const [rows] = await pool.execute(
          `SELECT migration_name, 1 as batch FROM ${this.migrationsTable} ORDER BY id`
        );
        return rows;
      } else {
        // New format with batch column
        const [rows] = await pool.execute(
          `SELECT migration_name, batch FROM ${this.migrationsTable} ORDER BY id`
        );
        return rows;
      }
    } catch (error) {
      console.error('❌ Error fetching executed migrations:', error.message);
      return [];
    }
  }

  // Get list of migration files
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      const upFiles = files.filter((file) => file.endsWith('.up.sql')).sort();

      const migrations = [];
      for (const upFile of upFiles) {
        const baseName = upFile.replace('.up.sql', '');
        const downFile = `${baseName}.down.sql`;
        const downExists = files.includes(downFile);

        migrations.push({
          name: baseName,
          upFile: upFile,
          downFile: downExists ? downFile : null,
          hasDown: downExists,
        });
      }

      return migrations;
    } catch (error) {
      console.error('❌ Error reading migrations directory:', error.message);
      return [];
    }
  }

  // Execute SQL statements from file
  async executeSqlFile(filePath, action = 'up') {
    try {
      const sql = await fs.readFile(filePath, 'utf8');

      // Split SQL by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await pool.execute(statement);
        }
      }
    } catch (error) {
      console.error(`❌ Error executing ${action} SQL:`, error.message);
      throw error;
    }
  }

  // Execute a single migration UP
  async executeMigrationUp(migration) {
    try {
      const filePath = path.join(this.migrationsPath, migration.upFile);
      console.log(`🔄 Migrating UP: ${migration.name}`);

      await this.executeSqlFile(filePath, 'up');

      // Record migration as executed
      const batch = await this.getCurrentBatch();

      // Check if batch column exists
      const [columns] = await pool.execute(
        `SHOW COLUMNS FROM ${this.migrationsTable} LIKE 'batch'`
      );

      if (columns.length === 0) {
        // Old format without batch column
        await pool.execute(
          `INSERT INTO ${this.migrationsTable} (migration_name) VALUES (?)`,
          [migration.name]
        );
      } else {
        // New format with batch column
        await pool.execute(
          `INSERT INTO ${this.migrationsTable} (migration_name, batch) VALUES (?, ?)`,
          [migration.name, batch]
        );
      }

      console.log(`✅ Migration UP completed: ${migration.name}`);
    } catch (error) {
      console.error(
        `❌ Error executing migration UP ${migration.name}:`,
        error.message
      );
      throw error;
    }
  }

  // Execute a single migration DOWN
  async executeMigrationDown(migration) {
    try {
      if (!migration.hasDown) {
        throw new Error(`No down migration found for ${migration.name}`);
      }

      const filePath = path.join(this.migrationsPath, migration.downFile);
      console.log(`🔄 Rolling back: ${migration.name}`);

      await this.executeSqlFile(filePath, 'down');

      // Remove migration record
      await pool.execute(
        `DELETE FROM ${this.migrationsTable} WHERE migration_name = ?`,
        [migration.name]
      );

      console.log(`✅ Migration DOWN completed: ${migration.name}`);
    } catch (error) {
      console.error(
        `❌ Error executing migration DOWN ${migration.name}:`,
        error.message
      );
      throw error;
    }
  }

  // Run all pending migrations UP
  async runMigrations() {
    try {
      console.log('🚀 Starting database migrations UP...');

      // Create database if it doesn't exist
      await createDatabase();

      // Test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      // Create migrations table
      await this.createMigrationsTable();

      // Get executed and available migrations
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      const executedNames = executedMigrations.map((m) => m.migration_name);

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        (migration) => !executedNames.includes(migration.name)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.');
        return;
      }

      console.log(`📝 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach((migration) =>
        console.log(
          `   - ${migration.name} ${
            migration.hasDown ? '(with rollback)' : '(no rollback)'
          }`
        )
      );

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigrationUp(migration);
      }

      console.log('🎉 All migrations UP completed successfully!');
    } catch (error) {
      console.error('💥 Migration UP failed:', error.message);
      process.exit(1);
    }
  }

  // Rollback last batch of migrations
  async rollbackMigrations(steps = 1) {
    try {
      console.log(`🔄 Rolling back last ${steps} batch(es) of migrations...`);

      // Test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      await this.createMigrationsTable();

      // Get executed migrations grouped by batch
      const [batches] = await pool.execute(
        `SELECT DISTINCT batch FROM ${this.migrationsTable} ORDER BY batch DESC LIMIT ${steps}`
      );

      if (batches.length === 0) {
        console.log('✅ No migrations to rollback.');
        return;
      }

      const batchNumbers = batches.map((b) => b.batch);

      // Create individual queries for each batch (safer than IN with placeholders)
      let migrationsToRollback = [];
      for (const batch of batchNumbers) {
        const [batchMigrations] = await pool.execute(
          `SELECT migration_name FROM ${this.migrationsTable} WHERE batch = ? ORDER BY id DESC`,
          [batch]
        );
        migrationsToRollback = migrationsToRollback.concat(batchMigrations);
      }

      if (migrationsToRollback.length === 0) {
        console.log('✅ No migrations to rollback.');
        return;
      }

      // Get migration file info
      const migrationFiles = await this.getMigrationFiles();
      const migrationMap = new Map(migrationFiles.map((m) => [m.name, m]));

      console.log(`📝 Rolling back ${migrationsToRollback.length} migrations:`);
      migrationsToRollback.forEach((migration) =>
        console.log(`   - ${migration.migration_name}`)
      );

      // Execute rollbacks in reverse order
      for (const migrationRecord of migrationsToRollback) {
        const migration = migrationMap.get(migrationRecord.migration_name);
        if (migration) {
          await this.executeMigrationDown(migration);
        } else {
          console.warn(
            `⚠️ Migration file not found for: ${migrationRecord.migration_name}`
          );
        }
      }

      console.log('🎉 Rollback completed successfully!');
    } catch (error) {
      console.error('💥 Rollback failed:', error.message);
      process.exit(1);
    }
  }

  // Show migration status
  async showStatus() {
    try {
      await testConnection();
      await this.createMigrationsTable();

      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      const executedNames = executedMigrations.map((m) => m.migration_name);

      console.log('\n📊 Migration Status:');
      console.log('==================');

      if (migrationFiles.length === 0) {
        console.log('No migration files found.');
        return;
      }

      migrationFiles.forEach((migration) => {
        const isExecuted = executedNames.includes(migration.name);
        const status = isExecuted ? '✅ EXECUTED' : '⏳ PENDING';
        const rollbackInfo = migration.hasDown ? '🔄' : '❌';
        console.log(`${status} ${rollbackInfo} - ${migration.name}`);
      });

      const pendingCount = migrationFiles.length - executedMigrations.length;
      console.log(
        `\nTotal: ${migrationFiles.length} migrations, ${pendingCount} pending`
      );
      console.log('🔄 = Has rollback, ❌ = No rollback\n');

      // Show batch information
      if (executedMigrations.length > 0) {
        const batches = [
          ...new Set(executedMigrations.map((m) => m.batch)),
        ].sort((a, b) => b - a);
        console.log('📦 Batches (latest first):');
        for (const batch of batches) {
          const batchMigrations = executedMigrations.filter(
            (m) => m.batch === batch
          );
          console.log(
            `   Batch ${batch}: ${batchMigrations.length} migration(s)`
          );
        }
        console.log();
      }
    } catch (error) {
      console.error('❌ Error checking migration status:', error.message);
    }
  }

  // Create a new migration file
  async createMigration(name) {
    try {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, '')
        .split('.')[0];
      const migrationName = `${timestamp}_${name}`;

      const upFilePath = path.join(
        this.migrationsPath,
        `${migrationName}.up.sql`
      );
      const downFilePath = path.join(
        this.migrationsPath,
        `${migrationName}.down.sql`
      );

      const upTemplate = `-- Migration: ${migrationName}.up.sql
-- Description: ${name}
-- Created: ${new Date().toISOString().split('T')[0]}

-- Add your UP migration SQL here
-- Example:
-- CREATE TABLE example (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(255) NOT NULL
-- );
`;

      const downTemplate = `-- Migration: ${migrationName}.down.sql
-- Description: Rollback ${name}
-- Created: ${new Date().toISOString().split('T')[0]}

-- Add your DOWN migration SQL here
-- Example:
-- DROP TABLE IF EXISTS example;
`;

      await fs.writeFile(upFilePath, upTemplate);
      await fs.writeFile(downFilePath, downTemplate);

      console.log(`✅ Created migration files:`);
      console.log(`   UP:   ${migrationName}.up.sql`);
      console.log(`   DOWN: ${migrationName}.down.sql`);
    } catch (error) {
      console.error('❌ Error creating migration:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'up':
      runner.runMigrations().then(() => process.exit(0));
      break;
    case 'down':
      const steps = parseInt(arg) || 1;
      runner.rollbackMigrations(steps).then(() => process.exit(0));
      break;
    case 'status':
      runner.showStatus().then(() => process.exit(0));
      break;
    case 'create':
      if (!arg) {
        console.error(
          '❌ Migration name required. Usage: npm run migrate create <name>'
        );
        process.exit(1);
      }
      runner.createMigration(arg).then(() => process.exit(0));
      break;
    case 'run':
    default:
      runner.runMigrations().then(() => process.exit(0));
      break;
  }
}

module.exports = MigrationRunner;
