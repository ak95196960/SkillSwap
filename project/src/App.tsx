import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import BrowseSkills from './components/BrowseSkills';
import CreateListing from './components/CreateListing';
import Profile from './components/Profile';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('landing');
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    if (currentView === 'auth') {
      return <AuthForm onBack={() => setCurrentView('landing')} />;
    }
    return <LandingPage onGetStarted={() => setCurrentView('auth')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'browse':
        return <BrowseSkills />;
      case 'create-listing':
        return <CreateListing />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderView()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;