const pool = require('./src/config/db');

async function fixUsersTable() {
    try {
        console.log('🛠️ Fixing Users table schema...');
        const connection = await pool.getConnection();

        // Check columns
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field);

        const columnsToAdd = [
            { name: 'full_name', type: 'VARCHAR(255)' },
            { name: 'career_goals', type: 'TEXT' },
            { name: 'interests', type: 'TEXT' },
            { name: 'education_level', type: 'VARCHAR(100)' }
        ];

        for (const col of columnsToAdd) {
            if (!columnNames.includes(col.name)) {
                console.log(`➕ Adding column: ${col.name}`);
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log('✅ Users table schema synchronized!');
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing users table:', err);
        process.exit(1);
    }
}

fixUsersTable();
