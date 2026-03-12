import React, { useState } from 'react';
import { Map, ChevronRight, BookOpen, ExternalLink, Star } from 'lucide-react';

const RoadmapViewer = ({ analysisData, highlightSkill, onClearedHighlight }) => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const lp = analysisData?.learningPath;
  const masterGaps = analysisData?.skillGap?.masterGaps || [];

  // 🔄 Auto-scroll to highlighted skill
  React.useEffect(() => {
    if (highlightSkill) {
      const element = document.getElementById(`resource-${highlightSkill.toLowerCase()}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Clear highlight from App state after a delay if desired, 
        // or just let it stay until the next jump
      }
    }
  }, [highlightSkill]);

  if (!lp) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '5rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
          <Map size={60} color="var(--primary-light)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
          <h2 className="font-outfit">Roadmap Pending</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Please complete a Resume Analysis to generate your personalized career journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '1rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', color: 'white' }}>{lp.title} Roadmap</h2>
          <p style={{ color: 'var(--text-muted)' }}>{lp.description}</p>
        </div>
        {highlightSkill && (
          <button 
            onClick={onClearedHighlight}
            style={{ 
              background: 'rgba(236, 72, 153, 0.1)', 
              color: 'var(--secondary)', 
              border: '1px solid var(--secondary)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Viewing Search: {highlightSkill} (Clear)
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {lp.milestones.map((m, idx) => (
            <div key={idx} className="glass-card" style={{ 
              position: 'relative', 
              paddingLeft: '4rem',
              borderLeft: m.isCritical ? '4px solid var(--secondary)' : '1px solid var(--border)',
              boxShadow: highlightSkill && m.topics.some(t => t.toLowerCase() === highlightSkill.toLowerCase()) 
                 ? '0 0 20px rgba(236, 72, 153, 0.2)' : 'none'
            }}>
              <div style={{
                position: 'absolute',
                left: '-18px',
                top: '24px',
                width: '36px',
                height: '36px',
                background: m.isCritical ? 'var(--secondary)' : 'var(--primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                {idx + 1}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', color: 'white' }}>{m.level} Module</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Focus: {m.focus}</p>
                </div>
                {m.isCritical && (
                  <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)', border: '1px solid var(--secondary)' }}>
                    <Star size={12} fill="var(--secondary)" style={{ marginRight: '4px' }} /> Critical Focus
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
                {m.topics.map(t => (
                  <span 
                    key={t} 
                    className="skill-tag" 
                    style={{ 
                      fontSize: '0.75rem',
                      background: highlightSkill && t.toLowerCase() === highlightSkill.toLowerCase() ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                      color: highlightSkill && t.toLowerCase() === highlightSkill.toLowerCase() ? 'white' : 'inherit'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resources Sidebar */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Targeted Materials</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lp.resources.map((r, i) => {
              const isHighlighted = highlightSkill && r.skill_name?.toLowerCase() === highlightSkill.toLowerCase();
              return (
                <div 
                  key={i} 
                  id={`resource-${r.skill_name?.toLowerCase()}`}
                  className="glass-card" 
                  style={{ 
                    cursor: 'pointer', 
                    padding: '1rem',
                    border: isHighlighted ? '1px solid var(--secondary)' : '1px solid var(--border)',
                    boxShadow: isHighlighted ? '0 0 15px rgba(236, 72, 153, 0.3)' : 'none',
                    transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                    transition: '0.3s'
                  }}
                  onClick={() => r.is_external ? window.open(r.url, '_blank') : setSelectedMaterial(r)}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: r.is_external ? 'rgba(99, 102, 241, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {r.is_external ? <ExternalLink size={18} color="var(--primary-light)" /> : <BookOpen size={18} color="var(--secondary)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{r.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.skill_name} | {r.category}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Material Modal */}
      {selectedMaterial && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="glass-card fade-in" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '3rem' }}>
            <h1 className="font-outfit" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedMaterial.title}</h1>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', marginBottom: '2rem', display: 'inline-block' }}>
              Internal Mastery Module
            </span>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.8, fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}></div>
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setSelectedMaterial(null)}>Back to Roadmap</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapViewer;
