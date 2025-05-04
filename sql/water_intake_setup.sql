-- Create water_intake table
CREATE TABLE IF NOT EXISTS public.water_intake (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS water_intake_user_date_idx ON public.water_intake(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own water intake
CREATE POLICY water_intake_policy ON public.water_intake
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
CREATE TRIGGER update_water_intake_updated_at
    BEFORE UPDATE ON public.water_intake
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 