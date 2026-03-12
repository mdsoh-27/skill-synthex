import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Zap, Target, BookOpen, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ user, token, analysisData }) => {
  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState({ date: 'Calculating...', velocity: 0, confidence: 'Low' });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  useEffect(() => {
    if (analytics && analytics.assessments.length >= 2) {
      calculatePrediction(analytics.assessments);
    } else if (analytics && analytics.assessments.length < 2) {
      setPrediction({ date: 'Need more data', velocity: 0, confidence: 'Low' });
    }
  }, [analytics]);

  const calculatePrediction = (data) => {
    // Simple Linear Regression: y = mx + b
    // x = time (days from first assessment), y = score percentage
    const firstDate = new Date(data[0].created_at).getTime();
    
    const points = data.map(d => ({
      x: (new Date(d.created_at).getTime() - firstDate) / (1000 * 60 * 60 * 24), // Days
      y: (d.score / d.total_questions) * 100 // Percentage
    }));

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    points.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // We want to find when Y = 90%
    if (m <= 0) {
      setPrediction({ date: 'Steady Pace', velocity: 0, confidence: 'Neutral' });
      return;
    }

    const targetX = (90 - b) / m;
    const readyDate = new Date(firstDate + targetX * (1000 * 60 * 60 * 24));
    
    // Confidence based on consistency (variance of intervals)
    let variance = 0;
    if (points.length > 2) {
       const intervals = [];
       for(let i=1; i<points.length; i++) intervals.push(points[i].x - points[i-1].x);
       const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
       variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
    }

    setPrediction({
      date: readyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      velocity: Math.round(m * 10) / 10,
      confidence: variance < 2 ? 'High' : variance < 5 ? 'Medium' : 'Low'
    });
  };

  // Use real data from analysisData or fallback to user initial state
  const skillMatch = analysisData?.skillGap?.matchPercentage || 0;
  const topRole = analysisData?.suggestedRoles?.[0]?.role || 'Predicting...';
  
  // Real stats from the user profile (merged assessments)
  const stats = user?.stats || {};
  const recentAccuracy = stats.recentScore ? Math.round((stats.recentScore / stats.recentTotal) * 100) : 0;
  const modulesDone = stats.assessmentsCount || 0;

  const activityData = [
    { name: 'Assessments', value: stats.assessmentsCount || 0, color: '#10b981' },
    { name: 'Identified Gaps', value: stats.allGaps?.length || 0, color: '#f59e0b' },
    { name: 'Target Roles', value: analysisData?.suggestedRoles?.length || 0, color: '#6366f1' },
  ];

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', color: 'white' }}>Growth Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.full_name || 'Explorer'}. Here is your precision growth map.</p>
      </header>

      {/* Hero Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard 
          icon={<Target color="var(--primary)" />} 
          title="Role Fit Score" 
          value={`${skillMatch}%`} 
          subtitle={topRole}
          trend={skillMatch > 50 ? "+Low Gap" : "+High Priority"}
        />
        <StatCard 
          icon={<Zap color="var(--secondary)" />} 
          title="Assessment Accuracy" 
          value={`${recentAccuracy}%`} 
          subtitle={stats.recentScore ? `${stats.recentScore}/${stats.recentTotal} Correct` : "Pending Eval"}
        />
        <StatCard 
          icon={<TrendingUp color="var(--accent)" />} 
          title="Job-Ready Forecast" 
          value={prediction.date} 
          subtitle={`Velocity: +${prediction.velocity}%/day`}
          trend={`${prediction.confidence} Confidence`}
        />
        <StatCard 
          icon={<BookOpen color="var(--success)" />} 
          title="Assessments Done" 
          value={modulesDone} 
          subtitle="Verification steps"
        />
        <StatCard 
          icon={<Clock color="var(--accent)" />} 
          title="Last Sync" 
          value="Today" 
          subtitle={new Date().toLocaleDateString()}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Proficiency Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Skill Proficiency Matrix</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.8rem' }}>
              <TrendingUp size={14} /> LIVE TRENDING
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '4rem' }}>
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Python', A: stats.allGaps?.includes('Python') ? 40 : 80, fullMark: 100 },
                  { subject: 'Frontend', A: stats.allGaps?.includes('Frontend') ? 30 : 85, fullMark: 100 },
                  { subject: 'Backend', A: stats.allGaps?.includes('Backend') ? 45 : 75, fullMark: 100 },
                  { subject: 'Cloud', A: stats.allGaps?.includes('Cloud') ? 20 : 70, fullMark: 100 },
                  { subject: 'Database', A: stats.allGaps?.includes('Database') ? 50 : 80, fullMark: 100 },
                  { subject: 'AI/ML', A: stats.allGaps?.includes('AI/ML') ? 15 : 65, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Radar name="Proficiency" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Learning velocity details */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>Cognitive Learning Velocity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activityData.map(item => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  <span>{item.value} Units</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(100, (item.value / 20) * 100)}%`, 
                    height: '100%', 
                    background: item.color,
                    boxShadow: `0 0 10px ${item.color}44`
                  }} />
                </div>
              </div>
            ))}
            
            <div style={{ 
              marginTop: '1rem', 
              padding: '1.5rem', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '15px', 
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <AlertCircle color="var(--primary)" />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Predictions are calculated using <strong>Time-Series Linear Regression</strong> based on your last {analytics?.assessments.length || 0} assessments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, trend }) => (
  <div className="glass-card" style={{ padding: '1.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div style={{ 
        width: '45px', 
        height: '45px', 
        borderRadius: '12px', 
        background: 'rgba(255,255,255,0.03)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {icon}
      </div>
      {trend && (
        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 700 }}>
          {trend} ↑
        </span>
      )}
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
    <h2 style={{ fontSize: '2.25rem', margin: '0.5rem 0', fontFamily: 'Outfit' }}>{value}</h2>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subtitle}</p>
  </div>
);

export default Dashboard;
