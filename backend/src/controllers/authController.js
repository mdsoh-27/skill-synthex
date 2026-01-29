const bcrypt = require('bcryptjs');
// const users=require('../utils/resumeTextExtractor.js');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

//signup
exports.signup = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and Password Required"
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: "Invalid email format"
        });
    };

    // Relaxed password regex for easier testing (min 6 characters)
    const passwordRegex = /^.{6,}$/;
    if (!passwordRegex.test(password)) {
        console.warn(`⚠️ Signup failed: Password too weak for ${email}`);
        return res.status(400).json({
            error: "Password must be at least 6 characters long"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`📝 Attempting to register user: ${email}`);

    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;

    db.run(query, [email, hashedPassword], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: "User already exists" });
            }
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "user registered successfully" });
    });

};

//loginup

exports.login = async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({
            error: "Email and Password required"
        });
    }

    const query = "SELECT * FROM users WHERE email = ?";

    db.get(query, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (!user)
            return res.status(401).json({ error: "Invalid email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid password"
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send token
        res.json({ message: "Login successful", token });
    });
}
