const pool = require('../config/db');

exports.getQuestions = async (req, res) => {
  try {
    const { skill } = req.params;
    const [rows] = await pool.query(
      'SELECT id, skill_name, topic, question, option_a, option_b, option_c, option_d, correct_option FROM quizzes WHERE skill_name = ? ORDER BY RAND() LIMIT 30',
      [skill]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No questions found for this skill' });
    }

    res.json({ success: true, questions: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions', message: err.message });
  }
};

exports.submitResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, score, total, responses } = req.body;
    // responses: [{ quiz_id, selected, is_correct, topic }]

    const gaps = responses
      .filter(r => !r.is_correct)
      .map(r => r.topic);
    
    // De-duplicate gaps
    const uniqueGaps = [...new Set(gaps)];

    await pool.query(
      'INSERT INTO user_assessments (user_id, skill_name, score, total_questions, gaps_identified) VALUES (?, ?, ?, ?, ?)',
      [userId, skill, score, total, uniqueGaps.join(', ')]
    );

    // Also update dashboard skill score if it's the highest? 
    // For now we just record it.

    res.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      score,
      total,
      gaps: uniqueGaps
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit result', message: err.message });
  }
};
