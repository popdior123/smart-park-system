
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/parking';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  getAllOperators: () => User[];
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
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize with default admin and load stored data
    const defaultAdmin: User = {
      id: '1',
      username: 'admin',
      email: 'admin@smartpark.com',
      fullName: 'System Administrator',
      phoneNumber: '+250788000000',
      role: 'admin',
      createdAt: new Date()
    };

    const storedUsers = localStorage.getItem('parking_users');
    const storedPasswords = localStorage.getItem('parking_passwords');
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers([defaultAdmin]);
      localStorage.setItem('parking_users', JSON.stringify([defaultAdmin]));
      localStorage.setItem('parking_passwords', JSON.stringify({ '1': 'admin123' }));
    }

    // Check for stored session
    const storedUser = localStorage.getItem('parking_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const storedPasswords = JSON.parse(localStorage.getItem('parking_passwords') || '{}');
    const foundUser = users.find(u => u.username === username);
    
    if (foundUser && storedPasswords[foundUser.id] === password) {
      setUser(foundUser);
      localStorage.setItem('parking_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      role: 'operator',
      createdAt: new Date()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    const storedPasswords = JSON.parse(localStorage.getItem('parking_passwords') || '{}');
    storedPasswords[newUser.id] = userData.password;
    
    localStorage.setItem('parking_users', JSON.stringify(updatedUsers));
    localStorage.setItem('parking_passwords', JSON.stringify(storedPasswords));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parking_user');
  };

  const getAllOperators = () => {
    return users.filter(u => u.role === 'operator');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    getAllOperators
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
