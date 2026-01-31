const fs = require('fs');
const { PDFParse } = require('pdf-parse');

exports.extractTextFromPDF = async (filePath) => {
  let parser;
  try {
    console.log('📄 Attempting to parse PDF at:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    console.log('📊 PDF file size:', dataBuffer.length, 'bytes');

    // V2 API Usage
    parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();

    console.log('✅ PDF parsed successfully. Text length:', result.text.length);

    return result.text;
  } catch (err) {
    console.error('❌ Error in extractTextFromPDF:', err.message);
    console.error('Full error:', err);
    throw new Error('Failed to parse PDF file: ' + err.message);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy();
    }
  }
};
