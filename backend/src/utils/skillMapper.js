/**
 * SkillMapper Utility
 * Normalizes skill names and topics across Quizzes, Resumes, and Resources.
 */

const taxonomy = {
    'python': ['python', 'py', 'python3', 'backend'],
    'javascript': ['javascript', 'js', 'frontend', 'react', 'vue', 'angular', 'node.js', 'node'],
    'html': ['html', 'html5', 'frontend', 'web'],
    'css': ['css', 'css3', 'flexbox', 'grid', 'frontend', 'web'],
    'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'database', 'db', 'crud'],
    'ai_ml': ['ai', 'ml', 'machine learning', 'nlp', 'neural networks', 'transformers', 'data science'],
    'cloud': ['aws', 'cloud', 's3', 'ec2', 'lambda', 'azure', 'gcp', 'serverless'],
    'cybersecurity': ['security', 'cybersecurity', 'ssl', 'phishing', 'encryption', 'metasploit'],
    'backend': ['backend', 'express', 'django', 'rest', 'api', 'middleware', 'node.js']
};

/**
 * Normalizes a raw string into a standard skill key from our taxonomy.
 * @param {string} raw - The raw skill string to normalize.
 * @returns {string} - The normalized skill key or the original slug if no match.
 */
function normalizeSkill(raw) {
    if (!raw) return 'general';
    const slug = raw.toLowerCase().trim().replace(/ /g, '_');
    
    for (const [key, aliases] of Object.entries(taxonomy)) {
        if (key === slug || aliases.some(a => slug.includes(a.replace(/ /g, '_')) || a.replace(/ /g, '_').includes(slug))) {
            return key;
        }
    }
    return slug;
}

/**
 * Maps a list of raw strings to normalized skill keys.
 * @param {string[]} list - Array of raw strings.
 * @returns {string[]} - Array of unique normalized skill keys.
 */
function mapSkills(list) {
    if (!Array.isArray(list)) return [];
    return [...new Set(list.map(normalizeSkill))];
}

module.exports = {
    normalizeSkill,
    mapSkills,
    taxonomy
};
