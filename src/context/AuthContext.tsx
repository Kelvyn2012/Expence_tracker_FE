import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const { data } = await api.get<User>('/auth/me/');
          setUser(data);
          updateTheme(data.theme_preference);
        } catch (error) {
          console.error("Auth check failed", error);
          // If 401, interceptor might have failed refresh or it's just invalid
          // We don't auto logout hard here to avoid flicker if refresh is pending, 
          // but if it failed, we assume logged out.
          // For now, let's clear if me fails hard.
          // localStorage.removeItem('access_token');
          // localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const updateTheme = (theme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  };

  const login = (data: AuthResponse) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
    updateTheme(data.user.theme_preference);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    updateTheme('light'); // Reset or keep? Resetting to light default.
  };
  
  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
      updateTheme(updatedUser.theme_preference);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      updateUser
    }}>
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
