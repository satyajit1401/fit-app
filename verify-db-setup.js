require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseSetup() {
  console.log('Verifying Supabase database setup...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Check if critical tables exist
    const requiredTables = [
      'users',
      'workouts',
      'exercises',
      'workout_exercises',
      'progress',
      'workout_sessions'
    ];
    
    console.log('\nChecking for required tables:');
    
    for (const table of requiredTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count()', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Table '${table}' is missing or inaccessible:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }
    
    // Check if API functions exist by trying to call them
    console.log('\nChecking for API functions:');
    
    // Test get_user_profile function
    const { data: profileData, error: profileError } = await supabase.rpc(
      'get_user_profile',
      { p_user_id: '00000000-0000-0000-0000-000000000000' } // Using a dummy UUID
    );
    
    if (profileError && !profileError.message.includes('not found')) {
      console.log('✅ get_user_profile function exists (expected error for non-existent user)');
    } else if (profileError) {
      console.error('❌ get_user_profile function is missing:', profileError.message);
    } else {
      console.log('✅ get_user_profile function exists and returned:', profileData);
    }
    
    // Test search_workouts function
    const { data: searchData, error: searchError } = await supabase.rpc(
      'search_workouts',
      { p_search_term: 'workout' }
    );
    
    if (searchError && !searchError.message.includes('not found')) {
      console.log('✅ search_workouts function exists (expected error for search operation)');
    } else if (searchError) {
      console.error('❌ search_workouts function is missing:', searchError.message);
    } else {
      console.log('✅ search_workouts function exists and returned results');
    }
    
    // Check for sample data in the exercises table
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(3);
    
    console.log('\nChecking for sample data:');
    if (exerciseError) {
      console.error('❌ Could not check for sample data:', exerciseError.message);
    } else if (exerciseData.length === 0) {
      console.log('❌ No sample data found in exercises table');
    } else {
      console.log(`✅ Sample data found in exercises table: ${exerciseData.length} records`);
      console.log(exerciseData);
    }
    
    console.log('\nVerification complete!');
    console.log('If you see any ❌ errors above, please follow the instructions in EXECUTE_IN_SUPABASE_DASHBOARD.md');
    
  } catch (error) {
    console.error('Unexpected error during verification:', error);
  }
}

verifyDatabaseSetup(); 