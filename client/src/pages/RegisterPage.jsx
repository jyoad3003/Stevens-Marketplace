import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

const RegisterPage = () => {
  useDocumentTitle('Sign Up');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Updates the state when the user types in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CS 546 BRIDGE:
  // Instead of a traditional <form action="/register" method="POST">
  // React intercepts the submit event, stops the page from reloading, 
  // and sends an AJAX request (fetch) to the Express Kitchen.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect the user to the login page
        navigate('/login');
      } else {
        // The backend threw an error (e.g., Email already exists)
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
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create an Account</h2>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              name="firstName" 
              placeholder="First Name" 
              required 
              value={formData.firstName} 
              onChange={handleChange}
              style={inputStyle}
            />
            <input 
              type="text" 
              name="lastName" 
              placeholder="Last Name" 
              required 
              value={formData.lastName} 
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

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
            placeholder="Password (min 6 chars)" 
            required 
            value={formData.password} 
            onChange={handleChange}
            style={inputStyle}
          />

          <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
            <option value="STUDENT">I am a Student</option>
            <option value="MENTOR">I am a Mentor</option>
          </select>

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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link>
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

export default RegisterPage;
