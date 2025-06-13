const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../db');

// @route   GET api/steps
// @desc    Get all step sessions for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching steps for user:', req.user.id);
    const sessions = await db.query(
      'SELECT * FROM step_sessions WHERE user_id = $1 ORDER BY end_time DESC',
      [req.user.id]
    );
    console.log('Found sessions:', sessions.rows);
    res.json(sessions.rows);
  } catch (err) {
    console.error('Error fetching steps:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/steps
// @desc    Save a new step session
router.post('/', auth, async (req, res) => {
  const { step_count } = req.body;
  try {
    console.log('Saving steps for user:', req.user.id, 'count:', step_count);
    const newSession = await db.query(
      'INSERT INTO step_sessions (user_id, step_count) VALUES ($1, $2) RETURNING *',
      [req.user.id, step_count]
    );
    console.log('Saved session:', newSession.rows[0]);
    res.json(newSession.rows[0]);
  } catch (err) {
    console.error('Error saving steps:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/steps/:id
// @desc    Delete a step session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if the step session exists and belongs to the user
    const stepSession = await db.query(
      'SELECT * FROM step_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (stepSession.rows.length === 0) {
      return res.status(404).json({ msg: 'Step session not found or unauthorized' });
    }

    // Delete the step session
    await db.query('DELETE FROM step_sessions WHERE id = $1', [req.params.id]);
    
    res.json({ msg: 'Step session deleted successfully' });
  } catch (err) {
    console.error('Error deleting step session:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;