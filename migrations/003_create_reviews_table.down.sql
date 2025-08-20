-- Migration: 003_create_reviews_table.down.sql
-- Description: Drop reviews table
-- Created: 2025-08-19

-- Note: Must drop reviews before movies and users due to foreign key constraints
DROP TABLE IF EXISTS reviews;
