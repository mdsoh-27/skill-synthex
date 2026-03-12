const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const learningPathsPath = path.join(__dirname, '../ml/data/career/learning_paths.json');

/**
 * Controller to fetch learning path for a specific role
 */
const getLearningPath = async (req, res) => {
    const { role } = req.params;
    const { gaps } = req.query; // Optional comma-separated gaps

    if (!role) {
        return res.status(400).json({
            success: false,
            message: "Role parameter is required"
        });
    }

    try {
        const masterGaps = gaps ? gaps.split(',').map(s => s.trim()) : [];
        const pathData = await getLearningPathData(role, masterGaps);

        if (!pathData) {
            return res.status(404).json({
                success: false,
                message: `Learning path for role '${role}' not found.`
            });
        }

        res.status(200).json({
            success: true,
            role: pathData.title,
            learningPath: pathData
        });

    } catch (error) {
        console.error("Error reading learning paths:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load learning path",
            error: error.message
        });
    }
};

const { normalizeSkill } = require('../utils/skillMapper');

/**
 * Helper function used internally by other controllers (e.g., resumeController)
 * Now enriched with dynamic gap analysis.
 */
const getLearningPathData = async (role, masterGaps = []) => {
    try {
        if (!fs.existsSync(learningPathsPath)) return null;
        const learningPaths = JSON.parse(fs.readFileSync(learningPathsPath, 'utf8'));
        const normalizedRole = role.toLowerCase().trim();

        let foundRole = learningPaths[normalizedRole];
        if (!foundRole) {
            const key = Object.keys(learningPaths).find(k => k.includes(normalizedRole) || normalizedRole.includes(k));
            if (key) foundRole = learningPaths[key];
        }

        if (foundRole) {
            // Map masterGaps for fast lookup
            const gapSet = new Set(masterGaps.map(g => normalizeSkill(g)));

            // Enrich Milestones with "is_critical" flag
            const enrichedMilestones = foundRole.milestones.map(m => {
                const isCritical = m.topics.some(t => gapSet.has(normalizeSkill(t)));
                return { ...m, is_critical: isCritical };
            });

            const skillsToLookup = [...new Set([...foundRole.core_stack, ...foundRole.milestones.flatMap(m => m.topics)])];
            let dbResources = [];
            try {
                const [rows] = await db.query(
                  'SELECT * FROM resources WHERE skill_name IN (?)',
                  [skillsToLookup.map(s => normalizeSkill(s))]
                );
                dbResources = rows;
            } catch (dbErr) {
                // Ignore DB errors in helper
            }

            return {
                ...foundRole,
                milestones: enrichedMilestones,
                resources: dbResources
            };
        }
        return null;
    } catch (e) {
        return null;
    }
};

module.exports = {
    getLearningPath,
    getLearningPathData
};
