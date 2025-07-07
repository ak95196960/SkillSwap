import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, usersAPI, matchesAPI, matchRequestsAPI } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  rating: number;
  completedExchanges: number;
  location: string;
  linkedinProfile: string;
  matches?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, linkedinProfile: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  createMatch: (targetUserId: string) => Promise<void>;
  sendMatchRequest: (receiverId: string, skillOffered: string, skillWanted: string, message?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, linkedinProfile: string) => {
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        linkedinProfile
      });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await usersAPI.updateProfile(userData);
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Update user failed:', error);
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  const createMatch = async (targetUserId: string) => {
    try {
      await matchesAPI.createMatch({
        targetUserId,
        notes: 'Interested in connecting for skill exchange'
      });
      
      // Update user's matches locally
      if (user) {
        const updatedMatches = [...(user.matches || [])];
        if (!updatedMatches.includes(targetUserId)) {
          updatedMatches.push(targetUserId);
          setUser({ ...user, matches: updatedMatches });
        }
      }
    } catch (error: any) {
      console.error('Create match failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to create match');
    }
  };

  const sendMatchRequest = async (receiverId: string, skillOffered: string, skillWanted: string, message?: string) => {
    try {
      await matchRequestsAPI.sendRequest({
        receiverId,
        skillOffered,
        skillWanted,
        message
      });
    } catch (error: any) {
      console.error('Send match request failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      updateUser, 
      createMatch, 
      sendMatchRequest 
    }}>
      {children}
    </AuthContext.Provider>
  );
};