-- Sample data for fitness tracking app

-- Insert exercise categories
INSERT INTO exercise_categories (id, name, description) VALUES
  ('5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Strength', 'Exercises focused on building muscle strength'),
  ('2e94f999-798f-4a5a-9a90-e4911c160edc', 'Cardio', 'Exercises focused on cardiovascular endurance'),
  ('84c0f00a-a0a0-4c33-9a8b-7b73815c8113', 'Flexibility', 'Exercises focused on improving range of motion'),
  ('9f30e5e2-1f3c-4aa6-8f38-5a3c6b2c9a7e', 'Balance', 'Exercises focused on improving stability'),
  ('1c3ea752-41a1-4c2b-99d1-8e3a6e736141', 'HIIT', 'High-Intensity Interval Training exercises');

-- Insert sample exercises
INSERT INTO exercises (id, name, description, instructions, muscle_group, category_id, difficulty, equipment_required, video_url, image_url) VALUES
  ('c5e66552-6f09-4e94-a3cb-242fb7f86fe5', 'Push-ups', 'Classic bodyweight exercise for chest, shoulders, and triceps', 'Start in a plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.', 'Chest', '5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Intermediate', ARRAY['None'], 'https://example.com/videos/pushups.mp4', 'https://example.com/images/pushups.jpg'),
  ('7f98e7db-3fbd-4109-9db1-9dd1b8a109a9', 'Squats', 'Compound lower body exercise', 'Stand with feet shoulder-width apart, lower your body by bending knees and pushing hips back, then return to standing.', 'Legs', '5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Beginner', ARRAY['None'], 'https://example.com/videos/squats.mp4', 'https://example.com/images/squats.jpg'),
  ('f6a84787-cb96-447d-b8dc-c11c5cdb0d37', 'Pull-ups', 'Upper body pulling exercise', 'Hang from a bar with palms facing away, pull your body up until your chin is above the bar, then lower back down.', 'Back', '5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Advanced', ARRAY['Pull-up bar'], 'https://example.com/videos/pullups.mp4', 'https://example.com/images/pullups.jpg'),
  ('bde1f8d9-5d27-4dba-97a3-36edda50319a', 'Running', 'Cardiovascular exercise', 'Start at a comfortable pace and maintain steady breathing. Increase speed gradually.', 'Full Body', '2e94f999-798f-4a5a-9a90-e4911c160edc', 'Beginner', ARRAY['None', 'Running shoes'], 'https://example.com/videos/running.mp4', 'https://example.com/images/running.jpg'),
  ('d112c5e2-acbd-4c54-b9b3-c3a89f82f51a', 'Plank', 'Core strengthening isometric exercise', 'Start in a push-up position, but with your weight on your forearms. Keep your body in a straight line from head to heels.', 'Core', '5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Beginner', ARRAY['None'], 'https://example.com/videos/plank.mp4', 'https://example.com/images/plank.jpg'),
  ('eae42203-70df-445e-bf52-9ee5193f2fc9', 'Jumping Jacks', 'Full body cardio exercise', 'Stand with feet together and arms at sides, then jump while spreading legs and raising arms above head.', 'Full Body', '2e94f999-798f-4a5a-9a90-e4911c160edc', 'Beginner', ARRAY['None'], 'https://example.com/videos/jumpingjacks.mp4', 'https://example.com/images/jumpingjacks.jpg'),
  ('f9d1b9a9-e2d0-4b32-a4a9-9d9f1c1b9a9d', 'Deadlift', 'Compound lower body exercise', 'Stand with feet hip-width apart, bend at the hips and knees to grasp the barbell, then stand up straight.', 'Back', '5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Advanced', ARRAY['Barbell', 'Weight plates'], 'https://example.com/videos/deadlift.mp4', 'https://example.com/images/deadlift.jpg'),
  ('7d9c1c9a-9e2d-4b9a-9d9f-1c9a9d9f1c9a', 'Bench Press', 'Upper body pushing exercise', 'Lie on a bench with feet flat on the floor, lower the barbell to chest level, then push it back up.', 'Chest', '5dd2d732-84c1-4612-9cc0-d93e7b5a0f17', 'Intermediate', ARRAY['Bench', 'Barbell', 'Weight plates'], 'https://example.com/videos/benchpress.mp4', 'https://example.com/images/benchpress.jpg'),
  ('8d9c1c9a-9e2d-4b9a-9d9f-1c9a9d9f1c9b', 'Burpees', 'Full body HIIT exercise', 'Begin in a standing position, drop into a squat position, kick feet back into a plank, return to squat, then jump up.', 'Full Body', '1c3ea752-41a1-4c2b-99d1-8e3a6e736141', 'Advanced', ARRAY['None'], 'https://example.com/videos/burpees.mp4', 'https://example.com/images/burpees.jpg'),
  ('9d9c1c9a-9e2d-4b9a-9d9f-1c9a9d9f1c9c', 'Yoga Flow', 'Series of yoga poses', 'Move through a sequence of poses focusing on breathing and mindfulness.', 'Full Body', '84c0f00a-a0a0-4c33-9a8b-7b73815c8113', 'Beginner', ARRAY['Yoga mat'], 'https://example.com/videos/yogaflow.mp4', 'https://example.com/images/yogaflow.jpg');

