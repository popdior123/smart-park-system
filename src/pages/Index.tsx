
import React from 'react';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
