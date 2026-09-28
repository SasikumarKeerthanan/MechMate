import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('mechmate_admin');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.adminLogin(credentials);
    localStorage.setItem('mechmate_admin_token', data.token);
    localStorage.setItem('mechmate_admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mechmate_admin_token');
    localStorage.removeItem('mechmate_admin');
    setAdmin(null);
  }, []);

  const isAuthenticated = Boolean(
    admin && localStorage.getItem('mechmate_admin_token'),
  );

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
