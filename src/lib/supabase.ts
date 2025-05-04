import { createClient } from '@supabase/supabase-js';
import { prewarmCache, resetCacheInitialization } from './cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string, username?: string) => {
  try {
    // First sign up with Supabase Auth to get the user ID
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username
        }
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned from auth signup');

    // Store the password and registration info temporarily for use after confirmation
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_registration', JSON.stringify({
        email,
        password,
        fullName,
        username
      }));
    }
    
    // Return confirmation state
    return { data: authData, error: null, confirmationSent: true };
  } catch (error) {
    return { data: null, error };
  }
};

// Call this after user confirms email and logs in for the first time
export const completeRegistrationAfterConfirmation = async (userId: string, email: string) => {
  if (typeof window === 'undefined') return { success: false, error: 'Not in browser' };
  const pending = localStorage.getItem('pending_registration');
  if (!pending) return { success: false, error: 'No pending registration found' };
  const { password, fullName, username } = JSON.parse(pending);
  try {
    const { error: apiError } = await supabase.rpc(
      'register_user',
      {
        p_id: userId,
        p_email: email,
        p_full_name: fullName,
        p_password: password,
        p_username: username
      }
    );
    if (apiError) throw apiError;
    // Clean up
    localStorage.removeItem('pending_registration');
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { data: null, error, userData: null };
    }

    // Prewarm cache with initial data if login is successful
    if (data.user) {
      prewarmCache(data.user.id);
    }

    return { data, error: null, userData: null };
  } catch (error) {
    return { data: null, error, userData: null };
  }
};

export const signOut = async () => {
  // Reset cache initialization flag before signing out
  resetCacheInitialization();
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'get_user_profile',
      { p_user_id: userId }
    );
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}; 