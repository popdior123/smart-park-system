
import React from 'react';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import OperatorDashboard from '@/components/OperatorDashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  if (user?.role === 'admin') {
    return <Dashboard />;
  }
  
  return <OperatorDashboard />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
