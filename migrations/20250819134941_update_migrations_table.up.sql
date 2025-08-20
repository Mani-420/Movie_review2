-- Migration: 20250819134941_update_migrations_table.up.sql
-- Description: update_migrations_table
-- Created: 2025-08-19

-- Add batch column to migrations table for rollback support
ALTER TABLE migrations ADD COLUMN batch INT NOT NULL DEFAULT 1;
