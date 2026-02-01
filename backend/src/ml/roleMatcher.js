const skillDictionary = require("../nlp/skillDictionary");

// normalize skill using dictionary
const normalizeSkill = (skill) => {
  if (!skill) return "";

  const key = skill
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, "")
    .replace("js", "javascript");

  return skillDictionary[key] || skill;
};

const matchRoles = (extractedSkills = [], dataset = []) => {
  // normalize resume skills
  const resumeSkills = extractedSkills.map(normalizeSkill);

  return dataset
    .map((row) => {
      // Find keys where value is 1 (excluding the 'role' key)
      const roleSkills = Object.keys(row).filter(key => key !== 'role' && row[key] === 1);

      if (roleSkills.length === 0) return null;

      let matchedSkills = roleSkills.filter((skill) =>
        resumeSkills.includes(normalizeSkill(skill))
      );

      const matchPercentage = (matchedSkills.length / roleSkills.length) * 100;

      return {
        role: row.role,
        matchedSkills,
        matchPercentage: Math.round(matchPercentage),
      };
    })
    .filter((r) => r && r.matchPercentage >= 30)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

const analyzeSkillGap = (extractedSkills = [], targetRole, dataset = []) => {
  if (!targetRole) return null;

  const resumeSkills = extractedSkills.map(normalizeSkill);

  // Find the exact role or the closest one in the dataset
  const roleData = dataset.find(
    (row) => row.role && row.role.toLowerCase() === targetRole.toLowerCase()
  );

  if (!roleData) return { error: "Target role not found in dataset" };

  // Identify all required skills for this role (where value is 1)
  const requiredSkills = Object.keys(roleData).filter(
    (key) => key !== "role" && roleData[key] === 1
  );

  const matchedSkills = requiredSkills.filter((skill) =>
    resumeSkills.includes(normalizeSkill(skill))
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !resumeSkills.includes(normalizeSkill(skill))
  );

  const matchPercentage = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100
  );

  return {
    targetRole: roleData.role,
    matchPercentage,
    matchedSkills,
    missingSkills,
  };
};

module.exports = { matchRoles, analyzeSkillGap };
