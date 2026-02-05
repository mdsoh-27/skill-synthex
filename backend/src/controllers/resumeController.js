const { extractTextFromPDF } = require('../utils/resumeTextExtractor');
const { extractSkills } = require('../nlp/extractSkills');
const db = require('../config/db');
const { spawn } = require("child_process");
const path = require("path");

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

    // 🔹 Call Python ML Service
    console.log('🤖 Calling Python ML Service...');

    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ml/ml_service.py')
    ]);

    const mlInput = JSON.stringify({
      skills,
      targetRole: req.body.targetRole
    });

    let mlOutput = '';
    let mlError = '';

    pythonProcess.stdin.write(mlInput);
    pythonProcess.stdin.end();

    const getMLResult = () => new Promise((resolve, reject) => {
      pythonProcess.stdout.on('data', (data) => {
        mlOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        mlError += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Python process exited with code ${code}`);
          console.error(`stderr: ${mlError}`);
          return reject(new Error('ML service failed'));
        }
        try {
          const result = JSON.parse(mlOutput);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse ML output'));
        }
      });
    });

    const { suggestedRoles, skillGap } = await getMLResult();
    console.log("🎯 Python ML results received");

    // 🔹 Send response
    res.json({
      message: "Resume uploaded & checked successfully",
      skills,
      suggestedRoles,
      skillGap
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