-- API Functions for Fitness Tracking App

-- Function to register a new user
CREATE OR REPLACE FUNCTION register_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_username TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (
    email, 
    password, 
    full_name, 
    username
  )
  VALUES (
    p_email, 
    crypt(p_password, gen_salt('bf')), 
    p_full_name, 
    p_username
  )
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$;

-- Function to authenticate a user
CREATE OR REPLACE FUNCTION authenticate_user(
  p_email TEXT,
  p_password TEXT
) RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  username TEXT,
  is_premium BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.username,
    u.is_premium
  FROM users u
  WHERE 
    u.email = p_email 
    AND u.password = crypt(p_password, u.password);
    
  -- Update last login time
  UPDATE users 
  SET last_login = NOW() 
  WHERE email = p_email 
    AND password = crypt(p_password, password);
END;
$$;

-- Function to get user profile
DROP FUNCTION IF EXISTS get_user_profile(UUID);
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'id', u.id,
    'full_name', u.full_name,
    'username', u.username,
    'email', u.email,
    'profile_image_url', u.profile_image_url,
    'bio', u.bio,
    'height_cm', u.height_cm,
    'weight_kg', u.weight_kg,
    'date_of_birth', u.date_of_birth,
    'gender', u.gender,
    'fitness_level', u.fitness_level,
    'activity_level', u.activity_level,
    'goals', u.goals,
    'is_premium', u.is_premium,
    'created_at', u.created_at,
    'last_login', u.last_login,
    'settings', (
      SELECT jsonb_build_object(
        'notification_preferences', s.notification_preferences,
        'theme', s.theme,
        'measurement_system', s.measurement_system,
        'privacy_settings', s.privacy_settings
      )
      FROM user_settings s
      WHERE s.user_id = u.id
    ),
    'stats', (
      SELECT jsonb_build_object(
        'workouts_completed', total_workouts_completed,
        'calories_burned', total_calories_burned,
        'active_days', active_days,
        'followers', follower_count,
        'following', following_count,
        'achievements', achievements_count
      )
      FROM user_stats
      WHERE user_id = u.id
    )
  )
  FROM users u
  WHERE u.id = p_user_id;
$$;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_height_cm DECIMAL DEFAULT NULL,
  p_weight_kg DECIMAL DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_fitness_level TEXT DEFAULT NULL,
  p_activity_level TEXT DEFAULT NULL,
  p_goals TEXT[] DEFAULT NULL,
  p_profile_image_url TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET
    full_name = COALESCE(p_full_name, full_name),
    username = COALESCE(p_username, username),
    bio = COALESCE(p_bio, bio),
    height_cm = COALESCE(p_height_cm, height_cm),
    weight_kg = COALESCE(p_weight_kg, weight_kg),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    gender = COALESCE(p_gender, gender),
    fitness_level = COALESCE(p_fitness_level, fitness_level),
    activity_level = COALESCE(p_activity_level, activity_level),
    goals = COALESCE(p_goals, goals),
    profile_image_url = COALESCE(p_profile_image_url, profile_image_url),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN get_user_profile(p_user_id);
END;
$$;

