import React, { useState } from 'react';
import { User, Save, Target, Sparkles, GraduationCap } from 'lucide-react';
import axios from 'axios';

const ProfileManager = ({ user, token, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    career_goals: user?.career_goals || '',
    interests: user?.interests || '',
    education_level: user?.education_level || 'B.Tech'
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await axios.put('http://localhost:5000/api/profile', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccess(true);
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', color: 'white' }}>Professional Profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>Tailor your growth journey by sharing your aspirations and background.</p>
      </header>

      <div className="glass-card" style={{ padding: '3rem' }}>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
            }}>
              <User size={40} />
            </div>
            <div>
              <h3 className="font-outfit" style={{ fontSize: '1.5rem' }}>{user?.email}</h3>
              <p style={{ color: 'var(--text-muted)' }}>Member since {new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" 
                className="glass-card" 
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', color: 'white' }}
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <GraduationCap size={16} /> Education Level
              </label>
              <select 
                className="glass-card" 
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', color: 'white' }}
                value={formData.education_level}
                onChange={(e) => setFormData({...formData, education_level: e.target.value})}
              >
                <option value="High School">High School</option>
                <option value="B.Tech">B.Tech / Bachelor's</option>
                <option value="M.Tech">M.Tech / Master's</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Target size={16} /> Career Goals
            </label>
            <textarea 
              className="glass-card" 
              rows="3"
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', resize: 'none', color: 'white' }}
              placeholder="e.g. Become a Senior Full-Stack Developer at a top tech company"
              value={formData.career_goals}
              onChange={(e) => setFormData({...formData, career_goals: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Sparkles size={16} /> Tech Interests
            </label>
            <textarea 
              className="glass-card" 
              rows="2"
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', resize: 'none', color: 'white' }}
              placeholder="e.g. Artificial Intelligence, Cloud Architecture, Mobile Development"
              value={formData.interests}
              onChange={(e) => setFormData({...formData, interests: e.target.value})}
            ></textarea>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : success ? 'Successfully Saved!' : <><Save size={20} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManager;
