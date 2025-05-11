import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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
    
    // Check if email confirmation is enabled based on session data
    const confirmationSent = !authData.session;
    
    return { 
      data: authData, 
      error: null, 
      confirmationSent 
    };
  } catch (error) {
    return { data: null, error, confirmationSent: false };
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
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return data?.user || null;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch profile');
    }
    
    const { data, error } = await supabase.rpc(
      'get_user_profile',
      { p_user_id: userId }
    );
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error getting user profile:', error.message || error);
    return { data: null, error };
  }
}; 