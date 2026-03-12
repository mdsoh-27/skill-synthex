const { extractTextFromPDF } = require('../utils/resumeTextExtractor');
const { extractSkills } = require('../nlp/extractSkills');
const db = require('../config/db');
const path = require("path");
const { getLearningPathData } = require('./learningPathController');
const { analyzeNative } = require('../utils/nativeMLService');

const { normalizeSkill, mapSkills } = require('../utils/skillMapper');

exports.uploadResume = async (req, res) => {
  try {
    console.log('📬 Robust Upload request received');
    if (!req.file) throw new Error('No file uploaded');
    if (!req.user || !req.user.id) throw new Error('Authenticated user ID is missing');

    // 1️⃣ Extract text & Resume Skills
    const text = await extractTextFromPDF(req.file.path);
    const rawResumeSkills = extractSkills(text);
    const normalizedResumeSkills = mapSkills(rawResumeSkills);
    console.log('✅ Normalized Resume Skills:', normalizedResumeSkills);

    // 2️⃣ NATIVE ML Analysis (Role Prediction & Gaps) - LIGHTNING FAST
    console.log('⚡ Running Native Node ML Analysis...');
    const { suggestedRoles, skillGap } = analyzeNative(normalizedResumeSkills);
    const resumeGaps = mapSkills(skillGap.missingSkills || []);

    // 3️⃣ INTEGRATED ANALYSIS: Synthesis with Assessment Evidence
    let assessmentGaps = [];
    try {
      const [assessmentRows] = await db.query(
        'SELECT gaps_identified FROM user_assessments WHERE user_id = ? AND skill_name = "Comprehensive" ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      if (assessmentRows.length > 0 && assessmentRows[0].gaps_identified) {
        // Extract and deduplicate gaps from assessment
        assessmentGaps = [...new Set(assessmentRows[0].gaps_identified.split(',').map(s => s.trim()))];
        console.log('📊 Assessment gaps retrieved:', assessmentGaps);
      }
    } catch (assErr) {
      console.warn("⚠️ Failed to fetch assessment gaps:", assErr.message);
    }

    // 4️⃣ ENRICH ROLES: Merge assessment gaps into each suggested role
    const enrichedSuggestedRoles = suggestedRoles.map(roleData => {
        const resumeGapsForRole = roleData.missingSkills || [];
        // Combine both sources
        const combined = [...new Set([...resumeGapsForRole, ...assessmentGaps])];
        
        return {
            ...roleData,
            missingSkills: combined,
            sources: {
                resume: resumeGapsForRole,
                assessment: assessmentGaps
            }
        };
    });

    const masterGaps = enrichedSuggestedRoles[0].missingSkills;
    console.log('🧠 Master Merged Gaps (Normalised):', masterGaps);

    // 5️⃣ Dynamic Learning Path Generation
    const learningPath = await getLearningPathData(enrichedSuggestedRoles[0].role, masterGaps);

    // 6️⃣ Robust Resource Fetching
    let gapResources = [];
    if (masterGaps.length > 0) {
      try {
        const [rows] = await db.query(
          'SELECT * FROM resources WHERE skill_name IN (?)',
          [masterGaps.map(g => normalizeSkill(g))]
        );
        gapResources = rows;
        console.log(`📚 Found ${gapResources.length} robust resources for MASTER gaps`);
      } catch (err) {
        console.warn("⚠️ Gap resource fetch skipped:", err.message);
      }
    }

    // 7️⃣ Respond with Synthesis Intelligence
    res.json({
      success: true,
      message: "Deep Synthesis completed successfully",
      skills: normalizedResumeSkills,
      suggestedRoles: enrichedSuggestedRoles,
      skillGap: {
          resumeGaps: (skillGap.missingSkills || []),
          assessmentGaps,
          masterGaps,
          matchPercentage: skillGap.matchPercentage,
          isIntegrated: assessmentGaps.length > 0
      },
      gapResources,
      learningPath
    });

  } catch (err) {
    console.error('❌ Synthesis Engine Error:', err.message);
    res.status(500).json({
      error: "Robust Synthesis Failed",
      message: err.message
    });
  }
};