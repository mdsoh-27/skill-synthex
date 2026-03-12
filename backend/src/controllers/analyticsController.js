const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch assessment history
    const [assessments] = await pool.query(
      'SELECT skill_name, score, total_questions, created_at FROM user_assessments WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // Fetch progress velocity (number of lessons completed per day/week)
    const [progress] = await pool.query(
      'SELECT completed_at FROM user_progress WHERE user_id = ? AND status = "completed" ORDER BY completed_at ASC',
      [userId]
    );

    res.json({
      assessments,
      progressCount: progress.length,
      firstActivity: assessments.length > 0 ? assessments[0].created_at : progress.length > 0 ? progress[0].completed_at : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};
