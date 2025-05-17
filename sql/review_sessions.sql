-- Migration to create review_sessions table for Nutrition Review feature
CREATE TABLE IF NOT EXISTS public.review_sessions (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_review_sessions_user_id ON public.review_sessions(user_id); 