-- Function to update user settings
CREATE OR REPLACE FUNCTION update_user_settings(
  p_user_id UUID,
  p_notification_preferences JSONB DEFAULT NULL,
  p_theme TEXT DEFAULT NULL,
  p_measurement_system TEXT DEFAULT NULL,
  p_privacy_settings JSONB DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_notification_prefs JSONB;
  v_existing_privacy_settings JSONB;
  v_result JSONB;
BEGIN
  -- Get existing values
  SELECT notification_preferences, privacy_settings 
  INTO v_existing_notification_prefs, v_existing_privacy_settings
  FROM user_settings
  WHERE user_id = p_user_id;
  
  -- Merge JSON objects rather than replace if partial update
  UPDATE user_settings
  SET
    notification_preferences = CASE 
      WHEN p_notification_preferences IS NOT NULL THEN v_existing_notification_prefs || p_notification_preferences
      ELSE notification_preferences
    END,
    theme = COALESCE(p_theme, theme),
    measurement_system = COALESCE(p_measurement_system, measurement_system),
    privacy_settings = CASE 
      WHEN p_privacy_settings IS NOT NULL THEN v_existing_privacy_settings || p_privacy_settings
      ELSE privacy_settings
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Return updated settings
  SELECT jsonb_build_object(
    'notification_preferences', notification_preferences,
    'theme', theme,
    'measurement_system', measurement_system,
    'privacy_settings', privacy_settings,
    'updated_at', updated_at
  ) INTO v_result
  FROM user_settings
  WHERE user_id = p_user_id;
  
  RETURN v_result;
END;
$$;

-- Function to create a workout
CREATE OR REPLACE FUNCTION create_workout(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'Custom',
  p_difficulty TEXT DEFAULT 'Intermediate',
  p_estimated_duration INTEGER DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT FALSE,
  p_equipment_needed TEXT[] DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL,
  p_exercises JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workout_id UUID;
  i INTEGER;
BEGIN
  -- Create the workout
  INSERT INTO workouts (
    user_id,
    name,
    description,
    type,
    difficulty,
    estimated_duration,
    is_public,
    equipment_needed,
    tags,
    thumbnail_url
  )
  VALUES (
    p_user_id,
    p_name,
    p_description,
    p_type,
    p_difficulty,
    p_estimated_duration,
    p_is_public,
    p_equipment_needed,
    p_tags,
    p_thumbnail_url
  )
  RETURNING id INTO v_workout_id;
  
  -- Add exercises if provided
  IF p_exercises IS NOT NULL AND jsonb_array_length(p_exercises) > 0 THEN
    FOR i IN 0..jsonb_array_length(p_exercises) - 1 LOOP
      INSERT INTO workout_exercises (
        workout_id,
        exercise_id,
        position,
        sets,
        reps,
        duration,
        rest_time,
        weight,
        notes
      )
      VALUES (
        v_workout_id,
        (p_exercises->i->>'exercise_id')::UUID,
        (p_exercises->i->>'position')::INTEGER,
        (p_exercises->i->>'sets')::INTEGER,
        (p_exercises->i->>'reps')::INTEGER,
        (p_exercises->i->>'duration')::INTEGER,
        (p_exercises->i->>'rest_time')::INTEGER,
        (p_exercises->i->>'weight')::DECIMAL,
        (p_exercises->i->>'notes')::TEXT
      );
    END LOOP;
  END IF;
  
  RETURN v_workout_id;
END;
$$;

-- Function to get workout details
DROP FUNCTION IF EXISTS get_workout_details(UUID);
CREATE OR REPLACE FUNCTION get_workout_details(p_workout_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'id', w.id,
    'name', w.name,
    'description', w.description,
    'type', w.type,
    'difficulty', w.difficulty,
    'estimated_duration', w.estimated_duration,
    'calories_burned', w.calories_burned,
    'is_public', w.is_public,
    'equipment_needed', w.equipment_needed,
    'tags', w.tags,
    'thumbnail_url', w.thumbnail_url,
    'created_at', w.created_at,
    'created_by', (
      SELECT jsonb_build_object(
        'id', id, 
        'username', username, 
        'full_name', full_name
      ) 
      FROM users 
      WHERE id = w.user_id
    ),
    'stats', (
      SELECT jsonb_build_object(
        'times_performed', times_performed,
        'avg_rating', avg_rating,
        'avg_duration_minutes', avg_duration_minutes,
        'avg_calories_burned', avg_calories_burned,
        'like_count', like_count
      )
      FROM workout_stats
      WHERE workout_id = w.id
    ),
    'exercises', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', we.id,
          'exercise_id', e.id,
          'name', e.name,
          'description', e.description,
          'instructions', e.instructions,
          'muscle_group', e.muscle_group,
          'difficulty', e.difficulty,
          'image_url', e.image_url,
          'video_url', e.video_url,
          'sets', we.sets,
          'reps', we.reps,
          'duration', we.duration,
          'rest_time', we.rest_time,
          'position', we.position,
          'weight', we.weight,
          'notes', we.notes
        )
      )
      FROM (
        SELECT * FROM workout_exercises 
        WHERE workout_id = w.id
        ORDER BY position
      ) we
      JOIN exercises e ON we.exercise_id = e.id
    )
  )
  FROM workouts w
  WHERE w.id = p_workout_id;
$$;

