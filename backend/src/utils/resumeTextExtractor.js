const fs = require('fs');
const pdf = require('pdf-parse');

exports.extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (err) {
    console.error('Error in extractTextFromPDF:', err);
    throw new Error('Failed to parse PDF file');
  }
};
