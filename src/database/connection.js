const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'movie_review_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Create database if it doesn't exist
const createDatabase = async () => {
  try {
    const connectionWithoutDB = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connectionWithoutDB.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
    );
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);

    await connectionWithoutDB.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  }
};

const connectDB = async () => {
  try {
    // Create database if it doesn't exist
    await createDatabase();

    // Test the connection
    const isConnected = await testConnection();

    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    return pool;
  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    console.error('🔧 Please check your database configuration in .env file');
    // Don't exit process, let the app continue (for development)
    // process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection,
  createDatabase,
  dbConfig,
  connectDB
};
