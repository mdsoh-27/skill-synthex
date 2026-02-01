const skillDictionary = require("./skillDictionary");

exports.extractSkills = (text) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lowerText = text.toLowerCase();
  const extractedSkills = [];

  for (const [key, value] of Object.entries(skillDictionary)) {
    if (lowerText.includes(key.toLowerCase())) {
      extractedSkills.push(value); // push clean display name
    }
  }

  return [...new Set(extractedSkills)]; // remove duplicates
};
