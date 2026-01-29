const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database file
const dbPath = path.join(__dirname, '../database/skill_synthex.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite connection error:', err);
  } else {
    console.log('✅ SQLite Database Connected:', dbPath);
  }
});

// Create tables automatically
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('✅ Users table ready');
  });

  // Resumes table
  db.run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      file_name TEXT,
      extracted_text TEXT,
      skills TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating resumes table:', err);
    else console.log('✅ Resumes table ready');
  });
});

module.exports = db;