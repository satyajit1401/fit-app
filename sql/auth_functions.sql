-- Create extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/update their own data
CREATE POLICY users_policy ON public.users
  USING (id = auth.uid() OR id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to register a user
CREATE OR REPLACE FUNCTION public.register_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_username TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;
  
  -- Check if username already exists if provided
  IF p_username IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  
  -- Insert new user
  INSERT INTO public.users (email, password_hash, full_name, username)
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_full_name,
    p_username
  )
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate a user
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_email TEXT,
  p_password TEXT
) RETURNS JSONB AS $$
DECLARE
  v_user public.users;
  v_result JSONB;
BEGIN
  -- Find user by email
  SELECT * INTO v_user FROM public.users
  WHERE email = p_email;
  
  -- Check if user exists
  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;
  
  -- Verify password
  IF v_user.password_hash = crypt(p_password, v_user.password_hash) THEN
    -- Return user data
    v_result = jsonb_build_object(
      'id', v_user.id,
      'email', v_user.email,
      'full_name', v_user.full_name,
      'username', v_user.username
    );
    
    RETURN v_result;
  ELSE
    RAISE EXCEPTION 'Invalid email or password';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user public.users;
  v_result JSONB;
BEGIN
  -- Find user by ID
  SELECT * INTO v_user FROM public.users
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Return user profile data
  v_result = jsonb_build_object(
    'id', v_user.id,
    'email', v_user.email,
    'full_name', v_user.full_name,
    'username', v_user.username,
    'bio', v_user.bio,
    'profile_image_url', v_user.profile_image_url,
    'created_at', v_user.created_at
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 