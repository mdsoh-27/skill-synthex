const fs = require("fs");
const csv = require("csv-parser");

function loadDataset(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (dataRow) => {
        const cleanedRow = {};
        Object.keys(dataRow).forEach(key => {
          const cleanKey = key.trim().toLowerCase();
          const rawValue = dataRow[key] || "";
          const cleanValue = rawValue.trim();

          if (cleanKey === "role") {
            cleanedRow["role"] = cleanValue;
          } else {
            cleanedRow[cleanKey] = Number(cleanValue) || 0;
          }
        });
        // Only push if the row actually has a role name
        if (cleanedRow.role) {
          data.push(cleanedRow);
        }
      })
      .on("end", () => resolve(data))
      .on("error", reject);
  });
}

module.exports = loadDataset;
