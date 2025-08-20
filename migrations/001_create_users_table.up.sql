-- Migration: 001_create_users_table.up.sql
-- Description: Create users table with authentication and OTP support
-- Created: 2025-08-19

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- OTP fields
    otp_code VARCHAR(6) NULL,
    otp_expires_at TIMESTAMP NULL,
    otp_type ENUM('signup', 'password_reset') NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_otp_code (otp_code),
    INDEX idx_created_at (created_at)
);
