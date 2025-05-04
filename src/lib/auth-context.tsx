'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  signIn as supabaseSignIn, 
  signUp as supabaseSignUp, 
  signOut as supabaseSignOut,
  getCurrentUser,
  getUserProfile,
  completeRegistrationAfterConfirmation
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
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username?: string
  ) => Promise<{ success: boolean; error?: any; confirmationSent?: boolean }>;
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

  // Upsert user into users table to ensure foreign key integrity
  const upsertUser = async (userObj: User) => {
    if (!userObj) return;
    try {
      await supabase.from('users').upsert({
        id: userObj.id,
        email: userObj.email,
        full_name: userObj.fullName || null,
        username: userObj.username || null,
      });
    } catch (error) {
      console.error('Error upserting user:', error);
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
          const userObj = {
            id: currentUser.id,
            email: currentUser.email || '',
            fullName: currentUser.user_metadata?.full_name,
            username: currentUser.user_metadata?.username
          };
          setUser(userObj);

          // Try to complete registration if needed
          const { success } = await completeRegistrationAfterConfirmation(currentUser.id, currentUser.email || '');
          if (success) {
            // Registration completed, you may want to show a welcome message
          }

          await upsertUser(userObj);
          
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
          const userObj = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            username: session.user.user_metadata?.username
          };
          setUser(userObj);
          await upsertUser(userObj);
          
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
        return { success: false, error, confirmationSent: false };
      }

      // If data is null or user is null, confirmation email was sent
      if (!data || !data.user) {
        return { success: true, confirmationSent: true };
      }

      if (data.user) {
        router.push('/auth/confirm');
        return { success: true, confirmationSent: false };
      }

      return { success: false, error: new Error('Unknown error during sign up'), confirmationSent: false };
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

  // Log current Auth user id for debugging when user changes
  useEffect(() => {
    if (user) {
      console.log('Current Auth user.id:', user.id);
    } else {
      console.log('No user loaded');
    }
  }, [user]);

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

export async function signUp(email: string, password: string, fullName: string) {
  // 1. Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error || !data || !data.user) return { success: false, error, confirmationSent: false };

  // Do NOT insert into users table here. Only insert after confirmation/login.
  return { success: true, confirmationSent: false };
} 