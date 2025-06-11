const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
const router = express.Router();

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('Database test result:', result.rows[0]);
    res.json({ 
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('Database test error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ 
      error: 'Database connection failed',
      message: err.message,
      code: err.code
    });
  }
});

// Check database tables
router.get('/check-db', async (req, res) => {
  try {
    console.log('Checking database tables...');
    
    // Check if users table exists
    const usersTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    // Check if step_sessions table exists
    const sessionsTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'step_sessions'
      );
    `);

    // Get table structure if they exist
    let usersStructure = null;
    let sessionsStructure = null;

    if (usersTable.rows[0].exists) {
      usersStructure = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users';
      `);
    }

    if (sessionsTable.rows[0].exists) {
      sessionsStructure = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'step_sessions';
      `);
    }

    res.json({
      tables: {
        users: {
          exists: usersTable.rows[0].exists,
          structure: usersStructure ? usersStructure.rows : null
        },
        step_sessions: {
          exists: sessionsTable.rows[0].exists,
          structure: sessionsStructure ? sessionsStructure.rows : null
        }
      }
    });
  } catch (err) {
    console.error('Database check error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ 
      error: 'Database check failed',
      message: err.message,
      code: err.code
    });
  }
});

// Create tables if they don't exist
router.post('/setup-db', async (req, res) => {
  try {
    console.log('Setting up database tables...');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create step_sessions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS step_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        step_count INTEGER NOT NULL,
        start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    res.json({ message: 'Database tables created successfully' });
  } catch (err) {
    console.error('Database setup error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ 
      error: 'Database setup failed',
      message: err.message,
      code: err.code
    });
  }
});

// @route   POST api/auth/register
// @desc    Register a user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Registration attempt for username:', username);
  
  try {
    // Check if user exists
    console.log('Checking if user exists...');
    let user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('User check result:', user.rows);
    
    if (user.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    console.log('Generating salt...');
    const salt = await bcrypt.genSalt(10);
    console.log('Hashing password...');
    const password_hash = await bcrypt.hash(password, salt);

    console.log('Inserting new user...');
    const newUser = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, password_hash]
    );
    console.log('New user created:', newUser.rows[0]);

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error('Registration error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      detail: err.detail
    });
    res.status(500).json({ 
      error: 'Server error',
      message: err.message,
      detail: err.detail
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.rows[0].id,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;