-- Function to record progress
CREATE OR REPLACE FUNCTION record_progress(
  p_user_id UUID,
  p_weight DECIMAL DEFAULT NULL,
  p_body_fat_percentage DECIMAL DEFAULT NULL,
  p_muscle_mass DECIMAL DEFAULT NULL,
  p_resting_heart_rate INTEGER DEFAULT NULL,
  p_blood_pressure TEXT DEFAULT NULL,
  p_mood TEXT DEFAULT NULL,
  p_energy_level INTEGER DEFAULT NULL,
  p_sleep_hours DECIMAL DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_measurements JSONB DEFAULT NULL,
  p_photos TEXT[] DEFAULT NULL,
  p_recorded_date DATE DEFAULT CURRENT_DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress_id UUID;
BEGIN
  INSERT INTO progress (
    user_id,
    weight,
    body_fat_percentage,
    muscle_mass,
    resting_heart_rate,
    blood_pressure,
    mood,
    energy_level,
    sleep_hours,
    notes,
    measurements,
    photos,
    recorded_date
  )
  VALUES (
    p_user_id,
    p_weight,
    p_body_fat_percentage,
    p_muscle_mass,
    p_resting_heart_rate,
    p_blood_pressure,
    p_mood,
    p_energy_level,
    p_sleep_hours,
    p_notes,
    p_measurements,
    p_photos,
    p_recorded_date
  )
  RETURNING id INTO v_progress_id;
  
  RETURN v_progress_id;
END;
$$;

-- Function to get user progress history
CREATE OR REPLACE FUNCTION get_progress_history(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
  v_end DATE := COALESCE(p_end_date, CURRENT_DATE);
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'data', jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'date', p.recorded_date,
        'weight', p.weight,
        'body_fat_percentage', p.body_fat_percentage,
        'muscle_mass', p.muscle_mass,
        'resting_heart_rate', p.resting_heart_rate,
        'blood_pressure', p.blood_pressure,
        'mood', p.mood,
        'energy_level', p.energy_level,
        'sleep_hours', p.sleep_hours,
        'notes', p.notes,
        'measurements', p.measurements,
        'photos', p.photos
      )
      ORDER BY p.recorded_date DESC
    ),
    'summary', jsonb_build_object(
      'weight_change', (
        SELECT MAX(weight) - MIN(weight)
        FROM progress
        WHERE user_id = p_user_id
        AND recorded_date BETWEEN v_start AND v_end
      ),
      'body_fat_change', (
        SELECT MAX(body_fat_percentage) - MIN(body_fat_percentage)
        FROM progress
        WHERE user_id = p_user_id
        AND recorded_date BETWEEN v_start AND v_end
      ),
      'entries_count', (
        SELECT COUNT(*)
        FROM progress
        WHERE user_id = p_user_id
        AND recorded_date BETWEEN v_start AND v_end
      )
    )
  ) INTO v_result
  FROM progress p
  WHERE p.user_id = p_user_id
  AND p.recorded_date BETWEEN v_start AND v_end
  ORDER BY p.recorded_date DESC
  LIMIT p_limit;
  
  RETURN v_result;
END;
$$;

