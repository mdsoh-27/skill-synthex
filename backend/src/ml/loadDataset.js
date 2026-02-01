const fs = require("fs");
const csv = require("csv-parser");

function loadDataset(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        Object.keys(row).forEach(key => {
          if (key !== "role") row[key] = Number(row[key]);
        });
        data.push(row);
      })
      .on("end", () => resolve(data))
      .on("error", reject);
  });
}

module.exports = loadDataset;
