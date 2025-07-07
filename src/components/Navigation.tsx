import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageCircle, User, LogOut, Home, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { matchRequestsAPI } from '../lib/api';
import RequestsPanel from './RequestsPanel';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequestCount();
      // Poll for new requests every 30 seconds
      const interval = setInterval(fetchRequestCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRequestCount = async () => {
    try {
      const response = await matchRequestsAPI.getRequestCount();
      setRequestCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch request count:', error);
    }
  };

  const handleRequestCountChange = (newCount: number) => {
    setRequestCount(newCount);
  };

  if (!user) return null;

  return (
    <>
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-400">SkillSwap</h1>
              </div>
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <button
                    onClick={() => onViewChange('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'dashboard'
                        ? 'bg-blue-900 text-blue-300'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Home className="inline-block w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => onViewChange('browse')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'browse'
                        ? 'bg-blue-900 text-blue-300'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Search className="inline-block w-4 h-4 mr-2" />
                    Browse Skills
                  </button>
                  <button
                    onClick={() => onViewChange('create-listing')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'create-listing'
                        ? 'bg-blue-900 text-blue-300'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Plus className="inline-block w-4 h-4 mr-2" />
                    Create Listing
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowRequestsPanel(true)}
                  className="relative text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {requestCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                      {requestCount > 9 ? '9+' : requestCount}
                    </span>
                  )}
                </button>
                <button className="text-gray-400 hover:text-gray-200 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => onViewChange('profile')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Requests Panel */}
      <RequestsPanel
        isVisible={showRequestsPanel}
        onClose={() => setShowRequestsPanel(false)}
        onRequestCountChange={handleRequestCountChange}
      />
    </>
  );
};

export default Navigation;