'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ADMIN_PASSWORD = '7890';

interface AuthContextType {
  isAdmin: boolean;
  isVisitorMode: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  toggleVisitorMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisitorMode, setIsVisitorMode] = useState(false);

  useEffect(() => {
    // Check sessionStorage for existing admin session
    const adminSession = sessionStorage.getItem('isAdmin');
    const visitorModeSession = sessionStorage.getItem('isVisitorMode');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
    if (visitorModeSession === 'true') {
      setIsVisitorMode(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsVisitorMode(false);
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('isVisitorMode');
  };

  const toggleVisitorMode = () => {
    setIsVisitorMode((prev) => {
      const newVal = !prev;
      sessionStorage.setItem('isVisitorMode', newVal.toString());
      return newVal;
    });
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isVisitorMode, login, logout, toggleVisitorMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
