import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ExplorePage = () => {
  useDocumentTitle('Explore Projects');
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all projects when the page loads
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (response.ok) {
          setProjects(data);
        } else {
          setError('Failed to fetch projects');
        }
      } catch (err) {
        setError('Network error. Could not connect to backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // --- MOCK AI LOGIC ---
  // Calculates how many skills a student has that match the project's required skills
  const calculateMatchScore = (project) => {
    if (!user || user.role !== 'STUDENT' || !user.skills || user.skills.length === 0) return 0;
    if (!project.skillsRequired || project.skillsRequired.length === 0) return 0;

    let matchCount = 0;
    
    // Convert to lowercase for basic smart matching
    const userSkillsLower = user.skills.map(s => s.toLowerCase());

    project.skillsRequired.forEach(skill => {
      if (userSkillsLower.includes(skill.toLowerCase())) {
        matchCount++;
      }
    });

    const percentage = Math.round((matchCount / project.skillsRequired.length) * 100);
    return percentage;
  };

  // Filter projects based on the search term (checks title and skills)
  let filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase();
    const matchesTitle = project.title.toLowerCase().includes(term);
    const matchesSkill = project.skillsRequired.some(skill => skill.toLowerCase().includes(term));
    return matchesTitle || matchesSkill;
  });

  // Calculate AI Match Score for each project
  filteredProjects = filteredProjects.map(project => ({
    ...project,
    matchScore: calculateMatchScore(project)
  }));

  // Sort projects: Highest match score first
  filteredProjects.sort((a, b) => b.matchScore - a.matchScore);

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading projects...</div>;
  if (error) return <div style={{ padding: '5rem', textAlign: 'center', color: '#ff4444' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 5%' }}>
      
      {/* HEADER & SEARCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Explore Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Find your next big idea and collaborate.</p>
        </div>
        
        <input 
          type="text" 
          placeholder="Search by title or skill..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '20px',
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            outline: 'none',
            minWidth: '300px'
          }}
        />
      </div>

      {/* MOCK AI BANNER */}
      {user && user.role === 'STUDENT' && (
        <div style={{
          background: 'rgba(0, 255, 128, 0.1)',
          border: '1px solid #00ff80',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          color: '#00ff80',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <div>
            <h4 style={{ margin: 0, fontWeight: 'bold' }}>AI Match Mode Active</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Projects are currently sorted by how well they match your profile skills.</p>
          </div>
        </div>
      )}

      {/* PROJECT GRID */}
      {filteredProjects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
          <h3>No projects found.</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search term.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredProjects.map(project => (
            <div key={project._id} className="glass-panel" style={{ 
              padding: '2rem', 
              borderRadius: '16px', 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease',
              cursor: 'default',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.4rem' }}>{project.title}</h2>
                  <span style={{ 
                    background: project.status === 'OPEN' ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,0,0.1)', 
                    color: project.status === 'OPEN' ? '#00ff00' : '#ffff00',
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {project.status}
                  </span>
                </div>
                
                <p style={{ 
                  color: 'var(--text-muted)', 
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.description}
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Required Skills:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {project.skillsRequired.map(skill => (
                      <span key={skill} style={{
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--border-color)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {/* MOCK AI MATCH INDICATOR */}
                {user && user.role === 'STUDENT' && project.matchScore > 0 && (
                  <div style={{ 
                    color: project.matchScore >= 80 ? '#00ff80' : project.matchScore >= 50 ? '#ffb347' : 'var(--text-muted)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    ✨ {project.matchScore}% Match
                  </div>
                )}

                {/* View Details Button */}
                <Link to={`/projects/${project._id}`} style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
