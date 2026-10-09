import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

const LoginPage = () => {
  useDocumentTitle('Log In');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Success! The backend just created our express-session cookie.
        // For now, let's just go back to the homepage. 
        // Later we will update the Navbar to say "Welcome, Name"
        window.location.href = '/'; // Hard reload so Navbar picks up the new cookie
      } else {
        // Invalid email or password
        setError(data.error);
      }
    } catch (err) {
      setError('Network error. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)' }}>
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input 
            type="email" 
            name="email" 
            placeholder="Stevens Email (@stevens.edu)" 
            required 
            value={formData.email} 
            onChange={handleChange}
            style={inputStyle}
          />

          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
            value={formData.password} 
            onChange={handleChange}
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={{
            background: 'var(--gradient-brand)',
            color: 'white',
            padding: '0.8rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginTop: '1rem',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: '8px',
  background: 'var(--bg-dark)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '1rem'
};

export default LoginPage;
