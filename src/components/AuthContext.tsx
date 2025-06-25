
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/parking';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('parking_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    if (username === 'admin' && password === 'admin123') {
      const userData: User = {
        id: '1',
        username: 'admin',
        role: 'admin'
      };
      setUser(userData);
      localStorage.setItem('parking_user', JSON.stringify(userData));
      return true;
    }
    if (username === 'operator' && password === 'op123') {
      const userData: User = {
        id: '2',
        username: 'operator',
        role: 'operator'
      };
      setUser(userData);
      localStorage.setItem('parking_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parking_user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
