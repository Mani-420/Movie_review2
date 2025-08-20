CREATE TABLE IF NOT EXISTS movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    genre VARCHAR(100) NOT NULL,
    cast TEXT,
    director VARCHAR(255),
    duration_minutes INT,
    poster_url VARCHAR(500),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_title (title),
    INDEX idx_genre (genre),
    INDEX idx_release_date (release_date),
    INDEX idx_rating (average_rating),
    INDEX idx_created_at (created_at)
);