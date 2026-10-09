import { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a Provider component that wraps our app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // CS 546 BRIDGE:
  // When the app first loads, we ask the Kitchen (Express) "Am I logged in?"
  // Express checks req.session.user (just like Lab 10) and returns the user object.
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/'; // Redirect to home
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook to easily use auth anywhere in our app
export const useAuth = () => useContext(AuthContext);
