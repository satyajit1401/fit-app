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
import { getWorkouts } from './api';

type User = {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
};

type AuthContextType = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username?: string
  ) => Promise<{ success: boolean; error?: any; confirmationSent?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
      const { data, error } = await getUserProfile(user.id);
      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      
      // Get the current authenticated user
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        return;
      }
      
      const userObj = {
        id: currentUser.id,
        email: currentUser.email || '',
        fullName: currentUser.user_metadata?.full_name,
        username: currentUser.user_metadata?.username
      };
      setUser(userObj);
      
      // Fetch user profile data
      const { data } = await getUserProfile(currentUser.id);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      // If there's an error refreshing the session, clear the user state
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for user on mount
  useEffect(() => {
    refreshSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          const userObj = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            username: session.user.user_metadata?.username
          };
          setUser(userObj);
          
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
      const { data, error } = await supabaseSignIn(email, password);
      
      if (error) {
        return { success: false, error };
      }
      
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name,
          username: data.user.user_metadata?.username
        });
        
        // Fetch user profile after sign in
        await refreshProfile();
        
        // Use replace to prevent back navigation to login page
        router.push('/workouts', { scroll: false });
        
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
      const { data, error, confirmationSent } = await supabaseSignUp(email, password, fullName, username);

      if (error) {
        return { success: false, error, confirmationSent: false };
      }

      // If confirmation email was sent
      if (confirmationSent) {
        router.push('/auth/confirm');
        return { success: true, confirmationSent: true };
      }

      // If data is null or user is null, still handle as success (might be email confirmation)
      if (!data || !data.user) {
        router.push('/auth/confirm');
        return { success: true, confirmationSent: true };
      }

      return { success: true, confirmationSent: false };
    } catch (error) {
      return { success: false, error, confirmationSent: false };
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
        refreshProfile,
        refreshSession
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