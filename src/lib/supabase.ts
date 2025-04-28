import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string, username?: string) => {
  try {
    // First register the user in our database using the API function
    const { data: userId, error: apiError } = await supabase.rpc(
      'register_user',
      { 
        p_email: email, 
        p_password: password, 
        p_full_name: fullName,
        p_username: username
      }
    );
    
    if (apiError) throw apiError;
    
    // Then sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          user_id: userId
        }
      }
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Use the authenticate_user function from our API
    const { data: userData, error: apiError } = await supabase.rpc(
      'authenticate_user',
      { p_email: email, p_password: password }
    );
    
    if (apiError) {
      // Fallback to Supabase Auth if our custom function fails
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data, error: null, userData: null };
    }
    
    // If our API function worked, also sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { data, error: null, userData };
  } catch (error) {
    return { data: null, error, userData: null };
  }
};

export const signOut = async () => {
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