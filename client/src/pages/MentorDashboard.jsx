import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const MentorDashboard = () => {
  useDocumentTitle('Mentor Dashboard');
  const { user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We need to fetch the incoming applications when the dashboard loads
  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/connections/incoming');
      const data = await response.json();
      
      if (response.ok) {
        setApplications(data);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Network error. Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (connectionId, newStatus) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh the list so the UI updates
        fetchApplications();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (!user || user.role !== 'MENTOR') {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Access Denied: Only Mentors can view this dashboard.</div>;
  }

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '5rem', textAlign: 'center', color: '#ff4444' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 5%' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mentor Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review incoming applications from students to join your projects.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
          <h3>No Pending Applications</h3>
          <p style={{ color: 'var(--text-muted)' }}>You're all caught up! Go create more projects to attract students.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {applications.map(app => (
            <div key={app._id} className="glass-panel" style={{ 
              padding: '2rem', 
              borderRadius: '12px',
              borderLeft: '4px solid var(--primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                  {app.studentName} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({app.studentEmail})</span>
                </h3>
                <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>
                  Applied to: <span style={{ color: 'var(--primary)' }}>{app.projectTitle}</span>
                </p>
                
                {app.message && (
                  <div style={{ 
                    background: 'var(--bg-dark)', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    fontStyle: 'italic',
                    marginBottom: '1rem'
                  }}>
                    "{app.message}"
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Student Skills:</span>
                  <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {app.studentSkills && app.studentSkills.map(skill => (
                      <span key={skill} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginLeft: '2rem' }}>
                <button 
                  onClick={() => handleUpdateStatus(app._id, 'ACCEPTED')}
                  style={{
                    background: '#00cc00',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                  style={{
                    background: 'transparent',
                    color: '#ff4444',
                    border: '1px solid #ff4444',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
