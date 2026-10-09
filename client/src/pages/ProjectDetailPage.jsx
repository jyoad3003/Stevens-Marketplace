import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ProjectDetailPage = () => {
  // useParams extracts the ':id' part of the URL route we set up in App.jsx
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set dynamic title if project is loaded
  useDocumentTitle(project ? project.title : 'Project Details');

  // Application state
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null); // 'PENDING', 'ACCEPTED', 'REJECTED'

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProject(data);
        } else {
          setError(data.error || 'Failed to fetch project');
        }
      } catch (err) {
        setError('Network error. Could not connect to backend.');
      } finally {
        setLoading(false);
      }
    };

    const fetchApplicationStatus = async () => {
      if (user && user.role === 'STUDENT') {
        try {
          const response = await fetch(`/api/connections/status/${id}`);
          const data = await response.json();
          if (data.hasApplied) {
            setApplySuccess(true);
            setApplicationStatus(data.status);
          }
        } catch (err) {
          // Fail silently, they can still try to apply
        }
      }
    };

    fetchProjectDetails();
    fetchApplicationStatus();
  }, [id, user]);

  const handleApply = async () => {
    // Simple prompt for an optional message (we can make a beautiful modal later if desired)
    const message = window.prompt("Why do you want to join this project? (Optional)");
    if (message === null) return; // User clicked Cancel

    setApplyLoading(true);
    setApplyError(null);

    try {
      const response = await fetch('/api/connections/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, message })
      });

      const data = await response.json();

      if (response.ok) {
        setApplySuccess(true);
        setApplicationStatus('PENDING');
      } else {
        setApplyError(data.error || 'Failed to apply');
      }
    } catch (err) {
      setApplyError('Network error. Try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading project details...</div>;
  if (error) return <div style={{ padding: '5rem', textAlign: 'center', color: '#ff4444' }}>{error}</div>;
  if (!project) return <div style={{ padding: '5rem', textAlign: 'center' }}>Project not found.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 5%' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/explore')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          marginBottom: '2rem',
          fontSize: '1rem',
          padding: 0
        }}
      >
        &larr; Back to Explore
      </button>

      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{project.title}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Posted on {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          <span style={{ 
            background: project.status === 'OPEN' ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,0,0.1)', 
            color: project.status === 'OPEN' ? '#00ff00' : '#ffff00',
            padding: '0.5rem 1rem', 
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            {project.status}
          </span>
        </div>

        {/* Description Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>About the Project</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            {project.description}
          </p>
        </div>

        {/* Tags Section */}
        <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Required Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.skillsRequired.map(skill => (
                <span key={skill} style={tagStyle}>{skill}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Categories</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.interests.map(interest => (
                <span key={interest} style={tagStyle}>{interest}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        {project.team && project.team.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Project Team</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {project.team.map(member => (
                <div key={member._id} style={{
                  background: 'var(--bg-dark)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'var(--primary)', 
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{member.firstName} {member.lastName}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentor / Owner Profile Section */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Project Mentor</h3>
            {project.owner ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {project.owner.firstName} {project.owner.lastName} <br/>
                <a href={`mailto:${project.owner.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  {project.owner.email}
                </a>
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Unknown Mentor</p>
            )}
          </div>
          
          {/* Apply Logic */}
          {user && user.role === 'STUDENT' && project.status === 'OPEN' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button 
                onClick={handleApply}
                disabled={applyLoading || applySuccess}
                style={{
                  background: applySuccess 
                    ? (applicationStatus === 'ACCEPTED' ? '#00cc00' : applicationStatus === 'REJECTED' ? '#ff4444' : '#555') 
                    : 'var(--gradient-brand)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: (applyLoading || applySuccess) ? 'default' : 'pointer',
                  opacity: applyLoading ? 0.7 : 1
                }}
                title={applySuccess ? `Application Status: ${applicationStatus}` : ''}
              >
                {applyLoading ? 'Sending...' : 
                 applySuccess ? 
                  (applicationStatus === 'ACCEPTED' ? '✓ Accepted' : 
                   applicationStatus === 'REJECTED' ? '❌ Not Accepted' : 
                   '⏳ Pending Application') 
                 : 'Apply to Join'}
              </button>
              {applyError && <span style={{ color: '#ff4444', fontSize: '0.9rem' }}>{applyError}</span>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const tagStyle = {
  background: 'var(--bg-dark)',
  border: '1px solid var(--border-color)',
  padding: '0.4rem 1rem',
  borderRadius: '20px',
  fontSize: '0.9rem'
};

export default ProjectDetailPage;
