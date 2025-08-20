-- Migration: 002_create_movies_table.up.sql
-- Description: Create movies table for storing movie information
-- Created: 2025-08-19

CREATE TABLE IF NOT EXISTS movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    genre VARCHAR(100),
    cast TEXT,  -- JSON string or comma-separated values
    director VARCHAR(255),
    duration_minutes INT,
    poster_url VARCHAR(500),
    
    -- Rating calculation fields
    ratings_avg DECIMAL(3,2) DEFAULT 0.00,
    ratings_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_title (title),
    INDEX idx_genre (genre),
    INDEX idx_release_date (release_date),
    INDEX idx_ratings_avg (ratings_avg),
    INDEX idx_created_at (created_at)
);
