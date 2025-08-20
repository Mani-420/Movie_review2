# Migration System Documentation

## Overview

Your Movie Review Platform now has a **comprehensive migration system** with **UP/DOWN support** for database schema management. This system provides safe database versioning with rollback capabilities.

## 🎯 Key Features

✅ **UP & DOWN Migrations** - Full rollback support  
✅ **Batch Tracking** - Group related migrations  
✅ **Safe Rollbacks** - Rollback by batch to maintain consistency  
✅ **Migration Status** - Track what's been applied  
✅ **Auto-generated Templates** - Quick migration creation  
✅ **Transaction Safety** - Each migration runs independently

## 🚀 Available Commands

### Basic Commands

```bash
# Run all pending migrations UP
npm run migrate:up

# Rollback last batch of migrations DOWN
npm run migrate:down

# Check migration status
npm run migrate:status

# Create new migration files
npm run migrate:create <migration_name>
```

### Advanced Commands

```bash
# Rollback multiple batches (e.g., last 2 batches)
npm run migrate:down 2

# Alternative ways to run migrations
npm run migrate        # Same as migrate:up
node src/database/migrate.js up
node src/database/migrate.js down 1
```

## 📁 Migration File Structure

Migrations follow the **UP/DOWN pattern**:

```
migrations/
├── 001_create_users_table.up.sql      # Create users table
├── 001_create_users_table.down.sql    # Drop users table
├── 002_create_movies_table.up.sql     # Create movies table
├── 002_create_movies_table.down.sql   # Drop movies table
├── 003_create_reviews_table.up.sql    # Create reviews table
├── 003_create_reviews_table.down.sql  # Drop reviews table
└── YYYYMMDDHHMMSS_migration_name.up.sql   # Timestamp format
```

## 🔧 Creating New Migrations

### 1. Generate Migration Files

```bash
npm run migrate:create add_user_avatar_column
```

This creates:

- `20250819135000_add_user_avatar_column.up.sql`
- `20250819135000_add_user_avatar_column.down.sql`

### 2. Edit the UP Migration

```sql
-- 20250819135000_add_user_avatar_column.up.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL;
```

### 3. Edit the DOWN Migration

```sql
-- 20250819135000_add_user_avatar_column.down.sql
ALTER TABLE users DROP COLUMN avatar_url;
```

### 4. Run the Migration

```bash
npm run migrate:up
```

## 📊 Migration Status Examples

### Viewing Status

```bash
$ npm run migrate:status

📊 Migration Status:
==================
✅ EXECUTED 🔄 - 001_create_users_table
✅ EXECUTED 🔄 - 002_create_movies_table
✅ EXECUTED 🔄 - 003_create_reviews_table
⏳ PENDING 🔄 - 20250819135000_add_user_avatar_column

Total: 4 migrations, 1 pending
🔄 = Has rollback, ❌ = No rollback

📦 Batches (latest first):
   Batch 3: 1 migration(s)
   Batch 2: 1 migration(s)
   Batch 1: 2 migration(s)
```

## 🔄 Rollback Examples

### Rollback Last Batch

```bash
$ npm run migrate:down

🔄 Rolling back last 1 batch(es) of migrations...
📝 Rolling back 1 migrations:
   - 20250819135000_add_user_avatar_column
🔄 Rolling back: 20250819135000_add_user_avatar_column
✅ Migration DOWN completed: 20250819135000_add_user_avatar_column
🎉 Rollback completed successfully!
```

### Rollback Multiple Batches

```bash
npm run migrate:down 2    # Rollback last 2 batches
```

## 🗄️ Database Tables

### Current Schema

After running all migrations:

**users** - User authentication and profiles

- `id`, `name`, `email`, `password_hash`
- `role` (admin/user), `is_verified`
- `otp_code`, `otp_expires_at`, `otp_type`
- `created_at`, `updated_at`

**movies** - Movie information

- `id`, `title`, `description`, `release_date`
- `genre`, `cast`, `director`, `duration_minutes`
- `ratings_avg`, `ratings_count`
- `created_at`, `updated_at`

**reviews** - User movie reviews

- `id`, `movie_id`, `user_id`, `rating`, `comment`
- `created_at`, `updated_at`
- Foreign keys to users and movies

**migrations** - Migration tracking

- `id`, `migration_name`, `batch`, `executed_at`

## ⚠️ Best Practices

### 1. **Always Create DOWN Migrations**

Every UP migration should have a corresponding DOWN migration for safe rollbacks.

### 2. **Test Migrations**

```bash
# Run up
npm run migrate:up

# Test rollback
npm run migrate:down

# Migrate back up
npm run migrate:up
```

### 3. **Backup Before Major Changes**

Always backup your database before running migrations in production.

### 4. **Batch-Related Changes Together**

Group related schema changes in the same batch by running them together:

```bash
npm run migrate:create add_user_fields
npm run migrate:create update_user_indexes
npm run migrate:up  # Both run in same batch
```

### 5. **Order Dependencies Correctly**

- Create parent tables before child tables
- Drop child tables before parent tables (in DOWN migrations)

## 🐛 Troubleshooting

### Migration Fails

```bash
# Check what went wrong
npm run migrate:status

# Manual fix if needed, then retry
npm run migrate:up
```

### Rollback Issues

If a rollback fails, you may need to manually fix the database schema and update the migrations table.

### Database Structure Issues

The migration system automatically handles upgrading from older migration table formats.

## 🔧 Development Workflow

1. **Make Schema Changes** → Create migration files
2. **Write UP SQL** → Define forward changes
3. **Write DOWN SQL** → Define rollback changes
4. **Test Locally** → Run up/down/up cycle
5. **Deploy** → Run migrations in production
6. **Rollback if Needed** → Use down migrations safely

## 📝 Example: Adding a New Feature

Let's say you want to add movie ratings caching:

```bash
# 1. Create migration
npm run migrate:create add_movie_ratings_cache

# 2. Edit UP file
# ALTER TABLE movies ADD COLUMN ratings_cache JSON;

# 3. Edit DOWN file
# ALTER TABLE movies DROP COLUMN ratings_cache;

# 4. Apply migration
npm run migrate:up

# 5. If issues, rollback
npm run migrate:down
```

Your migration system is now **production-ready** with full UP/DOWN support! 🎉
