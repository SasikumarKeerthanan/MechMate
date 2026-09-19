import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mechmate_admin_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // fallback
      }
    }
    return {
      uid: 'admin-root-001',
      name: 'Alexander Cross',
      email: 'admin@mechmate.com',
      role: 'Super Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('mechmate_admin_token') || 'mechmate-admin-dev-token';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mechmate_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mechmate_admin_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('mechmate_admin_token', token);
    } else {
      localStorage.removeItem('mechmate_admin_token');
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mechmate_admin_user');
    localStorage.removeItem('mechmate_admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
