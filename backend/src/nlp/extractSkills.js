const skills = require('./skillDictionary');
const { cleanText } = require('./textProcessor');

exports.extractSkills = (text) => {
  const cleaned = cleanText(text);
  return skills.filter(skill => cleaned.includes(skill));
};
