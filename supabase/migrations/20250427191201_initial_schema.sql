-- Database setup for Fitness Tracking App

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with authentication fields
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  profile_image_url TEXT,
  bio TEXT,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  date_of_birth DATE,
  gender VARCHAR(50),
  fitness_level VARCHAR(50) CHECK (fitness_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  activity_level VARCHAR(50),
  goals TEXT[],
  preferences JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"workout_reminders": true, "progress_updates": true, "social_notifications": true}',
  theme VARCHAR(50) DEFAULT 'light',
  measurement_system VARCHAR(20) DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial')),
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "activity_sharing": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) CHECK (type IN ('Strength', 'Cardio', 'HIIT', 'Flexibility', 'Balance', 'Custom')),
  difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  estimated_duration INTEGER, -- in minutes
  calories_burned INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  equipment_needed TEXT[],
  tags TEXT[],
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise categories
CREATE TABLE exercise_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  muscle_group VARCHAR(100),
  category_id UUID REFERENCES exercise_categories(id),
  difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  equipment_required TEXT[],
  video_url TEXT,
  image_url TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout_exercises junction table
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER,
  duration INTEGER, -- in seconds, for timed exercises
  rest_time INTEGER, -- in seconds
  weight DECIMAL(6,2), -- in kg
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workout_id, position)
);

-- Workout plans table (e.g., "12-Week Strength Program")
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  goal VARCHAR(100),
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout plan details (connects plans to workouts)
CREATE TABLE workout_plan_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, week_number, day_number)
);

-- Progress tracking table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  resting_heart_rate INTEGER,
  blood_pressure VARCHAR(20),
  mood VARCHAR(50),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3,1),
  notes TEXT,
  measurements JSONB,
  photos TEXT[],
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sessions (tracking actual workouts performed)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  calories_burned INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout session exercises (tracking exercises performed in a session)
CREATE TABLE workout_session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER[],
  weights_used DECIMAL(6,2)[],
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition table for tracking meals
CREATE TABLE nutrition_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type VARCHAR(50) CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout')),
  food_items JSONB,
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  meal_date DATE DEFAULT CURRENT_DATE,
  meal_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Social follows
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Comments on workouts
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout likes
CREATE TABLE workout_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_id)
);

-- API keys for integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  key_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, key_name)
);

-- Application settings
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout stats view
CREATE OR REPLACE VIEW workout_stats AS
SELECT 
  w.id AS workout_id,
  w.name AS workout_name,
  w.user_id,
  COUNT(DISTINCT ws.id) AS times_performed,
  AVG(ws.rating) AS avg_rating,
  AVG(EXTRACT(EPOCH FROM (ws.end_time - ws.start_time))/60) AS avg_duration_minutes,
  AVG(ws.calories_burned) AS avg_calories_burned,
  COUNT(DISTINCT wl.user_id) AS like_count
FROM workouts w
LEFT JOIN workout_sessions ws ON w.id = ws.workout_id
LEFT JOIN workout_likes wl ON w.id = wl.workout_id
GROUP BY w.id, w.name, w.user_id;

-- Create user stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id AS user_id,
  u.full_name,
  COUNT(DISTINCT ws.id) AS total_workouts_completed,
  SUM(ws.calories_burned) AS total_calories_burned,
  COUNT(DISTINCT EXTRACT(DAY FROM ws.start_time)) AS active_days,
  COUNT(DISTINCT f.following_id) AS following_count,
  COUNT(DISTINCT f2.follower_id) AS follower_count,
  COUNT(DISTINCT ua.achievement_id) AS achievements_count
FROM users u
LEFT JOIN workout_sessions ws ON u.id = ws.user_id AND ws.completed = true
LEFT JOIN follows f ON u.id = f.follower_id
LEFT JOIN follows f2 ON u.id = f2.following_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.full_name;

-- Function to update workout likes count
CREATE OR REPLACE FUNCTION update_workout_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE workouts SET likes_count = likes_count + 1 WHERE id = NEW.workout_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE workouts SET likes_count = likes_count - 1 WHERE id = OLD.workout_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workout likes
CREATE TRIGGER update_workout_likes_trigger
AFTER INSERT OR DELETE ON workout_likes
FOR EACH ROW EXECUTE PROCEDURE update_workout_likes_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_timestamp_trigger
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE PROCEDURE update_timestamp()', t);
  END LOOP;
END;
$$;

-- Function to create a user setting when user is created
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user settings
CREATE TRIGGER create_user_settings_trigger
AFTER INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE create_user_settings();

-- Function to handle completions and achievements
CREATE OR REPLACE FUNCTION process_workout_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_completed INTEGER;
  achievement_id UUID;
