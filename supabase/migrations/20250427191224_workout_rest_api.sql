-- Create function to get workout exercises with their details
CREATE OR REPLACE FUNCTION get_workout_exercises(workout_id UUID)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'id', we.id,
      'workout_id', we.workout_id,
      'exercise_id', we.exercise_id,
      'sets', we.sets,
      'reps', we.reps,
      'weight', we.weight,
      'rest_time', we.rest_time,
      'position', we.position,
      'notes', we.notes,
      'exercise', jsonb_build_object(
        'id', e.id,
        'name', e.name,
        'description', e.description,
        'instructions', e.instructions,
        'muscle_group', e.muscle_group,
        'category', e.category_id,
        'difficulty', e.difficulty,
        'equipment_required', e.equipment_required,
        'video_url', e.video_url,
        'image_url', e.image_url
      )
    )
  FROM 
    workout_exercises we
  JOIN 
    exercises e ON we.exercise_id = e.id
  WHERE 
    we.workout_id = get_workout_exercises.workout_id
  ORDER BY 
    we.position, we.id;
END;
$$; 