-- Migration: 20250819134941_update_migrations_table.down.sql
-- Description: Rollback update_migrations_table
-- Created: 2025-08-19

-- Remove batch column from migrations table
ALTER TABLE migrations DROP COLUMN batch;
