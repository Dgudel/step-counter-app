const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
const router = express.Router();

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