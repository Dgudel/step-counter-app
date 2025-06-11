const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../db');

// @route   GET api/stats/users
// @desc    Get user statistics
router.get('/users', auth, async (req, res) => {
  try {
    // First, let's check if we have any data in the tables
    const checkData = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM step_sessions) as session_count
    `);
    console.log('Database check:', checkData.rows[0]);

    // Main query to get user statistics
    const stats = await db.query(`
      WITH user_stats AS (
        SELECT 
          u.id as user_id,
          u.username,
          COALESCE(SUM(s.step_count), 0) as total_steps
        FROM users u
        LEFT JOIN step_sessions s ON u.id = s.user_id
        GROUP BY u.id, u.username
      )
      SELECT * FROM user_stats
      ORDER BY total_steps DESC
    `);
    
    console.log('Query results:', stats.rows);
    res.json(stats.rows);
  } catch (err) {
    console.error('Error fetching user stats:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 