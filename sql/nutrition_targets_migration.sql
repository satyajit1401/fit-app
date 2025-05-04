-- Add start_date column to nutrition_targets table
ALTER TABLE public.nutrition_targets 
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Update existing records to have start_date as the earliest possible date
UPDATE public.nutrition_targets 
SET start_date = '1970-01-01' 
WHERE start_date IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS nutrition_targets_user_date_idx ON public.nutrition_targets(user_id, start_date);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_nutrition_targets_updated_at ON public.nutrition_targets;

-- Create function to update updated_at timestamp if it doesn't exist
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

-- Remove the old unique constraint
ALTER TABLE public.nutrition_targets DROP CONSTRAINT IF EXISTS nutrition_targets_user_id_key;

-- Add the correct unique constraint
ALTER TABLE public.nutrition_targets ADD CONSTRAINT nutrition_targets_user_id_start_date_key UNIQUE (user_id, start_date); 