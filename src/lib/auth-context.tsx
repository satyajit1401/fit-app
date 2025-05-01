'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  signIn as supabaseSignIn, 
  signUp as supabaseSignUp, 
  signOut as supabaseSignOut,
  getCurrentUser,
  getUserProfile 
} from './supabase';
import { useRouter } from 'next/navigation';
import { getWorkouts, getExercises, getWorkoutExercises } from './api';

type User = {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  profile?: any;
};

type AuthContextType = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signUp: (email: string, password: string, fullName: string, username?: string) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await getUserProfile(user.id);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Helper to cache all data after login
  const cacheAllData = async (userId: string) => {
    // 1. Fetch and cache workouts first
    const workouts = await getWorkouts();
    // 2. Fetch and cache exercises in the background
    getExercises();
    // 3. Fetch and cache sets for each workout in the background
    workouts.forEach(w => {
      if (w.id) getWorkoutExercises(w.id);
    });
  };

  // Check for user on mount
  useEffect(() => {
    async function getInitialUser() {
      try {
        setLoading(true);
        
        // Get the current authenticated user
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            fullName: currentUser.user_metadata?.full_name,
            username: currentUser.user_metadata?.username
          });
          
          // Fetch user profile data
          const { data } = await getUserProfile(currentUser.id);
          if (data) {
            setProfile(data);
          }
          
          // Cache all data after login
          cacheAllData(currentUser.id);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    }

    getInitialUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            username: session.user.user_metadata?.username
          });
          
          // Fetch user profile data
          const { data } = await getUserProfile(session.user.id);
          if (data) {
            setProfile(data);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error, userData } = await supabaseSignIn(email, password);
      
      if (error) {
        return { success: false, error };
      }
      
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || (userData?.full_name),
          username: data.user.user_metadata?.username || (userData?.username)
        });
        
        // Fetch user profile after sign in
        await refreshProfile();
        
        // Cache all data after login
        cacheAllData(data.user.id);
        
        router.push('/workouts');
        return { success: true };
      }
      
      return { success: false, error: new Error('Unknown error during sign in') };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string, username?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseSignUp(email, password, fullName, username);
      
      if (error) {
        return { success: false, error };
      }
      
      if (data?.user) {
        router.push('/auth/confirm');
        return { success: true };
      }
      
      return { success: false, error: new Error('Unknown error during sign up') };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOutUser = async () => {
    try {
      setLoading(true);
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut: signOutUser,
        refreshProfile
      }}
    >
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