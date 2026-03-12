const pool = require('../config/db');

exports.markComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    // First find the resource ID by title
    const [resources] = await pool.query('SELECT id FROM resources WHERE title = ?', [title]);
    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const resourceId = resources[0].id;

    // Use INSERT ... ON DUPLICATE KEY UPDATE for the user_progress table
    await pool.query(
      `INSERT INTO user_progress (user_id, resource_id, status, completed_at) 
       VALUES (?, ?, 'completed', NOW()) 
       ON DUPLICATE KEY UPDATE status = 'completed', completed_at = NOW()`,
      [userId, resourceId]
    );

    res.json({ success: true, message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress', message: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT r.skill_name, p.status, p.completed_at 
       FROM user_progress p
       JOIN resources r ON p.resource_id = r.id
       WHERE p.user_id = ?`,
      [userId]
    );
    res.json({ success: true, progress: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress', message: err.message });
  }
};