-- Function to search workouts
CREATE OR REPLACE FUNCTION search_workouts(
  p_search_term TEXT DEFAULT NULL,
  p_type TEXT[] DEFAULT NULL,
  p_difficulty TEXT[] DEFAULT NULL,
  p_min_duration INTEGER DEFAULT NULL,
  p_max_duration INTEGER DEFAULT NULL,
  p_equipment TEXT[] DEFAULT NULL,
  p_muscle_group TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Full workouts search with filters
  WITH filtered_workouts AS (
    SELECT 
      w.id,
      w.name,
      w.description,
      w.type,
      w.difficulty,
      w.estimated_duration,
      w.equipment_needed,
      w.tags,
      w.thumbnail_url,
      w.created_at,
      w.user_id,
      u.username,
      u.full_name,
      ws.avg_rating,
      ws.like_count,
      CASE 
        WHEN p_search_term IS NULL THEN 0
        WHEN w.name ILIKE '%' || p_search_term || '%' THEN 3
        WHEN w.description ILIKE '%' || p_search_term || '%' THEN 2
        WHEN EXISTS (SELECT 1 FROM unnest(w.tags) t WHERE t ILIKE '%' || p_search_term || '%') THEN 1
        ELSE 0
      END AS relevance_score
    FROM workouts w
    JOIN users u ON w.user_id = u.id
    LEFT JOIN workout_stats ws ON w.id = ws.workout_id
    WHERE (p_search_term IS NULL OR 
          w.name ILIKE '%' || p_search_term || '%' OR 
          w.description ILIKE '%' || p_search_term || '%' OR
          EXISTS (SELECT 1 FROM unnest(w.tags) t WHERE t ILIKE '%' || p_search_term || '%'))
      AND (p_type IS NULL OR w.type = ANY(p_type))
      AND (p_difficulty IS NULL OR w.difficulty = ANY(p_difficulty))
      AND (p_min_duration IS NULL OR w.estimated_duration >= p_min_duration)
      AND (p_max_duration IS NULL OR w.estimated_duration <= p_max_duration)
      AND (p_equipment IS NULL OR w.equipment_needed && p_equipment)
      AND (w.is_public = TRUE OR w.user_id = auth.uid())
  )
  SELECT jsonb_build_object(
    'workouts', jsonb_agg(
      jsonb_build_object(
        'id', fw.id,
        'name', fw.name,
        'description', fw.description,
        'type', fw.type,
        'difficulty', fw.difficulty,
        'duration', fw.estimated_duration,
        'equipment', fw.equipment_needed,
        'tags', fw.tags,
        'thumbnail_url', fw.thumbnail_url,
        'created_at', fw.created_at,
        'creator', jsonb_build_object(
          'id', fw.user_id,
          'username', fw.username,
          'full_name', fw.full_name
        ),
        'rating', fw.avg_rating,
        'likes', fw.like_count
      )
    ),
    'count', (SELECT COUNT(*) FROM filtered_workouts),
    'filters', jsonb_build_object(
      'search_term', p_search_term,
      'type', p_type,
      'difficulty', p_difficulty,
      'duration', jsonb_build_object(
        'min', p_min_duration,
        'max', p_max_duration
      ),
      'equipment', p_equipment,
      'muscle_group', p_muscle_group
    )
  ) INTO v_result
  FROM filtered_workouts fw
  ORDER BY 
    fw.relevance_score DESC,
    fw.avg_rating DESC NULLS LAST,
    fw.like_count DESC,
    fw.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
  
  RETURN v_result;
END;
$$;

-- Function to record completed workout
DROP FUNCTION IF EXISTS track_completed_workout(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INTEGER, INTEGER, INTEGER, JSONB);
CREATE OR REPLACE FUNCTION record_completed_workout(
  p_user_id UUID,
  p_workout_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_calories_burned INTEGER DEFAULT NULL,
  p_rating INTEGER DEFAULT NULL,
  p_difficulty_rating INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_exercise_data JSONB DEFAULT NULL -- Array of completed exercises
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  i INTEGER;
  v_exercise_id UUID;
  v_workout_exercise_id UUID;
BEGIN
  -- Insert workout session
  INSERT INTO workout_sessions (
    user_id,
    workout_id,
    start_time,
    end_time,
    calories_burned,
    rating,
    difficulty_rating,
    notes,
    completed
  )
  VALUES (
    p_user_id,
    p_workout_id,
    p_start_time,
    p_end_time,
    p_calories_burned,
    p_rating,
    p_difficulty_rating,
    p_notes,
    TRUE
  )
  RETURNING id INTO v_session_id;
  
  -- Record individual exercises if provided
  IF p_exercise_data IS NOT NULL AND jsonb_array_length(p_exercise_data) > 0 THEN
    FOR i IN 0..jsonb_array_length(p_exercise_data) - 1 LOOP
      -- Get the workout_exercise_id
      v_workout_exercise_id := (p_exercise_data->i->>'workout_exercise_id')::UUID;
      
      -- If no workout_exercise_id provided but exercise_id is, find or create the workout_exercise record
      IF v_workout_exercise_id IS NULL AND (p_exercise_data->i->>'exercise_id') IS NOT NULL THEN
        v_exercise_id := (p_exercise_data->i->>'exercise_id')::UUID;
        
        -- Check if this exercise is already linked to the workout
        SELECT id INTO v_workout_exercise_id
        FROM workout_exercises
        WHERE workout_id = p_workout_id AND exercise_id = v_exercise_id
        LIMIT 1;
        
        -- If not found, create a new workout_exercise record
        IF v_workout_exercise_id IS NULL THEN
          INSERT INTO workout_exercises (
            workout_id,
            exercise_id,
            position,
            sets,
            reps
          )
          VALUES (
            p_workout_id,
            v_exercise_id,
            (SELECT COALESCE(MAX(position), 0) + 1 FROM workout_exercises WHERE workout_id = p_workout_id),
            1,
            0
          )
          RETURNING id INTO v_workout_exercise_id;
        END IF;
      END IF;
      
      -- Now record the completed exercise
      IF v_workout_exercise_id IS NOT NULL THEN
        INSERT INTO workout_session_exercises (
          session_id,
          workout_exercise_id,
          sets_completed,
          reps_completed,
          weights_used,
          duration_seconds,
          notes
        )
        VALUES (
          v_session_id,
          v_workout_exercise_id,
          COALESCE((p_exercise_data->i->>'sets_completed')::INTEGER, 1),
          COALESCE((p_exercise_data->i->>'reps_completed')::INTEGER[], ARRAY[0]),
          COALESCE((p_exercise_data->i->>'weights_used')::DECIMAL(6,2)[], ARRAY[0]),
          (p_exercise_data->i->>'duration_seconds')::INTEGER,
          (p_exercise_data->i->>'notes')
        );
      END IF;
    END LOOP;
  END IF;
  
  -- Return the session details
  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'workout_id', p_workout_id,
    'start_time', p_start_time,
    'end_time', p_end_time,
    'duration_minutes', EXTRACT(EPOCH FROM (p_end_time - p_start_time))/60,
    'calories_burned', p_calories_burned,
    'completed', TRUE
  );
END;
$$;

-- Function to get workout suggestions
DROP FUNCTION IF EXISTS get_workout_suggestions(UUID, INTEGER);
CREATE OR REPLACE FUNCTION get_workout_suggestions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_fitness_level TEXT;
  v_goals TEXT[];
  v_goal TEXT;
BEGIN
  -- Get user's fitness level and goals
  SELECT fitness_level, goals INTO v_fitness_level, v_goals
  FROM users
  WHERE id = p_user_id;
  
  SELECT jsonb_build_object(
    'based_on_level', (
      -- Workouts based on fitness level
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'name', w.name,
          'type', w.type,
          'difficulty', w.difficulty,
          'duration', w.estimated_duration,
          'thumbnail_url', w.thumbnail_url
        )
      )
      FROM workouts w
      WHERE w.is_public = TRUE
        AND w.difficulty = v_fitness_level
        AND w.id NOT IN (
          SELECT workout_id 
          FROM workout_sessions 
          WHERE user_id = p_user_id
        )
      ORDER BY w.likes_count DESC
      LIMIT p_limit
    ),
    'popular', (
      -- Popular workouts
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'name', w.name,
          'type', w.type,
          'difficulty', w.difficulty,
          'duration', w.estimated_duration,
          'thumbnail_url', w.thumbnail_url,
          'likes', w.likes_count
        )
      )
      FROM workouts w
      WHERE w.is_public = TRUE
      ORDER BY w.likes_count DESC
      LIMIT p_limit
    ),
    'recently_active', (
      -- Workouts recently completed by followers
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'name', w.name,
          'type', w.type,
          'difficulty', w.difficulty,
          'duration', w.estimated_duration,
          'thumbnail_url', w.thumbnail_url,
          'completed_by', u.username
        )
      )
      FROM workout_sessions ws
      JOIN workouts w ON ws.workout_id = w.id
      JOIN users u ON ws.user_id = u.id
      WHERE ws.completed = TRUE
        AND ws.user_id IN (
          SELECT following_id 
          FROM follows 
          WHERE follower_id = p_user_id
        )
        AND w.is_public = TRUE
      ORDER BY ws.end_time DESC
      LIMIT p_limit
    ),
    'based_on_goals', (
      -- Workouts matching user's goals
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'name', w.name,
          'type', w.type,
          'difficulty', w.difficulty,
          'duration', w.estimated_duration,
          'thumbnail_url', w.thumbnail_url
        )
      )
      FROM workouts w
      WHERE w.is_public = TRUE
        AND EXISTS (
          SELECT 1 
          FROM unnest(w.tags) t 
          WHERE t = ANY(v_goals) 
             OR EXISTS (
                SELECT 1 
                FROM unnest(v_goals) g 
                WHERE t ILIKE '%' || g || '%'
             )
        )
      ORDER BY w.likes_count DESC
      LIMIT p_limit
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Function to get user workout history
CREATE OR REPLACE FUNCTION get_workout_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'history', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'session_id', ws.id,
          'workout', jsonb_build_object(
            'id', w.id,
            'name', w.name,
            'type', w.type,
            'difficulty', w.difficulty
          ),
          'date', ws.start_time,
          'duration_minutes', EXTRACT(EPOCH FROM (ws.end_time - ws.start_time))/60,
          'calories_burned', ws.calories_burned,
          'rating', ws.rating,
          'completed', ws.completed
        )
        ORDER BY ws.start_time DESC
      )
      FROM workout_sessions ws
      JOIN workouts w ON ws.workout_id = w.id
      WHERE ws.user_id = p_user_id
      ORDER BY ws.start_time DESC
      LIMIT p_limit
      OFFSET p_offset
    ),
    'stats', (
      SELECT jsonb_build_object(
        'total_workouts', COUNT(*),
        'total_completed', COUNT(*) FILTER (WHERE completed = TRUE),
        'total_duration_minutes', SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60),
        'total_calories_burned', SUM(calories_burned),
        'avg_rating', AVG(rating),
        'most_recent', MAX(start_time)
      )
      FROM workout_sessions
      WHERE user_id = p_user_id
    ),
    'pagination', jsonb_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'total', (
        SELECT COUNT(*) 
        FROM workout_sessions 
        WHERE user_id = p_user_id
      )
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$; 