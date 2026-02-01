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
      const rawSkills =
        row.skills || row.Required_Skills || row.required_skills;

      if (!rawSkills) return null;

      const roleSkills = rawSkills
        .split(",")
        .map((s) => normalizeSkill(s.trim()));

      let matchedSkills = roleSkills.filter((skill) =>
        resumeSkills.includes(skill)
      );

      const matchPercentage =
        (matchedSkills.length / roleSkills.length) * 100;

      return {
        role: row.role || row.Role || "Unknown Role",
        matchedSkills,
        matchPercentage: Math.round(matchPercentage),
      };
    })
    .filter((r) => r && r.matchPercentage >= 40) // 🔥 threshold
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

module.exports = matchRoles;