-- Insert achievements
INSERT INTO achievements (id, name, description, icon_url, criteria, points) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'First Workout', 'Complete your first workout', 'https://example.com/icons/first_workout.png', '{"workout_count": 1}', 10),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '10 Workouts', 'Complete 10 workouts', 'https://example.com/icons/10_workouts.png', '{"workout_count": 10}', 50),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '50 Workouts', 'Complete 50 workouts', 'https://example.com/icons/50_workouts.png', '{"workout_count": 50}', 100),
  ('d4e5f6a7-b8c9-7d0e-1f2a-3b4c5d6e7f8a', 'Weight Loss Champion', 'Lose 5kg from your starting weight', 'https://example.com/icons/weight_loss.png', '{"weight_loss": 5}', 75),
  ('e5f6a7b8-c9d0-8e1f-2a3b-4c5d6e7f8a9b', 'Marathon Runner', 'Run a total of 42km', 'https://example.com/icons/marathon.png', '{"distance_run": 42}', 100);

-- Insert app settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('exercise_difficulty_levels', '["Beginner", "Intermediate", "Advanced", "Expert"]', 'Available difficulty levels for exercises'),
  ('workout_types', '["Strength", "Cardio", "HIIT", "Flexibility", "Balance", "Custom"]', 'Available workout types'),
  ('measurement_units', '{"weight": {"metric": "kg", "imperial": "lb"}, "height": {"metric": "cm", "imperial": "in"}, "distance": {"metric": "km", "imperial": "mi"}}', 'Measurement units for different systems'),
  ('app_features', '{"social_sharing": true, "nutrition_tracking": true, "workout_recommendations": true}', 'Enabled features in the app');

-- Insert sample users (passwords would be hashed in a real app)
INSERT INTO users (id, email, password, full_name, username, fitness_level, goals, is_premium) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'john@example.com', crypt('password123', gen_salt('bf')), 'John Smith', 'johnsmith', 'Intermediate', ARRAY['Lose weight', 'Build muscle'], FALSE),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'jane@example.com', crypt('password123', gen_salt('bf')), 'Jane Doe', 'janedoe', 'Beginner', ARRAY['Improve fitness', 'Increase flexibility'], TRUE),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 'mike@example.com', crypt('password123', gen_salt('bf')), 'Mike Johnson', 'mikej', 'Advanced', ARRAY['Build strength', 'Marathon training'], FALSE);

