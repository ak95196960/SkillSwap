import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for when Supabase is not configured
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@skillswap.com',
    name: 'Demo User',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Passionate about learning and sharing knowledge',
    skillsOffered: ['Web Development', 'Guitar', 'Photography'],
    skillsWanted: ['French Language', 'Cooking', 'Public Speaking'],
    rating: 4.8,
    completedExchanges: 12,
    location: 'New York, NY'
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // If Supabase is not configured, just set loading to false
      setLoading(false);
      return;
    }

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          bio: data.bio,
          skillsOffered: data.skills_offered || [],
          skillsWanted: data.skills_wanted || [],
          rating: data.rating || 0,
          completedExchanges: data.completed_exchanges || 0,
          location: data.location || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Mock login when Supabase is not configured
      await new Promise(resolve => setTimeout(resolve, 1000));
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
      } else {
        throw new Error('Invalid credentials');
      }
      return;
    }

    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured()) {
      // Mock signup when Supabase is not configured
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        bio: '',
        skillsOffered: [],
        skillsWanted: [],
        rating: 0,
        completedExchanges: 0,
        location: ''
      };
      setUser(newUser);
      return;
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase!
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email,
            name,
            bio: '',
            skills_offered: [],
            skills_wanted: [],
            rating: 0,
            completed_exchanges: 0,
            location: ''
          }
        ]);

      if (profileError) throw profileError;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase!.auth.signOut();
    }
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase!
        .from('profiles')
        .update({
          name: updatedUser.name,
          bio: updatedUser.bio,
          skills_offered: updatedUser.skillsOffered,
          skills_wanted: updatedUser.skillsWanted,
          location: updatedUser.location
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};