BEGIN
  IF NEW.completed = TRUE AND (OLD.completed = FALSE OR OLD.completed IS NULL) THEN
    -- Count total completed workouts
    SELECT COUNT(*) INTO total_completed 
    FROM workout_sessions 
    WHERE user_id = NEW.user_id AND completed = TRUE;
    
    -- Check for achievements
    IF total_completed = 1 THEN
      -- First workout achievement
      SELECT id INTO achievement_id FROM achievements WHERE name = 'First Workout';
      IF achievement_id IS NOT NULL THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (NEW.user_id, achievement_id)
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
      END IF;
    ELSIF total_completed = 10 THEN
      -- 10 workouts achievement
      SELECT id INTO achievement_id FROM achievements WHERE name = '10 Workouts';
      IF achievement_id IS NOT NULL THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (NEW.user_id, achievement_id)
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
      END IF;
    ELSIF total_completed = 50 THEN
      -- 50 workouts achievement
      SELECT id INTO achievement_id FROM achievements WHERE name = '50 Workouts';
      IF achievement_id IS NOT NULL THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (NEW.user_id, achievement_id)
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
      END IF;
    END IF;
    
    -- Create notification
    INSERT INTO notifications (user_id, type, content, related_entity_id)
    VALUES (NEW.user_id, 'workout_completed', 'You completed a workout!', NEW.workout_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workout completion
CREATE TRIGGER workout_completion_trigger
AFTER UPDATE ON workout_sessions
FOR EACH ROW EXECUTE PROCEDURE process_workout_completion();

-- Row Level Security
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Users can manage their own workouts" ON workouts
  FOR ALL USING (auth.uid() = user_id);

-- Workout_exercises policies
CREATE POLICY "Users can view workout exercises" ON workout_exercises
  FOR SELECT USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid() OR is_public = TRUE
    )
  );
CREATE POLICY "Users can manage their workout exercises" ON workout_exercises
  FOR ALL USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

-- Progress policies
CREATE POLICY "Users can view their own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

-- Public read-only policies for public data
CREATE POLICY "Public access to exercise categories" ON exercise_categories
  FOR SELECT USING (TRUE);
  
CREATE POLICY "Public access to exercises" ON exercises
  FOR SELECT USING (is_custom = FALSE OR created_by = auth.uid());
CREATE POLICY "Users can manage their own custom exercises" ON exercises
  FOR ALL USING (created_by = auth.uid());

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- API functions
-- Create stored procedures/functions for common API operations

-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'id', u.id,
    'full_name', u.full_name,
    'username', u.username,
    'profile_image_url', u.profile_image_url,
    'bio', u.bio,
    'fitness_level', u.fitness_level,
    'goals', u.goals,
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
  WHERE u.id = get_user_profile.user_id
  AND (u.id = auth.uid() OR 
       u.id IN (SELECT id FROM users 
                WHERE id IN (SELECT s.user_id FROM user_settings s 
                            WHERE s.privacy_settings->>'profile_visibility' = 'public')));
$$;

-- Function to get workout details
CREATE OR REPLACE FUNCTION get_workout_details(workout_id UUID)
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
    'created_by', (SELECT jsonb_build_object('id', id, 'username', username, 'full_name', full_name) 
                   FROM users WHERE id = w.user_id),
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
          'exercise_id', e.id,
          'name', e.name,
          'description', e.description,
          'muscle_group', e.muscle_group,
          'difficulty', e.difficulty,
          'sets', we.sets,
          'reps', we.reps,
          'duration', we.duration,
          'rest_time', we.rest_time,
          'position', we.position,
          'image_url', e.image_url
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
  WHERE w.id = get_workout_details.workout_id
  AND (w.user_id = auth.uid() OR w.is_public = TRUE);
$$;

-- Function to track a completed workout
CREATE OR REPLACE FUNCTION track_completed_workout(
  p_workout_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_calories_burned INTEGER,
  p_rating INTEGER,
  p_difficulty_rating INTEGER,
  p_exercises JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Create workout session
  INSERT INTO workout_sessions (
    user_id, 
    workout_id, 
    start_time, 
    end_time, 
    calories_burned, 
    rating, 
    difficulty_rating,
    completed
  )
  VALUES (
    auth.uid(), 
    p_workout_id, 
    p_start_time, 
    p_end_time, 
    p_calories_burned, 
    p_rating, 
    p_difficulty_rating,
    TRUE
  )
  RETURNING id INTO v_session_id;
  
  -- Process each exercise in the workout
  FOR i IN 0..jsonb_array_length(p_exercises) - 1 LOOP
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
      (p_exercises->i->>'workout_exercise_id')::UUID,
      (p_exercises->i->>'sets_completed')::INTEGER,
      (p_exercises->i->>'reps_completed')::INTEGER[],
      (p_exercises->i->>'weights_used')::DECIMAL(6,2)[],
      (p_exercises->i->>'duration_seconds')::INTEGER,
      p_exercises->i->>'notes'
    );
  END LOOP;
  
  RETURN v_session_id;
END;
$$; 