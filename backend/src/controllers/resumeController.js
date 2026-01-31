const { extractTextFromPDF } = require('../utils/resumeTextExtractor');
const { extractSkills } = require('../nlp/extractSkills');
const db = require('../config/db');

exports.uploadResume = async (req, res) => {
  try {
    // 1️⃣ Extract text
    const text = await extractTextFromPDF(req.file.path);

    // 2️⃣ Extract skills
    const skills = extractSkills(text);

    // 3️⃣ Save to DB
    const query = `
      INSERT INTO resumes (user_id, file_name, extracted_text, skills)
      VALUES (?, ?, ?, ?)
    `;

    db.run(
      query,
      [req.user.id, req.file.filename, text, JSON.stringify(skills)],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "DB error" });
        }

        res.json({
          message: "Resume uploaded & checked successfully",
          skills
        });
      }
    );

  } catch (err) {
    console.error('❌ Resume processing error:', err); // Log full error object
    res.status(500).json({
      error: "Resume processing failed",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
