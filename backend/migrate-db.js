const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'src/database/skill_synthex.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database schema...');

db.serialize(() => {
    db.all("PRAGMA table_info(resumes);", (err, rows) => {
        if (err) {
            console.error('❌ Error checking schema:', err);
            process.exit(1);
        }

        const hasSkills = rows.some(row => row.name === 'skills');

        if (!hasSkills) {
            console.log('➕ Adding missing "skills" column to "resumes" table...');
            db.run("ALTER TABLE resumes ADD COLUMN skills TEXT;", (err) => {
                if (err) {
                    console.error('❌ Error adding column:', err);
                } else {
                    console.log('✅ "skills" column added successfully!');
                }
                db.close();
            });
        } else {
            console.log('✅ "skills" column already exists.');
            db.close();
        }
    });
});
