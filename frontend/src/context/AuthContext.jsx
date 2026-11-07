import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, fetchAdminProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('careertrack_admin_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('careertrack_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await fetchAdminProfile();
          setAdmin(res.admin);
          localStorage.setItem('careertrack_admin_profile', JSON.stringify(res.admin));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginAdmin(email, password);
    setToken(res.token);
    setAdmin(res.admin);
    localStorage.setItem('careertrack_admin_token', res.token);
    localStorage.setItem('careertrack_admin_profile', JSON.stringify(res.admin));
    return res;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('careertrack_admin_token');
    localStorage.removeItem('careertrack_admin_profile');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
