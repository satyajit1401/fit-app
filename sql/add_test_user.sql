-- Add test user for satyajit.kumthekar@gmail.com

-- First check if user already exists
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if the user already exists
  SELECT id INTO v_user_id FROM public.users WHERE email = 'satyajit.kumthekar@gmail.com';
  
  -- If user doesn't exist, create it
  IF v_user_id IS NULL THEN
    -- Insert user with hashed password (password: 'password123')
    INSERT INTO public.users (
      email,
      password,
      password_hash,
      full_name,
      username,
      bio,
      profile_image_url
    ) VALUES (
      'satyajit.kumthekar@gmail.com',
      'password123', -- plaintext password (for the not-null constraint)
      crypt('password123', gen_salt('bf')), -- hashed password
      'Satyajit Kumthekar',
      'satyajit',
      'Fitness enthusiast and software developer',
      'https://randomuser.me/api/portraits/men/1.jpg'
    ) RETURNING id INTO v_user_id;
    
    -- Add some sample data for this user
    
    -- Add workouts
    WITH workout AS (
      INSERT INTO public.workouts (
        user_id,
        name,
        description,
        difficulty,
        created_at
      ) VALUES (
        v_user_id,
        'Full Body Strength',
        'A comprehensive full body workout targeting all major muscle groups',
        'Intermediate',
        NOW() - INTERVAL '7 days'
      ) RETURNING id
    )
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      sets,
      reps,
      weight,
      rest_time
    )
    SELECT 
      (SELECT id FROM workout),
      e.id,
      4,
      12,
      60,
      90
    FROM public.exercises e
    LIMIT 5;
    
    -- Add a second workout
    WITH workout AS (
      INSERT INTO public.workouts (
        user_id,
        name,
        description,
        difficulty,
        created_at
      ) VALUES (
        v_user_id,
        'HIIT Cardio',
        'High intensity interval training to boost metabolism',
        'Advanced',
        NOW() - INTERVAL '3 days'
      ) RETURNING id
    )
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      sets,
      reps,
      weight,
      rest_time
    )
    SELECT 
      (SELECT id FROM workout),
      e.id,
      5,
      20,
      NULL,
      45
    FROM public.exercises e
    WHERE e.category ILIKE '%cardio%' OR e.name ILIKE '%jump%' OR e.name ILIKE '%sprint%'
    LIMIT 6;
    
    -- Add progress data
    INSERT INTO public.progress (
      user_id,
      date,
      weight,
      body_fat_percentage,
      notes
    ) VALUES 
    (v_user_id, NOW() - INTERVAL '30 days', 82.5, 18.2, 'Starting my fitness journey'),
    (v_user_id, NOW() - INTERVAL '23 days', 81.7, 17.8, 'Feeling stronger already'),
    (v_user_id, NOW() - INTERVAL '16 days', 80.9, 17.3, 'Diet is going well'),
    (v_user_id, NOW() - INTERVAL '9 days', 80.1, 16.8, 'Increased my workout intensity'),
    (v_user_id, NOW() - INTERVAL '2 days', 79.4, 16.2, 'Seeing visible progress now');
    
    -- Add nutrition logs
    INSERT INTO public.nutrition_log (
      user_id,
      date,
      meal_type,
      food_item,
      calories,
      protein,
      carbs,
      fats
    ) VALUES 
    (v_user_id, CURRENT_DATE, 'Breakfast', 'Protein Oatmeal with Berries', 350, 24, 45, 10),
    (v_user_id, CURRENT_DATE, 'Lunch', 'Grilled Chicken Salad', 450, 40, 15, 20),
    (v_user_id, CURRENT_DATE, 'Dinner', 'Salmon with Sweet Potato and Broccoli', 550, 35, 50, 15),
    (v_user_id, CURRENT_DATE, 'Snack', 'Protein Shake', 200, 30, 5, 3),
    (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Breakfast', 'Avocado Toast with Eggs', 400, 22, 30, 22),
    (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Lunch', 'Turkey Wrap', 380, 30, 40, 10),
    (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Dinner', 'Stir Fry with Brown Rice', 500, 25, 60, 18);
    
    RAISE NOTICE 'Test user created with ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'User already exists with ID: %', v_user_id;
  END IF;
END $$; 