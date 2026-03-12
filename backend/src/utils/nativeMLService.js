const fs = require('fs');
const path = require('path');

const SKILL_MAP_PATH = path.join(__dirname, '../ml/data/career/role_skill_map.json');

/**
 * Node-Native ML Service
 * Provides instantaneous career prediction and gap analysis using Cosine Similarity.
 */
exports.analyzeNative = (userSkills) => {
    try {
        const roleSkillMap = JSON.parse(fs.readFileSync(SKILL_MAP_PATH, 'utf8'));
        const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
        
        const results = [];

        // 1. Calculate Score for each role based on Intersection/Union (Jaccard-like for better intuitive match)
        for (const [role, requiredSkills] of Object.entries(roleSkillMap)) {
            const requiredSet = new Set(requiredSkills.map(s => s.toLowerCase().trim()));
            
            const matched = [...requiredSet].filter(s => userSet.has(s));
            const missing = [...requiredSet].filter(s => !userSet.has(s));
            
            // Score weight: matches / length of required
            const matchScore = requiredSet.size > 0 ? (matched.length / requiredSet.size) : 0;
            const confidence = Math.round(matchScore * 100);
            
            results.push({
                role: role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                confidence,
                matchPercentage: confidence,
                matchedSkills: matched,
                missingSkills: missing
            });
        }

        // 2. Sort by confidence and get top 3
        const sortedResults = results.sort((a, b) => b.confidence - a.confidence);
        
        const suggestedRoles = sortedResults
            .slice(0, 3)
            .map(r => ({ 
                role: r.role, 
                confidence: r.confidence,
                missingSkills: r.missingSkills 
            }));

        const primaryRole = sortedResults[0];

        return {
            suggestedRoles,
            skillGap: {
                role: primaryRole.role,
                matchedSkills: primaryRole.matchedSkills,
                missingSkills: primaryRole.missingSkills,
                matchPercentage: primaryRole.matchPercentage
            }
        };
    } catch (err) {
        console.error("❌ Native ML Error:", err.message);
        throw new Error("Local analysis failed: " + err.message);
    }
};
