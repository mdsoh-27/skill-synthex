import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RoadmapViewer from './components/RoadmapViewer';
import ProfileManager from './components/ProfileManager';
import ProficiencyCenter from './components/ProficiencyCenter';
import ChatBot from './components/ChatBot';
import { LogIn, UserPlus } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [analysisData, setAnalysisData] = useState(() => {
    const saved = localStorage.getItem('analysisData');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLogin, setIsLogin] = useState(true);
  const [highlightSkill, setHighlightSkill] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  useEffect(() => {
    if (analysisData) localStorage.setItem('analysisData', JSON.stringify(analysisData));
    else localStorage.removeItem('analysisData');
  }, [analysisData]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser({ ...data.user, stats: data.stats, assessments: data.assessments });
      else logout();
    } catch (e) {
      console.error("Auth failed:", e);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleSkillJump = (skill) => {
    setHighlightSkill(skill);
    setActiveView('roadmap');
  };

  if (!token) {
    return <LoginView setToken={setToken} isLogin={isLogin} setIsLogin={setIsLogin} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeView={activeView} setView={setActiveView} logout={logout} />
      
      <main style={{ 
        marginLeft: '260px', 
        flex: 1, 
        padding: '2rem',
        backgroundColor: 'var(--bg-darker)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {activeView === 'dashboard' && <Dashboard user={user} token={token} analysisData={analysisData} />}
        {activeView === 'proficiency' && (
          <ProficiencyCenter 
            token={token} 
            initialData={analysisData}
            onAnalysisComplete={(data) => {
              setAnalysisData(data);
              fetchUserData(); // Sync dashboard
            }} 
            onSkillClick={handleSkillJump}
            navigateTo={setActiveView}
          />
        )}
        {activeView === 'roadmap' && (
          <RoadmapViewer 
            analysisData={analysisData} 
            highlightSkill={highlightSkill} 
            onClearedHighlight={() => setHighlightSkill(null)}
          />
        )}
        {activeView === 'profile' && (
          <ProfileManager 
            user={user} 
            token={token} 
            onUpdate={() => fetchUserData()} 
          />
        )}
      </main>

      <ChatBot token={token} />
    </div>
  );
}

const LoginView = ({ setToken, isLogin, setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1e1b4b, #020617)'
    }}>
      <div className="glass-card fade-in" style={{ width: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'var(--primary)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
          }}>
            <LogIn color="white" size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'Outfit' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Experience Precision Career Growth</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              type="email" 
              className="glass-card" 
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              className="glass-card" 
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: '#fb7185', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--primary-light)', background: 'none', border: 'none', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default App;
