import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, ChevronRight, CheckCircle2, AlertCircle, 
  Trophy, Timer, Award, XCircle, ArrowRight, Activity
} from 'lucide-react';
import axios from 'axios';

const ProficiencyCenter = ({ token, onAnalysisComplete, onSkillClick, navigateTo, initialData }) => {
  const [stage, setStage] = useState(() => {
    if (initialData) {
      if (initialData.skillGap?.isIntegrated) return 'FINAL_REPORT';
      return 'ANALYSIS_RESULTS';
    }
    return 'UPLOAD';
  });
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [results, setResults] = useState(initialData);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // Dynamic Roadmap Fetching for Rank 2 & 3
  useEffect(() => {
    const updateRoadmap = async () => {
      if (stage !== 'FINAL_REPORT' || !results?.suggestedRoles) return;
      
      const roleData = results.suggestedRoles[selectedRoleIndex];
      if (!roleData) return;
      
      const targetRole = roleData.role;

      // Avoid re-fetching if the current roadmap already matches this role
      if (results.learningPath?.title?.toLowerCase() === targetRole.toLowerCase() && !loadingRoadmap) return;

      const gaps = (roleData.missingSkills || []).join(',');

      setLoadingRoadmap(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/career/learning-path/${encodeURIComponent(targetRole)}?gaps=${encodeURIComponent(gaps)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const updatedResults = { ...results, learningPath: res.data.learningPath };
        setResults(updatedResults);
        if (onAnalysisComplete) onAnalysisComplete(updatedResults);
      } catch (err) {
        console.error("Failed to fetch specific roadmap:", err);
      } finally {
        setLoadingRoadmap(false);
      }
    };

    updateRoadmap();
  }, [selectedRoleIndex, stage, results]); // Included results to prevent stale closures

  const resetAnalysis = () => {
    setFile(null);
    setResults(null);
    setStage('UPLOAD');
    setError('');
    if (onAnalysisComplete) onAnalysisComplete(null);
  };

  // Keep local results synced with initialData from parent
  useEffect(() => {
    if (initialData) setResults(initialData);
  }, [initialData]);

  // Quiz States
  const [questions, setQuestions] = useState([]);
  const [currIdx, setCurrIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  const [seconds, setSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    let timer;
    if (stage === 'QUIZ_ACTIVE') {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;
    setStage('ANALYZING');
    setError('');
    setSelectedRoleIndex(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(res.data);
      setStage('ANALYSIS_RESULTS');
      if (onAnalysisComplete) onAnalysisComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
      setStage('UPLOAD');
    }
  };

  const startAssessment = async () => {
    setStage('QUIZ_LOADING');
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/Comprehensive', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(res.data.questions);
      setStage('QUIZ_ACTIVE');
      setCurrIdx(0);
      setScore(0);
      setResponses([]);
      setSeconds(0);
    } catch (err) {
      setError("Failed to load assessment.");
      setStage('ANALYSIS_RESULTS');
    }
  };

  const handleAnswer = (selected) => {
    const q = questions[currIdx];
    const isCorrect = selected === q.correct_option;
    
    const newResponses = [...responses, {
      quiz_id: q.id,
      selected,
      is_correct: isCorrect,
      topic: q.topic
    }];
    setResponses(newResponses);
    if (isCorrect) setScore(s => s + 1);

    if (currIdx + 1 < questions.length) {
      setCurrIdx(currIdx + 1);
    } else {
      finishQuiz(newResponses);
    }
  };

  const finishQuiz = async (finalResponses) => {
    setStage('QUIZ_LOADING'); // Re-use for submitting
    try {
      const payload = {
        skill: 'Comprehensive',
        score: finalResponses.filter(r => r.is_correct).length,
        total: questions.length,
        responses: finalResponses
      };
      
      const res = await axios.post('http://localhost:5000/api/quiz/submit', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuizResults(res.data);
      
      // Re-trigger analysis to get SYNTHESIZED results after quiz
      const formData = new FormData();
      formData.append('resume', file);
      const synthRes = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResults(synthRes.data);
      setStage('FINAL_REPORT');
      if (onAnalysisComplete) onAnalysisComplete(synthRes.data);
    } catch (err) {
      setError("Failed to save results");
      setStage('ANALYSIS_RESULTS');
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  // --- RENDERING LOGIC ---

  if (stage === 'UPLOAD' || stage === 'ANALYZING') {
    return (
      <div className="fade-in" style={{ padding: '1rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', color: 'white' }}>Proficiency Center: Discover</h2>
          <p style={{ color: 'var(--text-muted)' }}>Phase 1: Upload your resume for initial skill extraction and role mapping.</p>
        </header>

        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '20px',
            padding: '4rem 2rem',
            cursor: 'pointer',
            transition: '0.3s',
            backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
          }}>
            <input {...getInputProps()} />
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Upload size={40} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{file ? file.name : 'Drag or click to upload resume'}</h3>
            <p style={{ color: 'var(--text-muted)' }}>PDF formats supported (Max 5MB)</p>
          </div>

          {file && stage === 'UPLOAD' && (
            <button onClick={handleUpload} className="btn btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 3rem' }}>
              Begin Extraction <ChevronRight size={20} />
            </button>
          )}

          {stage === 'ANALYZING' && (
            <div style={{ marginTop: '3rem' }}>
              <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Deciphering skills with AI Synthesis v3...</p>
            </div>
          )}
          {error && <p style={{ color: '#fb7185', marginTop: '1rem' }}>{error}</p>}
        </div>
      </div>
    );
  }

  if (stage === 'ANALYSIS_RESULTS') {
    return (
      <div className="fade-in" style={{ padding: '1rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', color: 'white' }}>Skill Extraction Complete</h2>
          <p style={{ color: 'var(--text-muted)' }}>Phase 2: Initial results ready. Proceed to verification for 100% accuracy.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle2 color="var(--success)" size={32} />
                    <div>
                        <h4 style={{ color: 'var(--success)' }}>Extraction Successful</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{results.skills.length} core skills identified from your resume.</p>
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Target Roles Identified</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {results.suggestedRoles.map((r, i) => (
                            <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 600 }}>{r.role}</span>
                                <span style={{ color: 'var(--primary-light)' }}>{r.confidence}% Match</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
                    borderRadius: '20px', 
                    border: '1px solid var(--primary)',
                    textAlign: 'center'
                }}>
                    <Trophy color="var(--primary-light)" size={48} style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Verify Your Proficiency</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>To finalize your professional standing and unlock custom roadmaps, complete a 10-minute competency assessment.</p>
                    <button className="btn btn-primary" onClick={startAssessment} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Begin Verification <ArrowRight size={20} />
                    </button>
                    <button 
                        style={{ display: 'block', margin: '1.5rem auto 0', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setStage('FINAL_REPORT')}
                    >
                        Skip for now (Reduced Fidelity)
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Skills Found</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
                    {results.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
                <button className="btn btn-secondary" onClick={resetAnalysis} style={{ width: '100%', opacity: 0.6 }}>Analyze Different Resume</button>
            </div>
        </div>
      </div>
    );
  }

  if (stage === 'QUIZ_LOADING') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loader" style={{ marginBottom: '2rem' }}></div>
        <h3 className="font-outfit">Synchronizing Assessment Matrix...</h3>
      </div>
    );
  }

  if (stage === 'QUIZ_ACTIVE') {
    const q = questions[currIdx];
    const progress = ((currIdx) / questions.length) * 100;

    return (
      <div className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Phase 3: Proficiency Verification</span>
            <h3 style={{ fontSize: '1.5rem' }}>Comprehensive Domain Mastery</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1.25rem', borderRadius: '50px' }}>
            <Timer size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent)' }}>{formatTime(seconds)}</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '3rem', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))', transition: '0.4s' }}></div>
        </div>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <p style={{ fontSize: '1.4rem', marginBottom: '2.5rem', lineHeight: 1.6, color: 'white' }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: 700, marginRight: '1rem' }}>Q{currIdx + 1}.</span>
            {q.question}
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="skill-tag"
                style={{ 
                   width: '100%', 
                   textAlign: 'left', 
                   padding: '1.25rem 1.5rem', 
                   borderRadius: '15px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '1.5rem',
                   fontSize: '1rem',
                   cursor: 'pointer'
                }}
              >
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  <span>{opt}</span>
                </div>
                {q[`option_${opt.toLowerCase()}`]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'FINAL_REPORT') {
    const primaryRole = results.suggestedRoles[selectedRoleIndex];
    const currentGaps = primaryRole?.missingSkills || results?.skillGap?.masterGaps || [];

    return (
      <div className="fade-in" style={{ padding: '1rem' }}>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'white' }}>Unified Proficiency Report</h2>
            <p style={{ color: 'var(--text-muted)' }}>Synthesized Intelligence: Resume + Assessment data integrated.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} onClick={resetAnalysis}>Analyze New Resume</button>
             <button className="btn btn-secondary" onClick={() => navigateTo('dashboard')}>Go to Dashboard <Activity size={18} /></button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Predicted Roles */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem' }}>🎯 Roles Predicted</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The analysis has identified your top potential roles based on your verified performance.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.suggestedRoles.map((r, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedRoleIndex(i)}
                    style={{ 
                      padding: '1.25rem', 
                      background: selectedRoleIndex === i ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedRoleIndex === i ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: '0.2s',
                    }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank #{i+1}</p>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>{r.role}</p>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedRoleIndex === i ? 'var(--primary-light)' : 'white' }}>{r.confidence}%</div>
                  </div>
                ))}
              </div>
              
              {quizResults && (
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid var(--border)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment Perfomance</p>
                        <h4 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{quizResults.score}/{questions.length} Correct</h4>
                      </div>
                      <Award size={40} color="var(--secondary)" />
                   </div>
                </div>
              )}
            </div>

            {/* Synthesized Gaps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ borderColor: 'rgba(251, 113, 133, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#fb7185' }}>Synthesized Skill Gaps</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={10} color="var(--primary)" /> Resume
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)' }}>
                      <AlertCircle size={10} color="#fb7185" /> Assessment
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                   The combined delta between your resume skills and assessment verified weaknesses:
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
                  {currentGaps.map(g => {
                    const r = results.suggestedRoles[selectedRoleIndex];
                    const inAssessment = r?.sources?.assessment?.includes(g) || false;
                    const inResume = r?.sources?.resume?.includes(g) || false;

                    return (
                      <span 
                        key={g} 
                        className="skill-tag skill-missing" 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => onSkillClick && onSkillClick(g)}
                      >
                        {g}
                        {inAssessment && <AlertCircle size={12} />}
                        {!inAssessment && inResume && <CheckCircle2 size={12} />}
                      </span>
                    )
                  })}
                  {currentGaps.length === 0 && <p style={{ color: 'var(--success)', fontWeight: 600 }}>Zero gaps identified! You are fully role-ready. 🎉</p>}
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '15px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>Ready to bridge these gaps?</h4>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => navigateTo('roadmap')} 
                      disabled={loadingRoadmap}
                      style={{ width: '100%' }}
                    >
                      {loadingRoadmap ? 'Synchronizing Roadmap...' : `View Roadmap for ${primaryRole?.role || 'this Role'}`}
                      {!loadingRoadmap && <ChevronRight size={18} />}
                    </button>
                </div>
              </div>

              <div className="glass-card">
                  <h3 style={{ marginBottom: '1rem' }}>Identified Resume Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {results.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
              </div>
            </div>
        </div>
      </div>
    )
  }

  return null;
};

export default ProficiencyCenter;
