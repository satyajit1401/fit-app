-- SQL to add sets_data column to workout_exercises table
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS sets_data JSONB;
COMMENT ON COLUMN workout_exercises.sets_data IS 'Detailed information about each set, including reps and weight';
