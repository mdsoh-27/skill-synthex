const { extractTextFromPDF } = require('../utils/resumeTextExtractor');
const { extractSkills } = require('../nlp/extractSkills');
const db = require('../config/db');

exports.uploadResume = async (req, res) => {
  try {
    console.log('📬 Upload request received');
    console.log('📁 File info:', req.file);
    console.log('👤 User info:', req.user);

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // 1️⃣ Extract text
    const text = await extractTextFromPDF(req.file.path);

    // 2️⃣ Extract skills
    const skills = extractSkills(text);
    console.log('✅ Skills extracted:', skills);

    // 3️⃣ Save to DB
    const query = `
      INSERT INTO resumes (user_id, file_name, extracted_text, skills)
      VALUES (?, ?, ?, ?)
    `;

    console.log('💾 Saving to DB... user_id:', req.user?.id);

    // Check if user.id is missing
    if (!req.user || !req.user.id) {
      console.error('❌ Error: user_id is missing in req.user');
      throw new Error('Authenticated user ID is missing');
    }

    await db.query(
      query,
      [req.user.id, req.file.filename, text, JSON.stringify(skills)]
    );
    console.log('✅ Saved to DB successfully');

    res.json({
      message: "Resume uploaded & checked successfully",
      skills
    });

  } catch (err) {
    console.error('❌ Resume processing error:', err.message);
    console.error('Full error stack:', err.stack);
    res.status(500).json({
      error: "Resume processing failed",
      message: err.message,
      stack: err.stack
    });
  }
};