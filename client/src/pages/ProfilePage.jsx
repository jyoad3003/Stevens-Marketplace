import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ProfilePage = () => {
  useDocumentTitle('My Profile');
  const { user, setUser } = useAuth(); // We destructure setUser to manually update Context state
  
  // Student State
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [major, setMajor] = useState(user?.major || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '');
  const [portfolioLink, setPortfolioLink] = useState(user?.portfolioLink || '');

  // Mentor State
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    let payload = {};

    if (user.role === 'STUDENT') {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
      payload = {
        skills: skillsArray,
        interests: interestsArray,
        major,
        graduationYear,
        bio,
        portfolioLink
      };
    } else {
      payload = {
        title,
        bio
      };
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Update global auth context FIRST
        setUser(data);
        setMessage('Profile updated successfully!');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Could not connect to backend.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-dark)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    marginBottom: '1.5rem',
    fontFamily: 'inherit' // For textarea
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 5%' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
        {user.role === 'STUDENT' ? 'Update your resume to get better AI matches.' : 'Update your digital business card.'}
      </p>

      {message && <div style={{ background: '#00cc0022', color: '#00cc00', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{message}</div>}
      {error && <div style={{ background: '#ff444422', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px' }}>
        
        {/* Read-Only Identity Info */}
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{user.firstName} {user.lastName}</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user.email}</p>
          <span style={{ 
            display: 'inline-block', 
            marginTop: '1rem', 
            background: 'var(--primary)', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '12px', 
            fontSize: '0.8rem', 
            fontWeight: 'bold' 
          }}>
            {user.role}
          </span>
        </div>

        <form onSubmit={handleSave}>
          
          {/* =========================================
              STUDENT FIELDS 
              ========================================= */}
          {user.role === 'STUDENT' && (
            <>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Major / Degree</label>
                  <input 
                    type="text" 
                    value={major} 
                    onChange={e => setMajor(e.target.value)} 
                    placeholder="e.g., M.S. Computer Science"
                    style={inputStyle} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Graduation Year</label>
                  <input 
                    type="text" 
                    value={graduationYear} 
                    onChange={e => setGraduationYear(e.target.value)} 
                    placeholder="e.g., 2025"
                    style={inputStyle} 
                  />
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>My Skills (Comma-separated)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.3rem', marginBottom: '0.8rem' }}>
                This is crucial for the AI Matcher. List languages, frameworks, and tools.
              </p>
              <input 
                type="text" 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
                placeholder="e.g. React, Node.js, Python, MongoDB"
                style={inputStyle} 
              />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>My Interests (Comma-separated)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.3rem', marginBottom: '0.8rem' }}>
                What kind of projects excite you?
              </p>
              <input 
                type="text" 
                value={interests} 
                onChange={e => setInterests(e.target.value)} 
                placeholder="e.g. Machine Learning, Startups, Web Dev"
                style={inputStyle} 
              />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Portfolio / GitHub Link</label>
              <input 
                type="url" 
                value={portfolioLink} 
                onChange={e => setPortfolioLink(e.target.value)} 
                placeholder="https://github.com/yourusername"
                style={inputStyle} 
              />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Short Bio</label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Hi, I'm a junior passionate about backend architecture..."
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
              />
            </>
          )}

          {/* =========================================
              MENTOR FIELDS 
              ========================================= */}
          {user.role === 'MENTOR' && (
            <>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title / Role</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.3rem', marginBottom: '0.8rem' }}>
                How should students address you?
              </p>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Professor of Computer Science, Startup Founder"
                style={inputStyle} 
              />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Department / Bio</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.3rem', marginBottom: '0.8rem' }}>
                Tell students a bit about your research lab, startup, or department.
              </p>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="I run the Stevens AI Research lab..."
                style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} 
              />
            </>
          )}

          <button type="submit" style={{
            background: 'var(--gradient-brand)',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            marginTop: '1rem'
          }} className="hover-lift">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