-- Insert sample workouts
INSERT INTO workouts (id, user_id, name, description, type, difficulty, estimated_duration, is_public, equipment_needed, tags) VALUES
  ('a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Full Body Blast', 'Complete full body workout for building strength', 'Strength', 'Intermediate', 45, TRUE, ARRAY['Dumbbells', 'Bench'], ARRAY['strength', 'full body', 'beginner friendly']),
  ('b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Morning Cardio', 'Quick cardio session to start your day', 'Cardio', 'Beginner', 20, TRUE, ARRAY['None'], ARRAY['cardio', 'morning', 'quick']),
  ('c3d4e5f6-c3d4-c3d4-c3d4-c3d4e5f6a7b8', '7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'Yoga for Flexibility', 'Improve your flexibility with this yoga routine', 'Flexibility', 'Beginner', 30, TRUE, ARRAY['Yoga mat'], ARRAY['yoga', 'flexibility', 'relaxation']),
  ('d4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', '8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 'Advanced HIIT', 'High intensity interval training for advanced athletes', 'HIIT', 'Advanced', 25, TRUE, ARRAY['None'], ARRAY['hiit', 'advanced', 'fat burn']);

-- Link exercises to workouts
INSERT INTO workout_exercises (workout_id, exercise_id, position, sets, reps, rest_time) VALUES
  ('a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 'c5e66552-6f09-4e94-a3cb-242fb7f86fe5', 1, 3, 12, 60), -- Push-ups in Full Body Blast
  ('a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', '7f98e7db-3fbd-4109-9db1-9dd1b8a109a9', 2, 3, 15, 60), -- Squats in Full Body Blast
  ('a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 'd112c5e2-acbd-4c54-b9b3-c3a89f82f51a', 3, 3, 0, 60), -- Plank in Full Body Blast (duration instead of reps)
  ('b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', 'bde1f8d9-5d27-4dba-97a3-36edda50319a', 1, 1, 0, 0), -- Running in Morning Cardio
  ('b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', 'eae42203-70df-445e-bf52-9ee5193f2fc9', 2, 3, 20, 30), -- Jumping Jacks in Morning Cardio
  ('c3d4e5f6-c3d4-c3d4-c3d4-c3d4e5f6a7b8', '9d9c1c9a-9e2d-4b9a-9d9f-1c9a9d9f1c9c', 1, 1, 0, 0), -- Yoga Flow in Yoga for Flexibility
  ('d4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', '8d9c1c9a-9e2d-4b9a-9d9f-1c9a9d9f1c9b', 1, 4, 15, 30), -- Burpees in Advanced HIIT
  ('d4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', 'eae42203-70df-445e-bf52-9ee5193f2fc9', 2, 4, 30, 30), -- Jumping Jacks in Advanced HIIT
  ('d4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', 'c5e66552-6f09-4e94-a3cb-242fb7f86fe5', 3, 4, 20, 30); -- Push-ups in Advanced HIIT

-- Create workout plans
INSERT INTO workout_plans (id, name, description, duration_weeks, difficulty, goal, created_by) VALUES
  ('a9b8c7d6-e5f4-4a3b-8c7d-6e5f4a3b2c1d', 'Beginner Fitness Journey', 'A 4-week plan for beginners to establish a fitness routine', 4, 'Beginner', 'Establish exercise habit', '7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795'),
  ('b8c7d6e5-f4a3-5b4c-7d6e-5f4a3b2c1d0e', 'Strength Building', 'An 8-week plan focused on building strength and muscle', 8, 'Intermediate', 'Build strength', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  ('c7d6e5f4-a3b2-6c5d-6e5f-4a3b2c1d0e9f', 'HIIT Challenge', 'A 6-week high intensity interval training program', 6, 'Advanced', 'Improve cardiovascular fitness', '8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c');

-- Link workout plans to workouts
INSERT INTO workout_plan_details (plan_id, workout_id, week_number, day_number) VALUES
  ('a9b8c7d6-e5f4-4a3b-8c7d-6e5f4a3b2c1d', 'c3d4e5f6-c3d4-c3d4-c3d4-c3d4e5f6a7b8', 1, 1), -- Yoga for Flexibility on Week 1, Day 1
  ('a9b8c7d6-e5f4-4a3b-8c7d-6e5f4a3b2c1d', 'b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', 1, 3), -- Morning Cardio on Week 1, Day 3
  ('a9b8c7d6-e5f4-4a3b-8c7d-6e5f4a3b2c1d', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 1, 5), -- Full Body Blast on Week 1, Day 5
  ('b8c7d6e5-f4a3-5b4c-7d6e-5f4a3b2c1d0e', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 1, 1), -- Full Body Blast on Week 1, Day 1
  ('b8c7d6e5-f4a3-5b4c-7d6e-5f4a3b2c1d0e', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 1, 3), -- Full Body Blast on Week 1, Day 3
  ('b8c7d6e5-f4a3-5b4c-7d6e-5f4a3b2c1d0e', 'b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', 1, 5), -- Morning Cardio on Week 1, Day 5
  ('c7d6e5f4-a3b2-6c5d-6e5f-4a3b2c1d0e9f', 'd4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', 1, 2), -- Advanced HIIT on Week 1, Day 2
  ('c7d6e5f4-a3b2-6c5d-6e5f-4a3b2c1d0e9f', 'd4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', 1, 4), -- Advanced HIIT on Week 1, Day 4
  ('c7d6e5f4-a3b2-6c5d-6e5f-4a3b2c1d0e9f', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', 1, 6); -- Full Body Blast on Week 1, Day 6

-- Add some workout sessions (completed workouts)
INSERT INTO workout_sessions (user_id, workout_id, start_time, end_time, completed, calories_burned, rating) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '45 minutes', TRUE, 320, 4),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '22 minutes', TRUE, 180, 5),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '50 minutes', TRUE, 340, 4),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'c3d4e5f6-c3d4-c3d4-c3d4-c3d4e5f6a7b8', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '32 minutes', TRUE, 120, 5),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'b2c3d4e5-b2c3-b2c3-b2c3-b2c3d4e5f6a7', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '25 minutes', TRUE, 190, 3),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 'd4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '28 minutes', TRUE, 350, 5);

-- Add some progress entries
INSERT INTO progress (user_id, weight, body_fat_percentage, notes, recorded_date) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 82.5, 18.5, 'Feeling good today', CURRENT_DATE - 30),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 81.8, 18.2, 'Starting to see progress', CURRENT_DATE - 20),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 80.9, 17.8, 'More energy throughout the day', CURRENT_DATE - 10),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 79.5, 17.2, 'Really happy with my progress', CURRENT_DATE),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 65.2, 22.1, 'Just getting started', CURRENT_DATE - 15),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 64.8, 21.8, 'Feeling stronger', CURRENT_DATE - 7),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 64.5, 21.5, 'Keeping consistent', CURRENT_DATE),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 78.0, 12.0, 'Maintain current fitness', CURRENT_DATE - 20),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 77.5, 11.8, 'Increased protein intake', CURRENT_DATE - 10),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 77.2, 11.5, 'Focus on recovery', CURRENT_DATE);

