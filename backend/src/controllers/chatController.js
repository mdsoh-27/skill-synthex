const pool = require('../config/db');

exports.getChatResponse = async (req, res) => {
  try {
    const { message, context = 'dashboard' } = req.body;
    const userId = req.user.id;

    // RAG Step 1: Retrieve User Context
    const [userProfile] = await pool.query('SELECT full_name, career_goals, interests FROM users WHERE id = ?', [userId]);
    const [assessments] = await pool.query('SELECT skill_name, score, total_questions FROM user_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
    
    // RAG Step 2: Construct the Knowledge Base string
    let knowledgeBase = `User Name: ${userProfile[0]?.full_name || 'Explorer'}\n`;
    knowledgeBase += `Career Goals: ${userProfile[0]?.career_goals || 'Not set'}\n`;
    knowledgeBase += `Recent Skills Benchmarked: ${assessments.map(a => `${a.skill_name} (${Math.round((a.score/a.total_questions)*100)}%)`).join(', ')}\n`;
    
    // RAG Step 3: Call Ollama
    const systemPrompt = `You are "Synthex Mentor", an advanced AI career guide for the Skill Synthex System. 
Use the provided user context to give personalized, encouraging, and highly technical career advice. 
Keep responses concise (max 3-4 sentences). 
If you don't know something about the specific platform, focus on professional career growth in tech.
Context:\n${knowledgeBase}`;

    console.log(`🤖 Synthex Mentor: Generating response for user ${userId}...`);
    let response;
    try {
      response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3',
          prompt: `System: ${systemPrompt}\nUser: ${message}`,
          stream: false
        })
      });
    } catch (fetchErr) {
      console.error("❌ Ollama Connection Error:", fetchErr.message);
      return res.status(503).json({ error: 'Cannot connect to Ollama. Make sure "ollama serve" is active.' });
    }

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       console.error("❌ Ollama API Error:", response.status, errorData);
       if (response.status === 404) {
         return res.status(404).json({ error: 'Model "phi3" not found. Run "ollama pull phi3" in your terminal.' });
       }
       throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ AI Response Generated Successfully.`);
    res.json({ response: data.response });

  } catch (err) {
    console.error("❌ AI Mentor Internal Error:", err);
    res.status(500).json({ error: err.message || 'AI Mentor encountered an internal error.' });
  }
};
