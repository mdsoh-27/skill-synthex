const { extractTextFromPDF } = require('../utils/resumeTextExtractor');
const { extractSkills } = require('../nlp/extractSkills');
const db = require('../config/db');

exports.uploadResume = async (req, res) => {
  try {
    console.log('📬 Upload request received');
    console.log('📁 File info:', req.file);

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // 1️⃣ Extract text
    const text = await extractTextFromPDF(req.file.path);

    // 2️⃣ Extract skills
    const skills = extractSkills(text);

    // 3️⃣ Save to DB
    const query = `
      INSERT INTO resumes (user_id, file_name, extracted_text, skills)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(
      query,
      [req.user.id, req.file.filename, text, JSON.stringify(skills)]
    );

    res.json({
      message: "Resume uploaded & checked successfully",
      skills
    });

  } catch (err) {
    console.error('❌ Resume processing error:', err);
    res.status(500).json({
      error: "Resume processing failed",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};