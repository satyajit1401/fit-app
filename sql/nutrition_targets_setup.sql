-- Create nutrition_targets table
CREATE TABLE IF NOT EXISTS public.nutrition_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    target_calories INTEGER NOT NULL CHECK (target_calories > 0),
    target_protein INTEGER NOT NULL CHECK (target_protein > 0),
    target_carbs INTEGER NOT NULL CHECK (target_carbs > 0),
    target_fat INTEGER NOT NULL CHECK (target_fat > 0),
    target_water INTEGER NOT NULL CHECK (target_water > 0),
    weekly_weight_targets NUMERIC[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS nutrition_targets_user_date_idx ON public.nutrition_targets(user_id, start_date);

-- Enable Row Level Security
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own nutrition targets
CREATE POLICY nutrition_targets_policy ON public.nutrition_targets
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_nutrition_targets_updated_at
    BEFORE UPDATE ON public.nutrition_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 