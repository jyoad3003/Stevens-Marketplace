import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 5%',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          background: 'var(--gradient-brand)',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          S
        </div>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Stevens Marketplace
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        
        {user ? (
          <>
            <Link to="/explore" style={{ color: 'var(--text-muted)' }}>Explore</Link>
            {user.role === 'MENTOR' && (
              <>
                <Link to="/dashboard" style={{ 
                  color: 'var(--text-main)', 
                  fontWeight: '500'
                }}>
                  Dashboard
                </Link>
                <Link to="/projects/new" style={{ 
                  color: 'var(--primary)', 
                  fontWeight: '500',
                  borderBottom: '2px solid var(--primary)',
                  paddingBottom: '2px'
                }}>
                  + Create Project
                </Link>
              </>
            )}
            <Link to="/profile" style={{ color: 'var(--text-main)', fontWeight: '500' }}>
              My Profile
            </Link>
            <button 
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text-muted)' }}>Log in</Link>
            <Link to="/register" style={{
              background: 'var(--gradient-brand)',
              color: 'white',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontWeight: '500'
            }}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
