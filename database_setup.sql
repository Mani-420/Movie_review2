-- Database Setup Script
-- Run this script in your MySQL client to create the database and user

-- Create database
CREATE DATABASE IF NOT EXISTS movie_review_db;

-- Create user (optional - you can use root)
-- CREATE USER IF NOT EXISTS 'movie_user'@'localhost' IDENTIFIED BY 'movie_password';

-- Grant privileges (if using custom user)
-- GRANT ALL PRIVILEGES ON movie_review_db.* TO 'movie_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE movie_review_db;

-- Check if database is ready
SELECT 'Database setup complete!' AS status;
