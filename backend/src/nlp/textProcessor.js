exports.cleanText = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s#+.\-]/g, '');
