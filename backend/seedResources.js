const db = require('./src/config/db');

const initialResources = [
    // --- INTERNAL PROPRIETARY MODULES ---
    { 
        skill_name: 'python', 
        title: 'Python Essentials: Skill Synthex Module', 
        url: '#', 
        category: 'Module',
        is_external: false,
        content: `
            <h3>Welcome to the Python Mastery Module</h3>
            <p>Python is a high-level, interpreted programming language known for its readability and versatility.</p>
            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Variables & Data Types:</strong> Int, Float, String, Boolean.</li>
                <li><strong>Structures:</strong> Lists, Dictionaries, Tuples.</li>
                <li><strong>Control Flow:</strong> If-statements, For/While loops.</li>
            </ul>
            <p>Study this module to build a strong foundation for Data Science and Backend development.</p>
        `
    },
    { 
        skill_name: 'html', 
        title: 'Mastering Semantic HTML', 
        url: '#', 
        category: 'Module',
        is_external: false,
        content: `
            <h3>Semantic HTML5 Guide</h3>
            <p>Semantic HTML introduces meaning to the web page rather than just presentation.</p>
            <h4>Why it matters:</h4>
            <ul>
                <li><strong>SEO:</strong> Search engines understand your content better.</li>
                <li><strong>Accessibility:</strong> Screen readers benefit from proper tags.</li>
            </ul>
            <h4>Essential Tags:</h4>
            <code>&lt;header&gt;, &lt;main&gt;, &lt;article&gt;, &lt;footer&gt;, &lt;section&gt;</code>
        `
    },
    { 
        skill_name: 'css', 
        title: 'Modern CSS Layouts (Flexbox & Grid)', 
        url: '#', 
        category: 'Module',
        is_external: false,
        content: `
            <h3>The Skill Synthex Layout Guide</h3>
            <p>Modern web design relies on flexible, responsive layouts.</p>
            <h4>Flexbox:</h4>
            <p>Use <code>display: flex</code> for one-dimensional layouts (rows or columns).</p>
            <h4>Grid:</h4>
            <p>Use <code>display: grid</code> for two-dimensional layouts (complex structures).</p>
        `
    },
    { 
        skill_name: 'express', 
        title: 'Express.js: Building Robust APIs', 
        url: '#', 
        category: 'Module',
        is_external: false,
        content: `
            <h3>Express.js Core Architecture</h3>
            <p>Express is a minimal and flexible Node.js web application framework.</p>
            <h4>Key Features:</h4>
            <ul>
                <li><strong>Middleware:</strong> Process requests before they reach handlers.</li>
                <li><strong>Routing:</strong> Map URLs to specific logic.</li>
            </ul>
        `
    },

    // --- EXTERNAL REFERENCES ---
    { skill_name: 'python', title: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com/', category: 'Book', is_external: true, content: '' },
    { skill_name: 'sql', title: 'SQL Server Tutorial', url: 'https://www.sqlservertutorial.net/', category: 'Tutorial', is_external: true, content: '' },
    { skill_name: 'machine_learning', title: 'Machine Learning by Andrew Ng (Coursera)', url: 'https://www.coursera.org/learn/machine-learning', category: 'Course', is_external: true, content: '' },
    { skill_name: 'react', title: 'React Official Beta Docs', url: 'https://beta.reactjs.org/', category: 'Documentation', is_external: true, content: '' },
    { skill_name: 'aws', title: 'AWS Cloud Practitioner Essentials', url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials', category: 'Course', is_external: true, content: '' },
    { skill_name: 'mongodb', title: 'MongoDB University Free Courses', url: 'https://university.mongodb.com/', category: 'Course', is_external: true, content: '' },
    { skill_name: 'typescript', title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', category: 'Documentation', is_external: true, content: '' }
];

const { normalizeSkill } = require('./src/utils/skillMapper');

const seed = async () => {
    try {
        console.log('🌱 Updating database with Robust Normalized Resources...');
        
        let addedCount = 0;
        for (const res of initialResources) {
            const normalizedName = normalizeSkill(res.skill_name);
            
            // Use INSERT IGNORE or REPLACE depending on if we want to update
            // We'll use UPDATE on duplicate key to ensure skill_name is normalized even for existing titles
            const [result] = await db.query(
                `INSERT INTO resources (skill_name, title, url, category, is_external, content) 
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name)`,
                [normalizedName, res.title, res.url, res.category, res.is_external, res.content]
            );
            if (result.affectedRows > 0) addedCount++;
        }

        console.log(`✅ Update complete! Synced ${initialResources.length} resources. Path: Normalised.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seed();
