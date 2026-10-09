import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const CreateProjectPage = () => {
  useDocumentTitle('Create Project');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If someone who isn't a mentor somehow gets here, kick them out
  if (!user || user.role !== 'MENTOR') {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Access Denied: Only Mentors can create projects.</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim() !== '') {
      e.preventDefault(); // Stop form submission
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleAddInterest = (e) => {
    if (e.key === 'Enter' && interestInput.trim() !== '') {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        skillsRequired: skills,
        interests: interests
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Go back to the explore page (which we will build next)
        navigate('/explore');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 5%' }}>
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '800px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create a New Project</h2>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Project Title</label>
            <input 
              type="text" 
              name="title" 
              required 
              value={formData.title} 
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g. AI-Powered Trading Bot"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description</label>
            <textarea 
              name="description" 
              required 
              value={formData.description} 
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
              placeholder="Describe your project, the goal, and what kind of students you are looking for..."
            />
          </div>

          {/* SKILLS TAGS */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Required Skills (Press Enter)</label>
            <input 
              type="text" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              style={inputStyle}
              placeholder="e.g. React, Python"
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {skills.map(s => (
                <span key={s} style={tagStyle} onClick={() => setSkills(skills.filter(x => x !== s))}>{s} &times;</span>
              ))}
            </div>
          </div>

          {/* INTERESTS TAGS */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Project Categories / Interests (Press Enter)</label>
            <input 
              type="text" 
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={handleAddInterest}
              style={inputStyle}
              placeholder="e.g. FinTech, Machine Learning"
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {interests.map(i => (
                <span key={i} style={tagStyle} onClick={() => setInterests(interests.filter(x => x !== i))}>{i} &times;</span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            background: 'var(--gradient-brand)',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginTop: '1rem',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Creating Project...' : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '1rem',
  borderRadius: '8px',
  background: 'var(--bg-dark)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '1rem'
};

const tagStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  padding: '0.4rem 0.8rem',
  borderRadius: '20px',
  fontSize: '0.9rem',
  cursor: 'pointer'
};

export default CreateProjectPage;
