const pool = require('./src/config/db');

const quizData = [
    // --- COMPREHENSIVE ASSESSMENT (30 Questions across Domains) ---
    { skill: 'Comprehensive', topic: 'Frontend', q: 'Which CSS property is used to create a flex container?', a: 'display: block', b: 'display: grid', c: 'display: flex', d: 'position: relative', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Frontend', q: 'What does HTML stand for?', a: 'HyperText Markup Language', b: 'HighTech Modern Language', c: 'Hyperlink Text Management', d: 'Home Tool Markup Language', correct: 'A' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'Which method is the constructor in a Python class?', a: '__init__', b: '__main__', c: 'init', d: 'constructor', correct: 'A' },
    { skill: 'Comprehensive', topic: 'Database', q: 'Which SQL command is used to retrieve data from a database?', a: 'UPDATE', b: 'INSERT', c: 'SELECT', d: 'DELETE', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Cloud', q: 'What does AWS stand for?', a: 'Advanced Web Solutions', b: 'Amazon Web Services', c: 'Apple Web Systems', d: 'All Web Software', correct: 'B' },
    { skill: 'Comprehensive', topic: 'AI/ML', q: 'What is the primary library for numerical computing in Python?', a: 'Pandas', b: 'NumPy', c: 'Requests', d: 'Flask', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'Which Node.js module is used for creating a web server?', a: 'fs', b: 'path', c: 'http', d: 'os', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Frontend', q: 'Which property centers items along the main axis in Flexbox?', a: 'align-items', b: 'justify-content', c: 'text-align', d: 'align-content', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'What is the correct way to start a comment in Python?', a: '//', b: '/*', c: '#', d: '--', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Database', q: 'What is a Primary Key?', a: 'A key that unlocks the DB', b: 'A unique identifier for a record', c: 'A password for the database', d: 'The first column of any table', correct: 'B' },
    { skill: 'Comprehensive', topic: 'AI/ML', q: 'In Machine Learning, what is "Overfitting"?', a: 'Model works well on training but poor on new data', b: 'Model is too small', c: 'Model takes too long to train', d: 'Model works perfectly on all data', correct: 'A' },
    { skill: 'Comprehensive', topic: 'Cloud', q: 'Which service is used for scalable storage in AWS?', a: 'EC2', b: 'RDS', c: 'S3', d: 'Lambda', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Frontend', q: 'Which HTML tag is used for the largest heading?', a: '<h6>', b: '<head>', c: '<h1>', d: '<header>', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'Which of the following is NOT a JavaScript framework?', a: 'React', b: 'Angular', c: 'Django', d: 'Vue', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Database', q: 'What does ACID stand for in databases?', a: 'Atomicity, Consistency, Isolation, Durability', b: 'Accuracy, Complexity, Integrity, Design', c: 'Automatic, Connected, Internal, Distributed', d: 'None of the above', correct: 'A' },
    { skill: 'Comprehensive', topic: 'CyberSecurity', q: 'What is "Phishing"?', a: 'Catching fish online', b: 'A technique to steal sensitive info via deceptive emails', c: 'Scanning a network for ports', d: 'Encrypting a hard drive', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'Which HTTP method is used to update an existing resource?', a: 'GET', b: 'POST', c: 'PUT', d: 'DELETE', correct: 'C' },
    { skill: 'Comprehensive', topic: 'Frontend', q: 'What does the "box-sizing: border-box" property do?', a: 'Adds a border', b: 'Includes padding in element width', c: 'Removes padding', d: 'Makes the box round', correct: 'B' },
    { skill: 'Comprehensive', topic: 'AI/ML', q: 'Which type of learning uses labeled data?', a: 'Unsupervised', b: 'Supervised', c: 'Reinforcement', d: 'Manual', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Cloud', q: 'What is Cloud Computing?', a: 'Saving files on a hard drive', b: 'On-demand delivery of IT resources over the internet', c: 'A type of weather forecast', d: 'A networking ritual', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'What is the purpose of Middleware in Express.js?', a: 'To style the page', b: 'To execute code between request and response', c: 'To connect to the monitor', d: 'To manage hard drive space', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Frontend', q: 'Which tag is used for a multi-line text input?', a: '<input type="text">', b: '<textarea>', c: '<textbox>', d: '<field>', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Database', q: 'What is a Foreign Key?', a: 'A key from another country', b: 'A field that links two tables', c: 'A key that encrypts data', d: 'The last key in a record', correct: 'B' },
    { skill: 'Comprehensive', topic: 'AI/ML', q: 'What is a Neural Network?', a: 'A type of computer screen', b: 'A computational model inspired by the human brain', c: 'A social network for robots', d: 'A network of fiber optics', correct: 'B' },
    { skill: 'Comprehensive', topic: 'CyberSecurity', q: 'What does SSL stand for?', a: 'Secure Sockets Layer', b: 'System Security Level', c: 'Simple Socket Line', d: 'Secure Sign-on Logic', correct: 'A' },
    { skill: 'Comprehensive', topic: 'Backend', q: 'What is REST?', a: 'Taking a break from coding', b: 'Architectural style for networked applications', c: 'A programming language', d: 'A database system', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Frontend', q: 'How do you add a comment in CSS?', a: '//', b: '/*', c: '<!--', d: '#', correct: 'B' },
    { skill: 'Comprehensive', topic: 'AI/ML', q: 'What does NLP stand for?', a: 'Natural Language Processing', b: 'Neural Logic Programming', c: 'Network Level Protocol', d: 'None of the above', correct: 'A' },
    { skill: 'Comprehensive', topic: 'Cloud', q: 'What is "Serverless" computing?', a: 'Computing without any hardware', b: 'Running code without managing servers', c: 'A computer that doesn\'t act as a server', d: 'Offline computing', correct: 'B' },
    { skill: 'Comprehensive', topic: 'Database', q: 'What is NoSQL?', a: 'A database with no SQL support', b: 'Non-relational database for flexible schemas', c: 'A language better than SQL', d: 'A broken database', correct: 'B' }
];

async function seedQuizzes() {
    try {
        console.log('🚀 Seeding Comprehensive Skill Assessment...');
        
        // Clear existing quizzes to avoid duplicates during dev
        await pool.query('DELETE FROM quizzes');
        
        for (const item of quizData) {
            await pool.query(
                `INSERT INTO quizzes (skill_name, topic, question, option_a, option_b, option_c, option_d, correct_option) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [item.skill, item.topic, item.q, item.a, item.b, item.c, item.d, item.correct]
            );
        }

        console.log(`✅ Successfully seeded ${quizData.length} questions for Comprehensive Assessment!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding quizzes:', err);
        process.exit(1);
    }
}

seedQuizzes();
