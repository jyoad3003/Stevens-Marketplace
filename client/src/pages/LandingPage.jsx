import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const LandingPage = () => {
  useDocumentTitle('Welcome');
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch trending projects if the user is a guest (not logged in)
    // because logged-in users won't see the teaser section anyway.
    if (!user) {
      const fetchTrending = async () => {
        try {
          const response = await fetch('/api/projects/trending');
          if (response.ok) {
            const data = await response.json();
            setTrending(data);
          }
        } catch (err) {
          console.error("Failed to fetch trending projects");
        }
      };
      fetchTrending();
    }
  }, [user]);

  const handleGuestCardClick = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  // ==========================================
  // STATE 2 & 3: LOGGED IN VIEWS (Personalized Hub)
  // ==========================================
  if (user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{user.firstName}</span>!
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '4rem' }}>
          What would you like to do today?
        </p>

        {user.role === 'STUDENT' ? (
          // STUDENT HUB
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore" className="glass-panel hover-lift" style={{ 
              padding: '3rem 2rem', 
              borderRadius: '16px', 
              textDecoration: 'none', 
              color: 'var(--text-main)',
              flex: '1 1 250px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧭</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Explore Matches</h3>
              <p style={{ color: 'var(--text-muted)' }}>Find AI-matched projects and apply.</p>
            </Link>

            <Link to="/profile" className="glass-panel hover-lift" style={{ 
              padding: '3rem 2rem', 
              borderRadius: '16px', 
              textDecoration: 'none', 
              color: 'var(--text-main)',
              flex: '1 1 250px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Update Profile</h3>
              <p style={{ color: 'var(--text-muted)' }}>Add skills to get better project matches.</p>
            </Link>
          </div>
        ) : (
          // MENTOR HUB
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="glass-panel hover-lift" style={{ 
              padding: '3rem 2rem', 
              borderRadius: '16px', 
              textDecoration: 'none', 
              color: 'var(--text-main)',
              flex: '1 1 250px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Applications</h3>
              <p style={{ color: 'var(--text-muted)' }}>Review students applying to your projects.</p>
            </Link>

            <Link to="/projects/new" className="glass-panel hover-lift" style={{ 
              padding: '3rem 2rem', 
              borderRadius: '16px', 
              textDecoration: 'none', 
              color: 'var(--text-main)',
              flex: '1 1 250px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>➕</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Post Project</h3>
              <p style={{ color: 'var(--text-muted)' }}>Create a new project to recruit talent.</p>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // STATE 1: GUEST VIEW (Teaser Landing Page)
  // ==========================================
  return (
    <div>
      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800', 
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          Where Stevens <br />
          <span style={{ 
            background: 'var(--gradient-brand)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Builds the Future.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.6' }}>
          The exclusive AI-powered marketplace for Stevens Institute of Technology. 
          Find capstone teams, recruit top-tier talent, and launch your next startup.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            background: 'var(--gradient-brand)',
            color: 'white',
            padding: '1rem 2.5rem',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(255, 64, 129, 0.3)',
            transition: 'transform 0.2s ease'
          }} className="hover-lift">
            Create an Account
          </Link>
          <Link to="/login" style={{
            background: 'transparent',
            color: 'var(--text-main)',
            border: '2px solid var(--border-color)',
            padding: '1rem 2.5rem',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'transform 0.2s ease'
          }} className="hover-lift">
            Log In
          </Link>
        </div>
      </div>

      {/* TRENDING PROJECTS TEASER (Moved UP above the fold) */}
      {trending.length > 0 && (
        <div style={{ background: 'var(--bg-dark)', padding: '5rem 2rem', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔥 Trending at Stevens</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>The most highly-engaged projects right now. Log in to apply.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {trending.map((project, index) => (
                <div 
                  key={project._id || index}
                  onClick={handleGuestCardClick}
                  className="glass-panel hover-lift" 
                  style={{ 
                    padding: '2rem', 
                    borderRadius: '16px', 
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Trending Badge */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    background: 'rgba(255, 68, 68, 0.1)', 
                    color: '#ff4444', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    🔥 {project.applicantCount || 0} Applied
                  </div>

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', paddingRight: '6rem' }}>{project.title}</h3>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {project.skillsRequired && project.skillsRequired.slice(0, 3).map((skill, i) => (
                      <span key={i} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>{skill}</span>
                    ))}
                  </div>

                  {/* Blurred Description */}
                  <div style={{ position: 'relative' }}>
                    <p style={{ 
                      color: 'var(--text-muted)', 
                      filter: 'blur(4px)',
                      userSelect: 'none',
                      lineHeight: '1.6'
                    }}>
                      This is a highly sought after project that requires dedicated students to help build a cutting-edge platform. We are looking for people who can work fast...
                    </p>
                    
                    {/* Lock Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</span>
                      <span style={{ fontWeight: 'bold', color: 'white' }}>Log in to view</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* VALUE PROPOSITION CARDS (Moved DOWN below the fold) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '0 2rem 5rem', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h3>For Students</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Build your resume. Browse exclusive projects, get AI-matched to teams based on your skills, and gain real-world experience.
          </p>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3>For Mentors</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Post your research, senior design, or startup ideas. Review applications and recruit the best talent at Stevens.
          </p>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
