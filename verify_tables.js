// Script to verify table existence and test data operations
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('Verifying tables and testing data operations...');
  
  try {
    // 1. Check all tables
    const tables = ['users', 'workouts', 'exercises', 'workout_exercises', 'progress'];
    
    console.log('Checking tables:');
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.error(`Error accessing ${table} table:`, error);
      } else {
        console.log(`✓ ${table} table exists with ${data.length} records`);
      }
    }
    
    // 2. Test inserting a user
    console.log('\nTesting data operations:');
    console.log('Inserting a test user...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        password: 'securepassword123',
        full_name: 'Test User'
      })
      .select();
    
    if (userError) {
      console.error('Error inserting user:', userError);
    } else {
      console.log('✓ Successfully inserted user:', userData[0].id);
      
      // 3. Test inserting a workout for this user
      console.log('Inserting a test workout...');
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userData[0].id,
          name: 'Morning Routine',
          description: 'A simple morning workout routine',
          duration: 30,
          calories_burned: 250
        })
        .select();
      
      if (workoutError) {
        console.error('Error inserting workout:', workoutError);
      } else {
        console.log('✓ Successfully inserted workout:', workoutData[0].id);
      }
      
      // 4. Test inserting an exercise
      console.log('Inserting a test exercise...');
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          name: 'Push-ups',
          description: 'Basic push-ups exercise',
          muscle_group: 'Chest',
          difficulty: 'Medium'
        })
        .select();
      
      if (exerciseError) {
        console.error('Error inserting exercise:', exerciseError);
      } else {
        console.log('✓ Successfully inserted exercise:', exerciseData[0].id);
        
        // 5. Link workout and exercise
        console.log('Linking workout and exercise...');
        const { data: linkData, error: linkError } = await supabase
          .from('workout_exercises')
          .insert({
            workout_id: workoutData[0].id,
            exercise_id: exerciseData[0].id,
            sets: 3,
            reps: 12
          })
          .select();
        
        if (linkError) {
          console.error('Error linking workout and exercise:', linkError);
        } else {
          console.log('✓ Successfully linked workout and exercise');
        }
      }
      
      // 6. Add progress data
      console.log('Adding test progress data...');
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .insert({
          user_id: userData[0].id,
          weight: 75.5,
          body_fat_percentage: 15.2,
          notes: 'Feeling good today'
        })
        .select();
      
      if (progressError) {
        console.error('Error inserting progress:', progressError);
      } else {
        console.log('✓ Successfully added progress data');
      }
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the verification
verifyTables(); 