-- Add some follows
INSERT INTO follows (follower_id, following_id) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c'),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');

-- Add some workout likes
INSERT INTO workout_likes (user_id, workout_id) VALUES
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6'),
  ('8c9eb686-8b1a-4d67-9b1c-6a5c8e7e9b1c', 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c3d4e5f6-c3d4-c3d4-c3d4-c3d4e5f6a7b8'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd4e5f6a7-d4e5-d4e5-d4e5-d4e5f6a7b8c9');

-- Add some nutrition logs
INSERT INTO nutrition_log (user_id, meal_type, food_items, calories, protein_g, carbs_g, fat_g, meal_date) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Breakfast', '{"items": [{"name": "Oatmeal", "quantity": "1 cup"}, {"name": "Banana", "quantity": "1 medium"}, {"name": "Protein powder", "quantity": "1 scoop"}]}', 450, 25, 65, 10, CURRENT_DATE),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Lunch', '{"items": [{"name": "Chicken breast", "quantity": "150g"}, {"name": "Brown rice", "quantity": "1 cup"}, {"name": "Broccoli", "quantity": "100g"}]}', 550, 40, 60, 12, CURRENT_DATE),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Dinner', '{"items": [{"name": "Salmon", "quantity": "200g"}, {"name": "Sweet potato", "quantity": "1 medium"}, {"name": "Spinach salad", "quantity": "100g"}]}', 600, 45, 40, 25, CURRENT_DATE),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'Breakfast', '{"items": [{"name": "Scrambled eggs", "quantity": "3 eggs"}, {"name": "Whole grain toast", "quantity": "2 slices"}, {"name": "Avocado", "quantity": "1/2"}]}', 500, 25, 30, 30, CURRENT_DATE),
  ('7f6bafdf-cfdf-4a58-b9c5-2a16a3ea0795', 'Lunch', '{"items": [{"name": "Turkey sandwich", "quantity": "1"}, {"name": "Apple", "quantity": "1"}, {"name": "Greek yogurt", "quantity": "100g"}]}', 450, 35, 50, 15, CURRENT_DATE); 