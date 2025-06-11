const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

console.log('Database configuration:', {
  isProduction,
  hasDBUser: !!process.env.DB_USER,
  hasDBPassword: !!process.env.DB_PASSWORD,
  hasDBHost: !!process.env.DB_HOST,
  hasDBPort: !!process.env.DB_PORT,
  hasDBDatabase: !!process.env.DB_DATABASE,
  hasDATABASE_URL: !!process.env.DATABASE_URL
});

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
});

module.exports = {
  query: async (text, params) => {
    try {
      console.log('Executing query:', { text, params });
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      console.error('Query error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        detail: err.detail,
        query: text,
        params
      });
      throw err;
    }
  }
}; 