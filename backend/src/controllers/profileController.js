const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT email, full_name, career_goals, interests, education_level FROM users WHERE id = ?',
      [userId]
    );

    const [assessments] = await pool.query(
      'SELECT score, total_questions, gaps_identified, created_at FROM user_assessments WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: rows[0],
      stats: {
        assessmentsCount: assessments.length,
        recentScore: assessments[0] ? assessments[0].score : null,
        recentTotal: assessments[0] ? assessments[0].total_questions : null,
        allGaps: Array.from(assessments.reduce((acc, curr) => {
          if (curr.gaps_identified) {
            curr.gaps_identified.split(',').forEach(g => acc.add(g.trim()));
          }
          return acc;
        }, new Set()))
      },
      assessments
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, career_goals, interests, education_level } = req.body;

    await pool.query(
      'UPDATE users SET full_name = ?, career_goals = ?, interests = ?, education_level = ? WHERE id = ?',
      [full_name, career_goals, interests, education_level, userId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', message: err.message });
  }
};
